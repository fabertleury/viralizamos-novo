import axios from 'axios';
import { N8NOrder, N8NResponse, N8NConfig, OrderStatus } from './types';
import { createClient } from '@/lib/supabase/server';
import { transactionMonitoring } from '@/lib/monitoring/transactionMonitoring';

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
        this.logger.error(`Integração com N8N não está habilitada. Configurações atuais:
          ENABLE_N8N_INTEGRATION: ${this.config.enabled}
          N8N_WEBHOOK_URL: ${this.config.webhookUrl ? 'Configurado' : 'Não configurado'}
          N8N_WEBHOOK_URL_TEST: ${this.config.testWebhookUrl ? 'Configurado' : 'Não configurado'}
          N8N_API_KEY: ${this.config.apiKey ? 'Configurado' : 'Não configurado'}`);
        throw new Error('Integração com N8N não está habilitada');
      }
      
      // Determinar qual URL de webhook usar
      const webhookUrl = useTestEnvironment 
        ? this.config.testWebhookUrl 
        : this.config.webhookUrl;
      
      if (!webhookUrl) {
        this.logger.error(`URL do webhook do N8N para ambiente ${useTestEnvironment ? 'de teste' : 'de produção'} não configurada.
          N8N_WEBHOOK_URL: ${this.config.webhookUrl || 'Não configurado'}
          N8N_WEBHOOK_URL_TEST: ${this.config.testWebhookUrl || 'Não configurado'}`);
        throw new Error(`URL do webhook do N8N para ambiente ${useTestEnvironment ? 'de teste' : 'de produção'} não configurada`);
      }
      
      this.logger.info(`Enviando pedido ${orderData.order_id} para o N8N (${useTestEnvironment ? 'teste' : 'produção'})
        URL: ${webhookUrl}
        Service ID: ${orderData.service_id}
        Provider ID: ${orderData.provider_id}
        Target URL: ${orderData.target_url || 'N/A'}
        Username: ${orderData.target_username || 'N/A'}`);
      
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
      
      // Registrar tentativa de integração
      await transactionMonitoring.logIntegration(
        orderData.order_id,
        orderData.transaction_id || null,
        'n8n',
        orderData,
        null,
        'pending',
        null
      );
      
      // Enviar para o webhook do N8N com mais detalhes de debug
      try {
        this.logger.info(`Iniciando requisição para ${webhookUrl}`);
        const response = await axios.post(webhookUrl, payload, {
          auth,
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 segundos
        });
        
        this.logger.info(`Resposta recebida: Status ${response.status}`);
        
        // Verificar se a resposta foi bem-sucedida
        if (response.status === 200 && response.data) {
          this.logger.info(`Pedido ${orderData.order_id} enviado com sucesso para o N8N. Resposta: ${JSON.stringify(response.data)}`);
          
          // Registrar resposta no banco de dados
          await this.logOrderSent(orderData.order_id, payload, response.data);
          
          // Registrar resposta bem-sucedida no monitoramento
          await transactionMonitoring.logIntegration(
            orderData.order_id,
            orderData.transaction_id || null,
            'n8n',
            payload,
            response.data,
            'success',
            null
          );
          
          return {
            success: true,
            order_id: orderData.order_id,
            external_order_id: response.data.external_order_id || response.data.order_id
          };
        } else {
          this.logger.error(`Erro ao enviar pedido ${orderData.order_id} para o N8N: Resposta inválida. Status: ${response.status}, Dados: ${JSON.stringify(response.data)}`);
          
          // Registrar erro no banco de dados
          await this.logOrderError(orderData.order_id, payload, `Resposta inválida: ${JSON.stringify(response.data)}`);
          
          // Registrar erro no monitoramento
          await transactionMonitoring.logIntegration(
            orderData.order_id,
            orderData.transaction_id || null,
            'n8n',
            payload,
            response.data,
            'error',
            `Resposta inválida: ${JSON.stringify(response.data)}`
          );
          
          return {
            success: false,
            error: 'Resposta inválida do N8N'
          };
        }
      } catch (axiosError) {
        // Erro específico do axios
        const errorMessage = axiosError.response 
          ? `Erro HTTP ${axiosError.response.status}: ${JSON.stringify(axiosError.response.data)}` 
          : axiosError.message;
          
        this.logger.error(`Erro de comunicação ao enviar pedido ${orderData.order_id} para o N8N: ${errorMessage}`);
        
        // Registrar erro no banco de dados
        await this.logOrderError(orderData.order_id, payload, errorMessage);
        
        // Registrar erro no monitoramento
        await transactionMonitoring.logIntegration(
          orderData.order_id,
          orderData.transaction_id || null,
          'n8n',
          payload,
          axiosError.response?.data || null,
          'error',
          errorMessage
        );
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao enviar pedido ${orderData.order_id} para o N8N: ${errorMessage}`);
      
      // Registrar erro no banco de dados
      await this.logOrderError(orderData.order_id, orderData, errorMessage);
      
      // Registrar erro no monitoramento
      await transactionMonitoring.logIntegration(
        orderData.order_id,
        orderData.transaction_id || null,
        'n8n',
        orderData,
        null,
        'error',
        errorMessage
      );
      
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
      
      // Registrar callback recebido
      await transactionMonitoring.logWebhook(
        'n8n_callback',
        'n8n',
        callbackData
      );
      
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
        this.logger.info(`