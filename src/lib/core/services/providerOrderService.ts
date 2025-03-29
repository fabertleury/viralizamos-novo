import { createClient } from '@/lib/supabase/server';
import { LinkFormatter } from '../utils/linkFormatter';
import { Logger } from '../utils/logger';
import axios from 'axios';

/**
 * Serviço para envio de pedidos específicos para cada tipo de serviço do provedor
 */
export class ProviderOrderService {
  private supabase;
  private linkFormatter;
  private logger;

  constructor() {
    this.supabase = createClient();
    this.linkFormatter = new LinkFormatter();
    this.logger = new Logger('ProviderOrderService');
  }

  /**
   * Atraso auxiliar (sleep) para espaçar os pedidos
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Envia pedidos para o provedor com base no tipo de serviço
   * @param params Parâmetros da transação e serviço
   * @returns Resultado dos pedidos enviados
   */
  async sendOrders(params: {
    transactionId: string;
    serviceId: string;
    serviceType: string;
    providerId: string;
    posts: Array<{
      id: string;
      code?: string;
      url?: string;
      type?: string;
      username?: string;
      quantity?: number;
    }>;
    quantity: number;
    providerKey?: string;
    providerApiUrl?: string;
    externalServiceId?: string;
  }) {
    try {
      const { 
        transactionId, 
        serviceId, 
        serviceType, 
        providerId, 
        posts,
        quantity, 
        providerKey,
        providerApiUrl,
        externalServiceId
      } = params;

      // Buscar detalhes do provedor se não fornecidos
      let apiKey = providerKey;
      let apiUrl = providerApiUrl;
      let serviceExternalId = externalServiceId;

      if (!apiKey || !apiUrl || !serviceExternalId) {
        this.logger.info(`Buscando detalhes do provedor ${providerId} e serviço ${serviceId}`);
        
        // Buscar dados do provedor
        const { data: provider, error: providerError } = await this.supabase
          .from('providers')
          .select('*')
          .eq('id', providerId)
          .single();
          
        if (providerError || !provider) {
          throw new Error(`Erro ao buscar provedor: ${providerError?.message || 'Provedor não encontrado'}`);
        }
        
        // Buscar dados do serviço
        const { data: service, error: serviceError } = await this.supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();
          
        if (serviceError || !service) {
          throw new Error(`Erro ao buscar serviço: ${serviceError?.message || 'Serviço não encontrado'}`);
        }
        
        apiKey = provider.api_key;
        apiUrl = provider.api_url;
        serviceExternalId = service.external_id;
        
        if (!apiKey || !apiUrl) {
          throw new Error('Provedor não possui chave API ou URL configurada');
        }
        
        if (!serviceExternalId) {
          throw new Error('Serviço não possui ID externo configurado');
        }
      }

      // Array para armazenar resultados de todos os pedidos
      const results: Array<{
        success: boolean;
        orderId?: string;
        externalOrderId?: string;
        postId?: string;
        postCode?: string;
        error?: string;
      }> = [];

      // CORREÇÃO: Verificar se estamos lidando com um serviço de curtidas mas recebendo perfis
      // Se for serviço de curtidas/etc. mas só temos URLs de perfil, vamos tratar como seguidores
      if (
        ['curtidas', 'comentarios', 'visualizacao', 'reels'].includes(serviceType.toLowerCase()) && 
        posts.length > 0 && 
        posts.every(post => post.url && post.url.includes('instagram.com/') && 
                            !post.url.includes('/p/') && !post.url.includes('/reel/'))
      ) {
        this.logger.warn(`⚠️ Serviço de ${serviceType} detectado mas todos os posts são perfis. Tratando como serviço de seguidores.`);
        
        // ERRO CRÍTICO: Não devemos permitir este comportamento para serviços de curtidas/etc.
        throw new Error(`Erro de validação: URLs de perfil não são válidas para serviço de ${serviceType}. Verifique os posts enviados e certifique-se de que são URLs de posts ou reels válidos.`);
      }

      // Diferentes estratégias de envio conforme o tipo de serviço
      switch (serviceType.toLowerCase()) {
        case 'seguidores':
          // Para serviços de seguidores, enviamos apenas um pedido com o nome de usuário
          // Verificar se temos posts válidos
          if (!posts || posts.length === 0) {
            throw new Error('Nenhum post/usuário fornecido para serviço de seguidores');
          }
          
          this.logger.info(`Processando serviço de seguidores para ${posts[0].username || (posts[0].url ? 'URL: ' + posts[0].url : 'ID: ' + posts[0].id)}`);
          
          // Enviar pedido de seguidores (usando apenas o primeiro post)
          return await this.sendFollowersOrder({
            transactionId,
            serviceId,
            providerId,
            serviceExternalId,
            apiKey,
            apiUrl,
            post: posts[0], // Usamos apenas o primeiro post (que contém o username)
            quantity
          });

        case 'curtidas':
        case 'comentarios':
        case 'visualizacao':
        case 'reels': // Incluir reels no mesmo tratamento
          // Para curtidas, comentários, visualizações e reels, enviamos um pedido para cada item
          // Adicionando delay entre os pedidos
          
          // Logar todos os posts recebidos para debug
          this.logger.info(`🔍 POSTS RECEBIDOS (${posts.length}): ${JSON.stringify(posts)}`);
          
          // VALIDAÇÃO PRÉ-PROCESSAMENTO: Verificar se os posts são válidos para este tipo de serviço
          const invalidPosts = posts.filter(post => {
            // Um post é inválido se:
            // 1. Não tem código E
            // 2. Sua URL é de perfil (não contém /p/ ou /reel/)
            return (!post.code && post.url && post.url.includes('instagram.com/') && 
                    !post.url.includes('/p/') && !post.url.includes('/reel/'));
          });

          if (invalidPosts.length > 0) {
            this.logger.error(`⚠️ Detectados ${invalidPosts.length} posts inválidos para serviço de ${serviceType}:`, 
              JSON.stringify(invalidPosts.map(p => ({url: p.url, code: p.code, id: p.id}))));
            throw new Error(`Erro de validação: ${invalidPosts.length} URLs de perfil enviadas para serviço de ${serviceType}. Verifique os posts e certifique-se de que são URLs de posts ou reels válidos.`);
          }

          for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            try {
              // Logar detalhes do post atual (para entender de onde vem o 'virtual-')
              this.logger.info(`🔍 PROCESSANDO POST ${i+1}: ${JSON.stringify(post)}`);
              
              // Verificar se temos um post válido para serviços de curtidas/comentários/visualizações
              if (!post || (!post.code && !post.url)) {
                this.logger.error(`Post inválido para serviço ${serviceType}: ${JSON.stringify(post)}`);
                results.push({
                  success: false,
                  postId: post?.id,
                  error: `Post inválido: não possui código ou URL necessária para serviço de ${serviceType}`
                });
                continue; // Pular este post e ir para o próximo
              }
              
              // Verificar se a URL é de perfil (não deve ser usado para curtidas/etc)
              if (post.url && post.url.includes('instagram.com/') && 
                  !post.url.includes('/p/') && !post.url.includes('/reel/')) {
                this.logger.warn(`URL de perfil detectada para serviço de ${serviceType}: ${post.url}`);
                results.push({
                  success: false,
                  postId: post.id,
                  error: `URL de perfil não é válida para serviço de ${serviceType}`
                });
                continue; // Pular este post e ir para o próximo
              }
              
              // Log para indicar o processamento do item atual (post ou reel)
              const isReel = post.type === 'reel' || (post.url && post.url.includes('/reel/'));
              this.logger.info(`Processando ${isReel ? 'reel' : 'post'} ${i+1} de ${posts.length}: ${post.code || post.id}`);
              
              // Verificar se o post possui uma quantidade específica
              const postSpecificQuantity = post.quantity !== undefined && post.quantity !== null;
              
              // Log para mostrar a quantidade específica do post, se disponível
              if (postSpecificQuantity) {
                this.logger.info(`Post ${post.code || post.id} tem quantidade específica: ${post.quantity}`);
              } else {
                this.logger.info(`Post ${post.code || post.id} não tem quantidade específica, usando total: ${quantity}`);
              }
              
              // Todos os tipos de serviço agora usam o mesmo método sendPostOrder que verifica se é post ou reel
              const result = await this.sendPostOrder({
                transactionId,
                serviceId,
                providerId,
                serviceExternalId,
                apiKey,
                apiUrl,
                post,
                quantity: post.quantity !== undefined ? post.quantity : Math.floor(quantity / posts.length), // Usar a quantidade específica do post ou dividir pelo número de posts
                serviceType
              });
              
              // Log adicional para debug do resultado
              this.logger.info(`Resultado do envio para o provedor: ${JSON.stringify(result)}`);
              
              results.push(result);
              
              // Adicionar delay de 50 segundos entre cada pedido (exceto para o último)
              if (i < posts.length - 1) {
                this.logger.info(`Aguardando 50 segundos antes de processar o próximo item...`);
                await this.delay(50000); // 50 segundos em milissegundos
              }
            } catch (error) {
              this.logger.error(`Erro ao processar item ${i+1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
              this.logger.error(`Detalhes do post com erro: ${JSON.stringify({
                id: post?.id,
                code: post?.code,
                url: post?.url,
                type: post?.type
              })}`);
              
              results.push({
                success: false,
                postId: post?.id,
                postCode: post?.code,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
              });
              
              // Mesmo em caso de erro, aguardar antes do próximo para não sobrecarregar o provedor
              if (i < posts.length - 1) {
                await this.delay(50000);
              }
            }
          }
          break;

        default:
          throw new Error(`Tipo de serviço não suportado: ${serviceType}`);
      }

      // Calcular status geral
      // const allSuccess = results.every(r => r.success);
      
      // Log adicional para debug dos resultados finais
      this.logger.info(`Resultados finais: ${JSON.stringify(results)}`);
      
      return results;
    } catch (error) {
      this.logger.error(`Erro ao processar pedidos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Envia pedido para serviço de seguidores
   */
  private async sendFollowersOrder(params: {
    transactionId: string;
    serviceId: string;
    providerId: string;
    serviceExternalId: string;
    apiKey: string;
    apiUrl: string;
    post: {
      id: string;
      code?: string;
      url?: string;
      username?: string;
      quantity?: number;
      hasQuantity?: boolean;
    };
    quantity: number;
  }) {
    const { 
      transactionId, 
      serviceId, 
      providerId, 
      serviceExternalId, 
      apiKey, 
      apiUrl, 
      post,
      quantity: defaultQuantity
    } = params;

    // Log para depuração do post recebido
    this.logger.info(`Processando pedido de seguidores: ${JSON.stringify(post, null, 2)}`);

    // Validação básica
    if (!post) {
      throw new Error('Post inválido ou indefinido');
    }

    // Extrair o nome de usuário usando o valor já disponível ou da URL
    let username = post.username;
    
    // Se não tiver username explícito mas tiver URL, extrair da URL
    if (!username && post.url) {
      // Tentar extrair username da URL
      const urlRegex = /instagram\.com\/([^\/\?]+)/;
      const match = post.url.match(urlRegex);
      
      if (match && match[1]) {
        username = match[1];
        this.logger.info(`Username extraído da URL: ${username}`);
      } else {
        const urlParts = post.url.split('/');
        username = urlParts[urlParts.length - 1].replace('@', '');
      }
    }
    
    if (!username) {
      throw new Error(`Nome de usuário não encontrado para serviço de seguidores: ${JSON.stringify(post)}`);
    }
    
    // Remover @ se existir e qualquer parâmetro de URL
    username = username.replace('@', '').split('?')[0].split('#')[0];
    
    this.logger.info(`Enviando pedido de seguidores para usuário: ${username}`);
    
    // Usar quantidade específica se disponível
    const followerQuantity = post.quantity !== undefined ? post.quantity : defaultQuantity;
    
    this.logger.info(`Quantidade para seguidores: ${followerQuantity}`);
    
    // Verificar pedido duplicado
    const { data: duplicateCheck, error: checkError } = await this.supabase.rpc(
      'check_duplicate_order',
      {
        p_transaction_id: transactionId,
        p_post_code: username, // Para seguidores, usamos o username como código
        p_service_id: serviceId
      }
    );
    
    if (checkError) {
      this.logger.error(`Erro ao verificar duplicidade: ${checkError.message}`);
    } else if (duplicateCheck && duplicateCheck.has_duplicate) {
      this.logger.warn(`Pedido duplicado de seguidores detectado: ${duplicateCheck.message}`);
      
      return {
        success: false,
        error: duplicateCheck.message || 'Pedido duplicado detectado',
        duplicate: true,
        orderId: duplicateCheck.order_id,
        externalOrderId: duplicateCheck.external_order_id
      };
    }
    
    try {
      // CORREÇÃO: Para serviços de seguidores, enviamos APENAS o username, não a URL completa
      // Construir os parâmetros para a API do provedor
      const requestParams = new URLSearchParams({
        key: apiKey,
        action: 'add',
        service: serviceExternalId,
        link: username, // APENAS o username, não a URL completa
        quantity: followerQuantity.toString()
      });
      
      // Salvar os dados da requisição para referência
      const requestData = {
        action: 'add',
        service: serviceExternalId,
        link: username, // APENAS o username
        quantity: followerQuantity,
        target_username: username
      };
      
      this.logger.info(`Enviando pedido para o provedor: username=${username} com quantidade ${followerQuantity}`);
      
      // Enviar o pedido para o provedor
      const response = await axios.post(apiUrl, requestParams);
      
      // Validar a resposta do provedor
      if (!response.data || response.data.error) {
        throw new Error(`Erro do provedor: ${response.data?.error || 'Resposta inválida'}`);
      }
      
      const externalOrderId = response.data.order || String(response.data.id) || `order-${Date.now()}`;
      
      // Construir a URL formatada para o perfil para referência interna
      const profileUrl = `https://instagram.com/${username}`;
      
      // CORREÇÃO: Tratar IDs vindos da tabela core_transaction_posts_v2
      // Como a tabela posts não existe, vamos armazenar apenas nos metadados
      const actualPostId = null; // Sempre null para evitar erro de chave estrangeira
      
      // Registrar nos logs o ID original para referência
      this.logger.info(`Usando post ID ${post.id} apenas nos metadados (sem salvar na referência post_id)`);
      
      // Registrar o pedido no banco de dados
      const { data: order, error: orderError } = await this.supabase
        .from('core_orders')
        .insert({
          transaction_id: transactionId,
          post_id: actualPostId, // NULL para evitar violação de chave estrangeira
          service_id: serviceId,
          provider_id: providerId,
          external_order_id: externalOrderId,
          provider_order_id: externalOrderId,
          status: 'pending',
          quantity: followerQuantity,
          target_username: username,
          target_url: profileUrl, // Armazenar a URL do perfil para referência
          metadata: {
            service_type: 'seguidores',
            username: username,
            original_post_id: post.id, // Armazenar o ID original nos metadados para referência
            post_source: 'core_transaction_posts_v2', // Indicar a fonte do post
            providerRequestData: requestData,
            providerResponse: response.data
          }
        })
        .select()
        .single();
        
      if (orderError) {
        this.logger.error(`Erro ao registrar pedido: ${orderError.message}`);
        throw new Error(`Erro ao registrar pedido: ${orderError.message}`);
      }
      
      this.logger.success(`Pedido de seguidores registrado com sucesso: ${order.id} para ${username} (${followerQuantity} seguidores)`);
      
      return {
        success: true,
        orderId: order.id,
        externalOrderId,
        username,
        quantity: followerQuantity
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar pedido de seguidores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  }

  /**
   * Verifica se um pedido é duplicado usando várias verificações
   * @param postCode Código do post
   * @param serviceId ID do serviço 
   * @param transactionId ID da transação
   * @param targetUrl URL alvo do pedido
   * @returns Objeto com informações de duplicação, ou null se não for duplicado
   */
  private async verifyDuplicateOrder(
    postCode: string, 
    serviceId: string, 
    transactionId: string, 
    targetUrl: string
  ) {
    // 1. Verificar via RPC (procedimento armazenado)
    const { data: duplicateCheck, error: checkError } = await this.supabase.rpc('check_duplicate_order', {
      p_transaction_id: transactionId,
      p_post_code: postCode,
      p_service_id: serviceId
    });
    
    if (checkError) {
      this.logger.error(`Erro ao verificar duplicidade via RPC: ${checkError.message}`);
    } else if (duplicateCheck && duplicateCheck.has_duplicate) {
      this.logger.warn(`Pedido duplicado detectado via RPC: ${duplicateCheck.message}`);
      
      return {
        duplicate: true,
        method: 'rpc',
        message: duplicateCheck.message || 'Pedido duplicado detectado',
        orderId: duplicateCheck.order_id,
        externalOrderId: duplicateCheck.external_order_id
      };
    }
    
    // 2. Verificação na tabela core_orders por URL diretamente
    if (targetUrl) {
      const { data: duplicateOrders } = await this.supabase
        .from('core_orders')
        .select('id, external_order_id, status, provider_order_id')
        .eq('service_id', serviceId)
        .eq('target_url', targetUrl)
        .not('status', 'eq', 'error')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (duplicateOrders && duplicateOrders.length > 0) {
        const duplicateOrder = duplicateOrders[0];
        this.logger.warn(`Pedido duplicado detectado via URL: ${targetUrl} para serviço ${serviceId} (ID: ${duplicateOrder.id})`);
        
        return {
          duplicate: true,
          method: 'url',
          message: `Pedido duplicado: URL ${targetUrl} já processada anteriormente para este serviço`,
          orderId: duplicateOrder.id,
          externalOrderId: duplicateOrder.external_order_id || duplicateOrder.provider_order_id
        };
      }
    }
    
    // 3. Verificar em core_processing_locks
    const lockKey = `post_${postCode}_service_${serviceId}`;
    const { data: lockData } = await this.supabase
      .from('core_processing_locks')
      .select('*')
      .eq('lock_key', lockKey)
      .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro quando não encontra
      
    if (lockData) {
      this.logger.warn(`Pedido bloqueado: encontrado bloqueio existente para post ${postCode} e serviço ${serviceId}`);
      
      return {
        duplicate: true,
        method: 'lock',
        message: `Post ${postCode} bloqueado para processamento (já foi processado anteriormente)`,
        orderId: lockData.order_id
      };
    }
    
    // Nenhuma duplicação encontrada
    return null;
  }

  /**
   * Envia pedido para serviço de posts (curtidas, comentários ou visualizações)
   */
  private async sendPostOrder(params: {
    transactionId: string;
    serviceId: string;
    providerId: string;
    serviceExternalId: string;
    apiKey: string;
    apiUrl: string;
    post: {
      id: string;
      code?: string;
      url?: string;
      type?: string;
      quantity?: number;
      hasQuantity?: boolean;
      username?: string;
    };
    quantity: number;
    serviceType: string;
  }) {
    const { 
      transactionId, 
      serviceId, 
      providerId, 
      serviceExternalId, 
      apiKey, 
      apiUrl, 
      post, 
      quantity: defaultQuantity,
      serviceType 
    } = params;

    // Logar o post recebido para depuração
    this.logger.info(`Processando post: ${JSON.stringify(post, null, 2)}`);
    
    // Validação básica
    if (!post) {
      throw new Error('Post inválido ou indefinido');
    }
    
    // NOVA VERIFICAÇÃO: Se o URL é de perfil e não de post/reel e não temos código
    // (É um caso onde enviamos URL de perfil para um serviço de curtidas)
    if (post.url && post.url.includes('instagram.com/') && 
        !post.url.includes('/p/') && !post.url.includes('/reel/')) {
      
      this.logger.warn(`⚠️ URL de perfil detectada para serviço de ${serviceType}: ${post.url}`);
      throw new Error(`Erro de validação: URLs de perfil não são válidas para serviço de ${serviceType}. É necessário fornecer URLs de posts/reels específicos.`);
    }
    
    // Extrair código do post da URL se não estiver definido explicitamente
    let postCode = post.code;
    if (!postCode && post.url) {
      // Tenta extrair o código da URL
      const match = post.url.match(/instagram\.com\/(?:p|reel)\/([^\/]+)/);
      if (match && match[1]) {
        postCode = match[1];
        this.logger.info(`Código de post extraído da URL: ${postCode}`);
      }
    }
    
    if (!postCode) {
      this.logger.error(`Post não possui código e não foi possível extrair da URL: ${JSON.stringify(post)}`);
      throw new Error(`Post não possui código: ${JSON.stringify({
        id: post.id,
        url: post.url,
        username: post.username
      })}`);
    }
    
    // Verificar se é um reel baseado no tipo ou na URL
    const isReel = post.type === 'reel' || (post.url && post.url.includes('/reel/'));
    
    // Se o post já tem URL, usar diretamente; caso contrário, construir
    let targetUrl = post.url;
    if (!targetUrl) {
      // Construir URL baseada no tipo e código
      targetUrl = isReel
        ? `https://instagram.com/reel/${postCode}/`
        : `https://instagram.com/p/${postCode}/`;
    }
    
    // Garantir que a URL não tenha "www."
    targetUrl = targetUrl.replace('www.', '');
    
    this.logger.info(`Usando post: código=${postCode}, tipo=${isReel ? 'reel' : 'post'}, URL=${targetUrl}`);
    
    // Usar quantidade específica se disponível, caso contrário usar a quantidade passada
    const postQuantity = post.quantity !== undefined && post.quantity !== null 
      ? post.quantity 
      : defaultQuantity;
    
    this.logger.info(`Quantidade para post ${postCode}: ${postQuantity} (específica do post: ${post.quantity !== undefined ? 'sim' : 'não'})`);
    
    // Verificar duplicação usando o método centralizado
    const duplicateInfo = await this.verifyDuplicateOrder(postCode, serviceId, transactionId, targetUrl);
    
    if (duplicateInfo) {
      this.logger.warn(`Pedido duplicado detectado (método: ${duplicateInfo.method}): ${duplicateInfo.message}`);
      
      // Registrar bloqueio permanente (se ainda não existir)
      if (duplicateInfo.orderId) {
        await this.registerLock(postCode, serviceId, duplicateInfo.orderId);
      }
      
      return {
        success: false,
        error: duplicateInfo.message,
        duplicate: true,
        postId: post.id,
        postCode: postCode,
        orderId: duplicateInfo.orderId,
        externalOrderId: duplicateInfo.externalOrderId
      };
    }
    
    try {
      // Construir os parâmetros para a API do provedor
      const requestParams = new URLSearchParams({
        key: apiKey,
        action: 'add',
        service: serviceExternalId,
        link: targetUrl,
        quantity: postQuantity.toString()
      });
      
      // Salvar os dados da requisição para referência
      const requestData = {
        action: 'add',
        service: serviceExternalId,
        link: targetUrl,
        quantity: postQuantity,
        post_code: postCode
      };
      
      this.logger.info(`Enviando pedido para o provedor: ${targetUrl} com quantidade ${postQuantity}`);
      
      // Enviar o pedido para o provedor
      const response = await axios.post(apiUrl, requestParams);
      
      // Validar a resposta do provedor
      if (!response.data || response.data.error) {
        throw new Error(`Erro do provedor: ${response.data?.error || 'Resposta inválida'}`);
      }
      
      const externalOrderId = response.data.order || String(response.data.id) || `order-${Date.now()}`;
      
      // CORREÇÃO: Tratar IDs vindos da tabela core_transaction_posts_v2
      // Como a tabela posts não existe, vamos armazenar apenas nos metadados
      const actualPostId = null; // Sempre null para evitar erro de chave estrangeira
      
      // Registrar nos logs o ID original para referência
      this.logger.info(`Usando post ID ${post.id} apenas nos metadados (sem salvar na referência post_id)`);
      
      // Registrar o pedido no banco de dados
      const { data: order, error: orderError } = await this.supabase
        .from('core_orders')
        .insert({
          transaction_id: transactionId,
          post_id: actualPostId, // NULL para evitar violação de chave estrangeira
          service_id: serviceId,
          provider_id: providerId,
          external_order_id: externalOrderId,
          provider_order_id: externalOrderId,
          status: 'pending',
          quantity: postQuantity,
          target_url: targetUrl,
          metadata: {
            service_type: serviceType,
            post_code: postCode,
            post_type: post.type === 'reel' || (post.url && post.url.includes('/reel/')) ? 'reel' : 'post',
            original_post_id: post.id, // Armazenar o ID original nos metadados para referência
            post_source: 'core_transaction_posts_v2', // Indicar a fonte do post
            providerRequestData: requestData,
            providerResponse: response.data
          }
        })
        .select()
        .single();
        
      if (orderError) {
        this.logger.error(`Erro ao registrar pedido: ${orderError.message}`);
        throw new Error(`Erro ao registrar pedido: ${orderError.message}`);
      }
      
      // Registrar bloqueio permanente para evitar duplicação futura
      await this.registerLock(postCode, serviceId, order.id);
      
      this.logger.success(`Pedido de ${serviceType} registrado com sucesso: ${order.id} para ${targetUrl} (${postQuantity} ${serviceType})`);
      
      return {
        success: true,
        orderId: order.id,
        externalOrderId,
        postId: post.id,
        postCode,
        quantity: postQuantity
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  }

  /**
   * Registra um bloqueio permanente para um post e serviço
   * @param postCode Código do post
   * @param serviceId ID do serviço
   * @param orderId ID do pedido que causou o bloqueio
   */
  async registerLock(postCode: string, serviceId: string, orderId: string) {
    try {
      // Criar a chave de bloqueio
      const lockKey = `post_${postCode}_service_${serviceId}`;
    
      // Verificar se já existe um bloqueio para este post e serviço
      const { data: existingLock } = await this.supabase
        .from('core_processing_locks')
        .select('*')
        .eq('lock_key', lockKey)
        .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro quando não encontra
      
      if (existingLock) {
        this.logger.info(`Bloqueio já existe para post ${postCode} e serviço ${serviceId}`);
        return;
      }
      
      // Calcular data de expiração (1 ano)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      
      // Registrar bloqueio permanente usando a estrutura correta da tabela
      const { error } = await this.supabase
        .from('core_processing_locks')
        .insert({
          transaction_id: orderId, // Usando orderId como transaction_id para compatibilidade
          lock_key: lockKey,
          locked_by: 'provider-order-service',
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
        this.logger.error(`Erro ao registrar bloqueio: ${error.message}`);
      } else {
        this.logger.success(`Bloqueio registrado com sucesso para post ${postCode} e serviço ${serviceId}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao registrar bloqueio para post ${postCode}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
} 