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
      
      // Configurar autenticação básica para o N8N
      const username = 'n8n';
      const password = this.config.apiKey;
      const auth = {
        username,
        password
      };
      
      // Enviar para o webhook do N8N
      const response = await axios.post(webhookUrl, payload, {
        auth,
        headers: {
          'Content-Type': 'application/json'
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
        
        // Se o callback incluir external_order_id, atualizar na core_orders
        const externalOrderId = callbackData.external_order_id as string;
        if (externalOrderId) {
          await this.updateOrderExternalId(orderId, externalOrderId, status);
        }
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
   * Atualiza o ID externo e status na tabela core_orders
   */
  private async updateOrderExternalId(orderId: string, externalOrderId: string, status: string): Promise<void> {
    try {
      const supabase = createClient();
      
      // Encontrar o order_id na tabela core_orders
      const { data: orders, error: findError } = await supabase
        .from('core_orders')
        .select('id')
        .eq('order_id', orderId);
      
      if (findError || !orders || orders.length === 0) {
        this.logger.warn(`Pedido ${orderId} não encontrado na tabela core_orders. Procurando por payment_id...`);
        
        // Tente procurar pelo payment_id
        const { data: ordersByPayment, error: paymentError } = await supabase
          .from('core_orders')
          .select('id')
          .eq('payment_id', orderId);
        
        if (paymentError || !ordersByPayment || ordersByPayment.length === 0) {
          this.logger.error(`Pedido ${orderId} não encontrado na tabela core_orders.`);
          return;
        }
        
        // Use o primeiro resultado encontrado pelo payment_id
        for (const order of ordersByPayment) {
          await this.updateSingleOrder(order.id, externalOrderId, status);
        }
      } else {
        // Atualizar cada ordem encontrada
        for (const order of orders) {
          await this.updateSingleOrder(order.id, externalOrderId, status);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao atualizar ID externo do pedido: ${errorMessage}`);
    }
  }
  
  /**
   * Atualiza uma única ordem na tabela core_orders
   */
  private async updateSingleOrder(orderId: string, externalOrderId: string, status: string): Promise<void> {
    try {
      const supabase = createClient();
      
      // Mapear o status para o formato esperado pela tabela core_orders
      let orderStatus = 'pending';
      switch (status.toLowerCase()) {
        case 'completed':
          orderStatus = 'completed';
          break;
        case 'processing':
          orderStatus = 'processing';
          break;
        case 'error':
          orderStatus = 'error';
          break;
        case 'cancelled':
          orderStatus = 'cancelled';
          break;
      }
      
      // Atualizar a ordem
      const { error } = await supabase
        .from('core_orders')
        .update({
          external_id: externalOrderId,
          status: orderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        this.logger.error(`Erro ao atualizar pedido ${orderId}: ${error.message}`);
      } else {
        this.logger.info(`Pedido ${orderId} atualizado com external_id ${externalOrderId} e status ${orderStatus}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao atualizar ordem individual: ${errorMessage}`);
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
    
    try {
      // Primeiro, tente atualizar pelo payment_id direto
      const { data: updateResult, error } = await supabase
        .from('core_transactions_v2')
        .update({
          status: transactionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', orderId);
      
      if (error) {
        this.logger.error(`Erro ao atualizar transação por payment_id ${orderId}: ${error.message}`);
      } else if (updateResult && updateResult.length > 0) {
        this.logger.info(`Transação com payment_id ${orderId} atualizada para status ${transactionStatus}`);
        return;
      }
      
      // Se não encontrou pelo payment_id, tente com n8n_order_id
      const { error: error2 } = await supabase
        .from('core_transactions_v2')
        .update({
          status: transactionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('n8n_order_id', orderId);
      
      if (error2) {
        this.logger.error(`Erro ao atualizar transação por n8n_order_id ${orderId}: ${error2.message}`);
      } else {
        this.logger.info(`Transação com n8n_order_id ${orderId} atualizada para status ${transactionStatus}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao atualizar status da transação: ${errorMessage}`);
    }
    
    // Também atualizar na tabela n8n_order_status
    try {
      await supabase.from('n8n_order_status')
        .upsert({
          order_id: orderId,
          status: transactionStatus,
          updated_at: new Date().toISOString()
        }, { onConflict: 'order_id' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao atualizar status na tabela n8n_order_status: ${errorMessage}`);
    }
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao registrar envio de pedido: ${errorMessage}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao registrar erro de pedido: ${errorMessage}`);
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
        processed: true,
        processed_at: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao registrar callback: ${errorMessage}`);
    }
  }
} 