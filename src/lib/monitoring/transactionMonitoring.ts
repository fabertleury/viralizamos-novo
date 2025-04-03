import prisma, { generateOrderHash } from './client';
import { logger } from '@/lib/logger';

/**
 * Serviço para monitoramento de transações e pedidos
 */
export class TransactionMonitoring {
  /**
   * Registra uma transação no sistema de monitoramento
   */
  async logTransaction(transaction: any): Promise<boolean> {
    try {
      // Garantir que o status está sendo salvo corretamente
      const status = transaction.status || 'unknown';
      
      // Log adicional para debug
      console.log(`[TransactionMonitoring] Registrando transação ${transaction.id} com status ${status}`);
      
      await prisma.transactionsLog.create({
        data: {
          id: transaction.id,
          payment_id: transaction.payment_id || transaction.payment_external_reference || null,
          status: status,
          amount: transaction.amount ? parseFloat(transaction.amount) : null,
          created_at: transaction.created_at ? new Date(transaction.created_at) : new Date(),
          metadata: transaction.metadata || null,
          provider_data: transaction.provider_data || null
        }
      });
      
      logger.info(`[Monitor] Transação ${transaction.id} registrada no banco de monitoramento com status ${status}`);
      return true;
    } catch (error) {
      logger.error(`[Monitor] Erro ao registrar transação no banco de monitoramento: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Registra um pedido no sistema de monitoramento
   */
  async logOrder(order: any): Promise<boolean> {
    try {
      // Registrar o pedido
      await prisma.ordersLog.create({
        data: {
          id: order.id,
          transaction_id: order.transaction_id || null,
          provider_id: order.provider_id || null,
          service_id: order.service_id || null,
          quantity: order.quantity || null,
          status: order.status || null,
          target_url: order.target_url || order.link || null,
          created_at: order.created_at ? new Date(order.created_at) : new Date(),
          provider_response: order.provider_response || null
        }
      });
      
      // Verificar duplicação
      await this.checkAndLogDuplicate(order);
      
      logger.info(`[Monitor] Pedido ${order.id} registrado no banco de monitoramento`);
      return true;
    } catch (error) {
      logger.error(`[Monitor] Erro ao registrar pedido no banco de monitoramento: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Registra detalhes de integração com provedores externos
   */
  async logIntegration(
    orderId: string, 
    transactionId: string | null, 
    providerId: string | null, 
    requestData: any, 
    responseData: any, 
    status: string,
    errorMessage?: string
  ): Promise<boolean> {
    try {
      await prisma.integrationsLog.create({
        data: {
          order_id: orderId,
          transaction_id: transactionId,
          provider_id: providerId,
          request_data: requestData || null,
          response_data: responseData || null,
          status,
          error_message: errorMessage || null
        }
      });
      
      logger.info(`[Monitor] Integração para pedido ${orderId} registrada no banco de monitoramento`);
      return true;
    } catch (error) {
      logger.error(`[Monitor] Erro ao registrar integração no banco de monitoramento: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Registra recebimento de webhook
   */
  async logWebhook(
    webhookType: string,
    source: string,
    payload: any,
    statusCode?: number,
    responseBody?: any
  ): Promise<number | null> {
    try {
      const startTime = Date.now();
      
      const webhook = await prisma.webhookLogs.create({
        data: {
          webhook_type: webhookType,
          source,
          payload: payload || {},
          status_code: statusCode || null,
          response_body: responseBody || null,
          processing_time: null // Será atualizado quando o processamento for concluído
        }
      });
      
      logger.info(`[Monitor] Webhook ${webhookType} de ${source} registrado, ID: ${webhook.id}`);
      return webhook.id;
    } catch (error) {
      logger.error(`[Monitor] Erro ao registrar webhook no banco de monitoramento: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Atualiza o status de processamento de um webhook
   */
  async updateWebhookProcessed(
    webhookId: number,
    processed: boolean,
    statusCode?: number,
    responseBody?: any,
    processingTime?: number
  ): Promise<boolean> {
    try {
      await prisma.webhookLogs.update({
        where: { id: webhookId },
        data: {
          processed,
          status_code: statusCode || null,
          response_body: responseBody || null,
          processing_time: processingTime || null,
          processed_at: processed ? new Date() : null
        }
      });
      
      logger.info(`[Monitor] Webhook ${webhookId} atualizado como ${processed ? 'processado' : 'não processado'}`);
      return true;
    } catch (error) {
      logger.error(`[Monitor] Erro ao atualizar webhook no banco de monitoramento: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Verifica e registra possíveis duplicações de pedidos
   */
  private async checkAndLogDuplicate(order: any): Promise<void> {
    try {
      // Gerar hash único do pedido
      const hashKey = generateOrderHash({
        target_url: order.target_url || order.link,
        service_id: order.service_id,
        provider_id: order.provider_id,
        quantity: order.quantity
      });
      
      // Verificar se já existe
      const existingDuplicate = await prisma.duplicateDetection.findUnique({
        where: { hash_key: hashKey }
      });
      
      if (existingDuplicate) {
        // Atualizar registro existente
        await prisma.duplicateDetection.update({
          where: { hash_key: hashKey },
          data: {
            last_seen: new Date(),
            count: existingDuplicate.count + 1,
            order_id: order.id // Atualizar com o pedido mais recente
          }
        });
        
        // Registrar aviso se houver duplicação
        if (existingDuplicate.transaction_id !== order.transaction_id) {
          logger.warn(`[Monitor] Possível duplicação detectada! Pedido ${order.id} similar a outro com hash ${hashKey}`);
          logger.warn(`[Monitor] Transações diferentes: ${existingDuplicate.transaction_id} e ${order.transaction_id}`);
        }
      } else {
        // Criar novo registro
        await prisma.duplicateDetection.create({
          data: {
            hash_key: hashKey,
            transaction_id: order.transaction_id || '',
            order_id: order.id,
            target_url: order.target_url || order.link,
            service_id: order.service_id,
            provider_id: order.provider_id
          }
        });
      }
    } catch (error) {
      logger.error(`[Monitor] Erro ao verificar duplicação: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Exportar instância única
export const transactionMonitoring = new TransactionMonitoring(); 