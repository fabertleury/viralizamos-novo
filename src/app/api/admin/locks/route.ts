import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Manipulador para verificar o status dos locks de transação!
 * Somente para uso em ambiente de desenvolvimento ou por administradores
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar autorização adequada (implementar conforme necessário)
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'list';
    const transactionId = searchParams.get('transaction_id');
    
    // Verificar se a tabela order_locks existe diretamente
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'order_locks')
      .single();
    
    if (checkError || !tables) {
      return NextResponse.json({
        success: false,
        error: 'Tabela order_locks não existe',
        suggestion: 'Execute a migração create_order_locks.sql'
      }, { status: 404 });
    }
    
    // Executar a ação solicitada
    if (action === 'clear_expired') {
      // Limpar locks expirados manualmente
      const { data: clearedLocks, error: clearError } = await supabase
        .from('order_locks')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('count');
      
      if (clearError) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao limpar locks expirados',
          details: clearError
        }, { status: 500 });
      }
      
      const count = clearedLocks?.[0]?.count || 0;
      
      return NextResponse.json({
        success: true,
        message: `${count} locks expirados foram removidos`
      });
    } else if (action === 'delete' && transactionId) {
      // Remover lock específico
      const { error: deleteError } = await supabase
        .from('order_locks')
        .delete()
        .eq('transaction_id', transactionId);
      
      if (deleteError) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao remover lock',
          details: deleteError
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: `Lock para transação ${transactionId} removido com sucesso`
      });
    } else if (action === 'view' && transactionId) {
      // Visualizar lock específico
      const { data: lock, error: viewError } = await supabase
        .from('order_locks')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();
      
      if (viewError) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao buscar lock',
          details: viewError
        }, { status: 500 });
      }
      
      if (!lock) {
        return NextResponse.json({
          success: false,
          message: `Nenhum lock encontrado para transação ${transactionId}`
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        lock
      });
    } else {
      // Listar todos os locks
      const { data: locks, error: listError } = await supabase
        .from('order_locks')
        .select('*')
        .order('locked_at', { ascending: false });
      
      if (listError) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao listar locks',
          details: listError
        }, { status: 500 });
      }
      
      // Verificar locks expirados
      const now = new Date();
      const activeLocks = locks?.filter(lock => new Date(lock.expires_at) > now) || [];
      const expiredLocks = locks?.filter(lock => new Date(lock.expires_at) <= now) || [];
      
      return NextResponse.json({
        success: true,
        total: locks?.length || 0,
        active: activeLocks.length,
        expired: expiredLocks.length,
        locks,
        usage: {
          clear_expired: `${request.nextUrl.pathname}?action=clear_expired`,
          delete_lock: `${request.nextUrl.pathname}?action=delete&transaction_id=UUID`,
          view_lock: `${request.nextUrl.pathname}?action=view&transaction_id=UUID`
        }
      });
    }
  } catch (error) {
    console.error('[API] Erro ao verificar locks:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao verificar locks',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 