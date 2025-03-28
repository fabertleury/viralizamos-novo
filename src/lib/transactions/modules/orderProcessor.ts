import { createClient } from '@/lib/supabase/server';
import { 
  DatabaseService, 
  CustomerService, 
  OrderService, 
  TransactionService, 
  LinkService,
  PostDeduplicationService 
} from './services';
import { OldProviderService } from './provider/oldProviderService';
import { ProviderService } from './provider/providerService';
import { 
  Post, 
  Provider, 
  ProviderRequestData, 
  OrderResponse,
  ProcessOrderResult
} from './types';
import type { Transaction } from './types';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

// Delay entre requisições para evitar rate limiting
const API_REQUEST_DELAY = 1000; // 1 segundo
const POST_PROCESSING_DELAY = 60000; // 60 segundos entre posts

/**
 * Configurações globais de segurança para processamento de transações
 */
// Número máximo de posts/reels para qualquer serviço
const MAX_LINKS_PER_ORDER = 5;
// Intervalo entre o envio de cada post/reel (60 segundos)
// Este intervalo é fundamental para:
// 1. Evitar sobrecarga nos provedores
// 2. Reduzir o risco de ações de segurança do Instagram contra atividade suspeita
// 3. Melhorar a taxa de sucesso dos pedidos
// 4. Garantir que os pedidos sejam processados sequencialmente e com segurança
const LINK_PROCESSING_INTERVAL = POST_PROCESSING_DELAY;

// Função utilitária para aguardar x milissegundos
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cache de últimos pedidos de seguidores para prevenir duplicação
const followerRequestCache = new Map<string, {
  timestamp: number,
  orderId: string,
  transactionId: string
}>();

// Tempo mínimo entre pedidos de seguidores para o mesmo perfil (10 minutos = 600000 ms)
const MIN_FOLLOWER_REQUEST_INTERVAL = 600000;

// Adicione métodos para o DatabaseService para lidar com logs
// Atualizando a classe DatabaseService com métodos de log
DatabaseService.prototype.logWarningForTransaction = async function(
  transactionId: string, 
  message: string, 
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('transaction_logs').insert({
      transaction_id: transactionId,
      level: 'warning',
      message: message,
      metadata: {
        ...metadata,
        logged_at: new Date().toISOString()
      }
    });
    console.log(`[DatabaseService] Log de aviso registrado para transação ${transactionId}: ${message}`);
  } catch (error) {
    console.error(`[DatabaseService] Erro ao registrar log de aviso:`, error);
  }
};

DatabaseService.prototype.logInfoForTransaction = async function(
  transactionId: string, 
  message: string, 
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('transaction_logs').insert({
      transaction_id: transactionId,
      level: 'info',
      message: message,
      metadata: {
        ...metadata,
        logged_at: new Date().toISOString()
      }
    });
    console.log(`[DatabaseService] Log de informação registrado para transação ${transactionId}: ${message}`);
  } catch (error) {
    console.error(`[DatabaseService] Erro ao registrar log de informação:`, error);
  }
};

// Função para garantir que o diretório log existe
function ensureLogDirectoryExists() {
  const logDir = path.join(process.cwd(), 'log');
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
      console.log('[Logger] Diretório de log criado:', logDir);
    } catch (err) {
      console.error('[Logger] Erro ao criar diretório de log:', err);
    }
  }
  return logDir;
}

// Função para registrar log em arquivo
function logToFile(message: string) {
  try {
    const logDir = ensureLogDirectoryExists();
    const date = new Date();
    const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const logFile = path.join(logDir, `order-processor-${dateStr}.log`);
    
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error('[Logger] Erro ao escrever no arquivo de log:', err);
  }
}

/**
 * Processador de pedidos
 */
export class OrderProcessor {
  private databaseService = new DatabaseService();
  private customerService = new CustomerService();
  private oldProviderService = new OldProviderService();
  private providerService: ProviderService;
  private linkService = new LinkService();
  private orderService = new OrderService();
  private transactionService = new TransactionService();
  private postDeduplicationService = new PostDeduplicationService();
  private supabase = createClient();
  private transactionLocks = new Map<string, boolean>();

  constructor() {
    // Injetar databaseService no providerService para evitar importação circular
    this.providerService = new ProviderService(this.databaseService);
  }

