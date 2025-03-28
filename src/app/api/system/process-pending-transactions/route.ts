import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transactionProcessing } from '@/lib/transactions/utils/transactionProcessing'
import { ProcessTransaction } from '@/lib/transactions/modules/processTransaction'
import { logger } from '@/lib/logger'
import { verifyApiKey } from '@/lib/auth/apiAuth'

/**
 * Processa um lote de transações pendentes
 * Esta rota pode ser chamada por um cron job para processar transações pendentes em lote
 */
export async function POST(request: NextRequest) {
  // Verificar autenticação
  const authResult = await verifyApiKey(request)
  if (!authResult.success) {
    return NextResponse.json(
      { error: 'Acesso não autorizado' },
      { status: 401 }
    )
  }

  try {
    const supabase = createClient()
    const body = await request.json()
    
    // Parâmetros da requisição
    const batchSize = body.batchSize || 10
    const maxAttempts = body.maxAttempts || 3
    const workerId = body.workerId || `worker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // Buscar transações pendentes ou falhas com menos de N tentativas
    const { data: pendingTransactions, error } = await supabase
      .from('transaction_processing')
      .select('transaction_id, attempts, last_error')
      .in('status', ['pending', 'failed'])
      .lt('attempts', maxAttempts)
      .is('lock_key', null)
      .order('created_at', { ascending: true })
      .limit(batchSize)
    
    if (error) {
      logger.error('Erro ao buscar transações pendentes', { error })
      return NextResponse.json(
        { error: 'Erro ao buscar transações pendentes' },
        { status: 500 }
      )
    }
    
    if (!pendingTransactions || pendingTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma transação pendente encontrada',
        processed: 0
      })
    }
    
    logger.info(`Processando lote de ${pendingTransactions.length} transações pendentes`, {
      workerId,
      transactionIds: pendingTransactions.map(t => t.transaction_id)
    })
    
    // Inicializar o processador de transações
    const processTransaction = new ProcessTransaction()
    
    // Processar cada transação com lock de concorrência
    const results = await Promise.all(
      pendingTransactions.map(async (transaction) => {
        const transactionId = transaction.transaction_id
        
        try {
          // Tentar adquirir lock para processar
          const { success, result, error } = await transactionProcessing.processWithLock(
            transactionId,
            workerId,
            async () => {
              // Buscar transação completa do banco
              const { data: transactionData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', transactionId)
                .single()
              
              if (txError || !transactionData) {
                throw new Error(`Erro ao buscar dados da transação: ${txError?.message || 'Transação não encontrada'}`)
              }
              
              // Verificar se a transação já foi processada
              const { data: existingOrders } = await supabase
                .from('orders')
                .select('id')
                .eq('transaction_id', transactionId)
              
              if (existingOrders && existingOrders.length > 0) {
                logger.info(`Transação ${transactionId} já possui pedidos, pulando processamento`)
                return {
                  skipped: true,
                  reason: 'Transação já possui pedidos',
                  ordersCount: existingOrders.length
                }
              }
              
              // Processar a transação
              logger.info(`Processando transação ${transactionId}`)
              const processingResult = await processTransaction.executeStrategy(transactionData)
              
              return {
                success: true,
                processingResult
              }
            }
          )
          
          if (!success) {
            return {
              transactionId,
              success: false,
              error: error?.message || 'Erro desconhecido no processamento'
            }
          }
          
          return {
            transactionId,
            success: true,
            result
          }
        } catch (error) {
          logger.error(`Erro no processamento da transação ${transactionId}`, { error })
          return {
            transactionId,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          }
        }
      })
    )
    
    // Contar resultados
    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length
    const skippedCount = results.filter(r => r.success && r.result?.skipped).length
    
    logger.info(`Processamento de lote concluído`, {
      total: results.length,
      success: successCount,
      errors: errorCount,
      skipped: skippedCount
    })
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      stats: {
        success: successCount,
        errors: errorCount,
        skipped: skippedCount
      },
      results
    })
  } catch (error) {
    logger.error('Erro ao processar lote de transações', { error })
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 