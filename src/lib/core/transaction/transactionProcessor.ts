import { createClient } from '@/lib/supabase/server';
import { Transaction, Post, ProcessResult } from '../types';
import { LinkFormatter } from '../utils/linkFormatter';
import { Logger } from '../utils/logger';
import { ProviderOrderService } from '../services/providerOrderService';

/**
 * Responsável pelo processamento de transações aprovadas
 */
export class TransactionProcessor {
  private supabase;
  private linkFormatter;
  private logger;
  private providerOrderService;

  constructor() {
    this.supabase = createClient();
    this.linkFormatter = new LinkFormatter();
    this.logger = new Logger('TransactionProcessor');
    this.providerOrderService = new ProviderOrderService();
  }

  /**
   * Verifica se um post já tem um pedido duplicado
   * @param transactionId ID da transação atual
   * @param postCode Código do post
   * @param serviceId ID do serviço
   * @returns Resultado da verificação de duplicidade
   */
  async checkDuplicateOrder(transactionId: string, postCode: string, serviceId: string): Promise<{
    hasDuplicate: boolean;
    orderId?: string;
    externalOrderId?: string;
    status?: string;
    message?: string;
  }> {
    try {
      this.logger.info(`Verificando duplicidade para post ${postCode} no serviço ${serviceId}`);
      
      const { data, error } = await this.supabase.rpc(
        'check_duplicate_order',
        {
          p_transaction_id: transactionId,
          p_post_code: postCode,
          p_service_id: serviceId
        }
      );
      
      if (error) {
        this.logger.error(`Erro ao verificar duplicidade: ${error.message}`, error);
        return { hasDuplicate: false };
      }
      
      if (data && data.has_duplicate) {
        this.logger.warn(`Ordem duplicada detectada: ${data.message}`, data);
        return {
          hasDuplicate: true,
          orderId: data.order_id,
          externalOrderId: data.external_order_id,
          status: data.status,
          message: data.message
        };
      }
      
      return { hasDuplicate: false };
    } catch (error) {
      this.logger.error(`Erro ao verificar duplicidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, error);
      return { hasDuplicate: false };
    }
  }

  /**
   * Processa uma transação, enviando os pedidos para o provedor apropriado
   * @param transactionId ID da transação a ser processada
   * @returns Resultado do processamento
   */
  async processTransaction(transactionId: string): Promise<ProcessResult> {
    this.logger.info(`Iniciando processamento da transação: ${transactionId}`);
    
    try {
      // Verificar se a transação já está sendo processada
      const isLocked = await this.isTransactionLocked(transactionId);
      if (isLocked) {
        this.logger.info(`Transação ${transactionId} já está bloqueada para processamento`);
        return { 
          success: false, 
          error: 'Transação já está sendo processada',
          needsRetry: false
        };
      }
      
      // Adquirir bloqueio para processamento
      await this.lockTransaction(transactionId);
      this.logger.info(`Bloqueio adquirido para transação ${transactionId}`);
      
      try {
        // Buscar a transação no banco de dados
        const { data: transaction, error } = await this.supabase
          .from('core_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();
          
        if (error || !transaction) {
          this.logger.error(`Erro ao buscar transação ${transactionId}:`, error);
          return { 
            success: false, 
            error: `Transação não encontrada: ${error?.message || 'Erro desconhecido'}`,
            needsRetry: false
          };
        }
        
        // Verificar se a transação já foi processada
        if (transaction.is_processed) {
          this.logger.info(`Transação ${transactionId} já foi processada anteriormente`);
          return { 
            success: true, 
            message: 'Transação já processada anteriormente',
            needsRetry: false
          };
        }
        
        // Verificar se o pagamento foi aprovado
        if (transaction.status !== 'approved') {
          this.logger.info(`Transação ${transactionId} não está aprovada. Status atual: ${transaction.status}`);
          return { 
            success: false, 
            error: `Transação não está aprovada. Status atual: ${transaction.status}`,
            needsRetry: false
          };
        }
        
        // Buscar os posts associados à transação
        const { data: postsData } = await this.supabase
          .from('core_transaction_posts')
          .select('*')
          .eq('transaction_id', transactionId)
          .order('created_at', { ascending: true });
        
        let posts: Post[] = [];
        
        // Se tiver posts na tabela de posts, usar esses
        if (postsData && postsData.length > 0) {
          this.logger.info(`Encontrados ${postsData.length} posts na tabela de posts`);
          posts = postsData.map(post => ({
            id: post.id,
            code: post.post_code,
            url: post.post_url,
            caption: post.post_caption,
            type: post.post_type,
            username: post.username
          }));
        } 
        // Caso contrário, verificar se há posts nos metadados da transação
        else if (transaction.metadata?.posts && transaction.metadata.posts.length > 0) {
          this.logger.info(`Encontrados ${transaction.metadata.posts.length} posts nos metadados da transação`);
          posts = transaction.metadata.posts;
          
          // Inserir os posts da transação na tabela de posts
          try {
            const postsToInsert = posts.map(post => ({
              transaction_id: transactionId,
              post_code: post.code || '',
              post_url: post.url || post.link || '',
              post_caption: post.caption || '',
              post_type: (post.url || post.link || '').includes('/reel/') ? 'reel' : 'post',
              username: post.username || transaction.target_username
            }));
            
            const { data: insertedPosts, error: insertError } = await this.supabase
              .from('core_transaction_posts')
              .insert(postsToInsert)
              .select();
              
            if (insertedPosts) {
              // Atualizar os IDs dos posts
              posts = posts.map((post, index) => ({
                ...post,
                id: insertedPosts[index]?.id || post.id || `temp-${index}`
              }));
            }
              
            this.logger.info(`Posts dos metadados salvos na tabela de posts`);
          } catch (error) {
            this.logger.error(`Erro ao salvar posts dos metadados:`, error);
            // Continuar mesmo com o erro, pois já temos os posts nos metadados
          }
        }
        
        // Se não tiver posts, criar um post com o usuário alvo para serviços de seguidores
        if (posts.length === 0 && transaction.target_username) {
          this.logger.info(`Criando post de usuário para serviço de seguidores`);
          
          // Verificar se o serviço é de seguidores
          const { data: service } = await this.supabase
            .from('services')
            .select('type')
            .eq('id', transaction.service_id)
            .single();
            
          if (service && service.type.toLowerCase() === 'seguidores') {
            const { data: insertedPost, error: insertError } = await this.supabase
              .from('core_transaction_posts')
              .insert({
                transaction_id: transactionId,
                username: transaction.target_username,
                post_url: `https://instagram.com/${transaction.target_username}`
              })
              .select()
              .single();
              
            if (insertedPost && !insertError) {
              posts = [{
                id: insertedPost.id,
                username: transaction.target_username,
                url: `https://instagram.com/${transaction.target_username}`
              }];
            }
          }
        }
        
        // Se ainda não tiver posts, retornar erro
        if (posts.length === 0) {
          this.logger.error(`Nenhum post encontrado para a transação ${transactionId}`);
          return { 
            success: false, 
            error: 'Nenhum post encontrado para processamento',
            needsRetry: false
          };
        }
        
        // Buscar informações do serviço e do provedor
        const { data: service, error: serviceError } = await this.supabase
          .from('services')
          .select('*, providers(*)')
          .eq('id', transaction.service_id)
          .single();
          
        if (serviceError || !service) {
          this.logger.error(`Erro ao buscar serviço da transação:`, serviceError);
          return { 
            success: false, 
            error: `Serviço não encontrado: ${serviceError?.message || 'Erro desconhecido'}`,
            needsRetry: true
          };
        }
        
        // Verificar se o serviço tem provedor associado
        const provider = service.providers;
        if (!provider) {
          this.logger.error(`Serviço não tem provedor associado`);
          return { 
            success: false, 
            error: 'Serviço não tem provedor associado',
            needsRetry: false
          };
        }
        
        this.logger.info(`Serviço: ${service.name}, Tipo: ${service.type}, Provedor: ${provider.name}`);
        
        // Validar posts para serviços que exigem URLs específicas de posts/reels
        if (['curtidas', 'comentarios', 'visualizacao', 'reels'].includes(service.type.toLowerCase())) {
          // Verificar se há posts inválidos (URLs de perfil sem código de post)
          const invalidPosts = posts.filter(post => 
            !post.code && post.url && post.url.includes('instagram.com/') && 
            !post.url.includes('/p/') && !post.url.includes('/reel/')
          );
          
          if (invalidPosts.length > 0) {
            this.logger.error(`Erro: Encontrados ${invalidPosts.length} posts inválidos (URLs de perfil) para serviço de ${service.type}`);
            
            // Registrar log de erro
            await this.supabase.from('core_processing_logs').insert({
              transaction_id: transactionId,
              level: 'error',
              message: `Erro de validação: URLs de perfil não são válidas para serviço de ${service.type}`,
              metadata: { invalidPosts }
            });
            
            return {
              success: false,
              error: `Erro de validação: URLs de perfil não são válidas para serviço de ${service.type}. Verifique os posts enviados.`,
              needsRetry: false
            };
          }
        }
        
        // Processar os pedidos com base no tipo de serviço
        const orderResult = await this.providerOrderService.sendOrders({
          transactionId,
          serviceId: service.id,
          serviceType: service.type,
          providerId: provider.id,
          posts,
          quantity: service.quantity || 100, // Quantidade padrão se não especificada
          providerKey: provider.api_key,
          providerApiUrl: provider.api_url,
          externalServiceId: service.external_id
        });
        
        if (!orderResult.success) {
          this.logger.error(`Erro ao enviar pedidos: ${orderResult.error}`);
          
          // Atualizar a transação com o erro
          await this.supabase
            .from('core_transactions')
            .update({
              processing_attempts: transaction.processing_attempts + 1,
              last_processing_error: orderResult.error,
              updated_at: new Date().toISOString()
            })
            .eq('id', transactionId);
            
          // Registrar log de erro
          await this.supabase.from('core_processing_logs').insert({
            transaction_id: transactionId,
            level: 'error',
            message: `Erro ao enviar pedidos: ${orderResult.error}`,
            metadata: orderResult
          });
          
          return { 
            success: false, 
            error: orderResult.error,
            needsRetry: true
          };
        }
        
        // Atualizar a transação como processada
        await this.supabase
          .from('core_transactions')
          .update({
            is_processed: true,
            processing_attempts: transaction.processing_attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);
          
        this.logger.success(`Transação ${transactionId} processada com sucesso`);
        
        // Registrar log de processamento
        await this.supabase.from('core_processing_logs').insert({
          transaction_id: transactionId,
          level: 'info',
          message: 'Transação processada com sucesso',
          metadata: { 
            service_id: service.id,
            service_name: service.name,
            service_type: service.type,
            provider_id: provider.id,
            provider_name: provider.name,
            posts_count: posts.length,
            orders_result: orderResult
          }
        });
        
        return { 
          success: true, 
          message: 'Transação processada com sucesso',
          needsRetry: false,
          details: orderResult
        };
      } finally {
        // Remover o bloqueio ao finalizar
        await this.unlockTransaction(transactionId);
        this.logger.info(`Bloqueio removido para transação ${transactionId}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao processar transação ${transactionId}:`, error);
      
      // Registrar erro
      try {
        await this.supabase
          .from('core_transactions')
          .update({
            processing_attempts: this.supabase.rpc('increment_attempts', { transaction_id: transactionId }),
            last_processing_error: error instanceof Error ? error.message : 'Erro desconhecido',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);
          
        // Registrar log de erro
        await this.supabase.from('core_processing_logs').insert({
          transaction_id: transactionId,
          level: 'error',
          message: `Erro ao processar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          metadata: { error: JSON.stringify(error) }
        });
      } catch (dbError) {
        this.logger.error(`Erro ao registrar falha para transação ${transactionId}:`, dbError);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        needsRetry: true
      };
    }
  }
  
  /**
   * Verifica se uma transação já está bloqueada para processamento
   */
  private async isTransactionLocked(transactionId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('core_processing_locks')
      .select('expires_at')
      .eq('transaction_id', transactionId)
      .single();
      
    if (!data) return false;
    
    // Verificar se o bloqueio expirou
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      // O bloqueio expirou, podemos removê-lo
      await this.supabase
        .from('core_processing_locks')
        .delete()
        .eq('transaction_id', transactionId);
        
      return false;
    }
    
    return true;
  }
  
  /**
   * Adquire um bloqueio para processamento da transação
   */
  private async lockTransaction(transactionId: string): Promise<void> {
    // Calcular data de expiração (5 minutos no futuro)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    await this.supabase
      .from('core_processing_locks')
      .insert({
        transaction_id: transactionId,
        locked_by: 'transaction-processor',
        expires_at: expiresAt.toISOString(),
        metadata: {
          created_at: new Date().toISOString(),
          process_id: `process-${Date.now()}`
        }
      });
  }
  
  /**
   * Remove o bloqueio de processamento da transação
   */
  private async unlockTransaction(transactionId: string): Promise<void> {
    await this.supabase
      .from('core_processing_locks')
      .delete()
      .eq('transaction_id', transactionId);
  }
} 