  /**
   * Processa pedidos de curtidas com múltiplos posts
   * @param transaction Dados da transação
   * @param provider Provedor a ser utilizado
   * @param posts Lista de posts para processar
   * @param username Nome de usuário para o pedido
   * @returns Lista de pedidos criados
   */
  async processLikesOrder(transaction: Transaction, provider: Provider, posts?: Post[], username?: string): Promise<Array<{
    success: boolean;
    data?: {
      order: Record<string, unknown>;
      response: OrderResponse;
    };
    error?: string;
    post?: Post;
  }>> {
    console.log('[OrderProcessor] Processando pedido de curtidas');
    logToFile(`[OrderProcessor] Processando pedido de curtidas para transação ${transaction.id}`);
    
    try {
      // Verificar se existem pedidos existentes antes de qualquer processamento
      const existingOrders = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
      console.log(`[DatabaseService] Encontrados ${existingOrders.length} pedidos existentes para a transação`);
      logToFile(`[OrderProcessor] Encontrados ${existingOrders.length} pedidos existentes para a transação ${transaction.id}`);
      
      // Se já existem pedidos, retornar sem criar novos para evitar duplicação
      if (existingOrders.length > 0) {
        console.log(`[OrderProcessor] Transação ${transaction.id} já possui ${existingOrders.length} pedidos processados. Retornando pedidos existentes.`);
        logToFile(`[OrderProcessor] Transação ${transaction.id} já possui ${existingOrders.length} pedidos processados. Retornando pedidos existentes.`);
        return existingOrders.map(order => ({
            success: true,
            data: {
            order,
            response: order.metadata?.provider_response || {} as OrderResponse
          },
          post: order.metadata?.post as Post
        }));
      }
      
      // Tentar adquirir o lock ANTES de iniciar qualquer processamento
      const isLocked = await this.isTransactionLocked(transaction.id);
      if (isLocked) {
        console.log(`[OrderProcessor] Transação ${transaction.id} já está sendo processada por outro processo`);
        throw new Error(`Esta transação já está sendo processada`);
      }
      
      // Adquirir lock para evitar processamento duplicado
      await this.lockTransaction(transaction.id);
      console.log(`[OrderProcessor] Lock adquirido para transação ${transaction.id}`);
      
      try {
        // Verificar novamente pedidos existentes após o lock (caso tenham sido criados entre a verificação e o lock)
        const existingOrdersAfterLock = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
        if (existingOrdersAfterLock.length > 0) {
          console.log(`[OrderProcessor] Pedidos criados entre a verificação inicial e o lock. Retornando pedidos existentes.`);
          logToFile(`[OrderProcessor] Pedidos criados entre a verificação inicial e o lock. Retornando pedidos existentes.`);
          return existingOrdersAfterLock.map(order => ({
            success: true,
            data: {
              order,
              response: order.metadata?.provider_response || {} as OrderResponse
            },
            post: order.metadata?.post as Post
          }));
        }
        
        // Validar posts
        if (!posts || posts.length === 0) {
          console.error('[OrderProcessor] Nenhum post encontrado para processar');
          throw new Error('Nenhum post encontrado para processar');
        }
        
        // Log de diagnóstico dos posts recebidos
        console.log(`[OrderProcessor] Recebidos ${posts.length} posts para processar:`);
        logToFile(`[OrderProcessor] Recebidos ${posts.length} posts para processar para transação ${transaction.id}:`);
        posts.forEach((post, index) => {
          console.log(`[OrderProcessor] Post ${index + 1}:`, post);
          logToFile(`[OrderProcessor] Post ${index + 1}: ${JSON.stringify(post)}`);
        });
        
        // Deduplica usando o serviço específico para garantir consistência
        let postsToProcess = [];
        try {
          logToFile(`[OrderProcessor] Iniciando deduplicação com ${posts.length} posts para transação ${transaction.id}`);
          postsToProcess = this.postDeduplicationService.deduplicatePosts(posts);
          logToFile(`[OrderProcessor] Deduplicação concluída para transação ${transaction.id}`);
          
          // Verificar se o resultado é válido
          if (!postsToProcess || !Array.isArray(postsToProcess)) {
            console.error('[OrderProcessor] Erro na deduplicação: resultado não é um array válido', postsToProcess);
            logToFile(`[OrderProcessor] ERRO na deduplicação: resultado não é um array válido: ${JSON.stringify(postsToProcess)}`);
            // Usar o array original como fallback
            postsToProcess = [...posts];
            console.log('[OrderProcessor] Usando array original de posts como fallback');
            logToFile('[OrderProcessor] Usando array original de posts como fallback');
            
            // Registrar este erro
            await this.databaseService.logWarningForTransaction(
              transaction.id,
              'Erro na deduplicação de posts, usando posts originais',
              { posts_count: posts.length }
            );
          }
        } catch (deduplicationError) {
          console.error('[OrderProcessor] Erro ao deduplica posts:', deduplicationError);
          logToFile(`[OrderProcessor] ERRO ao deduplica posts: ${deduplicationError}`);
          // Em caso de erro, usar o array original
          postsToProcess = [...posts];
          console.log('[OrderProcessor] Usando array original de posts devido a erro');
          logToFile('[OrderProcessor] Usando array original de posts devido a erro');
          
          // Registrar este erro
          await this.databaseService.logWarningForTransaction(
            transaction.id,
            'Erro ao deduplica posts',
            { 
              error: String(deduplicationError),
              original_posts_count: posts.length 
            }
          );
        }
        
        console.log(`[OrderProcessor] Após deduplicação: ${postsToProcess.length} posts únicos`);
        logToFile(`[OrderProcessor] Após deduplicação: ${postsToProcess.length} posts únicos para transação ${transaction.id}`);
        postsToProcess.forEach((post, index) => {
          logToFile(`[OrderProcessor] Post único ${index + 1}: ${JSON.stringify({
            code: post.postCode || post.code || post.shortcode,
            link: post.link || post.url,
            id: post.id
          })}`);
        });
        
        // Verificar se ainda temos posts para processar após a deduplicação
        if (postsToProcess.length === 0) {
          console.error('[OrderProcessor] Nenhum post único restante após deduplicação');
          throw new Error('Nenhum post único para processar após deduplicação');
        }
        
        // Se não tiver username, tentar extrair dos metadados da transação
        if (!username) {
          username = transaction.target_username || 
                    transaction.metadata?.username || 
                    transaction.metadata?.profile?.username;
          console.log('[OrderProcessor] Usando username dos metadados da transação:', username);
        }
        
        if (!username) {
          throw new Error('Username não encontrado');
        }
        
        console.log('[OrderProcessor] Checkout de curtidas para:', username);
        
        const orders: Array<{
          success: boolean;
          data?: {
            order: any;
            response: OrderResponse;
          };
          error?: string;
          post?: Post;
        }> = [];
        
        // Limitar a no máximo 5 posts para garantir segurança
        const maxPosts = MAX_LINKS_PER_ORDER;
        if (postsToProcess.length > maxPosts) {
          console.log(`[OrderProcessor] Limitando o número de posts para ${maxPosts} (original: ${postsToProcess.length})`);
          
          // Registrar aviso nos logs
          await this.databaseService.logWarningForTransaction(
            transaction.id,
            `Número de posts excede o limite, processando apenas ${maxPosts} posts`,
            {
              original_count: postsToProcess.length,
              max_allowed: maxPosts,
              username,
              selected_posts: postsToProcess.slice(0, maxPosts).map(p => p.postCode || p.code || p.shortcode || p.link || p.url)
            }
          );
        }
        
        // Pegar apenas os primeiros 5 posts
        const limitedPosts = postsToProcess.slice(0, maxPosts);
        
        // Calcular a quantidade dividida entre os posts
        const originalQuantity = transaction.service?.quantity || transaction.metadata?.service?.quantity || 0;
        const dividedQuantity = Math.floor(originalQuantity / limitedPosts.length);
        const remainder = originalQuantity % limitedPosts.length;
        
        // Criar um array com as quantidades para cada post
        const quantidadesPorPost = Array(limitedPosts.length).fill(dividedQuantity);
        // Distribuir o resto entre os primeiros posts
        for (let i = 0; i < remainder; i++) {
          quantidadesPorPost[i]++;
        }
        
        console.log(`[OrderProcessor] Quantidade original: ${originalQuantity}, distribuída como:`, quantidadesPorPost);
        
        // Registrar os links que já foram processados para evitar duplicação
        const processedLinks = new Set<string>(); // Rastrear links já processados dentro desta execução
        
        for (let i = 0; i < limitedPosts.length; i++) {
          const post = limitedPosts[i];
          try {
            console.log(`[OrderProcessor] Processando post ${i+1}/${limitedPosts.length} para curtidas:`, post);
            
            // Formatar o link para o provedor
            let postLinkForProvider = this.linkService.formatPostLinkForProvider(post);
            
            // Se não conseguir formatar, usar o link original
            if (!postLinkForProvider) {
              postLinkForProvider = post.link || post.url || '';
              if (!postLinkForProvider) {
                console.error('[OrderProcessor] Não foi possível determinar o link do post.');
                orders.push({
                  success: false,
                  error: 'Link do post não encontrado',
                  post
                });
                continue;
              }
            }
            
            // Verificar se já processamos este link antes
            if (processedLinks.has(postLinkForProvider)) {
              console.log(`[OrderProcessor] Link já processado anteriormente, pulando: ${postLinkForProvider}`);
              orders.push({
                success: false,
                error: 'Link já processado anteriormente',
                post
              });
              continue;
            }
            
            // Registrar o link como processado
            processedLinks.add(postLinkForProvider);
                        
            // Quantidade para este post específico
            const quantidade = quantidadesPorPost[i];
            
            // Extrair ID do serviço do provedor
            const serviceId = transaction.metadata?.provider_service_id || 
                             transaction.provider_service_id || 
                             transaction.service?.id;
            
            if (!serviceId) {
              console.error('[OrderProcessor] ID do serviço do provedor não encontrado');
              orders.push({
                success: false,
                error: 'ID do serviço não encontrado',
                post
              });
              continue;
            }
            
            // Preparar dados para a requisição
            const providerRequestData: ProviderRequestData = {
              link: postLinkForProvider,
              quantity: quantidade,
              service: serviceId,
              action: 'add',
              username,
              transaction_id: transaction.id
            };
            
            // Log detalhado para diagnóstico
            console.log(`[OrderProcessor] Enviando pedido para provedor:`, {
              link: providerRequestData.link,
              quantity: providerRequestData.quantity,
              service: providerRequestData.service,
              username: providerRequestData.username
            });
            
            // Se usar o provider antigo ou o novo, dependendo das configurações
            let orderResponse;
            const useLegacyApi = provider.use_legacy_api === true || provider.api_type === 'legacy';
            
            if (useLegacyApi) {
              console.log('[OrderProcessor] Usando API legada para o provedor', provider.name);
              orderResponse = await this.oldProviderService.sendOrder(
                provider, 
                providerRequestData
              );
            } else {
              console.log('[OrderProcessor] Usando nova API para o provedor', provider.name);
              orderResponse = await this.providerService.sendOrderToProvider(
                provider, 
                providerRequestData,
                transaction.id
              );
            }
                        
            // Registrar o pedido no banco de dados
            const order = await this.databaseService.createOrderInDatabase(
              transaction.id, 
              orderResponse, 
              provider.id, 
              postLinkForProvider, 
              quantidade,
              username, 
              post, 
              limitedPosts.length, 
              providerRequestData
            );
            
            orders.push({
              success: true,
              data: {
                order,
                response: orderResponse
              },
              post
            });
            
            // Aguardar 60 segundos entre cada post para evitar sobrecarregar 
            // o provedor e garantir que os pedidos sejam processados com segurança
            if (i < limitedPosts.length - 1) {
              const delayTime = LINK_PROCESSING_INTERVAL;
              console.log(`[OrderProcessor] Aguardando ${delayTime/1000} segundos antes do próximo post...`);
              
              // Registrar nos logs que estamos aguardando
              await this.databaseService.logInfoForTransaction(
                transaction.id,
                `Aguardando ${delayTime/1000} segundos entre posts`,
                {
                  current_post: i + 1,
                  total_posts: limitedPosts.length,
                  next_post_at: new Date(Date.now() + delayTime).toISOString()
                }
              );
              
              await delay(delayTime);
              console.log(`[OrderProcessor] Continuando processamento após pausa de ${delayTime/1000} segundos`);
            }
          } catch (postError) {
            console.error(`[OrderProcessor] Erro ao processar post:`, postError);
            orders.push({
              success: false,
              error: postError instanceof Error ? postError.message : 'Erro desconhecido ao processar post',
              post
            });
          }
        }
        
        // Atualizar o status da transação
        await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
        
        // Verificar se algum pedido foi processado com sucesso
        const successfulOrders = orders.filter(order => order.success);
        if (successfulOrders.length === 0 && orders.length > 0) {
          console.error('[OrderProcessor] Nenhum pedido foi processado com sucesso');
          throw new Error('Nenhum pedido foi processado com sucesso');
        }
        
        return orders;
      } finally {
        this.unlockTransaction(transaction.id);
      }
    } catch (error) {
      console.error('[OrderProcessor] Erro ao processar pedido de curtidas:', error);
      throw error;
    }
  }

