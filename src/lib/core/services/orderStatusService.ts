import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/core/utils/logger';
import { Database } from '@/lib/database.types';
import axios from 'axios';

export type OrderStatusResult = {
  orderId: string;
  success: boolean;
  previousStatus?: string;
  newStatus?: string;
  statusChanged: boolean;
  error?: Error | unknown;
};

export type OrdersStatusCheckResult = {
  totalProcessed: number;
  successCount: number;
  failCount: number;
  statusChangedCount: number;
  message?: string;
  error?: Error | unknown;
  results: OrderStatusResult[];
};

export class OrderStatusService {
  private supabase: SupabaseClient<Database>;
  private logger: Logger;
  private apiKey: string;
  private providerApiUrl: string;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.logger = new Logger('OrderStatusService');
    this.apiKey = process.env.PROVIDER_API_KEY || '';
    this.providerApiUrl = process.env.PROVIDER_API_URL || '';
  }

  /**
   * Verifica o status de um pedido específico
   * @param orderId ID do pedido a ser verificado
   * @returns Resultado da verificação do status
   */
  async checkOrderStatus(orderId: string): Promise<OrderStatusResult> {
    try {
      this.logger.info(`Verificando status do pedido ${orderId}`);
      
      // Buscar informações do pedido
      const { data: order, error: orderError } = await this.supabase
        .from('core_orders')
        .select('id, provider_order_id, status')
        .eq('id', orderId)
        .single();
      
      if (orderError || !order) {
        this.logger.error(`Erro ao buscar pedido ${orderId}: ${orderError?.message || 'Pedido não encontrado'}`);
        return {
          orderId,
          success: false,
          statusChanged: false,
          error: orderError || new Error('Pedido não encontrado')
        };
      }

      // Se não tiver ID do pedido no provedor, não podemos verificar o status
      if (!order.provider_order_id) {
        this.logger.warn(`Pedido ${orderId} não possui ID do provedor`);
        return {
          orderId,
          success: false,
          statusChanged: false,
          error: new Error('Pedido não possui ID do provedor')
        };
      }

      // Fazer requisição para o provedor
      const response = await axios.post(
        `${this.providerApiUrl}/order/status`,
        {
          key: this.apiKey,
          order: order.provider_order_id
        }
      );

      if (response.status !== 200) {
        this.logger.error(`Erro na resposta do provedor para o pedido ${orderId}: ${response.status}`);
        return {
          orderId,
          success: false,
          statusChanged: false,
          error: new Error(`Erro na resposta do provedor: ${response.status}`)
        };
      }

      const providerStatus = response.data;
      
      // Mapear o status do provedor para o nosso formato
      let newStatus = order.status;
      if (providerStatus.status === 'Pending') newStatus = 'pending';
      else if (providerStatus.status === 'In progress') newStatus = 'in_progress';
      else if (providerStatus.status === 'Completed') newStatus = 'completed';
      else if (providerStatus.status === 'Partial') newStatus = 'partial';
      else if (providerStatus.status === 'Canceled') newStatus = 'cancelled';
      else if (providerStatus.status === 'Processing') newStatus = 'processing';
      else if (providerStatus.status === 'Failed') newStatus = 'failed';
      
      const statusChanged = newStatus !== order.status;
      
      // Atualizar o status no banco se houve mudança
      if (statusChanged) {
        this.logger.info(`Status do pedido ${orderId} alterado de ${order.status} para ${newStatus}`);
        
        const { error: updateError } = await this.supabase
          .from('core_orders')
          .update({
            status: newStatus,
            last_status_check: new Date().toISOString(),
            last_status_response: providerStatus,
            start_count: providerStatus.start_count || null,
            remains: providerStatus.remains || null
          })
          .eq('id', orderId);
          
        if (updateError) {
          this.logger.error(`Erro ao atualizar status do pedido ${orderId}: ${updateError.message}`);
          return {
            orderId,
            success: false,
            previousStatus: order.status,
            newStatus,
            statusChanged: true,
            error: updateError
          };
        }
      } else {
        // Mesmo se o status não mudou, atualizar a data da última verificação
        const { error: updateError } = await this.supabase
          .from('core_orders')
          .update({
            last_status_check: new Date().toISOString()
          })
          .eq('id', orderId);
          
        if (updateError) {
          this.logger.warn(`Erro ao atualizar data de verificação do pedido ${orderId}: ${updateError.message}`);
        }
      }
      
      return {
        orderId,
        success: true,
        previousStatus: order.status,
        newStatus,
        statusChanged
      };
    } catch (error) {
      this.logger.error(`Erro ao verificar status do pedido ${orderId}:`, error);
      return {
        orderId,
        success: false,
        statusChanged: false,
        error
      };
    }
  }
  
  /**
   * Verifica o status de múltiplos pedidos
   * @param limit Número máximo de pedidos a serem verificados
   * @returns Resultado das verificações de status
   */
  async checkOrdersStatus(limit = 50): Promise<OrdersStatusCheckResult> {
    const results: OrderStatusResult[] = [];
    let successCount = 0;
    let failCount = 0;
    let statusChangedCount = 0;
    
    try {
      this.logger.info(`Iniciando verificação de status para até ${limit} pedidos`);
      
      // Buscar pedidos pendentes ou em processamento que tenham ID do provedor
      const { data: orders, error: ordersError } = await this.supabase
        .from('core_orders')
        .select('id')
        .in('status', ['pending', 'in_progress', 'processing'])
        .not('provider_order_id', 'is', null)
        .order('created_at', { ascending: true })
        .limit(limit);
      
      if (ordersError) {
        this.logger.error(`Erro ao buscar pedidos pendentes: ${ordersError.message}`);
        return {
          totalProcessed: 0,
          successCount: 0,
          failCount: 0,
          statusChangedCount: 0,
          error: ordersError,
          results: []
        };
      }
      
      if (!orders || orders.length === 0) {
        this.logger.info('Nenhum pedido pendente encontrado para verificação de status');
        return {
          totalProcessed: 0,
          successCount: 0,
          failCount: 0,
          statusChangedCount: 0,
          message: 'Nenhum pedido pendente encontrado',
          results: []
        };
      }
      
      this.logger.info(`Verificando status de ${orders.length} pedidos`);
      
      // Verificar o status de cada pedido
      for (const order of orders) {
        const result = await this.checkOrderStatus(order.id);
        results.push(result);
        
        if (result.success) {
          successCount++;
          if (result.statusChanged) {
            statusChangedCount++;
          }
        } else {
          failCount++;
        }
      }
      
      this.logger.info(`Verificação de status concluída: ${successCount} sucesso, ${failCount} falhas, ${statusChangedCount} alterações de status`);
      
      return {
        totalProcessed: orders.length,
        successCount,
        failCount,
        statusChangedCount,
        results
      };
    } catch (error) {
      this.logger.error('Erro ao verificar status dos pedidos:', error);
      return {
        totalProcessed: results.length,
        successCount,
        failCount,
        statusChangedCount,
        error,
        results
      };
    }
  }
} 