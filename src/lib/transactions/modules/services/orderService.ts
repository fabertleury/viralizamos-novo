import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Serviço para gerenciar pedidos
 */
export class OrderService {
  private supabase = createClient();

  /**
   * Busca um pedido por ID
   */
  async getOrderById(orderId: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        logger.error(`[OrderService] Erro ao buscar pedido por ID: ${orderId}`, { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`[OrderService] Erro inesperado ao buscar pedido: ${orderId}`, { error });
      throw error;
    }
  }

  /**
   * Busca pedidos por ID da transação
   */
  async getOrdersByTransactionId(transactionId: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error(`[OrderService] Erro ao buscar pedidos por transaction_id: ${transactionId}`, { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`[OrderService] Erro inesperado ao buscar pedidos: ${transactionId}`, { error });
      throw error;
    }
  }

  /**
   * Cria um novo pedido
   */
  async createOrder(orderData: {
    transaction_id: string;
    service_id: string;
    status: string;
    quantity: number;
    target_username: string;
    provider_id?: string;
    external_order_id?: string;
    metadata?: Record<string, any>;
    target_link?: string;
    payment_status?: string;
    payment_method?: string;
    payment_id?: string;
    customer_id?: string;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        logger.error(`[OrderService] Erro ao criar pedido:`, { error, orderData });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`[OrderService] Erro inesperado ao criar pedido`, { error, orderData });
      throw error;
    }
  }

  /**
   * Atualiza um pedido existente
   */
  async updateOrder(orderId: string, orderData: Partial<{
    status: string;
    external_order_id: string;
    metadata: Record<string, any>;
    provider_id: string;
    needs_admin_attention: boolean;
    error_message: string;
  }>) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({
          ...orderData,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        logger.error(`[OrderService] Erro ao atualizar pedido: ${orderId}`, { error, orderData });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`[OrderService] Erro inesperado ao atualizar pedido: ${orderId}`, { error, orderData });
      throw error;
    }
  }

  /**
   * Verifica o status de um pedido junto ao provedor
   */
  async checkOrderStatus(orderId: string) {
    try {
      // Buscar pedido
      const order = await this.getOrderById(orderId);
      
      if (!order || !order.external_order_id || !order.provider_id) {
        logger.error(`[OrderService] Pedido ${orderId} não possui external_order_id ou provider_id`);
        return null;
      }
      
      // Retornar os dados necessários para verificação posterior
      return {
        id: order.id,
        external_order_id: order.external_order_id,
        provider_id: order.provider_id,
        status: order.status
      };
    } catch (error) {
      logger.error(`[OrderService] Erro ao verificar status do pedido: ${orderId}`, { error });
      throw error;
    }
  }
} 