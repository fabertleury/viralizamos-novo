import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { TransactionProcessingScheduler } from '@/lib/services/transactionProcessingScheduler'

// Chave de API para autenticação simples
const API_KEY = process.env.TRANSACTION_PROCESSING_API_KEY || ''

/**
 * Verifica se a chave de API é válida
 */
function verifyApiKey(request: NextRequest): { success: boolean } {
  const apiKey = request.headers.get('x-api-key')
  return { success: apiKey === API_KEY && API_KEY !== '' }
}

/**
 * Endpoint para processar transações aprovadas que ainda não foram enviadas para os provedores
 * Este endpoint é ideal para ser chamado por um cron job para garantir que nenhuma transação fique sem processamento
 */
export async function POST(request: NextRequest) {
  // Verificar autenticação
  const authResult = verifyApiKey(request)
  if (!authResult.success) {
    return NextResponse.json(
      { error: 'Acesso não autorizado' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    
    // Parâmetros opcionais
    const batchSize = body.batchSize || 5
    const maxAttempts = body.maxAttempts || 3
    const dryRun = body.dryRun === true
    
    logger.info('Iniciando processamento de transações aprovadas', {
      batchSize,
      maxAttempts,
      dryRun
    })
    
    // Se for dry run, apenas simular a operação
    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: 'Dry run: nenhuma transação processada',
        params: {
          batchSize,
          maxAttempts,
          dryRun
        }
      })
    }
    
    // Processar transações com pagamentos aprovados
    const scheduler = new TransactionProcessingScheduler()
    const result = await scheduler.processApprovedTransactions(batchSize, maxAttempts)
    
    // Registrar estatísticas
    logger.info('Processamento de transações concluído', {
      processed: result.processed,
      success: result.success,
      failed: result.failed,
      skipped: result.skipped
    })
    
    return NextResponse.json({
      success: true,
      message: `Processadas ${result.processed} transações (${result.success} com sucesso, ${result.failed} falhas, ${result.skipped} puladas)`,
      data: result
    })
  } catch (error) {
    logger.error('Erro ao processar transações aprovadas', { error })
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 