import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/core/utils/logger';
import { ProviderOrderService } from '@/lib/core/services/providerOrderService';

/**
 * Interface para o formato de um pedido
 */
interface OrderData {
  id: string;
  transaction_id: string;
  service_id: string;
  provider_id: string;
  status: string;
  quantity: number;
  target_url?: string;
  target_username?: string;
  metadata?: {
    post_code?: string;
    post_type?: string;
    service_type?: string;
    [key: string]: unknown;
  };
  post_id?: string;
  created_at?: string;
  [key: string]: unknown;
}

/**
 * Interface para representar o resultado do processamento de uma ordem
 */
export interface OrderProcessResult {
  status: 'success' | 'error' | 'skipped';
  orderId?: string;
  providerOrderId?: string;
  error?: string;
  message?: string;
}

/**
 * Classe responsável por processar pedidos pendentes e enviá-los aos provedores
 */
export class OrderProcessor {
  private supabase: SupabaseClient;
  private logger: Logger;
  private providerOrderService: ProviderOrderService;
  
  // Configurações para processamento em lote
  private POSTS_DELAY_MS = 50000; // 50 segundos entre cada post
  private MAX_POSTS_PER_TRANSACTION = 5;
  
  constructor(
    supabase: SupabaseClient
  ) {
    this.supabase = supabase;
    this.logger = new Logger('OrderProcessor');
    this.providerOrderService = new ProviderOrderService();
  }
  
