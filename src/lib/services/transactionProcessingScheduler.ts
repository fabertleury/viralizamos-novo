import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { transactionProcessing } from '@/lib/transactions/utils/transactionProcessing'
import { ProviderService } from '@/lib/transactions/modules/provider/providerService'
import { linkFormatter } from '@/lib/transactions/utils/linkFormatter'

/**
 * Serviço para agendar e executar processamento automático de transações
 * Este serviço garante que transações com pagamento aprovado sejam enviadas para o provedor
 * mesmo que ocorram falhas no processamento do webhook
 */
export class TransactionProcessingScheduler {
  private supabase = createClient()
  private providerService = new ProviderService()
  
  /**
   * Encontra e processa transações pendentes que estão com pagamento aprovado
   * @param batchSize Quantidade máxima de transações para processar
   * @param maxAttempts Número máximo de tentativas 
   * @returns Resultado do processamento
   */
  async processApprovedTransactions(batchSize = 5, maxAttempts = 3): Promise<{
    processed: number;
    success: number;
    failed: number;
    skipped: number;
    results: Array<{
      transactionId: string;
      success: boolean;
      error?: string;
      status?: string;
    }>;
  }> {
    const schedulerId = `scheduler_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const results: Array<{
      transactionId: string;
      success: boolean;
      error?: string;
      status?: string;
    }> = []
    
    try {
      logger.info('Iniciando processamento automático de transações', {
        schedulerId,
        batchSize,
        maxAttempts
      })
      
      // Buscar transações pendentes que tenham pagamento aprovado
      const { data: pendingTransactions, error } = await this.supabase
        .from('transactions')
        .select(`
          id,
          status,
          payment_status,
          service_id,
          created_at,
          payment_id,
          metadata
        `)
        .eq('status', 'pending')
        .eq('payment_status', 'approved')
        .limit(batchSize)
      
      if (error) {
        logger.error('Erro ao buscar transações pendentes', { error })
        throw new Error(`Erro ao buscar transações pendentes: ${error.message}`)
      }
      
      if (!pendingTransactions || pendingTransactions.length === 0) {
        logger.info('Nenhuma transação pendente encontrada com pagamento aprovado')
        return {
          processed: 0,
          success: 0,
          failed: 0,
          skipped: 0,
          results: []
        }
      }
      
      logger.info(`Encontradas ${pendingTransactions.length} transações pendentes com pagamento aprovado`, {
        transactionIds: pendingTransactions.map(t => t.id)
      })
      
      // Processar cada transação
      let successCount = 0
      let failedCount = 0
      let skippedCount = 0
      
      for (const transaction of pendingTransactions) {
        try {
          // Verificar se existe um lock ativo para essa transação
          const isLocked = await transactionProcessing.isLocked(transaction.id)
          
          if (isLocked) {
            logger.info(`Transação ${transaction.id} já está sendo processada, pulando`, {
              transactionId: transaction.id
            })
            
            results.push({
              transactionId: transaction.id,
              success: false,
              status: 'skipped',
              error: 'Transação já está bloqueada para processamento'
            })
            
            skippedCount++
            continue
          }
          
          // Verificar se já tem tentativas demais
          const { data: processingData } = await this.supabase
            .from('transaction_processing')
            .select('attempts, status')
            .eq('transaction_id', transaction.id)
            .single()
          
          if (processingData && processingData.attempts >= maxAttempts) {
            logger.info(`Transação ${transaction.id} já excedeu o número máximo de tentativas (${processingData.attempts}/${maxAttempts})`, {
              transactionId: transaction.id,
              attempts: processingData.attempts,
              maxAttempts
            })
            
            results.push({
              transactionId: transaction.id,
              success: false,
              status: 'skipped',
              error: `Transação excedeu o número máximo de tentativas (${processingData.attempts}/${maxAttempts})`
            })
            
            skippedCount++
            continue
          }
          
          // Verificar se tem pedidos criados
          const { data: existingOrders, error: ordersError } = await this.supabase
            .from('orders')
            .select('id')
            .eq('transaction_id', transaction.id)
          
          if (ordersError) {
            logger.error(`Erro ao verificar pedidos existentes para transação ${transaction.id}`, {
              error: ordersError
            })
          }
          
          if (existingOrders && existingOrders.length > 0) {
            logger.info(`Transação ${transaction.id} já possui ${existingOrders.length} pedidos, pulando`, {
              transactionId: transaction.id,
              ordersCount: existingOrders.length
            })
            
            results.push({
              transactionId: transaction.id,
              success: false,
              status: 'skipped',
              error: `Transação já possui ${existingOrders.length} pedidos`
            })
            
            skippedCount++
            continue
          }
          
          // Processar a transação com lock para garantir exclusividade
          logger.info(`Processando transação ${transaction.id} via agendador`, {
            transactionId: transaction.id,
            schedulerId
          })
          
          const processResult = await transactionProcessing.processWithLock(
            transaction.id,
            schedulerId,
            async () => {
              // Verificar novamente se já existem pedidos (após adquirir o lock)
              const { data: orders } = await this.supabase
                .from('orders')
                .select('id')
                .eq('transaction_id', transaction.id)
              
              if (orders && orders.length > 0) {
                return {
                  success: true,
                  skipped: true,
                  message: `Transação já possui ${orders.length} pedidos`
                }
              }
              
              // Buscar a transação completa do banco
              const { data: fullTransaction, error: txError } = await this.supabase
                .from('transactions')
                .select('*')
                .eq('id', transaction.id)
                .single()
              
              if (txError || !fullTransaction) {
                throw new Error(`Erro ao buscar dados da transação: ${txError?.message || 'Transação não encontrada'}`)
              }

              // Implementar processamento direto de transação aqui - substituir executeStrategy do ProcessTransaction
              return await this.processTransaction(fullTransaction)
            }
          )
          
          if (!processResult.success) {
            logger.error(`Erro ao processar transação ${transaction.id}`, {
              error: processResult.error
            })
            
            results.push({
              transactionId: transaction.id,
              success: false,
              error: processResult.error?.message
            })
            
            failedCount++
          } else {
            if (processResult.result?.skipped) {
              logger.info(`Transação ${transaction.id} pulada: ${processResult.result.message}`)
              
              results.push({
                transactionId: transaction.id,
                success: true,
                status: 'skipped',
                error: processResult.result.message
              })
              
              skippedCount++
            } else {
              logger.info(`Transação ${transaction.id} processada com sucesso`)
              
              results.push({
                transactionId: transaction.id,
                success: true,
                status: 'processed'
              })
              
              successCount++
            }
          }
        } catch (error) {
          logger.error(`Erro ao processar transação ${transaction.id}`, { error })
          
          results.push({
            transactionId: transaction.id,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })
          
          failedCount++
        }
      }
      
      return {
        processed: pendingTransactions.length,
        success: successCount,
        failed: failedCount,
        skipped: skippedCount,
        results
      }
    } catch (error) {
      logger.error('Erro ao processar lote de transações', { error })
      throw error
    }
  }

  /**
   * Processa uma transação diretamente, sem depender do módulo ProcessTransaction
   * Baseado no padrão de checkout do Instagram para curtidas, comentários e visualizações
   */
  private async processTransaction(transaction: any): Promise<{
    success: boolean;
    skipped?: boolean;
    message?: string;
    data?: any;
  }> {
    try {
      logger.info(`Processando transação ${transaction.id}`, { transactionId: transaction.id })

      // Verificar se temos o metadado com posts
      if (!transaction.metadata?.posts || transaction.metadata.posts.length === 0) {
        logger.error(`Transação ${transaction.id} não possui posts para processar`, { 
          transactionId: transaction.id,
          metadata: transaction.metadata 
        })
        throw new Error('Transação não possui posts para processar')
      }

      // Verificar se temos um service_id
      if (!transaction.service_id) {
        logger.error(`Transação ${transaction.id} não possui service_id`, { 
          transactionId: transaction.id
        })
        throw new Error('Transação não possui service_id')
      }

      // Buscar serviço e provedor
      const { data: service, error: serviceError } = await this.supabase
        .from('services')
        .select('*, provider:providers(*)')
        .eq('id', transaction.service_id)
        .single()

      if (serviceError || !service) {
        logger.error(`Erro ao buscar serviço ${transaction.service_id}`, { 
          error: serviceError,
          serviceId: transaction.service_id 
        })
        throw new Error(`Serviço não encontrado: ${serviceError?.message}`)
      }

      if (!service.provider_id || !service.provider) {
        logger.error(`Serviço ${transaction.service_id} não possui provedor associado`, { 
          serviceId: transaction.service_id 
        })
        throw new Error('Serviço não possui provedor associado')
      }

      // Processar cada post da transação
      const postsToProcess = transaction.metadata.posts
      const results = []

      logger.info(`Processando ${postsToProcess.length} posts para transação ${transaction.id}`, {
        transactionId: transaction.id,
        postsCount: postsToProcess.length
      })

      for (const post of postsToProcess) {
        try {
          // Formatar o link do post para o formato aceito pelo provedor
          const formattedLink = linkFormatter.formatPostLinkForProvider(
            post.postLink, 
            service.provider_id
          )

          // Preparar os dados para o provedor
          const providerRequestData = {
            service: service.external_id?.toString() || service.id,
            link: formattedLink,
            quantity: post.quantity.toString(),
            transaction_id: transaction.id,
            username: transaction.metadata?.profile?.username || 
                      transaction.metadata?.username ||
                      'unknown'
          }

          // Enviar pedido para o provedor
          const orderResponse = await this.providerService.sendOrderToProvider(
            service.provider, 
            providerRequestData
          )

          // Verificar se houve erro na resposta
          if (orderResponse.error || orderResponse.status === 'error') {
            throw new Error(`Erro ao enviar pedido: ${orderResponse.error || 'Falha no provedor'}`)
          }

          // Registrar o pedido no banco de dados
          const { data: order, error: orderError } = await this.supabase
            .from('orders')
            .insert({
              transaction_id: transaction.id,
              service_id: transaction.service_id,
              provider_id: service.provider_id,
              provider_order_id: orderResponse.order?.toString() || orderResponse.orderId?.toString(),
              provider_status: orderResponse.status || 'pending',
              quantity: post.quantity,
              link: formattedLink,
              metadata: {
                post_data: post,
                provider_response: orderResponse,
                post_type: post.type || 'post'
              }
            })
            .select()
            .single()

          if (orderError) {
            logger.error(`Erro ao registrar pedido para post ${post.postCode}`, { 
              error: orderError, 
              post 
            })
            throw new Error(`Erro ao registrar pedido: ${orderError.message}`)
          }

          results.push({
            success: true,
            order,
            response: orderResponse,
            post
          })

          logger.info(`Pedido enviado com sucesso para o post ${post.postCode}`, {
            orderId: order.id,
            providerOrderId: orderResponse.order || orderResponse.orderId
          })

          // Aguardar um pequeno intervalo entre requisições para não sobrecarregar o provedor
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          logger.error(`Erro ao processar post ${post.postCode}`, { 
            error, 
            post 
          })
          
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            post
          })
        }
      }

      // Atualizar o status da transação
      await this.supabase
        .from('transactions')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      logger.info(`Processamento concluído para transação ${transaction.id}`, {
        transactionId: transaction.id,
        total: results.length,
        success: successCount,
        failed: failCount
      })

      return {
        success: true,
        data: {
          results,
          successCount,
          failCount
        }
      }
    } catch (error) {
      logger.error(`Erro ao processar transação ${transaction.id}`, { 
        error, 
        transactionId: transaction.id 
      })
      throw error
    }
  }
} 