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
  private POSTS_DELAY_MS = 60000; // 60 segundos (1 minuto) entre cada post
  private MAX_POSTS_PER_TRANSACTION = 5;
  
  constructor(
    supabase: SupabaseClient
  ) {
    this.supabase = supabase;
    this.logger = new Logger('OrderProcessor');
    this.providerOrderService = new ProviderOrderService();
  }
  
  /**
   * Verifica se um pedido já está bloqueado para processamento
   * @param postCode Código do post
   * @param serviceId ID do serviço
   * @returns True se estiver bloqueado, false caso contrário
   */
  private async isOrderLocked(postCode: string, serviceId: string): Promise<boolean> {
    if (!postCode) return false;
    
    try {
      // Criar a chave de bloqueio
      const lockKey = `post_${postCode}_service_${serviceId}`;
      
      // Verificar se existe um bloqueio ativo na tabela core_processing_locks
      const { data, error } = await this.supabase
        .from('core_processing_locks')
        .select('id, expires_at')
        .eq('lock_key', lockKey)
        .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro quando não encontra
        
      // Se não tiver dados ou ocorreu erro, consideramos como não bloqueado
      if (error || !data) {
        return false;
      }
      
      // Verificar se o bloqueio expirou
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        // Bloqueio expirado, pode remover
        await this.supabase
          .from('core_processing_locks')
          .delete()
          .eq('id', data.id);
          
        return false;
      }
      
      // Bloqueio ainda válido
      return true;
    } catch (error) {
      this.logger.error(`Erro ao verificar bloqueio (considerando não bloqueado): ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false; // Em caso de erro, permitir processar para não bloquear o fluxo
    }
  }
  
  /**
   * Adquire um bloqueio para processamento do pedido
   * @param postCode Código do post
   * @param serviceId ID do serviço
   * @param orderId ID do pedido
   * @returns True se conseguiu adquirir o bloqueio, false caso contrário
   */
  private async lockOrder(postCode: string, serviceId: string, orderId: string): Promise<boolean> {
    if (!postCode) return true; // Se não tiver código, não precisa bloquear
    
    try {
      // Verificar se já está bloqueado
      const isLocked = await this.isOrderLocked(postCode, serviceId);
      if (isLocked) {
        this.logger.warn(`Post ${postCode} já está bloqueado para processamento. Pulando.`);
        return false;
      }
      
      // Calcular data de expiração (1 ano para ser permanente)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Criar a chave de bloqueio
      const lockKey = `post_${postCode}_service_${serviceId}`;
      
      // Adquirir bloqueio usando a estrutura atual da tabela
      const { error } = await this.supabase
        .from('core_processing_locks')
        .insert({
          transaction_id: orderId, // Usando orderId como transaction_id para compatibilidade
          lock_key: lockKey,
          locked_by: 'order-processor',
          locked_at: new Date().toISOString(),
          order_id: orderId,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            post_code: postCode,
            service_id: serviceId,
            reason: 'Pedido processado - bloqueio permanente para evitar duplicação'
          }
        });
        
      if (error) {
        // Verificar se o erro é devido à restrição única (tabela já existe com essa chave)
        if (error.code === '23505') { // Código PostgreSQL para violação de chave única
          this.logger.warn(`Bloqueio já existe para o post ${postCode} (conflito de chave única). Pedido será pulado.`);
          return false;
        }
        
        this.logger.error(`Erro ao adquirir bloqueio para post ${postCode}: ${error.message}`);
        return true; // Permitir o processamento apesar do erro, para não bloquear o fluxo
      }
      
      this.logger.success(`Bloqueio permanente adquirido para post ${postCode} no serviço ${serviceId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao gerenciar bloqueio para post ${postCode}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return true; // Em caso de erro, permitir o processamento (melhor do que impedir tudo)
    }
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
    
    // Determinar o atraso com base no número de posts
    const delayMs = ordersToProcess.length > 2 ? 60000 : this.POSTS_DELAY_MS; // 1 minuto se mais de 2 posts
    
    if (ordersToProcess.length > 1) {
      this.logger.info(`Processando ${ordersToProcess.length} posts com intervalo de ${delayMs / 1000} segundos entre eles`);
    }
    
    for (let i = 0; i < ordersToProcess.length; i++) {
      const order = ordersToProcess[i];
      
      try {
        // Se não for o primeiro post, esperar o tempo configurado
        if (i > 0) {
          this.logger.info(`Aguardando ${delayMs / 1000} segundos antes de processar o próximo pedido...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
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
      // Extrair código do post do metadata ou da URL
      const postCode = order.metadata?.post_code || this.extractPostCodeFromUrl(order.target_url);
      
      // Verificação adicional específica para transação+post_code+service_id
      if (postCode && order.transaction_id && order.service_id) {
        // Verificar se já existe um pedido processado com success para esta combinação
        const { data: existingProcessedOrders } = await this.supabase
          .from('core_orders')
          .select('id, status, external_order_id, provider_order_id')
          .eq('transaction_id', order.transaction_id)
          .eq('service_id', order.service_id)
          .eq('status', 'processing')
          .like('metadata->post_code', postCode)
          .neq('id', order.id) // Excluir o próprio pedido
          .limit(1);
          
        if (existingProcessedOrders && existingProcessedOrders.length > 0) {
          const existingOrder = existingProcessedOrders[0];
          this.logger.warn(`⚠️ DUPLICAÇÃO DETECTADA: Já existe um pedido (${existingOrder.id}) para transaction_id=${order.transaction_id}, service_id=${order.service_id}, post_code=${postCode}. Pulando pedido atual (${order.id}).`);
          
          // Atualizar o pedido atual para indicar que foi pulado devido a duplicação
          await this.supabase
            .from('core_orders')
            .update({
              status: 'skipped',
              external_order_id: existingOrder.external_order_id, // Copiar o external_order_id do pedido existente
              provider_order_id: existingOrder.provider_order_id, // Copiar o provider_order_id do pedido existente
              updated_at: new Date().toISOString(),
              metadata: {
                ...(order.metadata || {}),
                skipped_reason: 'Pedido duplicado (mesmo transaction_id, service_id e post_code)',
                skipped_at: new Date().toISOString(),
                duplicate_order_id: existingOrder.id,
                external_order_id: existingOrder.external_order_id,
                provider_order_id: existingOrder.provider_order_id
              }
            })
            .eq('id', order.id);
            
          return {
            order_id: order.id,
            success: true, // Considerado sucesso para não tentar novamente
            message: `Pedido pulado: já existe um pedido processado para esta transação, serviço e post`,
            external_order_id: existingOrder.external_order_id
          };
        }
      }
      
      // Se tiver código do post, verificar se já está bloqueado
      if (postCode) {
        const isLocked = await this.isOrderLocked(postCode, order.service_id);
        if (isLocked) {
          this.logger.warn(`Pedido ${order.id} para post ${postCode} já está bloqueado (já foi processado anteriormente). Pulando.`);
          
          // Atualizar o pedido para indicar que foi pulado devido a bloqueio
          await this.supabase
            .from('core_orders')
            .update({
              status: 'skipped',
              updated_at: new Date().toISOString(),
              metadata: {
                ...(order.metadata || {}),
                skipped_reason: 'Post já processado anteriormente (bloqueado)',
                skipped_at: new Date().toISOString()
              }
            })
            .eq('id', order.id);
            
          return {
            order_id: order.id,
            success: true, // Considerado sucesso para não tentar novamente
            message: `Pedido pulado: post ${postCode} já processado anteriormente`
          };
        }
      }
      
      // Verificação adicional: verificar se já existe um pedido com a mesma URL e service_id
      if (order.target_url) {
        const { data: existingOrders } = await this.supabase
          .from('core_orders')
          .select('id, status')
          .eq('service_id', order.service_id)
          .eq('target_url', order.target_url)
          .not('id', 'eq', order.id) // Excluir o próprio pedido
          .not('status', 'eq', 'error') // Ignorar pedidos com erro
          .limit(1);
          
        if (existingOrders && existingOrders.length > 0) {
          this.logger.warn(`Pedido ${order.id} com URL ${order.target_url} já foi processado anteriormente (pedido existente: ${existingOrders[0].id}). Pulando.`);
          
          // Atualizar o pedido para indicar que foi pulado devido a duplicação
          await this.supabase
            .from('core_orders')
            .update({
              status: 'skipped',
              updated_at: new Date().toISOString(),
              metadata: {
                ...(order.metadata || {}),
                skipped_reason: 'URL já processada anteriormente',
                skipped_at: new Date().toISOString(),
                duplicate_order_id: existingOrders[0].id
              }
            })
            .eq('id', order.id);
            
          return {
            order_id: order.id,
            success: true, // Considerado sucesso para não tentar novamente
            message: `Pedido pulado: URL ${order.target_url} já processada anteriormente`
          };
        }
      }
      
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
          const postType = post.type || (order.metadata?.post_type);
          let postId = post.id;
          let postQuantity = null;
          let postCreated = false;
          
          if (!targetUrl) {
            // Construir URL baseada no tipo e código
            targetUrl = postType === 'reel'
              ? `https://instagram.com/reel/${postCode}/`
              : `https://instagram.com/p/${postCode}/`;
          }
          
          // Verificar se a URL é de perfil e não de post
          if (targetUrl && targetUrl.includes('instagram.com/') && 
              !targetUrl.includes('/p/') && !targetUrl.includes('/reel/')) {
            this.logger.warn(`URL de perfil detectada (${targetUrl}), buscando post_code na tabela de posts...`);
            
            // Buscar posts da transação na tabela core_transaction_posts_v2
            const { data: transactionPosts } = await this.supabase
              .from('core_transaction_posts_v2')
              .select('*')
              .eq('transaction_id', order.transaction_id);
            
            if (transactionPosts && transactionPosts.length > 0) {
              this.logger.info(`Encontrados ${transactionPosts.length} posts na tabela core_transaction_posts_v2`);
              
              // Usar o primeiro post que tenha post_code
              const postWithCode = transactionPosts.find(p => p.post_code);
              
              if (postWithCode) {
                this.logger.info(`Encontrado post com código: ${postWithCode.post_code}, id: ${postWithCode.id}, quantidade: ${postWithCode.quantity || 'não definida'}`);
                
                // Salvar o ID e quantidade reais do post
                postId = postWithCode.id;
                postQuantity = postWithCode.quantity;
                
                // Determinar se é um reel baseado no tipo do post
                const isPostReel = postWithCode.post_type === 'reel';
                
                // Construir URL correta com o post_code
                targetUrl = isPostReel
                  ? `https://instagram.com/reel/${postWithCode.post_code}/`
                  : `https://instagram.com/p/${postWithCode.post_code}/`;
                  
                this.logger.info(`URL corrigida com dados da tabela: ${targetUrl}`);
                
                // Também atualizar o código do post com o valor da tabela
                const postCodeFromTable = postWithCode.post_code;
                
                posts.push({
                  id: postId,
                  code: postCodeFromTable,
                  url: targetUrl,
                  type: postWithCode.post_type || post.type,
                  username: post.username || order.target_username,
                  quantity: postQuantity
                });
                
                postCreated = true;
              } else if (order.metadata?.post_code) {
                // Caso não encontre na tabela mas tenha post_code no metadata
                // Determinar se é um reel baseado no metadata
                const isPostReel = order.metadata?.post_type === 'reel';
                
                // Construir URL correta com o post_code
                targetUrl = isPostReel
                  ? `https://instagram.com/reel/${order.metadata.post_code}/`
                  : `https://instagram.com/p/${order.metadata.post_code}/`;
                  
                this.logger.info(`URL corrigida com metadata: ${targetUrl}`);
              }
            } else if (order.metadata?.post_code) {
              // Caso não tenha posts na tabela mas tenha post_code no metadata
              this.logger.warn(`Nenhum post encontrado na tabela, mas temos post_code no metadata, corrigindo...`);
              
              // Determinar se é um reel baseado no metadata
              const isPostReel = order.metadata?.post_type === 'reel';
              
              // Construir URL correta com o post_code
              targetUrl = isPostReel
                ? `https://instagram.com/reel/${order.metadata.post_code}/`
                : `https://instagram.com/p/${order.metadata.post_code}/`;
              
              this.logger.info(`URL corrigida: ${targetUrl}`);
            }
          }
          
          // Garantir que a URL não tenha "www."
          targetUrl = targetUrl?.replace('www.', '');
          
          // Só cria um post baseado na tabela 'posts' se não criou baseado em core_transaction_posts_v2
          if (!postCreated) {
            posts.push({
              id: post.id,
              code: postCode,
              url: targetUrl,
              type: post.type || (order.metadata?.post_type),
              username: post.username || order.target_username
            });
          }
        }
      }
      
      // Se não tiver posts mas tiver URL ou username, criar um post virtual
      if (posts.length === 0 && (order.target_url || order.target_username)) {
        let targetUrl = order.target_url;
        const postCode = order.metadata?.post_code;
        const postType = order.metadata?.post_type;
        let postId = null;
        let postQuantity = null;
        let postCreated = false;
        
        if (!targetUrl) {
          // Construir URL baseada no tipo e código
          targetUrl = postType === 'reel'
            ? `https://instagram.com/reel/${postCode}/`
            : `https://instagram.com/p/${postCode}/`;
        }
        
        // Verificar se a URL é de perfil e não de post
        if (targetUrl && targetUrl.includes('instagram.com/') && 
            !targetUrl.includes('/p/') && !targetUrl.includes('/reel/')) {
          this.logger.warn(`URL de perfil detectada (${targetUrl}), buscando post_code na tabela de posts...`);
          
          // Buscar posts da transação na tabela core_transaction_posts_v2
          const { data: transactionPosts } = await this.supabase
            .from('core_transaction_posts_v2')
            .select('*')
            .eq('transaction_id', order.transaction_id);
          
          if (transactionPosts && transactionPosts.length > 0) {
            this.logger.info(`Encontrados ${transactionPosts.length} posts na tabela core_transaction_posts_v2`);
            
            // Usar o primeiro post que tenha post_code
            const postWithCode = transactionPosts.find(p => p.post_code);
            
            if (postWithCode) {
              this.logger.info(`Encontrado post com código: ${postWithCode.post_code}, id: ${postWithCode.id}, quantidade: ${postWithCode.quantity || 'não definida'}`);
              
              // Salvar o ID e quantidade reais do post
              postId = postWithCode.id;
              postQuantity = postWithCode.quantity;
              
              // Determinar se é um reel baseado no tipo do post
              const isPostReel = postWithCode.post_type === 'reel';
              
              // Construir URL correta com o post_code
              targetUrl = isPostReel
                ? `https://instagram.com/reel/${postWithCode.post_code}/`
                : `https://instagram.com/p/${postWithCode.post_code}/`;
                
              this.logger.info(`URL corrigida com dados da tabela: ${targetUrl}`);
              
              // Também atualizar o código do post com o valor da tabela
              const postCodeFromTable = postWithCode.post_code;
              
              posts.push({
                id: postId,
                code: postCodeFromTable,
                url: targetUrl,
                type: postWithCode.post_type,
                username: order.target_username,
                quantity: postQuantity
              });
              
              postCreated = true;
            } else if (order.metadata?.post_code) {
              // Caso não encontre na tabela mas tenha post_code no metadata
              // Determinar se é um reel baseado no metadata
              const isPostReel = order.metadata?.post_type === 'reel';
              
              // Construir URL correta com o post_code
              targetUrl = isPostReel
                ? `https://instagram.com/reel/${order.metadata.post_code}/`
                : `https://instagram.com/p/${order.metadata.post_code}/`;
                
              this.logger.info(`URL corrigida com metadata: ${targetUrl}`);
            }
          } else if (order.metadata?.post_code) {
            // Caso não tenha posts na tabela mas tenha post_code no metadata
            this.logger.warn(`Nenhum post encontrado na tabela, mas temos post_code no metadata, corrigindo...`);
            
            // Determinar se é um reel baseado no metadata
            const isPostReel = order.metadata?.post_type === 'reel';
            
            // Construir URL correta com o post_code
            targetUrl = isPostReel
              ? `https://instagram.com/reel/${order.metadata.post_code}/`
              : `https://instagram.com/p/${order.metadata.post_code}/`;
            
            this.logger.info(`URL corrigida: ${targetUrl}`);
          }
        }
        
        // Garantir que a URL não tenha "www."
        targetUrl = targetUrl?.replace('www.', '');
        
        // Só cria um post virtual se não conseguir obter os dados da tabela
        if (!postCreated) {
          posts.push({
            id: order.post_id || `virtual-${Date.now()}`,
            url: targetUrl,
            code: postCode,
            type: order.metadata?.post_type,
            username: order.target_username
          });
        }
      }
      
      // Se não tiver posts depois de todas as tentativas, retornar erro
      if (posts.length === 0) {
        this.logger.error(`Nenhum post válido encontrado para o pedido ${order.id}`);
        return {
          order_id: order.id,
          success: false,
          error: 'Nenhum post válido encontrado para processar'
        };
      }
      
      // Processar o primeiro post da lista
      const post = posts[0];
      
      // Se tiver código do post e serviço não for de seguidores, adquirir bloqueio
      if (post.code && service.type.toLowerCase() !== 'seguidores') {
        const lockAcquired = await this.lockOrder(post.code, order.service_id, order.id);
        if (!lockAcquired) {
          this.logger.warn(`Não foi possível adquirir bloqueio para o post ${post.code}. Pulando para evitar duplicação.`);
          
          // Atualizar o pedido para indicar que foi pulado devido a falha no bloqueio
          await this.supabase
            .from('core_orders')
            .update({
              status: 'skipped',
              updated_at: new Date().toISOString(),
              metadata: {
                ...(order.metadata || {}),
                skipped_reason: 'Não foi possível adquirir bloqueio para o post',
                skipped_at: new Date().toISOString()
              }
            })
            .eq('id', order.id);
            
          return {
            order_id: order.id,
            success: true, // Considerado sucesso para não tentar novamente
            message: `Pedido pulado: não foi possível adquirir bloqueio para o post ${post.code}`
          };
        }
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
      
      // Log para debugging do resultado
      this.logger.info(`Resultado do providerOrderService.sendOrders: ${JSON.stringify(result)}`);
      
      // Verificar resultado e atualizar o pedido
      if (result && Array.isArray(result) && result.length > 0) {
        const successfulOrder = result.find(r => r.success);
        if (successfulOrder && successfulOrder.externalOrderId) {
          // Adicionar logs para debug
          this.logger.info(`Atualizando pedido ${order.id} com ID externo ${successfulOrder.externalOrderId}`);
          this.logger.info(`Dados do resultado recebido do provedor: ${JSON.stringify(successfulOrder)}`);
          
          // Atualizar o pedido com o ID externo
          const { error: updateError } = await this.supabase
            .from('core_orders')
            .update({
              provider_order_id: successfulOrder.externalOrderId,
              external_order_id: successfulOrder.externalOrderId,
              status: 'processing',
              updated_at: new Date().toISOString(),
              metadata: {
                ...(order.metadata || {}),
                provider_response: {
                  external_order_id: successfulOrder.externalOrderId,
                  processed_at: new Date().toISOString()
                }
              }
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
        this.logger.error(`Resultado inválido ao enviar pedido ${order.id}: ${JSON.stringify(result)}`);
        
        await this.supabase
          .from('core_orders')
          .update({
            status: 'error',
            updated_at: new Date().toISOString(),
            metadata: {
              ...(order.metadata || {}),
              error: 'Resultado inválido ao enviar pedido'
            }
          })
          .eq('id', order.id);
          
        return {
          order_id: order.id,
          success: false,
          error: 'Resultado inválido ao enviar pedido'
        };
      }
    } catch (error) {
      this.logger.error(`Erro ao processar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        order_id: order.id,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Extrai o código do post da URL
   * @param url URL do post
   * @returns Código do post ou undefined se não for possível extrair
   */
  private extractPostCodeFromUrl(url?: string): string | undefined {
    if (!url || !url.includes('instagram.com')) return undefined;
    
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/]+)/);
    return match?.[1];
  }
} 