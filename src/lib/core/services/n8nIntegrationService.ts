import axios from 'axios';
import { Logger } from '@/lib/core/utils/logger';

interface OrderData {
  order_id: string;
  transaction_id: string;
  service_id: string;
  provider_id: string;
  external_service_id: string;
  quantity: number;
  target_url?: string;
  target_username?: string;
  metadata?: Record<string, any>;
}

interface N8nResponse {
  success: boolean;
  order_id?: string;
  external_order_id?: string;
  error?: string;
}

/**
 * Serviço para integração com o n8n
 */
export class N8nIntegrationService {
  private logger: Logger;
  private n8nWebhookUrl: string;
  private n8nApiKey: string;
  
  constructor() {
    this.logger = new Logger('N8nIntegration');
    
    // Obter configurações do ambiente
    this.n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || '';
    this.n8nApiKey = process.env.N8N_API_KEY || '';
    
    if (!this.n8nWebhookUrl) {
      this.logger.warn('URL do webhook do n8n não configurada. A integração com n8n não funcionará.');
    }
  }
  
  /**
   * Envia um pedido para o n8n processar
   * @param orderData Dados do pedido a ser enviado
   * @returns Resultado do envio
   */
  async sendOrder(orderData: OrderData): Promise<N8nResponse> {
    try {
      // Verificar se a URL do webhook está configurada
      if (!this.n8nWebhookUrl) {
        throw new Error('URL do webhook do n8n não configurada');
      }
      
      this.logger.info(`Enviando pedido ${orderData.order_id} para o n8n`);
      
      // Preparar dados para envio
      const payload = {
        ...orderData,
        webhook_timestamp: new Date().toISOString()
      };
      
      // Enviar para o webhook do n8n
      const response = await axios.post(this.n8nWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.n8nApiKey
        },
        timeout: 30000 // 30 segundos
      });
      
      // Verificar se a resposta foi bem-sucedida
      if (response.status === 200 && response.data) {
        this.logger.success(`Pedido ${orderData.order_id} enviado com sucesso para o n8n`);
        
        return {
          success: true,
          order_id: orderData.order_id,
          external_order_id: response.data.external_order_id || response.data.order_id
        };
      } else {
        this.logger.error(`Erro ao enviar pedido ${orderData.order_id} para o n8n: Resposta inválida`);
        
        return {
          success: false,
          error: 'Resposta inválida do n8n'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao enviar pedido ${orderData.order_id} para o n8n: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Processa o callback do n8n
   * @param callbackData Dados do callback
   * @returns Resultado do processamento
   */
  async processCallback(callbackData: any): Promise<boolean> {
    try {
      this.logger.info(`Recebido callback do n8n para o pedido ${callbackData.order_id}`);
      
      // Validar dados do callback
      if (!callbackData.order_id) {
        this.logger.error('Callback sem order_id');
        return false;
      }
      
      // Aqui você pode implementar a lógica para atualizar o status do pedido
      // com base nos dados do callback
      
      this.logger.success(`Callback processado com sucesso para o pedido ${callbackData.order_id}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao processar callback do n8n: ${errorMessage}`);
      return false;
    }
  }
} 