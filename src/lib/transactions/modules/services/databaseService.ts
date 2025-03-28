import { createClient } from '@/lib/supabase/server';
import { Transaction, Provider, OrderResponse, ProviderRequestData, Order } from '../types';

/**
 * Serviço para operações de banco de dados relacionadas a pedidos
 */
export class DatabaseService {
  private supabase = createClient();

  /**
   * Busca pedidos existentes para uma transação
   * @param transactionId ID da transação
   * @returns Lista de pedidos existentes
   */
  async getExistingOrdersForTransaction(transactionId: string): Promise<any[]> {
    try {
      console.log(`[DatabaseService] Buscando pedidos existentes para a transação: ${transactionId}`);
      
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('transaction_id', transactionId);
        
      if (error) {
        console.error('[DatabaseService] Erro ao buscar pedidos existentes:', error);
        return [];
      }
      
      console.log(`[DatabaseService] Encontrados ${data?.length || 0} pedidos existentes para a transação`);
      return data || [];
    } catch (error) {
      console.error('[DatabaseService] Erro ao buscar pedidos existentes:', error);
      return [];
    }
  }

  /**
   * Verifica se já existe um pedido duplicado
   * @param transactionId ID da transação
   * @param link Link do post
   * @param postCode Código do post (identificador único do Instagram)
   * @returns Pedido existente ou null
   */
  async checkForDuplicateOrder(transactionId: string, link: string, postCode?: string): Promise<any> {
    try {
      console.log(`[DatabaseService] Verificando pedidos duplicados para transação: ${transactionId}, link: ${link}, postCode: ${postCode || 'não fornecido'}`);
      
      // Buscar todos os pedidos para esta transação
      const existingOrders = await this.getExistingOrdersForTransaction(transactionId);
      
      if (existingOrders.length === 0) {
        console.log(`[DatabaseService] Nenhum pedido existente para a transação ${transactionId}`);
        return null;
      }
      
      // Extrair o código do post do link (para Instagram)
      // O padrão típico é https://instagram.com/p/CÓDIGO ou https://instagram.com/reel/CÓDIGO
      let extractedPostCode = null;
      try {
        if (link.includes('instagram.com')) {
          const match = link.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
          if (match && match[2]) {
            extractedPostCode = match[2];
            console.log(`[DatabaseService] Código extraído do link: ${extractedPostCode}`);
          }
        }
      } catch (error) {
        console.error('[DatabaseService] Erro ao extrair código do link:', error);
      }
      
      // Priorizar o código fornecido diretamente, se disponível
      const finalPostCode = postCode || extractedPostCode;
      
      if (finalPostCode) {
        console.log(`[DatabaseService] Verificando duplicação usando o código: ${finalPostCode}`);
      }
      
      // Verificar se algum dos pedidos tem o mesmo código de post (prioridade máxima)
      // ou mesmo link exato (prioridade secundária)
      const duplicateOrder = existingOrders.find(order => {
        // Verificar o status do pedido - permitir reenviar se status não for 'pending' ou 'processing'
        const orderStatus = order.status || 'pending';
        if (orderStatus !== 'pending' && orderStatus !== 'processing') {
          console.log(`[DatabaseService] Pedido encontrado com status ${orderStatus}, permitindo reenvio`);
          return false;
        }
        
        // Verificar o link exato
        const orderLink = order.target_link || order.metadata?.link;
        
        // Extrair o código do post nos metadados
        const orderPostCode = order.metadata?.post?.code || 
                             order.metadata?.post?.shortcode || 
                             order.metadata?.post?.postCode;
        
        // Extrair o código do link do pedido existente
        let orderLinkCode = null;
        try {
          if (orderLink && orderLink.includes('instagram.com')) {
            const match = orderLink.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
            if (match && match[2]) {
              orderLinkCode = match[2];
            }
          }
        } catch (error) {
          console.error('[DatabaseService] Erro ao extrair código do link do pedido:', error);
        }
        
        // Verificações de duplicidade
        let isCodeMatch = false;
        
        // Verificação prioritária pelo código do post
        if (finalPostCode) {
          isCodeMatch = orderPostCode === finalPostCode || orderLinkCode === finalPostCode;
          
          if (isCodeMatch) {
            console.log(`[DatabaseService] Duplicata encontrada pelo CÓDIGO do post: ${finalPostCode} com status ${orderStatus}`);
            return true;
          }
        }
        
        // Verificação secundária pelo link exato (menos confiável)
        const isLinkMatch = orderLink === link;
        
        if (isLinkMatch) {
          console.log(`[DatabaseService] Duplicata encontrada pelo LINK exato: ${link} com status ${orderStatus}`);
        }
        
        return isCodeMatch || isLinkMatch;
      });
      
      if (duplicateOrder) {
        console.log(`[DatabaseService] Pedido duplicado encontrado: ${duplicateOrder.id}`);
        
        // Registrar informações detalhadas para o admin sobre a duplicata
        try {
          // Registrar no log de transações para análise do admin
          await this.supabase
            .from('transaction_logs')
            .insert({
              transaction_id: transactionId,
              level: 'warning',
              message: `Tentativa de pedido duplicado detectada: ${finalPostCode || link}`,
              metadata: {
                original_order_id: duplicateOrder.id,
                external_order_id: duplicateOrder.external_order_id,
                link: link,
                post_code: finalPostCode,
                order_link: duplicateOrder.target_link || duplicateOrder.metadata?.link,
                order_post_code: duplicateOrder.metadata?.post?.code || 
                              duplicateOrder.metadata?.post?.shortcode || 
                              duplicateOrder.metadata?.post?.postCode,
                detected_at: new Date().toISOString(),
                duplicate_type: finalPostCode ? 'code_match' : 'link_match'
              }
            });
          
          // Registrar na tabela de erros de transação para o painel admin
          await this.logErrorForTransaction(
            transactionId,
            `Tentativa de envio de pedido duplicado bloqueada pelo sistema`,
            {
              duplicate_order_id: duplicateOrder.id,
              duplicate_external_id: duplicateOrder.external_order_id,
              link: link,
              code: finalPostCode,
              detected_at: new Date().toISOString()
            }
          );
          
          // Verificar se este pedido já tem uma notificação de duplicação
          const { data: existingNotification } = await this.supabase
            .from('admin_notifications')
            .select('id')
            .eq('transaction_id', transactionId)
            .eq('type', 'duplicate_order')
            .eq('reference_id', duplicateOrder.id)
            .maybeSingle();
          
          // Só criar notificação se ainda não existir
          if (!existingNotification) {
            await this.supabase
              .from('admin_notifications')
              .insert({
                type: 'duplicate_order',
                title: 'Pedido duplicado bloqueado',
                message: `Sistema bloqueou tentativa de envio duplicado para post ${finalPostCode || link}`,
                reference_id: duplicateOrder.id,
                transaction_id: transactionId,
                status: 'pending',
                priority: 'low',
                metadata: {
                  original_order_id: duplicateOrder.id,
                  external_order_id: duplicateOrder.external_order_id,
                  link: link,
                  post_code: finalPostCode,
                  detected_at: new Date().toISOString()
                },
                created_at: new Date().toISOString()
              });
          }
        } catch (logError) {
          console.error('[DatabaseService] Erro ao registrar informações de duplicidade:', logError);
        }
        
        return duplicateOrder;
      }
      
      console.log(`[DatabaseService] Nenhum pedido duplicado encontrado para transação ${transactionId}, código ${finalPostCode || 'não disponível'}`);
      return null;
    } catch (error) {
      console.error('[DatabaseService] Erro ao verificar pedido duplicado:', error);
      return null;
    }
  }

