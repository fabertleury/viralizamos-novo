import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/core/utils/logger';
import { 
  TransactionProcessResult, 
  TransactionType 
} from './types';
import { PaymentStatusResult } from './types';
import { OrderProcessor } from '../order/OrderProcessor';

// Cache para controlar tentativas de verificação
const paymentAttempts: Record<string, number> = {};
const MAX_ATTEMPTS = 3; // Máximo de tentativas para processar uma transação

/**
 * Classe responsável pelo processamento de transações
 */
export class TransactionProcessor {
  private supabase: SupabaseClient;
  private logger: Logger;
  private orderProcessor: OrderProcessor;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient();
    this.logger = new Logger('TransactionProcessor');
    this.orderProcessor = new OrderProcessor(this.supabase);
  }

  /**
   * Processa uma transação com base no status do pagamento
   * @param transaction Dados da transação a ser processada
   * @param paymentStatusResult Resultado da verificação de status do pagamento
   * @returns Resultado do processamento
   */
  async processTransaction(transaction: TransactionType, paymentStatusResult?: PaymentStatusResult): Promise<TransactionProcessResult> {
    try {
      if (!transaction) {
        this.logger.error('Transação não fornecida para processamento');
        return {
          status: 'error',
          reason: 'Transação não fornecida',
          error: 'Transação não fornecida para processamento'
        };
      }

      // Se já foi processada e tem ordem criada, pular
      if (transaction.order_created === true) {
        this.logger.info(`Transação ${transaction.id} já foi processada e tem ordem criada. Pulando.`);
        return {
          status: 'skipped',
          reason: 'Transação já processada com ordem criada'
        };
      }

      // Se não tiver resultado de status, verificar o status da transação
      if (!paymentStatusResult) {
        this.logger.info(`Verificando status da transação ${transaction.id} no banco de dados`);
        
        const { data: transactionData, error: transactionError } = await this.supabase
          .from('core_transactions_v2')
          .select('status')
          .eq('id', transaction.id)
          .single();
          
        if (transactionError) {
          this.logger.error(`Erro ao buscar status da transação ${transaction.id}: ${transactionError.message}`);
          return {
            status: 'error',
            reason: 'Erro ao buscar status da transação',
            error: transactionError.message
          };
        }
        
        // Se o status for aprovado, processar
        if (transactionData.status === 'approved') {
          paymentStatusResult = {
            status: 'approved',
            transaction_id: transaction.id
          };
        } else {
          this.logger.info(`Transação ${transaction.id} com status ${transactionData.status}. Não aprovada para processamento.`);
          return {
            status: 'skipped',
            reason: `Status da transação (${transactionData.status}) não é 'approved'`
          };
        }
      }

      // Verificar se o pagamento foi aprovado
      if (paymentStatusResult.status !== 'approved') {
        this.logger.info(`Pagamento da transação ${transaction.id} não aprovado (${paymentStatusResult.status}). Pulando processamento.`);
        return {
          status: 'skipped',
          reason: `Status do pagamento (${paymentStatusResult.status}) não é 'approved'`
        };
      }

      // Criar ordem na core_orders se ainda não existir
      const { count, error: countError } = await this.supabase
        .from('core_orders')
        .select('*', { count: 'exact', head: true })
        .eq('transaction_id', transaction.id);
        
      if (countError) {
        this.logger.error(`Erro ao verificar existência de ordem para transação ${transaction.id}: ${countError.message}`);
        return {
          status: 'error',
          reason: 'Erro ao verificar existência de ordem',
          error: countError.message
        };
      }

      if (count && count > 0) {
        this.logger.info(`Já existe ordem para a transação ${transaction.id}. Processando pedidos pendentes.`);
        
        // Processar ordens pendentes para envio ao provedor
        const processingResult = await this.orderProcessor.processPendingOrders();
        
        // Atualizar a transação para indicar que a ordem foi criada
        if (processingResult.success) {
          await this.supabase
            .from('core_transactions_v2')
            .update({
              order_created: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id);
            
          this.logger.success(`Pedidos processados para transação ${transaction.id}`);
          
          return {
            status: 'processed',
            reason: 'Pedidos existentes processados',
            result: {
              status: 'processed',
              message: `${processingResult.success_count} pedidos processados com sucesso`
            }
          };
        } else {
          this.logger.error(`Erro ao processar pedidos pendentes para transação ${transaction.id}: ${processingResult.error}`);
          return {
            status: 'error',
            reason: 'Erro ao processar pedidos pendentes',
            error: processingResult.error
          };
        }
      }

      // Se não existir ordem, precisamos criar uma com base nos dados da transação
      this.logger.info(`Criando ordem para transação ${transaction.id}`);
      
      // Obter os detalhes necessários da transação
      const { data: txDetails, error: txError } = await this.supabase
        .from('core_transactions_v2')
        .select(`
          id, 
          service_id, 
          provider_id, 
          post_id,
          customer_id,
          customer_name,
          customer_email,
          target_username,
          target_url,
          metadata
        `)
        .eq('id', transaction.id)
        .single();
        
      if (txError || !txDetails) {
        this.logger.error(`Erro ao buscar detalhes da transação ${transaction.id}: ${txError?.message || 'Não encontrada'}`);
        return {
          status: 'error',
          reason: 'Erro ao buscar detalhes da transação',
          error: txError?.message || 'Transação não encontrada'
        };
      }
      
      // Verificar se temos todos os dados necessários
      if (!txDetails.service_id) {
        this.logger.error(`Transação ${transaction.id} não possui service_id`);
        return {
          status: 'error',
          reason: 'Dados incompletos',
          error: 'Transação não possui service_id'
        };
      }
      
      if (!txDetails.provider_id) {
        this.logger.error(`Transação ${transaction.id} não possui provider_id`);
        return {
          status: 'error',
          reason: 'Dados incompletos',
          error: 'Transação não possui provider_id'
        };
      }
      
      // Buscar posts associados à transação na tabela core_transaction_posts_v2
      const { data: transactionPosts, error: postsError } = await this.supabase
        .from('core_transaction_posts_v2')
        .select('*')
        .eq('transaction_id', transaction.id);
        
      if (postsError) {
        this.logger.error(`Erro ao buscar posts da transação ${transaction.id}: ${postsError.message}`);
        return {
          status: 'error',
          reason: 'Erro ao buscar posts da transação',
          error: postsError.message
        };
      }
      
      // Se não encontrou posts na tabela, usar a lógica padrão
      if (!transactionPosts || transactionPosts.length === 0) {
        this.logger.info(`Nenhum post encontrado na tabela core_transaction_posts_v2, usando dados da transação`);
        
        // Extrair a quantidade do metadata da transação
        const quantity = txDetails.metadata?.quantity || 
                         txDetails.metadata?.service?.quantity || 
                         txDetails.metadata?.service?.quantidade || 
                         txDetails.metadata?.quantidade || 
                         1000; // valor padrão seguro
        
        this.logger.info(`Quantidade extraída do metadata: ${quantity}`);
        
        // Criar ordem básica para ser processada pelo OrderProcessor
        const { data: order, error: orderError } = await this.supabase
          .from('core_orders')
          .insert({
            transaction_id: txDetails.id,
            service_id: txDetails.service_id,
            provider_id: txDetails.provider_id,
            post_id: txDetails.post_id,
            customer_id: txDetails.customer_id,
            customer_name: txDetails.customer_name,
            customer_email: txDetails.customer_email,
            status: 'pending',
            quantity: quantity,
            target_username: txDetails.target_username,
            target_url: txDetails.target_url,
            metadata: txDetails.metadata || {}
          })
          .select()
          .single();
          
        if (orderError) {
          this.logger.error(`Erro ao criar ordem para transação ${transaction.id}: ${orderError.message}`);
          return {
            status: 'error',
            reason: 'Erro ao criar ordem',
            error: orderError.message
          };
        }
        
        this.logger.success(`Ordem ${order.id} criada com sucesso para transação ${transaction.id}`);
      } else {
        // Se encontrou posts, criar uma ordem para cada post
        this.logger.info(`Encontrados ${transactionPosts.length} posts na tabela core_transaction_posts_v2`);
        
        let ordersCreated = 0;
        let ordersWithErrors = 0;
        
        for (const post of transactionPosts) {
          // Usar a quantidade específica do post ou do metadata da transação
          const quantity = post.quantity || 
                           txDetails.metadata?.quantity || 
                           txDetails.metadata?.service?.quantity || 
                           txDetails.metadata?.service?.quantidade || 
                           txDetails.metadata?.quantidade || 
                           1000; // valor padrão seguro
          
          this.logger.info(`Criando ordem para post ${post.id} (${post.post_code}) com quantidade ${quantity}`);
          
          // Construir URL correta para o post
          let targetUrl = post.post_url;
          if (!targetUrl && post.post_code) {
            // Se não tiver URL mas tiver código, construir URL
            const isReel = post.post_type === 'reel';
            targetUrl = isReel
              ? `https://instagram.com/reel/${post.post_code}/`
              : `https://instagram.com/p/${post.post_code}/`;
          }
          
          try {
            // Criar ordem para este post específico
            const { data: order, error: orderError } = await this.supabase
              .from('core_orders')
              .insert({
                transaction_id: txDetails.id,
                service_id: txDetails.service_id,
                provider_id: txDetails.provider_id,
                post_id: null, // Não usar post_id para evitar violação de chave estrangeira
                customer_id: txDetails.customer_id,
                customer_name: txDetails.customer_name,
                customer_email: txDetails.customer_email,
                status: 'pending',
                quantity: quantity,
                target_username: post.username || txDetails.target_username,
                target_url: targetUrl || txDetails.target_url,
                metadata: {
                  ...(txDetails.metadata || {}),
                  post_code: post.post_code,
                  post_type: post.post_type,
                  post_url: post.post_url,
                  post_id: post.id,
                  post_source: 'core_transaction_posts_v2'
                }
              })
              .select()
              .single();
              
            if (orderError) {
              this.logger.error(`Erro ao criar ordem para post ${post.id}: ${orderError.message}`);
              ordersWithErrors++;
              // Continuar para o próximo post mesmo se houver erro
              continue;
            }
            
            this.logger.success(`Ordem ${order.id} criada com sucesso para post ${post.id}`);
            ordersCreated++;
          } catch (error) {
            this.logger.error(`Erro ao criar ordem para post ${post.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            ordersWithErrors++;
            // Continuar para o próximo post
            continue;
          }
        }
        
        this.logger.info(`Criadas ${ordersCreated} ordens com sucesso. ${ordersWithErrors} ordens com erro.`);
        
        // Se nenhuma ordem foi criada com sucesso, retornar erro
        if (ordersCreated === 0) {
          return {
            status: 'error',
            reason: 'Erro ao criar ordens para os posts',
            error: `Falha ao criar ${ordersWithErrors} ordens para a transação`
          };
        }
      }
      
      // Processar ordens pendentes para envio ao provedor
      const processingResult = await this.orderProcessor.processPendingOrders();
      
      // Atualizar a transação para indicar que as ordens foram criadas
      if (processingResult.success) {
        await this.supabase
          .from('core_transactions_v2')
          .update({
            order_created: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);
          
        this.logger.success(`Pedidos processados para transação ${transaction.id}: ${processingResult.success_count} com sucesso, ${processingResult.error_count} com erro`);
        
        return {
          status: 'processed',
          reason: 'Ordens criadas e processadas',
          result: {
            status: 'processed',
            message: `${processingResult.success_count} pedidos processados com sucesso. ${processingResult.error_count} com erro.`
          }
        };
      } else {
        this.logger.error(`Erro ao processar pedidos pendentes para transação ${transaction.id}: ${processingResult.error}`);
        
        // Ainda consideramos que as ordens foram criadas com sucesso
        await this.supabase
          .from('core_transactions_v2')
          .update({
            order_created: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);
          
        return {
          status: 'processed',
          reason: 'Ordens criadas mas erro no processamento',
          result: {
            status: 'created',
            error: processingResult.error
          }
        };
      }
    } catch (error) {
      this.logger.error(`Erro ao processar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        status: 'error',
        reason: 'Erro no processamento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Incrementa a contagem de tentativas para uma transação
   */
  public incrementAttemptCount(transactionId: string): number {
    paymentAttempts[transactionId] = (paymentAttempts[transactionId] || 0) + 1;
    return paymentAttempts[transactionId];
  }

  /**
   * Obtém a contagem de tentativas para uma transação
   */
  public getAttemptCount(transactionId: string): number {
    return paymentAttempts[transactionId] || 0;
  }

  /**
   * Verifica se uma transação excedeu o número máximo de tentativas
   */
  public hasExceededMaxAttempts(transactionId: string): boolean {
    return this.getAttemptCount(transactionId) >= MAX_ATTEMPTS;
  }
} 