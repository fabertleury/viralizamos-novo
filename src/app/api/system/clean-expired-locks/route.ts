import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

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
 * Endpoint para limpar locks expirados no sistema de processamento de transações
 * Este endpoint pode ser chamado por um cron job para manutenção automática
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
    const supabase = createClient()
    const body = await request.json()
    
    // Parâmetros opcionais
    const statusFilter = body.statusFilter || ['processing']
    const dryRun = body.dryRun === true
    
    // Primeiro, buscar quais transações seriam afetadas
    const { data: locksToClean, error: queryError } = await supabase
      .from('transaction_processing')
      .select('*')
      .in('status', statusFilter)
      .not('lock_key', 'is', null)
      .filter('lock_expiry', 'lt', new Date().toISOString())
    
    if (queryError) {
      logger.error('Erro ao buscar locks expirados', { error: queryError })
      return NextResponse.json(
        { error: 'Erro ao buscar locks expirados' },
        { status: 500 }
      )
    }
    
    // Se não houver locks para limpar
    if (!locksToClean || locksToClean.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum lock expirado encontrado',
        cleaned: 0,
        dryRun
      })
    }
    
    // Extrair IDs para log
    const transactionIds = locksToClean.map(lock => lock.transaction_id)
    logger.info(`Encontrados ${locksToClean.length} locks expirados`, {
      count: locksToClean.length,
      transactionIds: transactionIds.slice(0, 10),
      totalTransactions: transactionIds.length,
      dryRun
    })
    
    // Se for um dry run, retornar sem fazer alterações
    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: 'Dry run: nenhuma alteração realizada',
        found: locksToClean.length,
        cleaned: 0,
        dryRun,
        locks: locksToClean.slice(0, 10) // Retornar apenas os 10 primeiros para não sobrecarregar
      })
    }
    
    // Limpar os locks expirados
    const { data: updateResult, error: updateError } = await supabase
      .from('transaction_processing')
      .update({
        status: 'failed',
        lock_key: null,
        lock_expiry: null,
        locked_by: null,
        last_error: 'Lock expirado e liberado automaticamente',
        updated_at: new Date().toISOString()
      })
      .in('transaction_id', transactionIds)
      .select('transaction_id')
    
    if (updateError) {
      logger.error('Erro ao limpar locks expirados', { error: updateError })
      return NextResponse.json(
        { error: 'Erro ao limpar locks expirados' },
        { status: 500 }
      )
    }
    
    const cleanedCount = updateResult?.length || 0
    logger.info(`Locks expirados limpos com sucesso`, {
      count: cleanedCount,
      affected: updateResult?.map(r => r.transaction_id)
    })
    
    return NextResponse.json({
      success: true,
      message: `${cleanedCount} locks expirados foram limpos com sucesso`,
      found: locksToClean.length,
      cleaned: cleanedCount,
      dryRun
    })
  } catch (error) {
    logger.error('Erro ao processar limpeza de locks', { error })
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 