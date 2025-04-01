import axios from 'axios';
import { N8NOrder, N8NResponse, N8NConfig, OrderStatus } from './types';
import { createClient } from '@/lib/supabase/server';

/**
 * Serviço para integração com o N8N
 */
export class N8NIntegrationService {
  private config: N8NConfig;
  private logger: Console;
  
  constructor() {
    this.logger = console;
    
    // Obter configurações do ambiente
    this.config = {
      enabled: process.env.ENABLE_N8N_INTEGRATION === 'true',
      webhookUrl: process.env.N8N_WEBHOOK_URL || '',
      testWebhookUrl: process.env.N8N_WEBHOOK_URL_TEST || '',
      apiKey: process.env.N8N_API_KEY || '',
      callbackSecret: process.env.API_CALLBACK_SECRET || ''
    };
    
    if (!this.config.webhookUrl) {
      this.logger.warn('URL do webhook do N8N não configurada. A integração com N8N não funcionará.');
    }
  }
  
  /**
   * Verifica se a integração com N8N está habilitada
   */
  isEnabled(): boolean {
    return this.config.enabled && !!this.config.webhookUrl && !!this.config.apiKey;
  }
  
  /**
   * Envia um pedido para o N8N processar
   * @param orderData Dados do pedido a ser enviado
   * @param useTestEnvironment Define se deve usar o ambiente de teste
   * @returns Resultado do envio
   */
  async sendOrder(orderData: N8NOrder, useTestEnvironment = false): Promise<N8NResponse> {
    try {
      if (!this.isEnabled()) {
        throw new Error('Integração com N8N não está habilitada');
      }
      
      // Determinar qual URL de webhook usar
      const webhookUrl = useTestEnvironment 
        ? this.config.testWebhookUrl 
        : this.config.webhookUrl;
      
      if (!webhookUrl) {
        throw new Error(`URL do webhook do N8N para ambiente ${useTestEnvironment ? 'de teste' : 'de produção'} não configurada`);
      }
      
      this.logger.info(`Enviando pedido ${orderData.order_id} para o N8N (${useTestEnvironment ? 'teste' : 'produção'})`);
      
      // Preparar dados para envio
      const payload = {
        ...orderData,
        webhook_timestamp: new Date().toISOString()
      };
      
      // Enviar para o webhook do N8N
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey
        },
        timeout: 30000 // 30 segundos
      });
      
      // Verificar se a resposta foi bem-sucedida
      if (response.status === 200 && response.data) {
        this.logger.info(`Pedido ${orderData.order_id} enviado com sucesso para o N8N`);
        
        // Registrar resposta no banco de dados
        await this.logOrderSent(orderData.order_id, payload, response.data);
        
        return {
          success: true,
          order_id: orderData.order_id,
          external_order_id: response.data.external_order_id || response.data.order_id
        };
      } else {
        this.logger.error(`Erro ao enviar pedido ${orderData.order_id} para o N8N: Resposta inválida`);
        
        // Registrar erro no banco de dados
        await this.logOrderError(orderData.order_id, payload, `Resposta inválida: ${JSON.stringify(response.data)}`);
        
        return {
          success: false,
          error: 'Resposta inválida do N8N'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao enviar pedido ${orderData.order_id} para o N8N: ${errorMessage}`);
      
      // Registrar erro no banco de dados
      await this.logOrderError(orderData.order_id, orderData, errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Processa o callback do N8N
   * @param callbackData Dados do callback
   * @returns Resultado do processamento
   */
  async processCallback(callbackData: Record<string, unknown>): Promise<boolean> {
    try {
      const orderId = callbackData.order_id as string;
      
      if (!orderId) {
        this.logger.error('Callback sem order_id');
        return false;
      }
      
      this.logger.info(`Recebido callback do N8N para o pedido ${orderId}`);
      
      // Registrar callback no banco de dados
      await this.logCallback(orderId, callbackData);
      
      // Extrair status do callback
      const status = callbackData.status as string;
      
      if (status) {
        // Atualizar o status da transação no banco de dados
        await this.updateTransactionStatus(orderId, status);
      }
      
      this.logger.info(`Callback processado com sucesso para o pedido ${orderId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao processar callback do N8N: ${errorMessage}`);
      return false;
    }
  }
  
  /**
   * Atualiza o status de uma transação com base no callback
   */
  private async updateTransactionStatus(orderId: string, status: string): Promise<void> {
    const supabase = createClient();
    
    // Mapear o status para um dos status válidos do sistema
    let transactionStatus: string;
    
    switch (status.toLowerCase()) {
      case 'completed':
        transactionStatus = OrderStatus.COMPLETED;
        break;
      case 'processing':
        transactionStatus = OrderStatus.PROCESSING;
        break;
      case 'error':
        transactionStatus = OrderStatus.ERROR;
        break;
      case 'cancelled':
        transactionStatus = OrderStatus.CANCELLED;
        break;
      default:
        transactionStatus = OrderStatus.PENDING;
    }
    
    // Atualizar a transação
    await supabase
      .from('core_transactions_v2')
      .update({
        status: transactionStatus,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', orderId);
  }
  
  /**
   * Registra o envio de um pedido
   */
  private async logOrderSent(
    orderId: string, 
    orderData: N8NOrder, 
    responseData: Record<string, unknown>
  ): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase.from('n8n_order_logs').insert({
        order_id: orderId,
        event_type: 'order_sent',
        request_data: orderData,
        response_data: responseData,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Erro ao registrar envio de pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Registra um erro ao enviar um pedido
   */
  private async logOrderError(
    orderId: string, 
    orderData: N8NOrder, 
    errorMessage: string
  ): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase.from('n8n_order_logs').insert({
        order_id: orderId,
        event_type: 'order_error',
        request_data: orderData,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Erro ao registrar erro de pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Registra um callback recebido
   */
  private async logCallback(
    orderId: string, 
    callbackData: Record<string, unknown>
  ): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase.from('n8n_callbacks').insert({
        order_id: orderId,
        callback_data: callbackData,
        created_at: new Date().toISOString(),
        processed: true
      });
    } catch (error) {
      this.logger.error(`Erro ao registrar callback: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
} 