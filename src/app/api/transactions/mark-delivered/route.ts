import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient();
    
    // Verificar se o usuário é admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    // Extrair dados do request
    const { transactionId } = await request.json();
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação é obrigatório' },
        { status: 400 }
      );
    }

    console.log('[MarkDelivered] Marcando transação como entregue:', transactionId);

    // Buscar transação
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('[MarkDelivered] Transação não encontrada:', transactionError);
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar status da transação
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        delivered: true,
        delivered_at: new Date().toISOString(),
        metadata: {
          ...transaction.metadata,
          delivery: {
            delivered: true,
            delivered_at: new Date().toISOString(),
            delivered_by: session.user.id
          }
        }
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (updateError) {
      console.error('[MarkDelivered] Erro ao atualizar transação:', updateError);
      return NextResponse.json(
        { error: 'Erro ao marcar transação como entregue' },
        { status: 500 }
      );
    }

    // Verificar se existem pedidos associados a esta transação
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('transaction_id', transactionId);

    if (!ordersError && orders && orders.length > 0) {
      // Atualizar status dos pedidos
      const { error: updateOrdersError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          metadata: {
            ...transaction.metadata,
            delivery: {
              delivered: true,
              delivered_at: new Date().toISOString(),
              delivered_by: session.user.id
            }
          }
        })
        .eq('transaction_id', transactionId);

      if (updateOrdersError) {
        console.error('[MarkDelivered] Erro ao atualizar pedidos:', updateOrdersError);
      }
    }

    return NextResponse.json({
      status: 'success',
      data: updatedTransaction
    });
  } catch (error: any) {
    console.error('[MarkDelivered] Erro geral:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
