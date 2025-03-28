import { createClient } from '@/lib/supabase/server';
import { SocialMediaService } from '@/lib/services/socialMediaService';

/**
 * Gerencia o status dos pedidos
 */
export class OrderStatusManager {
  private supabase = createClient();

  /**
   * Verifica o status de um pedido no provedor
   * @param orderId ID do pedido
   * @param providerId ID do provedor
   * @returns Status do pedido
   */
  async checkOrderStatus(orderId: number, providerId: string): Promise<any> {
    try {
      // Buscar o provedor
      const { data: provider, error: providerError } = await this.supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (providerError || !provider) {
        throw new Error(`Provedor com ID ${providerId} não encontrado`);
      }
      
      // Inicializar o serviço de mídia social com o provedor
      const socialMediaService = new SocialMediaService(provider);
      
      // Verificar o status do pedido
      return await socialMediaService.checkOrderStatus(orderId, providerId);
    } catch (error) {
      console.error('[OrderStatusManager] Erro ao verificar status do pedido:', error);
      throw error;
    }
  }

  /**
   * Verifica o status de múltiplos pedidos no provedor
   * @param orderIds Lista de IDs dos pedidos
   * @param providerId ID do provedor
   * @returns Status dos pedidos
   */
  async checkMultipleOrdersStatus(orderIds: string[], providerId?: string): Promise<any> {
    try {
      // Se não tiver providerId, buscar o primeiro pedido para obter o provedor
      if (!providerId && orderIds.length > 0) {
        const { data: order, error: orderError } = await this.supabase
          .from('orders')
          .select('provider_id')
          .eq('external_order_id', orderIds[0])
          .single();
        
        if (orderError || !order) {
          throw new Error(`Pedido com ID ${orderIds[0]} não encontrado`);
        }
        
        providerId = order.provider_id;
      }
      
      if (!providerId) {
        throw new Error('ID do provedor não fornecido');
      }
      
      // Buscar o provedor
      const { data: provider, error: providerError } = await this.supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (providerError || !provider) {
        throw new Error(`Provedor com ID ${providerId} não encontrado`);
      }
      
      // Inicializar o serviço de mídia social com o provedor
      const socialMediaService = new SocialMediaService(provider);
      
      // Verificar o status dos pedidos
      return await socialMediaService.checkMultipleOrdersStatus(orderIds, providerId);
    } catch (error) {
      console.error('[OrderStatusManager] Erro ao verificar status dos pedidos:', error);
      throw error;
    }
  }

  /**
   * Verifica o status de uma reposição (refill) no provedor
   * @param refillId ID da reposição
   * @param providerId ID do provedor
   * @returns Status da reposição
   */
  async checkRefillStatus(refillId: string, providerId?: string): Promise<any> {
    try {
      // Se não tiver providerId, buscar a reposição para obter o provedor
      if (!providerId) {
        const { data: refill, error: refillError } = await this.supabase
          .from('refills')
          .select('provider_id')
          .eq('external_refill_id', refillId)
          .single();
        
        if (refillError || !refill) {
          throw new Error(`Reposição com ID ${refillId} não encontrada`);
        }
        
        providerId = refill.provider_id;
      }
      
      if (!providerId) {
        throw new Error('ID do provedor não fornecido');
      }
      
      // Buscar o provedor
      const { data: provider, error: providerError } = await this.supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (providerError || !provider) {
        throw new Error(`Provedor com ID ${providerId} não encontrado`);
      }
      
      // Inicializar o serviço de mídia social com o provedor
      const socialMediaService = new SocialMediaService(provider);
      
      // Verificar o status da reposição
      return await socialMediaService.checkRefillStatus(refillId, providerId);
    } catch (error) {
      console.error('[OrderStatusManager] Erro ao verificar status da reposição:', error);
      throw error;
    }
  }

  /**
   * Atualiza o status de um pedido no banco de dados
   * @param orderId ID do pedido
   * @param status Novo status
   * @returns Pedido atualizado
   */
  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('[OrderStatusManager] Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }
}
