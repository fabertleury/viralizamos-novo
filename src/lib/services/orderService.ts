/**
 * Serviço para gerenciar pedidos
 */
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export class OrderService {
  private supabase = createClient();

  /**
   * Busca um pedido por ID
   */
  async getOrderById(orderId: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*, service:service_id(*)')
        .eq('id', orderId)
        .maybeSingle();

      if (error) {
        logger.error(`Erro ao buscar pedido por ID: ${orderId}`, { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Erro inesperado ao buscar pedido: ${orderId}`, { error, orderId });
      throw error;
    }
  }

  /**
   * Busca pedidos por transação
   */
  async getOrdersByTransaction(transactionId: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*, service:service_id(*)')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error(`Erro ao buscar pedidos por transação: ${transactionId}`, { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Erro inesperado ao buscar pedidos por transação: ${transactionId}`, { error });
      throw error;
    }
  }

  /**
   * Busca pedidos por usuário
   */
  async getOrdersByUser(userId: string, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*, service:service_id(*), transaction:transaction_id(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Erro ao buscar pedidos por usuário: ${userId}`, { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Erro inesperado ao buscar pedidos por usuário: ${userId}`, { error });
      throw error;
    }
  }

  /**
   * Atualiza o status de um pedido
   */
  async updateOrderStatus(orderId: string, status: string, metadata?: any) {
    try {
      const updateData: any = { status };
      
      if (metadata) {
        // Mesclar o metadata existente com o novo
        const { data: existingOrder } = await this.supabase
          .from('orders')
          .select('metadata')
          .eq('id', orderId)
          .maybeSingle();
          
        if (existingOrder && existingOrder.metadata) {
          updateData.metadata = {
            ...existingOrder.metadata,
            ...metadata
          };
        } else {
          updateData.metadata = metadata;
        }
      }
      
      const { data, error } = await this.supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (error) {
        logger.error(`Erro ao atualizar status do pedido: ${orderId}`, { error, orderId, status });
        throw error;
      }

      // Registrar o log de atualização
      await this.supabase
        .from('order_logs')
        .insert({
          order_id: orderId,
          level: 'info',
          message: `Status atualizado para: ${status}`,
          metadata: { 
            previousStatus: existingOrder?.metadata?.status || 'unknown',
            newStatus: status,
            updatedMetadata: metadata 
          }
        });

      return data;
    } catch (error) {
      logger.error(`Erro inesperado ao atualizar status do pedido: ${orderId}`, { error });
      throw error;
    }
  }

  /**
   * Verifica se um pedido para determinado link já existe
   */
  async checkExistingOrder(link: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('id, status, created_at')
        .contains('metadata', { link })
        .or(`status.eq.pending,status.eq.processing`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error(`Erro ao verificar pedido existente para o link: ${link}`, { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Erro inesperado ao verificar pedido existente: ${link}`, { error });
      throw error;
    }
  }
} 