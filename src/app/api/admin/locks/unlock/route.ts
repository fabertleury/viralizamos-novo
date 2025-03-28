import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Manipulador para liberar locks de transações
 * Somente para uso por administradores
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar autorização adequada (implementar conforme necessário)
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'clear_expired';
    const transactionId = searchParams.get('transaction_id');
    
    // Verificar se a tabela order_locks existe
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
        suggestion: 'Execute as migrações necessárias'
      }, { status: 404 });
    }
    
    // Executar a ação solicitada
    if (action === 'clear_expired') {
      // Limpar locks expirados manualmente
      const now = new Date().toISOString();
      
      const { data: clearedLocks, error: clearError } = await supabase
        .from('order_locks')
        .delete()
        .lt('expires_at', now)
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
        message: `${count} locks expirados foram removidos`,
        timestamp: now
      });
    } else if (action === 'force_unlock' && transactionId) {
      // Remover lock específico forçadamente
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
      
      // Registrar log da ação forçada
      await supabase
        .from('logs')
        .insert({
          action: 'force_unlock',
          transaction_id: transactionId,
          metadata: {
            unlocked_by: 'admin',
            unlocked_at: new Date().toISOString(),
            reason: 'Liberação forçada via API'
          }
        });
      
      return NextResponse.json({
        success: true,
        message: `Lock para transação ${transactionId} removido forçadamente`
      });
    } else if (action === 'clear_all') {
      // Limpar todos os locks (CUIDADO!)
      const { data, error: deleteError } = await supabase
        .from('order_locks')
        .delete()
        .neq('id', 'none') // Condição que afeta todas as linhas
        .select('count');
      
      if (deleteError) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao remover todos os locks',
          details: deleteError
        }, { status: 500 });
      }
      
      // Registrar log da ação drástica
      await supabase
        .from('logs')
        .insert({
          action: 'clear_all_locks',
          metadata: {
            cleared_by: 'admin',
            cleared_at: new Date().toISOString(),
            reason: 'Limpeza forçada de todos os locks via API'
          }
        });
      
      const count = data?.[0]?.count || 0;
      
      return NextResponse.json({
        success: true,
        message: `Todos os ${count} locks foram removidos`,
        warning: 'Esta ação é extremamente perigosa e deve ser usada apenas em situações de emergência'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Ação inválida ou parâmetros insuficientes',
        usage: {
          clear_expired: `${request.nextUrl.pathname}?action=clear_expired`,
          force_unlock: `${request.nextUrl.pathname}?action=force_unlock&transaction_id=UUID`,
          clear_all: `${request.nextUrl.pathname}?action=clear_all`
        }
      }, { status: 400 });
    }
  } catch (error) {
    console.error('[API] Erro ao manipular locks:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao manipular locks',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 