  /**
   * Processa pedidos de reels com múltiplos reels
   * @param transaction Dados da transação
   * @param provider Provedor a ser utilizado
   * @param reels Lista de reels para processar
   * @param username Nome de usuário para o pedido
   * @returns Lista de pedidos criados
   */
  async processReelsOrder(transaction: Transaction, provider: Provider, reels?: Post[], username?: string): Promise<Array<{
    success: boolean;
    data?: {
      order: any;
      response: OrderResponse;
    };
    error?: string;
    post?: Post;
  }>> {
    console.log('[OrderProcessor] Processando pedido de reels');
    
    // Verificar se a transação é válida
    if (!transaction || !transaction.id) {
      console.error('[OrderProcessor] Transação inválida para processamento de reels');
      throw new Error('Transação inválida para processamento de reels');
    }
    
    // Verificar se o provedor é válido
    if (!provider || !provider.id) {
      console.error('[OrderProcessor] Provedor inválido para processamento de reels');
      throw new Error('Provedor inválido para processamento de reels');
    }
    
    const orders: Array<{
      success: boolean;
      data?: {
        order: any;
        response: OrderResponse;
      };
      error?: string;
      post?: Post;
    }> = [];
    
    // Verificar se já existem pedidos para esta transação
    const existingOrders = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
    if (existingOrders.length > 0) {
      console.log(`[OrderProcessor] Encontrados ${existingOrders.length} pedidos existentes para a transação ${transaction.id}`);
      
      // Retornar os pedidos existentes sem criar novos
      return existingOrders.map(order => ({
            success: true,
            data: {
          order,
          response: order.metadata?.provider_response || {}
        },
        post: order.metadata?.post as Post
      }));
      }
      
      // Bloquear a transação para evitar processamento duplicado
      if (await this.isTransactionLocked(transaction.id)) {
        console.log(`[OrderProcessor] Transação ${transaction.id} já está sendo processada`);
        throw new Error('Esta transação já está sendo processada');
      }
      
      // Criar bloqueio para esta transação
      this.lockTransaction(transaction.id);
      
      try {
        // Validar reels
        if (!reels || reels.length === 0) {
          console.error('[OrderProcessor] Nenhum reel encontrado para processar');
          throw new Error('Nenhum reel encontrado para processar');
        }
        
      // Usar o serviço de deduplicação para remover duplicatas
      const postsToProcess = this.postDeduplicationService.deduplicatePosts(reels);
      
      // Garantir que temos um array válido (corrigir erro "s.slice is not a function")
      const uniqueReels = Array.isArray(postsToProcess) ? postsToProcess : [];
      
      const originalReelsCount = reels.length;
      
      console.log(`[OrderProcessor] Após deduplicação: ${uniqueReels.length} reels únicos de ${originalReelsCount} originais`);
      
      // Verificar se ainda temos reels para processar após a deduplicação
      if (uniqueReels.length === 0) {
        console.error('[OrderProcessor] Nenhum reel único restante após deduplicação');
        throw new Error('Nenhum reel único para processar após deduplicação');
        }
        
        // Limitar a no máximo 5 reels para garantir segurança
        const maxReels = MAX_LINKS_PER_ORDER;
        if (uniqueReels.length > maxReels) {
          console.log(`[OrderProcessor] Limitando o número de reels para ${maxReels} (original: ${uniqueReels.length})`);
          
          // Registrar nos logs
          try {
            const supabase = createClient();
            await supabase.from('transaction_logs').insert({
              transaction_id: transaction.id,
              level: 'warning',
              message: `Número de reels excede o limite, processando apenas ${maxReels} reels`,
              metadata: {
                original_count: uniqueReels.length,
                max_allowed: maxReels,
                selected_reels: uniqueReels.slice(0, maxReels).map(r => r.postCode || r.code || r.shortcode)
              }
            });
          } catch (logError) {
            console.error('[OrderProcessor] Erro ao registrar log de limitação de reels:', logError);
          }
        }
        
        // Usar apenas os primeiros 5 reels
        const limitedReels = uniqueReels.slice(0, maxReels);
        
        console.log('[OrderProcessor] Processando', limitedReels.length, 'reels únicos');
        
        // Se não tiver username, tentar extrair dos metadados da transação
        if (!username) {
          username = transaction.target_username || 
                    transaction.metadata?.username || 
                    transaction.metadata?.profile?.username;
          console.log('[OrderProcessor] Usando username dos metadados da transação:', username);
        }
        
        if (!username) {
          throw new Error('Username não encontrado');
        }
        
        console.log('[OrderProcessor] Checkout de reels para:', username);
        
        for (let i = 0; i < limitedReels.length; i++) {
          const reel = limitedReels[i];
          try {
            console.log(`[OrderProcessor] Processando reel ${i+1}/${limitedReels.length}:`, reel);
            
            // Formatar o link para o provedor no formato específico para reels
            let reelLinkForProvider;
            const reelCode = reel.postCode || reel.code || reel.shortcode;
            
            if (reelCode) {
              // Formato padrão para reels: https://instagram.com/reel/{code}
              reelLinkForProvider = `https://instagram.com/reel/${reelCode}`;
            } else {
              // Fallback para o método padrão se não tiver o código específico
            reelLinkForProvider = this.linkService.formatPostLink(reel);
            }
            
            console.log('[OrderProcessor] Link formatado para o provedor:', reelLinkForProvider);
            
            // Verificar se já existe um pedido para este reel nesta transação
            const existingOrder = await this.databaseService.checkForDuplicateOrder(
              transaction.id, 
              reelLinkForProvider, 
              reel.postCode || reel.code || reel.shortcode
            );
            
            if (existingOrder) {
              console.log(`[OrderProcessor] Pedido já existe para o reel. ID: ${existingOrder.id}`);
              orders.push({
                success: true,
                data: {
                  order: existingOrder,
                  response: {
                    order: existingOrder.external_order_id,
                    orderId: existingOrder.external_order_id,
                    status: existingOrder.status
                  }
                },
                post: reel
              });
              continue;
            }
            
            // Extrair o ID do serviço
            const serviceId = this.transactionService.getServiceId(transaction);
            
            if (!serviceId) {
              console.error('[OrderProcessor] ID do serviço não encontrado na transação:', transaction);
              throw new Error('ID do serviço não encontrado na transação');
            }
            
            // Preparar os dados para a requisição ao provedor
            const providerRequestData: ProviderRequestData = {
              service: serviceId,
              link: reelLinkForProvider,
            quantity: 1, // Usar a quantidade específica para este reel
              transaction_id: transaction.id,
              target_username: username,
              key: provider.api_key,
              action: 'add'
            };
            
            // Log detalhado para depuração
            this.providerService.logRequestDetails(providerRequestData);
            
            // Usar o novo providerService com rate limiting
            const orderResponse = await this.providerService.createOrder(provider, providerRequestData);
            console.log('[OrderProcessor] Resposta do provedor para o reel:', orderResponse);
            
            // Registrar o envio do pedido para evitar duplicação
            await this.databaseService.logOrderSent(
              transaction.id,
              reelLinkForProvider,
              username,
              providerRequestData
            );
            
            // Criar pedido no banco de dados
            const order = await this.databaseService.createOrderInDatabase(
              transaction, 
              provider, 
              orderResponse, 
              reelLinkForProvider, 
              username, 
              reel, 
              limitedReels.length, 
              providerRequestData
            );
            
            orders.push({
              success: true,
              data: {
                order: order,
                response: orderResponse
              },
              post: reel
            });
            
            // Aguardar 60 segundos entre cada reel para evitar sobrecarregar 
            // o provedor e garantir que os pedidos sejam processados com segurança
            if (i < limitedReels.length - 1) {
              const delayTime = LINK_PROCESSING_INTERVAL;
              console.log(`[OrderProcessor] Aguardando ${delayTime/1000} segundos antes do próximo reel...`);
              
              // Registrar nos logs
              try {
                const supabase = createClient();
                await supabase.from('transaction_logs').insert({
                  transaction_id: transaction.id,
                  level: 'info',
                  message: `Aguardando ${delayTime/1000} segundos entre reels`,
                  metadata: {
                    current_reel: i + 1,
                    total_reels: limitedReels.length,
                    next_reel_at: new Date(Date.now() + delayTime).toISOString()
                  }
                });
              } catch (logError) {
                console.error('[OrderProcessor] Erro ao registrar log de pausa entre reels:', logError);
              }
              
              await delay(delayTime);
              console.log(`[OrderProcessor] Continuando processamento após pausa de ${delayTime/1000} segundos`);
            }
            
          } catch (error) {
            console.error('[OrderProcessor] Erro ao processar reel:', reel, error);
            orders.push({
              success: false,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              post: reel
            });
            
            // Continuar processando os próximos reels
            continue;
          }
        }
        
        // Atualizar o status da transação
        await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
        
        return orders;
      } finally {
        // Sempre remover o bloqueio ao finalizar, independente do resultado
        this.unlockTransaction(transaction.id);
        console.log(`[OrderProcessor] Bloqueio removido para transação ${transaction.id}`);
    }
  }