  /**
   * Processa pedidos pendentes e os envia aos provedores
   * @returns Resultado do processamento
   */
  async processPendingOrders() {
    try {
      this.logger.info('Buscando pedidos pendentes para envio...');
      
      // Agrupar pedidos pendentes por transação para processamento escalonado
      const pendingOrdersByTransaction = await this.getPendingOrdersGroupedByTransaction();
      
      if (Object.keys(pendingOrdersByTransaction).length === 0) {
        this.logger.info('Nenhum pedido pendente encontrado para processamento');
        return {
          success: true,
          processed: 0,
          message: 'Nenhum pedido pendente para processamento'
        };
      }
      
      this.logger.info(`Encontradas ${Object.keys(pendingOrdersByTransaction).length} transações com pedidos pendentes`);
      
      const results = [];
      let totalProcessed = 0;
      
      // Processar cada transação separadamente
      for (const transactionId of Object.keys(pendingOrdersByTransaction)) {
        const transactionOrders = pendingOrdersByTransaction[transactionId];
        this.logger.info(`Processando ${transactionOrders.length} pedidos da transação ${transactionId}`);
        
        // Processar pedidos da mesma transação com intervalo entre eles
        const transactionResults = await this.processOrdersWithDelay(transactionOrders);
        
        results.push(...transactionResults);
        totalProcessed += transactionOrders.length;
      }
      
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: true,
        processed: totalProcessed,
        success_count: successCount,
        error_count: totalProcessed - successCount,
        results
      };
    } catch (error) {
      this.logger.error(`Erro ao processar pedidos pendentes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Obtém pedidos pendentes agrupados por transação
   * @returns Mapa de transação -> array de pedidos
   */
  private async getPendingOrdersGroupedByTransaction() {
    const { data: pendingOrders, error: fetchError } = await this.supabase
      .from('core_orders')
      .select(`
        id,
        transaction_id,
        service_id,
        provider_id,
        status,
        quantity,
        target_url,
        target_username,
        metadata,
        post_id,
        created_at
      `)
      .eq('status', 'pending')
      .is('provider_order_id', null)
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      this.logger.error(`Erro ao buscar pedidos pendentes: ${fetchError.message}`);
      throw new Error(`Erro ao buscar pedidos pendentes: ${fetchError.message}`);
    }
    
    if (!pendingOrders || pendingOrders.length === 0) {
      return {};
    }
    
    // Agrupar pedidos por transaction_id
    const ordersByTransaction: Record<string, OrderData[]> = {};
    
    for (const order of pendingOrders) {
      const orderData = order as OrderData;
      if (!ordersByTransaction[orderData.transaction_id]) {
        ordersByTransaction[orderData.transaction_id] = [];
      }
      
      ordersByTransaction[orderData.transaction_id].push(orderData);
    }
    
    return ordersByTransaction;
  }
  
  /**
   * Processa pedidos da mesma transação com um atraso entre eles
   * @param orders Pedidos da mesma transação
   * @returns Resultados do processamento
   */
  private async processOrdersWithDelay(orders: OrderData[]) {
    const results = [];
    
    // Limitar número máximo de posts por transação
    const ordersToProcess = orders.slice(0, this.MAX_POSTS_PER_TRANSACTION);
    
    if (ordersToProcess.length > 1) {
      this.logger.info(`Processando ${ordersToProcess.length} posts com intervalo de ${this.POSTS_DELAY_MS / 1000} segundos entre eles`);
    }
    
    for (let i = 0; i < ordersToProcess.length; i++) {
      const order = ordersToProcess[i];
      
      try {
        // Se não for o primeiro post, esperar o tempo configurado
        if (i > 0) {
          this.logger.info(`Aguardando ${this.POSTS_DELAY_MS / 1000} segundos antes de processar o próximo pedido...`);
          await new Promise(resolve => setTimeout(resolve, this.POSTS_DELAY_MS));
        }
        
        this.logger.info(`Processando pedido ${order.id} (${i + 1}/${ordersToProcess.length}) da transação ${order.transaction_id}`);
        
        const result = await this.processOrder(order);
        results.push(result);
      } catch (error) {
        this.logger.error(`Erro ao processar pedido ${order.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        
        results.push({
          order_id: order.id,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Processa um pedido individual
   * @param order Pedido a ser processado
   * @returns Resultado do processamento
   */
  private async processOrder(order: OrderData) {
    try {
      // Obter dados do serviço
      const { data: service, error: serviceError } = await this.supabase
        .from('services')
        .select('*')
        .eq('id', order.service_id)
        .single();
        
      if (serviceError || !service) {
        this.logger.error(`Erro ao buscar serviço ${order.service_id}: ${serviceError?.message || 'Serviço não encontrado'}`);
        return {
          order_id: order.id,
          success: false,
          error: `Erro ao buscar serviço: ${serviceError?.message || 'Serviço não encontrado'}`
        };
      }
      
      // Obter dados do post, se necessário
      const posts = [];
      if (order.post_id) {
        const { data: post, error: postError } = await this.supabase
          .from('posts')
          .select('*')
          .eq('id', order.post_id)
          .single();
          
        if (!postError && post) {
          let targetUrl = post.url || order.target_url;
          const postCode = post.code || (order.metadata?.post_code);
          const isReel = post.type || (order.metadata?.post_type) === 'reel';
          
          if (!targetUrl) {
            // Construir URL baseada no tipo e código
            targetUrl = isReel
              ? `https://instagram.com/reel/${postCode}/`
              : `https://instagram.com/p/${postCode}/`;
          }
          
          // CORREÇÃO: Verificar se a URL é de perfil e não de post - isso indica um problema
          if (targetUrl && targetUrl.includes('instagram.com/') && 
              !targetUrl.includes('/p/') && !targetUrl.includes('/reel/') && 
              order.metadata?.post_code) {
            this.logger.warn(`URL de perfil detectada (${targetUrl}) mas temos post_code, corrigindo para URL de post...`);
            
            // Determinar se é um reel baseado no metadata
            const isPostReel = order.metadata?.post_type === 'reel';
            
            // Construir URL correta com o post_code
            targetUrl = isPostReel
              ? `https://instagram.com/reel/${order.metadata.post_code}/`
              : `https://instagram.com/p/${order.metadata.post_code}/`;
              
            this.logger.info(`URL corrigida: ${targetUrl}`);
          }
          
          // Garantir que a URL não tenha "www."
          targetUrl = targetUrl.replace('www.', '');
          
          posts.push({
            id: post.id,
            code: postCode,
            url: targetUrl,
            type: post.type || (order.metadata?.post_type),
            username: post.username || order.target_username
          });
        }
      }
      
      // Se não tiver posts mas tiver URL ou username, criar um post virtual
      if (posts.length === 0 && (order.target_url || order.target_username)) {
        let targetUrl = order.target_url;
        const postCode = order.metadata?.post_code;
        const isReel = order.metadata?.post_type === 'reel';
        
        if (!targetUrl) {
          // Construir URL baseada no tipo e código
          targetUrl = isReel
            ? `https://instagram.com/reel/${postCode}/`
            : `https://instagram.com/p/${postCode}/`;
        }
        
        // CORREÇÃO: Verificar se a URL é de perfil e não de post - isso indica um problema
        if (targetUrl && targetUrl.includes('instagram.com/') && 
            !targetUrl.includes('/p/') && !targetUrl.includes('/reel/') && 
            order.metadata?.post_code) {
          this.logger.warn(`URL de perfil detectada (${targetUrl}) mas temos post_code, corrigindo para URL de post...`);
          
          // Determinar se é um reel baseado no metadata
          const isPostReel = order.metadata?.post_type === 'reel';
          
          // Construir URL correta com o post_code
          targetUrl = isPostReel
            ? `https://instagram.com/reel/${order.metadata.post_code}/`
            : `https://instagram.com/p/${order.metadata.post_code}/`;
            
          this.logger.info(`URL corrigida: ${targetUrl}`);
        }
        
        // Garantir que a URL não tenha "www."
        targetUrl = targetUrl.replace('www.', '');
        
        posts.push({
          id: order.post_id || `virtual-${Date.now()}`,
          url: targetUrl,
          code: postCode,
          type: order.metadata?.post_type,
          username: order.target_username
        });
      }
      
      // Determinar o tipo de serviço
      const serviceType = order.metadata?.service_type || service.type || 'unknown';
      
      // Enviar o pedido para o provedor
      const result = await this.providerOrderService.sendOrders({
        transactionId: order.transaction_id,
        serviceId: order.service_id,
        serviceType: serviceType,
        providerId: order.provider_id,
        posts: posts,
        quantity: order.quantity,
        externalServiceId: service.external_id
      });
      
      // Verificar resultado e atualizar o pedido
      if (result && Array.isArray(result) && result.length > 0) {
        const successfulOrder = result.find(r => r.success);
        if (successfulOrder && successfulOrder.externalOrderId) {
          // Atualizar o pedido com o ID externo
          const { error: updateError } = await this.supabase
            .from('core_orders')
            .update({
              provider_order_id: successfulOrder.externalOrderId,
              external_order_id: successfulOrder.externalOrderId,
              status: 'processing',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);
            
          if (updateError) {
            this.logger.error(`Erro ao atualizar pedido ${order.id}: ${updateError.message}`);
          } else {
            this.logger.success(`Pedido ${order.id} enviado com sucesso para o provedor. ID externo: ${successfulOrder.externalOrderId}`);
          }
          
          return {
            order_id: order.id,
            success: true,
            external_order_id: successfulOrder.externalOrderId
          };
        } else {
          // Registrar falha no pedido
          const errorMessages = result.map(r => r.error).filter(Boolean).join('; ');
          this.logger.error(`Falha ao enviar pedido ${order.id} para o provedor: ${errorMessages}`);
          
          await this.supabase
            .from('core_orders')
            .update({
              status: 'error',
              updated_at: new Date().toISOString(),
              metadata: {
                ...(order.metadata || {}),
                error: errorMessages
              }
            })
            .eq('id', order.id);
            
          return {
            order_id: order.id,
            success: false,
            error: errorMessages
          };
        }
      } else {
        this.logger.error(`Resultado inválido ao enviar pedido ${order.id} para o provedor`);
        return {
          order_id: order.id,
          success: false,
          error: 'Resultado inválido do provedor'
        };
      }
    } catch (error) {
      this.logger.error(`Erro ao processar pedido ${order.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        order_id: order.id,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 