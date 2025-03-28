import { Transaction, Provider, Post, ProviderRequestData, OrderResponse } from '../types';
import { 
  DatabaseService, 
  LinkService, 
  ProviderService, 
  TransactionService 
} from './index';

/**
 * Registra uma entrada no log da transação
 */
async function logTransaction(
  databaseService: DatabaseService,
  transactionId: string,
  level: 'info' | 'warning' | 'error',
  message: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    await databaseService.logOrderSent(transactionId, '', '', {
      log_level: level,
      log_message: message,
      ...metadata
    });
  } catch (error) {
    console.error(`[LogTransaction] Erro ao registrar log:`, error);
  }
}

/**
 * Função para processar pedidos de curtidas com tratamento específico para cada tipo
 */
export async function processSpecificLikesOrder(
  transaction: Transaction, 
  provider: Provider, 
  posts: Post[], 
  username: string,
  databaseService: DatabaseService,
  linkService: LinkService,
  providerService: ProviderService,
  transactionService: TransactionService
): Promise<Array<{
  success: boolean;
  data?: {
    order: Record<string, unknown>;
    response: OrderResponse;
  };
  error?: string;
  post?: Post;
}>> {
  try {
    // Verificar a validade dos posts
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      console.error('[ProcessLikesOrder] Lista de posts inválida ou vazia');
      throw new Error('Lista de posts inválida ou vazia');
    }
    
    // Verificar o tipo de serviço para tratamento específico
    const serviceName = transaction.service?.name?.toLowerCase() || 
                        (transaction.metadata?.service as Record<string, unknown>)?.name?.toString().toLowerCase() || '';
    
    console.log('[ProcessLikesOrder] Processando serviço:', serviceName);
    console.log(`[ProcessLikesOrder] Quantidade inicial de posts: ${posts.length}`);
    
    // Registrar os posts originais para debug
    console.log('[ProcessLikesOrder] Posts originais:');
    posts.forEach((post, idx) => {
      console.log(`Post original ${idx + 1}:`, JSON.stringify({
        id: post.id,
        code: post.code || post.shortcode || post.postCode,
        link: post.link || post.url || post.postLink
      }));
    });
    
    // Registrar no log da transação a quantidade inicial de posts
    await logTransaction(
      databaseService,
      transaction.id,
      'info',
      `Iniciando processamento com ${posts.length} posts originais`,
      {
        initial_post_count: posts.length,
        service_name: serviceName,
        original_posts: posts.map(p => ({
          id: p.id,
          code: p.code || p.shortcode || p.postCode,
          link: p.link || p.url || p.postLink
        })),
        timestamp: new Date().toISOString()
      }
    );
    
    // Verificar posts duplicados independente do tipo de serviço
    // Remover possíveis duplicações de posts usando múltiplos identificadores
    const uniquePosts: Post[] = [];
    const seenIds = new Set<string>();
    const seenCodes = new Set<string>();
    const seenLinks = new Set<string>();
    const duplicates: Post[] = [];
    
    for (const post of posts) {
      // Tentar identificar o post por várias propriedades
      const postId = post.id?.toString();
      const postCode = post.code || post.shortcode || post.postCode;
      const postLink = post.link || post.url || post.postLink;
      
      // Formatar o link para o mesmo formato que será enviado ao provedor para comparação
      const formattedLink = linkService.formatPostLinkForProvider(post);
      
      // Verificar se qualquer um dos identificadores já foi visto
      if (
        (postId && seenIds.has(postId)) || 
        (postCode && seenCodes.has(postCode)) || 
        (postLink && seenLinks.has(postLink)) ||
        (formattedLink && seenLinks.has(formattedLink))
      ) {
        console.log(`[ProcessLikesOrder] Post duplicado detectado e removido:`, JSON.stringify({
          id: postId,
          code: postCode,
          link: postLink,
          formatted: formattedLink
        }));
        duplicates.push(post);
        continue;
      }
      
      // Adicionar identificadores aos conjuntos de verificação
      if (postId) seenIds.add(postId);
      if (postCode) seenCodes.add(postCode);
      if (postLink) seenLinks.add(postLink);
      if (formattedLink) seenLinks.add(formattedLink);
      
      uniquePosts.push(post);
    }
    
    console.log(`[ProcessLikesOrder] Após deduplicação: ${posts.length} posts -> ${uniquePosts.length} posts únicos`);
    
    // Log detalhado dos posts únicos para depuração
    console.log('[ProcessLikesOrder] Posts únicos após deduplicação:');
    uniquePosts.forEach((post, idx) => {
      console.log(`Post único ${idx + 1}:`, JSON.stringify({
        id: post.id,
        code: post.code || post.shortcode || post.postCode,
        link: post.link || post.url || post.postLink,
        formatted: linkService.formatPostLinkForProvider(post)
      }));
    });
    
    // Registrar no log da transação os resultados da deduplicação
    await logTransaction(
      databaseService,
      transaction.id,
      'info',
      `Deduplicação resultou em ${uniquePosts.length} posts únicos (${duplicates.length} duplicados removidos)`,
      {
        final_unique_count: uniquePosts.length,
        duplicate_count: duplicates.length,
        unique_posts: uniquePosts.map(p => ({
          id: p.id,
          code: p.code || p.shortcode || p.postCode,
          link: p.link || p.url || p.postLink,
          formatted: linkService.formatPostLinkForProvider(p)
        })),
        duplicate_posts: duplicates.map(p => ({
          id: p.id, 
          code: p.code || p.shortcode || p.postCode,
          link: p.link || p.url || p.postLink
        })),
        timestamp: new Date().toISOString()
      }
    );
    
    // Verificar se não restou nenhum post após a deduplicação
    if (uniquePosts.length === 0) {
      const errorMessage = 'Nenhum post único para processar após deduplicação';
      console.error(`[ProcessLikesOrder] ${errorMessage}`);
      
      // Registrar o erro no log da transação
      await logTransaction(
        databaseService,
        transaction.id,
        'error',
        errorMessage,
        {
          timestamp: new Date().toISOString()
        }
      );
      
      throw new Error(errorMessage);
    }
    
    // Verificar se já existem pedidos para esta transação antes de continuar
    const existingOrdersBeforeProcessing = await databaseService.getExistingOrdersForTransaction(transaction.id);
    console.log(`[ProcessLikesOrder] Pedidos já existentes antes do processamento: ${existingOrdersBeforeProcessing.length}`);
    
    // Se já existem pedidos para esta transação, verificar se todos os posts já foram processados
    if (existingOrdersBeforeProcessing.length > 0) {
      console.log('[ProcessLikesOrder] Verificando se posts já foram processados...');
      const processedPostIds = new Set<string>();
      const processedPostCodes = new Set<string>();
      const processedLinks = new Set<string>();
      
      // Coletar informações sobre posts já processados
      existingOrdersBeforeProcessing.forEach(order => {
        if (order.metadata?.post?.id) {
          processedPostIds.add(order.metadata.post.id.toString());
        }
        if (order.metadata?.post?.code || order.metadata?.post?.shortcode || order.metadata?.post?.postCode) {
          const code = order.metadata.post.code || order.metadata.post.shortcode || order.metadata.post.postCode;
          processedPostCodes.add(code);
        }
        if (order.metadata?.link) {
          processedLinks.add(order.metadata.link);
        }
      });
      
      // Filtrar apenas posts que ainda não foram processados
      const postsToProcess = uniquePosts.filter(post => {
        const postId = post.id?.toString();
        const postCode = post.code || post.shortcode || post.postCode;
        const formattedLink = linkService.formatPostLinkForProvider(post);
        
        const alreadyProcessed = 
          (postId && processedPostIds.has(postId)) || 
          (postCode && processedPostCodes.has(postCode)) ||
          (formattedLink && processedLinks.has(formattedLink));
        
        if (alreadyProcessed) {
          console.log(`[ProcessLikesOrder] Post já processado anteriormente:`, JSON.stringify({
            id: postId,
            code: postCode,
            formatted: formattedLink
          }));
        }
        
        return !alreadyProcessed;
      });
      
      console.log(`[ProcessLikesOrder] Posts restantes para processar: ${postsToProcess.length} de ${uniquePosts.length}`);
      
      // Se todos os posts já foram processados, retornar com os pedidos existentes
      if (postsToProcess.length === 0) {
        console.log('[ProcessLikesOrder] Todos os posts já foram processados. Retornando pedidos existentes.');
        
        await logTransaction(
          databaseService,
          transaction.id,
          'info',
          `Todos os ${uniquePosts.length} posts já foram processados. Nenhum novo pedido criado.`,
          {
            timestamp: new Date().toISOString()
          }
        );
        
        // Retornar os pedidos existentes formatados corretamente
        return existingOrdersBeforeProcessing.map(order => ({
          success: true,
          data: {
            order: order,
            response: order.metadata?.provider_response || {}
          },
          post: order.metadata?.post as Post
        }));
      }
      
      // Atualizar a lista de posts para processar apenas os que ainda não foram processados
      console.log(`[ProcessLikesOrder] Continuando com ${postsToProcess.length} posts não processados`);
      uniquePosts.length = 0; // Limpar o array
      uniquePosts.push(...postsToProcess); // Adicionar apenas os posts ainda não processados
    }
    
    // Tratamento específico para diferentes tipos de serviço
    if (serviceName.includes('brasileira') || serviceName.includes('premium')) {
      // Processar usando a lista de posts deduplicados
      return processPosts(uniquePosts, transaction, provider, username,
        databaseService, linkService, providerService, transactionService);
    } else {
      // Processar qualquer outro tipo de serviço com a mesma lógica
      console.log('[ProcessLikesOrder] Usando processamento padrão para o serviço:', serviceName);
      return processPosts(uniquePosts, transaction, provider, username,
        databaseService, linkService, providerService, transactionService);
    }
  } catch (error) {
    console.error('[ProcessLikesOrder] Erro ao processar pedido:', error);
    throw error;
  }
}