  /**
   * Registra envio de pedido ao provedor para evitar duplicação
   * @param transactionId ID da transação
   * @param link Link do pedido
   * @param username Nome de usuário
   * @param requestData Dados enviados ao provedor
   */
  async logOrderSent(transactionId: string, link: string, username: string, requestData: any): Promise<void> {
    try {
      console.log(`[DatabaseService] Registrando envio de pedido. Transação: ${transactionId}, Link: ${link}`);
      
      // Registrar o envio do pedido no log da transação
      await this.supabase
        .from('transaction_logs')
        .insert({
          transaction_id: transactionId,
          level: 'info',
          message: `Pedido enviado ao provedor: ${link}`,
          metadata: {
            link: link,
            username: username,
            request_data: requestData,
            sent_at: new Date().toISOString()
          }
        });
        
      console.log('[DatabaseService] Envio de pedido registrado com sucesso');
    } catch (error) {
      console.error('[DatabaseService] Erro ao registrar envio de pedido:', error);
    }
  }

  /**
   * Cria um pedido no banco de dados
   * @param transaction Transação relacionada
   * @param provider Provedor utilizado
   * @param orderResponse Resposta do provedor
   * @param link Link do pedido
   * @param username Nome de usuário
   * @param currentPost Post atual (se aplicável)
   * @param totalPosts Total de posts (se aplicável)
   * @param requestData Dados enviados ao provedor
   * @returns Pedido criado
   */
  async createOrderInDatabase(
    transaction: Transaction,
    provider: Provider,
    orderResponse: OrderResponse,
    link: string,
    username: string,
    currentPost?: any,
    totalPosts: number = 1,
    requestData?: ProviderRequestData
  ): Promise<any> {
    try {
      console.log('[DatabaseService] Criando pedido no banco de dados');
      
      // Calcular quantidade com base nos posts
      const quantity = await this.calculateQuantity(transaction, currentPost, totalPosts);
      console.log(`[DatabaseService] Calculando quantidade: ${quantity} (original: ${transaction.service?.quantidade}, posts: ${currentPost})`);
      
      // Extrair ID do pedido
      const externalOrderId = orderResponse.order || 
                             orderResponse.orderId || 
                             orderResponse.order_id;
                             
      if (!externalOrderId) {
        console.error(`[DatabaseService] Resposta do provedor não contém ID do pedido: ${provider.id}`);
      }
      
      // Definir status conforme a resposta do provedor
      let orderStatus = 'pending';
      let needsAdminAttention = false;
      let errorMessage = '';
      
      // Verificar se há mensagem de erro na resposta
      const hasProviderError = 
        orderResponse.error ||
        (typeof orderResponse === 'object' && orderResponse.error_message) ||
        (typeof orderResponse === 'string' && typeof orderResponse === 'string' && orderResponse.toLowerCase().includes('error'));
      
      // Extrair mensagem de erro
      if (hasProviderError) {
        errorMessage = typeof orderResponse.error === 'string' 
          ? orderResponse.error 
          : (orderResponse.error_message || 'Erro desconhecido do provedor');
      }
      
      // Detectar erros específicos do provedor
      if (hasProviderError) {
        console.log(`[DatabaseService] Erro do provedor detectado: ${errorMessage}`);
        orderStatus = 'failed'; // Agora podemos usar 'failed' pois temos status_text
        needsAdminAttention = true;
      } else if (orderResponse.needs_retry === true) {
        orderStatus = 'pending';
        needsAdminAttention = true;
      } else if (!orderResponse.order && !orderResponse.orderId) {
        console.error('[DatabaseService] Resposta do provedor não contém ID do pedido:', orderResponse);
        orderStatus = 'failed'; // Agora podemos usar 'failed' pois temos status_text
        needsAdminAttention = true;
      } else {
        // Mapear status da resposta para valores válidos de order_status
        const respStatus = orderResponse.status || 'pending';
        
        // Não precisamos mais filtrar os valores, pois status_text aceita qualquer valor
        orderStatus = respStatus;
      }
      
      // Dados do pedido para inserção no banco
      const orderData = {
        transaction_id: transaction.id,
        user_id: transaction.user_id,
        customer_id: transaction.customer_id,
        service_id: transaction.service_id,
        external_order_id: externalOrderId,
        // Usamos a função safe_order_status no SQL para garantir que o enum é válido
        // Mas armazenamos o valor real em status_text
        status: this.supabase.rpc('safe_order_status', { status_value: orderStatus }),
        status_text: orderStatus, // Armazenar o status real
        amount: 0.01, // Valor mínimo para evitar erros
        quantity: quantity,
        target_username: username,
        target_url: link,
        provider_id: provider.id,
        needs_admin_attention: needsAdminAttention,
        error_message: errorMessage || null,
        payment_method: transaction.payment_method || 'API',
        payment_id: transaction.payment_id || null,
        metadata: {
          provider: provider.name,
          requestData: requestData || null,
          responseData: orderResponse
        },
        created_at: new Date()
      };
      
      // Inserir o pedido no banco de dados
      const { data: order, error } = await this.supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) {
        console.error('[DatabaseService] Erro ao criar pedido no banco de dados:', error);
        throw error;
      }
      
      console.log('[DatabaseService] Pedido criado com sucesso:', order);
      
      return order;
    } catch (error) {
      console.error('[DatabaseService] Erro ao criar pedido no banco de dados:', error);
      throw error;
    }
  }

  /**
   * Busca uma transação pelo ID do pagamento
   * @param paymentId ID do pagamento
   * @returns Transação ou null se não encontrar
   */
  async getTransactionByPaymentId(paymentId: string): Promise<any> {
    try {
      console.log(`[DatabaseService] Buscando transação pelo payment_id ${paymentId}`);
      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('payment_id', paymentId)
        .single();
      
      if (error) {
        console.error(`[DatabaseService] Erro ao buscar transação por payment_id:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`[DatabaseService] Erro ao buscar transação por payment_id:`, error);
      return null;
    }
  }

  /**
   * Atualiza o status de uma transação
   * @param transactionId ID da transação
   * @param status Status para atualizar (opcional)
   */
  async updateTransactionStatus(transactionId: string, status: string = 'approved'): Promise<void> {
    try {
      console.log(`[DatabaseService] Atualizando status da transação: ${transactionId} para ${status}`);
      
      // Verificar se o status é válido para o enum payment_status
      const validStatuses = ['pending', 'approved', 'rejected', 'refunded', 'in_process'];
      if (!validStatuses.includes(status)) {
        console.warn(`[DatabaseService] Status inválido: ${status}. Usando 'approved' como padrão.`);
        status = 'approved';
      }
      
      const { error } = await this.supabase
        .from('transactions')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
      
      if (error) {
        console.error(`[DatabaseService] Erro ao atualizar status da transação:`, error);
        return;
      }
      
      console.log(`[DatabaseService] Status da transação atualizado com sucesso para ${status}`);
    } catch (error) {
      console.error(`[DatabaseService] Erro ao atualizar status da transação:`, error);
    }
  }

  /**
   * Verifica se uma transação já possui pedidos
   * @param transactionId ID da transação
   * @returns Verdadeiro se a transação já tiver pedidos
   */
  async checkTransactionHasOrders(transactionId: string): Promise<boolean> {
    try {
      console.log(`[DatabaseService] Verificando se transação ${transactionId} já possui pedidos`);
      const { data, error } = await this.supabase
        .from('orders')
        .select('id')
        .eq('transaction_id', transactionId)
        .limit(1);
      
      if (error) {
        console.error(`[DatabaseService] Erro ao verificar pedidos da transação:`, error);
        return false;
      }
      
      const hasOrders = data && data.length > 0;
      console.log(`[DatabaseService] Transação ${transactionId} ${hasOrders ? 'possui' : 'não possui'} pedidos`);
      return hasOrders;
    } catch (error) {
      console.error(`[DatabaseService] Erro ao verificar pedidos da transação:`, error);
      return false;
    }
  }

  /**
   * Obtém um pedido pelo ID externo (ID no provedor)
   * @param externalOrderId ID do pedido no provedor
   * @returns Pedido se encontrado
   */
  async getOrderByExternalId(externalOrderId: string): Promise<Order | null> {
    try {
      const { data: order, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('external_order_id', externalOrderId)
        .maybeSingle();
      
      if (error) {
        console.error('[DatabaseService] Erro ao buscar pedido por ID externo:', error);
        return null;
      }
      
      return order;
    } catch (error) {
      console.error('[DatabaseService] Erro ao buscar pedido por ID externo:', error);
      return null;
    }
  }

  /**
   * Registra um erro associado a uma transação para análise
   * @param transactionId ID da transação
   * @param errorMessage Mensagem de erro
   * @param errorData Dados adicionais para ajudar na análise do erro
   */
  async logErrorForTransaction(transactionId: string, errorMessage: string, errorData?: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('transaction_errors')
        .insert({
          transaction_id: transactionId,
          error_message: errorMessage,
          error_data: errorData,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('[DatabaseService] Erro ao registrar erro de transação:', error);
        
        // Tenta salvar em uma alternativa, caso a tabela não exista
        console.log('[DatabaseService] Tentando registrar no log geral...');
        const { error: backupError } = await this.supabase
          .from('logs')
          .insert({
            level: 'error',
            message: `Erro em transação ${transactionId}: ${errorMessage}`,
            details: errorData,
            created_at: new Date().toISOString()
          });
        
        if (backupError) {
          console.error('[DatabaseService] Também falhou ao registrar no log geral:', backupError);
        }
      }
    } catch (error) {
      console.error('[DatabaseService] Erro ao registrar erro de transação:', error);
    }
  }

  /**
   * Cria um lock de transação para evitar processamento duplicado
   * @param transactionId ID da transação
   * @param expiresInSeconds Tempo em segundos para expiração do lock (padrão: 15 minutos)
   * @returns Resultado da criação do lock
   */
  async createTransactionLock(transactionId: string, expiresInSeconds: number = 15 * 60): Promise<any> {
    try {
      // Calcular data de expiração
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);
      
      const { data, error } = await this.supabase
        .from('order_locks')
        .insert({
          transaction_id: transactionId,
          locked_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          metadata: {
            created_by: 'DatabaseService',
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error(`[DatabaseService] Erro ao criar lock para transação ${transactionId}:`, error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`[DatabaseService] Erro ao criar lock para transação ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se existe um lock para a transação
   * @param transactionId ID da transação
   * @returns Verdadeiro se existir lock válido
   */
  async hasTransactionLock(transactionId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('order_locks')
        .select('id, expires_at')
        .eq('transaction_id', transactionId)
        .maybeSingle();
      
      if (error) {
        console.error(`[DatabaseService] Erro ao verificar lock para transação ${transactionId}:`, error.message);
        return false;
      }
      
      if (!data) {
        return false;
      }
      
      // Verificar se o lock está expirado
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        // Lock expirado, remover e retornar false
        await this.removeTransactionLock(transactionId);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`[DatabaseService] Erro ao verificar lock para transação ${transactionId}:`, error);
      return false;
    }
  }
  
  /**
   * Remove um lock de transação
   * @param transactionId ID da transação
   * @returns Resultado da remoção
   */
  async removeTransactionLock(transactionId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('order_locks')
        .delete()
        .eq('transaction_id', transactionId);
      
      if (error) {
        console.error(`[DatabaseService] Erro ao remover lock para transação ${transactionId}:`, error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`[DatabaseService] Erro ao remover lock para transação ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Calcula a quantidade para o pedido com base na transação e posts
   * @param transaction Dados da transação
   * @param currentPost Post atual sendo processado
   * @param totalPosts Total de posts a serem processados
   * @returns Quantidade calculada
   */
  async calculateQuantity(transaction: Transaction, currentPost?: any, totalPosts = 1): Promise<number> {
    // Obter a quantidade diretamente do currentPost, se disponível e tiver quantity
    if (currentPost && typeof currentPost.quantity === 'number') {
      console.log(`[DatabaseService] Usando quantidade específica do post: ${currentPost.quantity}`);
      return currentPost.quantity;
    }
    
    // Verificar se há uma quantidade específica na tabela core_transaction_posts_v2
    if (transaction.id && currentPost && currentPost.id) {
      try {
        const { data: transactionPost, error } = await this.supabase
          .from('core_transaction_posts_v2')
          .select('quantity')
          .eq('transaction_id', transaction.id)
          .eq('post_id', currentPost.id)
          .maybeSingle();
        
        if (!error && transactionPost && transactionPost.quantity) {
          console.log(`[DatabaseService] Usando quantidade da tabela core_transaction_posts_v2: ${transactionPost.quantity}`);
          return transactionPost.quantity;
        }
      } catch (error) {
        console.error('[DatabaseService] Erro ao buscar quantidade específica do post:', error);
        // Continuar com o cálculo normal se ocorrer erro
      }
    }
    
    // Verificar nos metadados da transação se há quantidade específica para este post
    if (transaction.metadata && transaction.metadata.posts && Array.isArray(transaction.metadata.posts)) {
      const metadataPosts = transaction.metadata.posts;
      const matchingPost = metadataPosts.find((p: any) => 
        p.postId === currentPost?.id || p.postCode === currentPost?.code);
      
      if (matchingPost && typeof matchingPost.quantity === 'number') {
        console.log(`[DatabaseService] Usando quantidade dos metadados da transação: ${matchingPost.quantity}`);
        return matchingPost.quantity;
      }
    }
    
    // Caso não tenha sido fornecida nos dados do post, calcular com base no serviço
    const originalQuantity = transaction.quantity || 
                            transaction.service?.quantidade || 
                            transaction.metadata?.service?.quantidade || 
                            transaction.metadata?.quantity || 
                            100; // Valor padrão seguro
    
    // Se tivermos múltiplos posts, distribuir a quantidade
    const calculatedQuantity = totalPosts > 1 ? Math.floor(originalQuantity / totalPosts) : originalQuantity;
    
    console.log(`[DatabaseService] Calculando quantidade: ${calculatedQuantity} (original: ${originalQuantity}, posts: ${totalPosts})`);
    return calculatedQuantity;
  }
}
