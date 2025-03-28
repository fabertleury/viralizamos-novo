import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transactionProcessing } from '@/lib/transactions/utils/transactionProcessing'
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

export async function GET(request: NextRequest) {
  // Verificar autenticação para acesso à rota
  const authResult = verifyApiKey(request)
  if (!authResult.success) {
    return NextResponse.json(
      { error: 'Acesso não autorizado' },
      { status: 401 }
    )
  }

  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'status'
    
    // Verificar status geral do sistema de processamento
    if (action === 'status') {
      const { data: locks, error: locksError } = await supabase
        .from('transaction_processing')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10)
      
      const { data: stats, error: statsError } = await supabase.rpc('get_transaction_processing_stats')
      
      if (locksError || statsError) {
        return NextResponse.json(
          { 
            error: 'Erro ao buscar status do sistema',
            details: { locksError, statsError }
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: {
          recentLocks: locks,
          stats: stats
        }
      })
    }
    
    // Verificar saúde do sistema com alertas e recomendações
    if (action === 'health') {
      const { data: health, error: healthError } = await supabase.rpc('get_transaction_processing_health')
      
      if (healthError) {
        logger.error('Erro ao verificar saúde do sistema', { error: healthError })
        return NextResponse.json(
          { 
            error: 'Erro ao verificar saúde do sistema',
            details: healthError
          },
          { status: 500 }
        )
      }
      
      // Determinar o código de status HTTP com base no status de saúde
      let statusCode = 200;
      if (health?.status === 'warning') {
        statusCode = 200; // Ainda 200, mas com avisos no corpo
      } else if (health?.status === 'critical') {
        statusCode = 503; // Service Unavailable para status crítico
      }
      
      return NextResponse.json({
        success: true,
        data: health
      }, { status: statusCode })
    }
    
    // Verificar status de uma transação específica
    if (action === 'check') {
      const transactionId = searchParams.get('transactionId')
      if (!transactionId) {
        return NextResponse.json(
          { error: 'ID da transação não fornecido' },
          { status: 400 }
        )
      }
      
      const isLocked = await transactionProcessing.isLocked(transactionId)
      const status = await transactionProcessing.getProcessingStatus(transactionId)
      const { data, error } = await supabase
        .from('transaction_processing')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao verificar status da transação', {
          error,
          transactionId
        })
      }
      
      return NextResponse.json({
        success: true,
        data: {
          transactionId,
          isLocked,
          status,
          details: data || null
        }
      })
    }
    
    // Liberar um lock específico (apenas em emergências)
    if (action === 'release') {
      const transactionId = searchParams.get('transactionId')
      if (!transactionId) {
        return NextResponse.json(
          { error: 'ID da transação não fornecido' },
          { status: 400 }
        )
      }
      
      // Verificar se existe um admin key para operações sensíveis
      const adminKey = searchParams.get('adminKey')
      if (adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json(
          { error: 'Acesso não autorizado para esta operação' },
          { status: 403 }
        )
      }
      
      const { data, error } = await supabase
        .from('transaction_processing')
        .update({
          status: 'failed',
          lock_key: null,
          lock_expiry: null,
          locked_by: null,
          last_error: 'Lock liberado manualmente via API',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId)
        .select()
      
      if (error) {
        logger.error('Erro ao liberar lock da transação', {
          error,
          transactionId
        })
        
        return NextResponse.json(
          { 
            error: 'Erro ao liberar lock',
            details: error
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Lock liberado com sucesso',
        data
      })
    }
    
    // Ação não reconhecida
    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Erro na API de diagnóstico de processamento de transações', { error })
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 