/**
 * Função auxiliar para processar posts
 */
async function processPosts(
  posts: Post[],
  transaction: Transaction,
  provider: Provider,
  username: string,
  databaseService: DatabaseService,
  linkService: LinkService,
  providerService: ProviderService,
  transactionService: TransactionService
): Promise<Array<{
  success: boolean;
  data?: {
    order: Record<string, unknown>;
    response: OrderResponse;
  };
  error?: string;
  post?: Post;
}>> {
  // Garantir que posts é um array válido
  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    console.error('[ProcessPosts] Lista de posts inválida ou vazia');
    throw new Error('Lista de posts inválida ou vazia');
  }
  
  const orders: Array<{
    success: boolean;
    data?: {
      order: Record<string, unknown>;
      response: OrderResponse;
    };
    error?: string;
    post?: Post;
  }> = [];
  
  // Calcular a quantidade dividida entre os posts
  const originalQuantity = transaction.service?.quantity || 
                          (transaction.metadata?.service as Record<string, unknown>)?.quantity as number || 0;
                          
  if (typeof originalQuantity !== 'number' || isNaN(originalQuantity) || originalQuantity <= 0) {
    console.error('[ProcessPosts] Quantidade inválida:', originalQuantity);
    throw new Error(`Quantidade inválida: ${originalQuantity}`);
  }
  
  const dividedQuantity = Math.floor(originalQuantity / posts.length);
  // Calcular o resto da divisão para distribuir entre os primeiros posts
  const remainder = originalQuantity % posts.length;
  
  // Criar um array com as quantidades para cada post
  const quantidadesPorPost = Array(posts.length).fill(dividedQuantity);
  
  // Distribuir o resto incrementando as quantidades dos primeiros posts
  for (let i = 0; i < remainder; i++) {
    quantidadesPorPost[i]++;
  }
  
  console.log(`[ProcessPosts] Quantidade original: ${originalQuantity}, Quantidade base: ${dividedQuantity}, Resto: ${remainder}`);
  console.log(`[ProcessPosts] Distribuição por post:`, quantidadesPorPost);
  console.log(`[ProcessPosts] Total de posts a processar: ${posts.length}`);
  
  // Verificar se já existem pedidos para esta transação
  const existingOrders = await databaseService.getExistingOrdersForTransaction(transaction.id);
  console.log(`[ProcessPosts] Pedidos já existentes para esta transação: ${existingOrders.length}`);
  
  // Registrar no log da transação o início do processamento
  await logTransaction(
    databaseService,
    transaction.id,
    'info',
    `Iniciando processamento de ${posts.length} posts com ${existingOrders.length} pedidos existentes`,
    {
      post_count: posts.length,
      existing_orders: existingOrders.length,
      divided_quantity: dividedQuantity,
      remainder: remainder,
      quantity_distribution: quantidadesPorPost,
      timestamp: new Date().toISOString()
    }
  );
  
  // Criar um conjunto para rastrear links já processados nesta execução
  const processedLinksThisSession = new Set<string>();
  
  // Contador para rastrear o índice do post atual no loop
  let postIndex = 0;
  
  for (const post of posts) {
    try {
      console.log('[ProcessPosts] Processando post:', post.id);
      
      // Formatar o link para o provedor
      const postLinkForProvider = linkService.formatPostLinkForProvider(post);
      console.log('[ProcessPosts] Link formatado para o provedor:', postLinkForProvider);
      
      // Extrair o código do post para deduplicação mais eficaz
      let postCode = null;
      try {
        if (postLinkForProvider && postLinkForProvider.includes('instagram.com')) {
          const match = postLinkForProvider.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
          if (match && match[2]) {
            postCode = match[2];
            console.log(`[ProcessPosts] Código extraído do link: ${postCode}`);
          }
        }
      } catch (error) {
        console.error('[ProcessPosts] Erro ao extrair código do link:', error);
      }
      
      // Adicionar múltiplos identificadores ao conjunto de processados para uma deduplicação mais robusta
      const postId = post.id?.toString();
      
      // Verificar se já processamos este post nesta mesma execução usando múltiplos identificadores
      if (
        processedLinksThisSession.has(postLinkForProvider) || 
        (postCode && processedLinksThisSession.has(postCode)) ||
        (postId && processedLinksThisSession.has(postId))
      ) {
        console.log(`[ProcessPosts] Post já foi processado nesta execução. Identificadores:`, {
          link: postLinkForProvider, 
          code: postCode,
          id: postId
        });
        
        await logTransaction(
          databaseService,
          transaction.id,
          'warning',
          `Ignorado post duplicado na mesma execução: ${postLinkForProvider}`,
          {
            post_id: post.id,
            post_code: postCode,
            link: postLinkForProvider,
            timestamp: new Date().toISOString()
          }
        );
        
        continue;
      }
      
      // Verificar se já existe um pedido para este post nesta transação
      // Fazemos uma verificação completa no banco de dados
      const duplicateOrder = await databaseService.checkForDuplicateOrder(
        transaction.id, 
        postLinkForProvider, 
        post.id?.toString()
      );
      
      if (duplicateOrder) {
        console.log(`[ProcessPosts] Pedido já existente para o post ${post.id}, ID: ${duplicateOrder.id}`);
        
        await logTransaction(
          databaseService,
          transaction.id,
          'warning',
          `Pedido duplicado encontrado: ${duplicateOrder.id} para post ${post.id}`,
          {
            post_id: post.id,
            post_code: post.code || post.shortcode || post.postCode,
            link: postLinkForProvider,
            existing_order_id: duplicateOrder.id,
            timestamp: new Date().toISOString()
          }
        );
        
        orders.push({
          success: true,
          data: {
            order: duplicateOrder,
            response: duplicateOrder.metadata?.provider_response || {}
          },
          post: post
        });
        
        // Adicionar todos os identificadores ao conjunto de processados para evitar reprocessamento
        processedLinksThisSession.add(postLinkForProvider);
        if (postCode) processedLinksThisSession.add(postCode);
        if (postId) processedLinksThisSession.add(postId);
        continue;
      }
      
      // Adicionar todos os identificadores ao conjunto de processados
      processedLinksThisSession.add(postLinkForProvider);
      if (postCode) processedLinksThisSession.add(postCode);
      if (postId) processedLinksThisSession.add(postId);
      
      // Extrair o ID do serviço
      const serviceId = transactionService.getServiceId(transaction);
      
      if (!serviceId) {
        console.error('[ProcessPosts] ID do serviço não encontrado na transação:', transaction);
        throw new Error('ID do serviço não encontrado na transação');
      }
      
      // Preparar os dados para a requisição ao provedor
      const providerRequestData: ProviderRequestData = {
        service: serviceId,
        link: postLinkForProvider,
        quantity: quantidadesPorPost[postIndex], // Usar a quantidade específica para este post
        transaction_id: transaction.id,
        target_username: username,
        key: provider.api_key,
        action: 'add'
      };
      
      // Log detalhado para depuração
      providerService.logRequestDetails(providerRequestData);
      
      // Registrar o envio do pedido ao provedor
      await databaseService.logOrderSent(
        transaction.id,
        postLinkForProvider,
        username,
        {
          service: serviceId,
          link: postLinkForProvider,
          quantity: quantidadesPorPost[postIndex],
          target_username: username
        }
      );
      
      // Verificar uma última vez antes de enviar ao provedor para prevenir duplicação em execuções concorrentes
      const lastCheckOrder = await databaseService.checkForDuplicateOrder(
        transaction.id, 
        postLinkForProvider, 
        post.id?.toString()
      );
      
      if (lastCheckOrder) {
        console.log(`[ProcessPosts] Pedido criado entre verificações! ID: ${lastCheckOrder.id}`);
        
        await logTransaction(
          databaseService,
          transaction.id,
          'warning',
          `Pedido detectado entre verificações: ${lastCheckOrder.id}`,
          {
            post_id: post.id,
            link: postLinkForProvider,
            timestamp: new Date().toISOString()
          }
        );
        
        orders.push({
          success: true,
          data: {
            order: lastCheckOrder,
            response: lastCheckOrder.metadata?.provider_response || {}
          },
          post: post
        });
        continue;
      }
      
      // Enviar para o endpoint do provedor
      const orderResponse = await providerService.sendOrderToProvider(provider, providerRequestData);
      console.log('[ProcessPosts] Resposta do provedor para o post:', orderResponse);
      
      // Criar pedido no banco de dados
      const order = await databaseService.createOrderInDatabase(
        transaction, 
        provider, 
        orderResponse, 
        postLinkForProvider, 
        username, 
        post, 
        posts.length, 
        providerRequestData
      );
      
      orders.push({
        success: true,
        data: {
          order: order,
          response: orderResponse
        },
        post: post
      });
      
      // Incrementar o índice do post após o processamento bem-sucedido
      postIndex++;
      
    } catch (error) {
      console.error('[ProcessPosts] Erro ao processar post:', post, error);
      
      // Registrar o erro no log da transação
      await logTransaction(
        databaseService,
        transaction.id,
        'error',
        `Erro ao processar post: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        {
          post_id: post.id,
          post_code: post.code || post.shortcode || post.postCode,
          link: post.link || post.url || post.postLink,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      );
      
      orders.push({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        post: post
      });
      
      // Continuar processando os próximos posts
      continue;
    }
  }
  
  // Registrar finalização do processamento
  await logTransaction(
    databaseService,
    transaction.id,
    'info',
    `Processamento finalizado: ${orders.filter(o => o.success).length} sucessos, ${orders.filter(o => !o.success).length} falhas`,
    {
      successful_posts: orders.filter(o => o.success).length,
      failed_posts: orders.filter(o => !o.success).length,
      timestamp: new Date().toISOString()
    }
  );
  
  // Atualizar o status da transação
  await databaseService.updateTransactionStatus(transaction.id);
  
  return orders;
} 