  /**
   * Processa pedidos de comentários
   * @param transaction Dados da transação
   * @param provider Provedor a ser utilizado
   * @param posts Lista de posts para processar
   * @param username Nome de usuário para o pedido
   * @returns Lista de pedidos criados
   */
  async processCommentsOrder(transaction: Transaction, provider: Provider, posts?: Post[], username?: string, comments?: string[]): Promise<Array<{
    success: boolean;
    data?: {
      order: any;
      response: OrderResponse;
    };
    error?: string;
    post?: Post;
  }>> {
    console.log('[OrderProcessor] Processando pedido de comentários');
    
    // Verificar se a transação é válida
    if (!transaction || !transaction.id) {
      console.error('[OrderProcessor] Transação inválida para processamento de comentários');
      throw new Error('Transação inválida');
    }
    
    // Verificar se o provedor é válido
    if (!provider || !provider.id) {
      console.error('[OrderProcessor] Provedor inválido para processamento de comentários');
      throw new Error('Provedor inválido');
    }
    
    try {
      // Verificar pedidos existentes antes de qualquer processamento
      const existingOrders = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
      
      if (existingOrders && existingOrders.length > 0) {
        console.log(`[OrderProcessor] Já existem ${existingOrders.length} pedidos para esta transação. Retornando pedidos existentes.`);
        return existingOrders.map(order => ({
            success: true,
            data: {
            order,
            response: order.metadata?.provider_response || {}
          },
          post: order.metadata?.post as Post
        }));
      }
      
      // Bloquear a transação para evitar processamento duplicado
      if (await this.isTransactionLocked(transaction.id)) {
        console.log(`[OrderProcessor] Transação ${transaction.id} já está sendo processada`);
        throw new Error('Esta transação já está sendo processada');
      }
      
      // Criar bloqueio para esta transação
      this.lockTransaction(transaction.id);
      console.log(`[OrderProcessor] Lock adquirido para transação ${transaction.id}`);
      
      try {
        // Verificar comentários
        if (!comments || comments.length === 0) {
          console.error('[OrderProcessor] Nenhum comentário encontrado para processar');
          throw new Error('Nenhum comentário encontrado para processar');
        }
        
        // Validar posts
        if (!posts || posts.length === 0) {
          console.error('[OrderProcessor] Nenhum post encontrado para processar comentários');
          throw new Error('Nenhum post encontrado para processar comentários');
        }
        
        // Usar o serviço de deduplicação para remover duplicatas
        const postsToProcess = this.postDeduplicationService.deduplicatePosts(posts);
        
        // Garantir que temos um array válido (corrigir erro "s.slice is not a function")
        const uniquePosts = Array.isArray(postsToProcess) ? postsToProcess : [];
        
        const originalPostsCount = posts.length;
        
        console.log(`[OrderProcessor] Após deduplicação: ${uniquePosts.length} posts únicos de ${originalPostsCount} originais`);
        
        // Verificar se ainda temos posts para processar após a deduplicação
        if (uniquePosts.length === 0) {
          console.error('[OrderProcessor] Nenhum post único restante após deduplicação');
          throw new Error('Nenhum post único para processar após deduplicação');
        }
        
        // Limitar a no máximo 5 posts para garantir segurança
        const maxPosts = MAX_LINKS_PER_ORDER;
        if (uniquePosts.length > maxPosts) {
          console.log(`[OrderProcessor] Limitando o número de posts para comentários para ${maxPosts} (original: ${uniquePosts.length})`);
        }
        
        // Usar apenas os primeiros 5 posts
        const limitedPosts = uniquePosts.slice(0, maxPosts);
        
        console.log('[OrderProcessor] Processando comentários para', limitedPosts.length, 'posts únicos');
        
        // Se não tiver username, tentar extrair dos metadados da transação
        if (!username) {
          username = transaction.target_username || 
                    transaction.metadata?.username || 
                    transaction.metadata?.profile?.username;
          console.log('[OrderProcessor] Usando username dos metadados da transação:', username);
        }
        
        if (!username) {
          throw new Error('Username não encontrado');
        }
        
        console.log('[OrderProcessor] Checkout de comentários para:', username);
        
        const orders: Array<{
          success: boolean;
          data?: {
            order: any;
            response: OrderResponse;
          };
          error?: string;
          post?: Post;
        }> = [];
        
        // Calcular a quantidade dividida entre os posts
        const originalQuantity = transaction.service?.quantity || transaction.metadata?.service?.quantity || 0;
        const dividedQuantity = Math.floor(originalQuantity / limitedPosts.length);
        
        console.log(`[OrderProcessor] Quantidade original: ${originalQuantity}, Quantidade dividida por post: ${dividedQuantity}`);
        
        // Obter o texto dos comentários (se houver)
        const commentsText = comments?.join('\n') || '';
        
        const processedLinks = new Set<string>(); // Rastrear links já processados dentro desta execução
        
        for (let i = 0; i < limitedPosts.length; i++) {
          const post = limitedPosts[i];
          try {
            console.log(`[OrderProcessor] Processando post ${i+1}/${limitedPosts.length} para comentários:`, post);
            
            // Formatar o link para o provedor
            let postLinkForProvider = this.linkService.formatPostLinkForProvider(post);
            
            // Verificar se é um reel ou post normal
            const isReel = postLinkForProvider.includes('/reel/') || 
                         (post.type === 'reel') || 
                         (post.url && post.url.includes('/reel/'));
            
            // Ajustar o formato do link se necessário
            if (isReel) {
              const reelCode = postLinkForProvider.includes('/') ? 
                             postLinkForProvider.split('/').pop()?.split('?')[0] : 
                             postLinkForProvider;
              
              if (reelCode) {
                postLinkForProvider = `https://instagram.com/reel/${reelCode}`;
              }
            } else {
              const postCode = postLinkForProvider.includes('/') ? 
                            postLinkForProvider.split('/').pop()?.split('?')[0] : 
                            postLinkForProvider;
              
              if (postCode) {
                postLinkForProvider = `https://instagram.com/p/${postCode}`;
              }
            }
            
            console.log('[OrderProcessor] Link formatado para o provedor:', postLinkForProvider);
            
            // Verificar se este link já foi processado nesta execução atual
            if (processedLinks.has(postLinkForProvider)) {
              console.log(`[OrderProcessor] Link ${postLinkForProvider} já foi processado nesta execução, pulando.`);
              orders.push({
                success: false,
                error: 'Duplicação detectada na mesma execução',
                post: post
              });
              continue;
            }
            
            // Verificar no banco de dados se este pedido já foi enviado para o provedor
            const isDuplicate = await this.databaseService.checkForDuplicateOrder(
              transaction.id, 
              postLinkForProvider,
              username
            );
            
            if (isDuplicate) {
              console.log(`[OrderProcessor] Link ${postLinkForProvider} já foi enviado para o provedor anteriormente, pulando.`);
              orders.push({
                success: false,
                error: 'Duplicação detectada no histórico',
                post: post
              });
              continue;
            }
            
            // Adicionar à lista de links processados nesta execução
            processedLinks.add(postLinkForProvider);
            
            // Extrair o ID do serviço
            const serviceId = this.transactionService.getServiceId(transaction);
            
            if (!serviceId) {
              console.error('[OrderProcessor] ID do serviço não encontrado na transação:', transaction);
              throw new Error('ID do serviço não encontrado na transação');
            }
            
            // Preparar os dados para a requisição ao provedor
            const providerRequestData: ProviderRequestData = {
              service: serviceId,
              link: postLinkForProvider,
              quantity: await this.databaseService.calculateQuantity(transaction, post, limitedPosts.length), // Usar quantidade específica do post
              transaction_id: transaction.id,
              target_username: username,
              key: provider.api_key,
              action: 'add',
              comments_text: commentsText // Adicionar o texto dos comentários
            };
            
            // Registrar que este pedido será enviado ao provedor (antes do envio real)
            await this.databaseService.logOrderSent(
              transaction.id,
              postLinkForProvider,
              username,
              providerRequestData
            );
            
            // Log detalhado para depuração
            this.providerService.logRequestDetails(providerRequestData);
            
            // Enviar para o endpoint do provedor
            const orderResponse = await this.providerService.sendOrderToProvider(provider, providerRequestData);
            console.log('[OrderProcessor] Resposta do provedor para o post/reel:', orderResponse);
            
            // Criar pedido no banco de dados
            const order = await this.databaseService.createOrderInDatabase(
              transaction, 
              provider, 
              orderResponse, 
              postLinkForProvider, 
              username, 
              post, 
              limitedPosts.length, 
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
            
            // Aguardar 60 segundos entre cada post para evitar sobrecarregar 
            // o provedor e garantir que os pedidos sejam processados com segurança
            if (i < limitedPosts.length - 1) {
              const delayTime = LINK_PROCESSING_INTERVAL;
              console.log(`[OrderProcessor] Aguardando ${delayTime/1000} segundos antes do próximo post...`);
              
              // Registrar nos logs
              try {
                const supabase = createClient();
                await supabase.from('transaction_logs').insert({
                  transaction_id: transaction.id,
                  level: 'info',
                  message: `Aguardando ${delayTime/1000} segundos entre posts para comentários`,
                  metadata: {
                    current_post: i + 1,
                    total_posts: limitedPosts.length,
                    next_post_at: new Date(Date.now() + delayTime).toISOString()
                  }
                });
              } catch (logError) {
                console.error('[OrderProcessor] Erro ao registrar log de pausa entre posts:', logError);
              }
              
              await delay(delayTime);
              console.log(`[OrderProcessor] Continuando processamento após pausa de ${delayTime/1000} segundos`);
            }
            
          } catch (error) {
            console.error('[OrderProcessor] Erro ao processar post para comentários:', post, error);
            orders.push({
              success: false,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              post: post
            });
            
            // Continuar processando os próximos posts
            continue;
          }
        }
        
        // Atualizar o status da transação
        await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
        
        return orders;
      } finally {
        // Sempre remover o bloqueio ao finalizar, independente do resultado
        this.unlockTransaction(transaction.id);
        console.log(`[OrderProcessor] Bloqueio removido para transação ${transaction.id}`);
      }
    } catch (error) {
      console.error('[OrderProcessor] Erro ao processar pedido de comentários:', error);
      throw error;
    }
  }

  /**
   * Processar pedido genérico
   * @param transaction Transação a ser processada
   * @param provider Provedor do serviço
   */
  async processGenericOrder(transaction: Transaction, provider: Provider): Promise<ProcessOrderResult> {
    console.log('[OrderProcessor] Processando pedido genérico');
    
    // Verificar se a transação é válida
    if (!transaction || !transaction.id) {
      console.error('[OrderProcessor] Transação inválida para processamento genérico');
      throw new Error('Transação inválida');
    }
    
    // Verificar se o provedor é válido
    if (!provider || !provider.id) {
      console.error('[OrderProcessor] Provedor inválido para processamento genérico');
      throw new Error('Provedor inválido');
    }
    
    try {
      // Verificar pedidos existentes antes de qualquer processamento
      const existingOrders = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
      
      if (existingOrders && existingOrders.length > 0) {
        console.log(`[OrderProcessor] Encontrados ${existingOrders.length} pedidos existentes para a transação ${transaction.id}. Retornando primeiro pedido.`);
        
        const existingOrder = existingOrders[0];
        return {
          success: true,
          data: {
            order: existingOrder,
            response: existingOrder.metadata?.provider_response || {}
          }
        };
      }
      
      // Bloquear a transação para evitar processamento duplicado
      if (await this.isTransactionLocked(transaction.id)) {
        console.log(`[OrderProcessor] Transação ${transaction.id} já está sendo processada por outro processo`);
        throw new Error('Esta transação já está sendo processada');
      }
      
      this.lockTransaction(transaction.id);
      console.log(`[OrderProcessor] Adquirindo lock para transação ${transaction.id}`);
      
      try {
        // Verificar tipo de serviço para determinar o processamento adequado
        console.log('[OrderProcessor] Verificando tipo de serviço...');
        const serviceType = transaction.service?.type?.toLowerCase() || 
                           transaction.metadata?.service?.type?.toString().toLowerCase() || '';
        
        const serviceName = transaction.service?.name?.toLowerCase() || 
                           transaction.metadata?.service?.name?.toString().toLowerCase() || '';
        
        console.log(`[OrderProcessor] Tipo de serviço: ${serviceType}, Nome: ${serviceName}`);
        
        // Se for um serviço de posts/links específicos como curtidas ou comentários
        if (serviceType === 'likes' || serviceName.includes('curtida') || 
            serviceType === 'comments' || serviceName.includes('comentário') ||
            serviceType === 'reels' || serviceName.includes('reel') || 
            serviceType === 'posts' || serviceName.includes('post')) {
          
          console.log('[OrderProcessor] Serviço baseado em posts/links detectado');
          
          // Verificar se existem posts nos metadados
          if (transaction.metadata?.posts && transaction.metadata.posts.length > 0) {
            console.log(`[OrderProcessor] Encontrados ${transaction.metadata.posts.length} posts nos metadados`);
            
            // Extrair posts dos metadados
            const postsFromMetadata = transaction.metadata.posts;
            
            // Garantir que posts é um array
            if (!Array.isArray(postsFromMetadata)) {
              console.error('[OrderProcessor] Posts não é um array válido:', postsFromMetadata);
              throw new Error('Lista de posts inválida');
            }
            
            // Log de diagnóstico de todos os posts
            console.log('[OrderProcessor] Verificando posts dos metadados:');
            postsFromMetadata.forEach((post, idx) => {
              console.log(`Post ${idx + 1}:`, JSON.stringify({
                id: post.id,
                code: post.code || post.shortcode || post.postCode,
                link: post.link || post.url || post.postLink
              }));
            });
            
            // Extrair username dos metadados
        const username = transaction.target_username || 
                      transaction.metadata?.username || 
                      transaction.metadata?.profile?.username;
        
        if (!username) {
              console.error('[OrderProcessor] Username não encontrado nos metadados');
          throw new Error('Username não encontrado');
        }
        
            console.log(`[OrderProcessor] Username encontrado: ${username}`);
            
            // Usar o serviço de deduplicação para posts
            const postsToProcess = this.postDeduplicationService.deduplicatePosts(postsFromMetadata);
            
            // Garantir que temos um array válido (corrigir erro "s.slice is not a function")
            const uniquePosts = Array.isArray(postsToProcess) ? postsToProcess : [];
            
            const originalPostCount = postsFromMetadata.length;
            
            console.log(`[OrderProcessor] Após deduplicação: ${uniquePosts.length} posts únicos de ${originalPostCount} originais`);
            
            // Verificar se ainda temos posts para processar após a deduplicação
            if (uniquePosts.length === 0) {
              console.error('[OrderProcessor] Nenhum post único restante após deduplicação');
              throw new Error('Nenhum post único para processar após deduplicação');
            }
            
            // Limitar a no máximo 5 posts para garantir segurança
          const maxPosts = MAX_LINKS_PER_ORDER;
          if (uniquePosts.length > maxPosts) {
            console.log(`[OrderProcessor] Limitando o número de posts para ${maxPosts} (original: ${uniquePosts.length})`);
            }
            
            // Usar apenas os primeiros 5 posts
            const limitedPosts = uniquePosts.slice(0, maxPosts);
            
            console.log(`[OrderProcessor] Processando ${limitedPosts.length} posts únicos`);
            
            // Se não tiver username, tentar extrair dos metadados da transação
            if (!username) {
              username = transaction.target_username || 
                         transaction.metadata?.username || 
                         transaction.metadata?.profile?.username;
              console.log('[OrderProcessor] Usando username dos metadados da transação:', username);
            }
            
            if (!username) {
              throw new Error('Username não encontrado');
            }
            
            console.log('[OrderProcessor] Checkout de pedidos genéricos para:', username);
            
            const orders: Array<{
              success: boolean;
              data?: {
                order: any;
                response: OrderResponse;
              };
              error?: string;
              post?: Post;
            }> = [];
          
          // Calcular a quantidade dividida entre os posts
          const originalQuantity = transaction.service?.quantity || transaction.metadata?.service?.quantity || 0;
          const dividedQuantity = Math.floor(originalQuantity / limitedPosts.length);
            
            console.log(`[OrderProcessor] Quantidade original: ${originalQuantity}, Quantidade dividida por post: ${dividedQuantity}`);
            
            // Obter o texto dos comentários (se houver)
            const commentsText = comments?.join('\n') || '';
          
          for (let i = 0; i < limitedPosts.length; i++) {
            const post = limitedPosts[i];
            
            // Determinar o link apropriado para o post
            let postLinkForProvider = '';
            if (post.type === 'reel' || (post.url && post.url.includes('/reel/'))) {
              const reelCode = post.code || post.shortcode || '';
              postLinkForProvider = `https://instagram.com/reel/${reelCode}/`;
            } else {
              const postCode = post.code || post.shortcode || '';
              postLinkForProvider = `https://instagram.com/p/${postCode}/`;
            }
            
            try {
              // Obter a quantidade específica para este post usando o método assíncrono
              const postQuantity = await this.databaseService.calculateQuantity(
                transaction, 
                post, 
                limitedPosts.length
              );
              
              console.log(`[OrderProcessor] Usando quantidade específica para o post ${post.code}: ${postQuantity}`);
              
              // Preparar dados para a requisição
              const providerRequestData: ProviderRequestData = {
                link: postLinkForProvider,
                quantity: postQuantity, // Usar a quantidade específica para este post
                service: serviceId,
                action: 'add',
                username,
                transaction_id: transaction.id
              };
              
              // Log detalhado para diagnóstico
              console.log(`[OrderProcessor] Enviando pedido para provedor:`, {
                link: providerRequestData.link,
                quantity: providerRequestData.quantity,
                service: providerRequestData.service,
                username: providerRequestData.username
              });
              
              // Enviar pedido ao provedor
              const orderResponse = await this.providerService.sendOrderToProvider(
                provider, 
                providerRequestData
              );
              
              // Registrar o pedido no banco de dados
              const order = await this.databaseService.createOrderInDatabase(
                transaction, 
                provider, 
                orderResponse, 
                postLinkForProvider, 
                username, 
                post, 
                limitedPosts.length, 
                providerRequestData
              );
              
              orders.push({
                success: true,
                data: {
                  order,
                  response: orderResponse
                },
                post
              });
              
              // Aguardar intervalo entre cada post para evitar sobrecarregar 
              // o provedor e garantir que os pedidos sejam processados com segurança
              if (i < limitedPosts.length - 1) {
                const delayTime = LINK_PROCESSING_INTERVAL;
                console.log(`[OrderProcessor] Aguardando ${delayTime/1000} segundos antes do próximo post...`);
                
                // Registrar nos logs que estamos aguardando
                await this.databaseService.logInfoForTransaction(
                  transaction.id,
                  `Aguardando ${delayTime/1000} segundos entre posts`,
                  {
                    current_post: i + 1,
                    total_posts: limitedPosts.length,
                    next_post_at: new Date(Date.now() + delayTime).toISOString()
                  }
                );
                
                await delay(delayTime);
                console.log(`[OrderProcessor] Continuando processamento após pausa de ${delayTime/1000} segundos`);
              }
            } catch (postError) {
              console.error(`[OrderProcessor] Erro ao processar post em pedido genérico:`, postError);
            }
          }
          
          // Atualizar o status da transação
          await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
          
          // Verificar se algum pedido foi processado com sucesso
          if (orders.length > 0) {
            // Retornar o primeiro pedido para compatibilidade com o sistema existente
            return {
              success: true,
              data: orders[0].data
            };
          }
          
          throw new Error('Nenhum pedido foi processado com sucesso');
          }
          
          // Se não tiver posts, processar como um único pedido genérico
          console.log('[OrderProcessor] Sem posts específicos, processando como pedido genérico único');
          
          // Definir link do alvo, preferência para links específicos
          let targetLink = transaction.target_link || 
                        transaction.metadata?.link || 
                        transaction.metadata?.profile?.target_link || 
                        `https://instagram.com/${username}`;
          
          // Extrair o ID do serviço
          const serviceId = transaction.metadata?.provider_service_id || 
                           transaction.service?.id;
          
          if (!serviceId) {
            throw new Error('ID do serviço não encontrado');
          }
          
          // Extrair quantidade
          const quantity = transaction.service?.quantity || 
                         transaction.metadata?.service?.quantity || 
                         transaction.metadata?.quantidade || 
                         1000;
          
          // Dados para o provedor
          const providerRequestData: ProviderRequestData = {
            service: serviceId,
            link: targetLink,
            quantity: quantity,
            transaction_id: transaction.id,
            username: username
          };
          
          // Enviar pedido para o provedor
          const orderResponse = await this.providerService.sendOrderToProvider(provider, providerRequestData);
          
          // Armazenar o pedido no banco de dados
          const order = await this.databaseService.createOrderInDatabase(
            transaction,
            provider,
            orderResponse,
            targetLink,
            username
          );
          
          await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
          
          return {
            success: true,
            data: {
              order,
              response: orderResponse
            }
          };
        }
        
        // Se não tiver posts, processar como um único pedido genérico
        console.log('[OrderProcessor] Sem posts específicos, processando como pedido genérico único');
        
        // Definir link do alvo, preferência para links específicos
        let targetLink = transaction.target_link || 
                      transaction.metadata?.link || 
                      transaction.metadata?.profile?.target_link || 
                      `https://instagram.com/${username}`;
        
        // Extrair o ID do serviço
        const serviceId = transaction.metadata?.provider_service_id || 
                         transaction.service?.id;
        
        if (!serviceId) {
          throw new Error('ID do serviço não encontrado');
        }
        
        // Extrair quantidade
        const quantity = transaction.service?.quantity || 
                       transaction.metadata?.service?.quantity || 
                       transaction.metadata?.quantidade || 
                       1000;
        
        // Dados para o provedor
        const providerRequestData: ProviderRequestData = {
          service: serviceId,
          link: targetLink,
          quantity: quantity,
          transaction_id: transaction.id,
          username: username
        };
        
        // Enviar pedido para o provedor
        const orderResponse = await this.providerService.sendOrderToProvider(provider, providerRequestData);
        
        // Armazenar o pedido no banco de dados
        const order = await this.databaseService.createOrderInDatabase(
          transaction,
          provider,
          orderResponse,
          targetLink,
          username
        );
        
        await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
        
        return {
          success: true,
          data: {
            order,
            response: orderResponse
          }
        };
      } finally {
        this.unlockTransaction(transaction.id);
      }
    } catch (error) {
      console.error('[OrderProcessor] Erro ao processar pedido genérico:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma transação está bloqueada
   * @param transactionId ID da transação
   * @returns Verdadeiro se a transação estiver bloqueada
   */
  async isTransactionLocked(transactionId: string): Promise<boolean> {
    try {
      // Verificar se estamos monitorando esta transação na memória
      if (this.transactionLocks.has(transactionId)) {
        console.log(`[OrderProcessor] Transação ${transactionId} já está bloqueada na memória.`);
        return true;
      }
      
      // Verificar se existe um bloqueio registrado no banco
      const { data: existingLock, error } = await this.supabase
        .from('order_locks')
        .select('id, locked_at, expires_at, locked_by')
        .eq('transaction_id', transactionId)
        .maybeSingle();
        
      if (error) {
        console.error(`[OrderProcessor] Erro ao verificar order_locks:`, error.message);
        return false;
      }
      
      if (existingLock) {
        // Verificar se o bloqueio expirou
        const now = new Date();
        const expiresAt = new Date(existingLock.expires_at);
        const lockedAt = new Date(existingLock.locked_at);
        const lockedDurationMinutes = Math.round((now.getTime() - lockedAt.getTime()) / (60 * 1000));
        
        // Verificar se é um bloqueio muito antigo ou expirado
        if (now > expiresAt || lockedDurationMinutes > 30) {
          let removalReason = '';
          
          if (now > expiresAt) {
            removalReason = `expirado (bloqueado há ${lockedDurationMinutes} minutos, expirou há ${Math.round((now.getTime() - expiresAt.getTime()) / (60 * 1000))} minutos)`;
            console.log(`[OrderProcessor] Bloqueio para transação ${transactionId} está ${removalReason}. Removendo...`);
          } else {
            removalReason = `bloqueio antigo (${lockedDurationMinutes} minutos)`;
            console.log(`[OrderProcessor] Bloqueio para transação ${transactionId} é muito antigo (${lockedDurationMinutes} minutos). Possível lock preso. Removendo...`);
          }
          
          await this.removeLock(transactionId, removalReason);
          
          // Verificar se existe algum pedido para esta transação
          try {
            const { data: existingOrders } = await this.supabase
              .from('orders')
              .select('id, external_order_id')
              .eq('transaction_id', transactionId);
              
            if (existingOrders && existingOrders.length > 0) {
              console.log(`[OrderProcessor] Transação ${transactionId} já tem ${existingOrders.length} pedidos criados.`);
              
              // Atualizar a transação para indicar que os pedidos foram criados
              await this.supabase
                .from('transactions')
                .update({ order_created: true })
                .eq('id', transactionId);
                
              // Se já tem pedidos, consideramos que está "bloqueada" no sentido que não devemos processar de novo
              return true;
            }
          } catch (ordersError) {
            console.error(`[OrderProcessor] Erro ao verificar pedidos existentes:`, ordersError);
          }
          
          return false;
        }
        
        console.log(`[OrderProcessor] Transação ${transactionId} já está bloqueada no banco até ${expiresAt.toISOString()} (bloqueada há ${lockedDurationMinutes} minutos por ${existingLock.locked_by || 'desconhecido'}).`);
        return true;
      }
      
      // Limpar locks antigos periodicamente (a cada 100 verificações aproximadamente)
      if (Math.random() < 0.01) {
        this.cleanupExpiredLocks();
      }
      
      console.log(`[OrderProcessor] Não há bloqueio existente para a transação ${transactionId}.`);
      return false;
    } catch (error) {
      console.error(`[OrderProcessor] Erro ao verificar bloqueio de transação:`, error);
      return false;
    }
  }
  
  /**
   * Cria um bloqueio para uma transação
   * @param transactionId ID da transação
   */
  private async lockTransaction(transactionId: string): Promise<void> {
    try {
      console.log(`[OrderProcessor] Adquirindo lock para transação ${transactionId}`);
      this.transactionLocks.set(transactionId, true);
      
      // Criar lock diretamente na tabela order_locks
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 15); // Lock expira em 15 minutos
      
      try {
        const { error } = await this.supabase
          .from('order_locks')
          .insert({
            transaction_id: transactionId,
            locked_at: new Date().toISOString(),
            expires_at: expirationTime.toISOString(),
            locked_by: 'order_processor',
            metadata: { 
              source: 'OrderProcessor', 
              locked_at_timestamp: Date.now() 
            }
          });
            
        if (error) {
          console.error(`[OrderProcessor] Erro ao criar bloqueio no banco:`, error);
          // Continuar mesmo com erro no banco, usando apenas o bloqueio em memória
        } else {
          console.log(`[OrderProcessor] Lock criado no banco para transação ${transactionId}`);
        }
      } catch (error) {
        console.error(`[OrderProcessor] Erro ao criar bloqueio:`, error);
      }
      
      this.transactionLocks.set(transactionId, true);
    } catch (error) {
      console.error(`[OrderProcessor] Erro ao adquirir lock:`, error);
      throw new Error(`Erro ao adquirir lock: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Libera o lock de uma transação
   */
  private async unlockTransaction(transactionId: string): Promise<void> {
    try {
      console.log(`[OrderProcessor] Removendo lock da transação ${transactionId}`);
      
      // Remover da memória local
      this.transactionLocks.delete(transactionId);
      
      // Remover do banco de dados
      try {
        const { error } = await this.supabase
          .from('order_locks')
          .delete()
          .eq('transaction_id', transactionId);
          
        if (error) {
          console.error(`[OrderProcessor] Erro ao remover bloqueio do banco:`, error);
        } else {
        console.log(`[OrderProcessor] Lock da transação ${transactionId} removido com sucesso`);
        }
      } catch (dbError) {
        console.error(`[OrderProcessor] Erro ao remover bloqueio do banco:`, dbError);
        // Continuar mesmo com erro, pelo menos liberamos o bloqueio em memória
      }
    } catch (error) {
      console.error(`[OrderProcessor] Erro ao remover lock:`, error);
    }
  }

  /**
   * Processa pedido de seguidores
   * @param transaction Dados da transação
   * @param provider Provedor a ser utilizado
   * @returns Resposta do processamento
   */
  async processFollowersOrder(transaction: Transaction, provider: Provider): Promise<ProcessOrderResult> {
    console.log('[OrderProcessor] Processando pedido de seguidores');
    
    try {
      // Verificar se existem pedidos existentes antes de qualquer processamento
      const existingOrders = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
      
      if (existingOrders && existingOrders.length > 0) {
        console.log(`[OrderProcessor] Já existem ${existingOrders.length} pedidos para esta transação. Retornando o primeiro pedido.`);
        const lastOrder = existingOrders[0];
          
        // Marcar a transação como tendo pedidos
        if (!transaction.order_created) {
          const supabase = createClient();
          await supabase
            .from('transactions')
            .update({ order_created: true })
            .eq('id', transaction.id);
            
          console.log(`[OrderProcessor] Transação ${transaction.id} marcada como tendo pedidos criados.`);
        }
        
        return {
          success: true,
          data: {
            order: lastOrder,
            response: {
              order: lastOrder.external_order_id,
              orderId: lastOrder.external_order_id,
              status: lastOrder.status
            }
          }
        };
      }
      
      // Verificar se esta transação já está sendo processada (bloqueio)
      if (await this.isTransactionLocked(transaction.id)) {
        console.log(`[OrderProcessor] Transação ${transaction.id} já está sendo processada. Abortando.`);
        return {
          success: false,
          error: 'Transação já está sendo processada'
        };
      }
      
      // Adquirir lock para esta transação
      this.lockTransaction(transaction.id);
      
      try {
        // Extrair username do perfil
        const username = transaction.target_username || 
                        transaction.metadata?.username || 
                        transaction.metadata?.profile?.username;
        
        if (!username) {
          throw new Error('Username não encontrado');
        }
        
        // Obter o link do perfil
        let profileLink = transaction.target_link || `https://instagram.com/${username}/`;
        
        // Formatar o link corretamente se necessário
        if (!profileLink.includes('instagram.com')) {
          profileLink = `https://instagram.com/${username}/`;
        }
        
        console.log(`[OrderProcessor] Processando seguidores para: ${username} (${profileLink})`);
        
        // Verificar se já existe algum pedido para este perfil nas últimas 24 horas
        // Esta é uma verificação adicional para evitar duplicações de serviços de seguidores
        const timeWindow = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
        const twentyFourHoursAgo = new Date(Date.now() - timeWindow).toISOString();
        
        const supabase = createClient();
        const { data: recentOrders, error: recentOrdersError } = await supabase
          .from('orders')
          .select('id, created_at, external_order_id, metadata, transaction_id, target_link, target_username')
          .or(`target_username.eq.${username},target_link.ilike.%${username}%`)
          .gt('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false });
          
        if (recentOrdersError) {
          console.error(`[OrderProcessor] Erro ao verificar pedidos recentes:`, recentOrdersError);
        } else if (recentOrders && recentOrders.length > 0) {
          const otherTransactionOrders = recentOrders.filter(o => o.transaction_id !== transaction.id);
          
          if (otherTransactionOrders.length > 0) {
            // Existem outros pedidos para este perfil em outras transações recentes
            console.warn(`[OrderProcessor] Detectados ${otherTransactionOrders.length} pedidos para o mesmo perfil nas últimas 24 horas!`);
            
            // Registrar esse evento para análise
            await this.databaseService.logErrorForTransaction(
              transaction.id, 
              'Possível duplicação de pedido de seguidores',
              { 
                username,
                profileLink,
                recent_orders: otherTransactionOrders.map(o => ({
                  id: o.id,
                  created_at: o.created_at,
                  transaction_id: o.transaction_id
                }))
              }
            );
            
            // Verificar se são pedidos muito recentes (última hora)
            const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000)).toISOString();
            const veryRecentOrders = otherTransactionOrders.filter(o => o.created_at > oneHourAgo);
            
            if (veryRecentOrders.length > 0) {
              console.error(`[OrderProcessor] Detectados ${veryRecentOrders.length} pedidos muito recentes (última hora) para o mesmo perfil!`);
              console.error(`[OrderProcessor] Para evitar duplicação e bloqueio do perfil, não será enviado novo pedido.`);
              
              // Bloquear o envio deste pedido para o provedor
              this.unlockTransaction(transaction.id);
              
              return {
                success: false,
                error: `Bloqueado pedido duplicado de seguidores. Já existem ${veryRecentOrders.length} pedidos para este perfil na última hora. Aguarde pelo menos 1 hora antes de enviar outro pedido para o mesmo perfil.`
              };
            }
            
            // Para pedidos nas últimas 24h mas não tão recentes, apenas avisar
            console.warn(`[OrderProcessor] Pedidos existentes são de mais de 1 hora atrás. Prosseguindo com cautela.`);
          }
        }
        
        // Verificar se já enviamos um pedido para este perfil muito recentemente (cache em memória)
        const cacheKey = `${username.toLowerCase()}_${provider.id}`;
        const cachedRequest = followerRequestCache.get(cacheKey);
        
        const now = Date.now();
        if (cachedRequest && (now - cachedRequest.timestamp) < MIN_FOLLOWER_REQUEST_INTERVAL) {
          console.log(`[OrderProcessor] Pedido muito recente detectado para ${username} (há ${Math.floor((now - cachedRequest.timestamp)/1000)} segundos)`);
          console.log(`[OrderProcessor] Aguardando pelo menos ${MIN_FOLLOWER_REQUEST_INTERVAL/1000} segundos entre pedidos para o mesmo perfil`);
          
          if (cachedRequest.transactionId === transaction.id) {
            // É o mesmo pedido tentando ser reprocessado
            console.log(`[OrderProcessor] É a mesma transação (${transaction.id}), verificando se o pedido já existe`);
            
            // Buscar o pedido no banco de dados
            const order = await this.databaseService.getOrderByExternalId(cachedRequest.orderId);
            
            if (order) {
              console.log(`[OrderProcessor] Pedido encontrado no banco de dados: ${order.id}`);
              return {
                success: true,
                data: {
                  order: order,
                  response: {
                    order: order.external_order_id,
                    orderId: order.external_order_id,
                    status: order.status
                  }
                }
              };
            }
          }
          
          // Diferente transação, mas mesmo usuário num intervalo muito curto - bloqueado
          console.error(`[OrderProcessor] Duplicata de pedido de seguidores bloqueada! Transação atual: ${transaction.id}, Transação anterior: ${cachedRequest.transactionId}`);
          console.error(`[OrderProcessor] Pedido anterior enviado há apenas ${Math.floor((now - cachedRequest.timestamp)/1000)} segundos`);
          
          // Registrar esse erro para investigação
          await this.databaseService.logErrorForTransaction(
            transaction.id, 
            'Duplicata de pedido de seguidores bloqueada',
            { 
              profileLink, 
              username, 
              previousRequest: { 
                timestamp: new Date(cachedRequest.timestamp).toISOString(),
                transactionId: cachedRequest.transactionId,
                orderId: cachedRequest.orderId,
                timeAgo: `${Math.floor((now - cachedRequest.timestamp)/1000)} segundos`
              }
            }
          );
          
          // Bloquear o envio deste pedido para o provedor para proteger o perfil
          return {
            success: false,
            error: `Bloqueado pedido duplicado de seguidores. Um pedido para este perfil foi enviado há menos de ${Math.floor((now - cachedRequest.timestamp)/1000)} segundos. Aguarde pelo menos ${MIN_FOLLOWER_REQUEST_INTERVAL/1000/60} minutos antes de enviar outro pedido.`
          };
        }
        
        // Extrair o ID do serviço
        const serviceId = this.transactionService.getServiceId(transaction);
        
        if (!serviceId) {
          console.error('[OrderProcessor] ID do serviço não encontrado na transação:', transaction);
          throw new Error('ID do serviço não encontrado na transação');
        }
        
        // Obter a quantidade de seguidores
        const quantity = transaction.service?.quantity || transaction.metadata?.service?.quantity || 0;
        
        // Preparar os dados para a requisição ao provedor
        const providerRequestData: ProviderRequestData = {
          service: serviceId,
          link: profileLink,
          quantity: quantity,
          transaction_id: transaction.id,
          target_username: username,
          key: provider.api_key,
          action: 'add'
        };
        
        // Registrar o envio do pedido para evitar duplicação
        // Importante: registrar ANTES de enviar ao provedor para prevenir concorrência
        await this.databaseService.logOrderSent(
          transaction.id,
          profileLink,
          username,
          providerRequestData
        );
        
        // Log detalhado
        this.providerService.logRequestDetails(providerRequestData);
        
        // Criar pedido
        const orderResponse = await this.providerService.sendOrderToProvider(provider, providerRequestData);
        console.log('[OrderProcessor] Resposta do provedor:', orderResponse);
        
        // Criar pedido no banco de dados
        const order = await this.databaseService.createOrderInDatabase(
          transaction, 
          provider, 
          orderResponse, 
          profileLink, 
          username, 
          undefined, 
          1, 
          providerRequestData
        );
        
        // Atualizar o status da transação
        await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
        
        return {
          success: true,
          data: {
            order: order,
            response: orderResponse
          }
        };
      } finally {
        // Sempre remover o bloqueio ao finalizar, independente do resultado
        this.unlockTransaction(transaction.id);
        console.log(`[OrderProcessor] Bloqueio removido para transação ${transaction.id}`);
      }
    } catch (error) {
      console.error('[OrderProcessor] Erro ao processar pedido de seguidores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um lock de transação tanto da memória quanto do banco de dados
   * @param transactionId ID da transação para remover o lock
   * @param reason Motivo da remoção (opcional)
   */
  async removeLock(transactionId: string, reason?: string): Promise<void> {
    try {
      console.log(`[OrderProcessor] Removendo lock para transação ${transactionId}${reason ? ` (Motivo: ${reason})` : ''}`);
      
      // Remover da memória
      this.transactionLocks.delete(transactionId);
      
      // Remover do banco
      const { error } = await this.supabase
        .from('order_locks')
        .delete()
        .eq('transaction_id', transactionId);
      
      if (error) {
        console.error(`[OrderProcessor] Erro ao remover lock do banco:`, error);
      } else {
        console.log(`[OrderProcessor] Lock removido do banco com sucesso`);
      }
      
      // Registrar log
      try {
        await this.supabase.from('logs').insert({
          action: 'manual_unlock',
          transaction_id: transactionId,
          metadata: {
            unlocked_by: 'OrderProcessor.removeLock',
            unlocked_at: new Date().toISOString(),
            reason: reason || 'Remoção manual/programática de lock'
          }
        });
      } catch (logError) {
        console.error(`[OrderProcessor] Erro ao registrar log de remoção de lock:`, logError);
      }
    } catch (error) {
      console.error(`[OrderProcessor] Erro ao remover lock:`, error);
    }
  }
  
  /**
   * Limpa locks expirados do banco de dados
   */
  private async cleanupExpiredLocks(): Promise<void> {
    try {
      console.log(`[OrderProcessor] Iniciando limpeza de locks expirados...`);
      
      const now = new Date().toISOString();
      
      // Buscar locks expirados
      const { data: expiredLocks, error } = await this.supabase
        .from('order_locks')
        .select('transaction_id, locked_at, expires_at')
        .lt('expires_at', now)
        .limit(50);
        
      if (error) {
        console.error(`[OrderProcessor] Erro ao buscar locks expirados:`, error);
        return;
      }
      
      if (!expiredLocks || expiredLocks.length === 0) {
        console.log(`[OrderProcessor] Nenhum lock expirado encontrado`);
        return;
      }
      
      console.log(`[OrderProcessor] Encontrados ${expiredLocks.length} locks expirados para remover`);
      
      // Remover cada lock expirado
      for (const lock of expiredLocks) {
        const expirationTime = new Date(lock.expires_at);
        const expirationMinutes = Math.round((new Date().getTime() - expirationTime.getTime()) / (60 * 1000));
        await this.removeLock(lock.transaction_id, `Expirado há ${expirationMinutes} minutos (limpeza automática)`);
      }
      
      console.log(`[OrderProcessor] Limpeza de locks expirados concluída`);
    } catch (error) {
      console.error(`[OrderProcessor] Erro na limpeza de locks expirados:`, error);
    }
  }

  /**
   * Mapeia o status da resposta do provedor para um valor válido do enum order_status
   * @param providerStatus Status retornado pelo provedor
   * @returns Status válido para o banco de dados
   */
  private mapProviderStatusToDbStatus(providerStatus: string): string {
    // Com a nova coluna status_text podemos armazenar qualquer valor
    // Não precisamos mais validar contra o enum
    
    // Normalização básica dos status conhecidos
    const normalizedMap: Record<string, string> = {
      'error': 'failed',
      'Error': 'failed',
      'ERROR': 'failed',
      'pending': 'pending',
      'Pending': 'pending',
      'PENDING': 'pending',
      'processing': 'processing',
      'Processing': 'processing',
      'in progress': 'processing',
      'In Progress': 'processing',
      'active': 'processing',
      'Active': 'processing',
      'completed': 'completed',
      'Completed': 'completed',
      'COMPLETED': 'completed',
      'success': 'completed',
      'Success': 'completed',
      'done': 'completed',
      'Done': 'completed',
      'fail': 'failed',
      'Failed': 'failed',
      'FAILED': 'failed',
      'canceled': 'canceled',
      'cancelled': 'canceled',
      'Canceled': 'canceled',
      'Cancelled': 'canceled'
    };
    
    // Retornar o status normalizado ou o original
    return normalizedMap[providerStatus] || providerStatus;
  }
}
