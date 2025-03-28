import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[Reprocess] Iniciando reprocessamento da transação:', params.id);
  const startTime = new Date();

  try {
    const supabase = createClient();

    // Verificar se a transação existe e está aprovada
    const { data: transaction, error: searchError } = await supabase
      .from('transactions')
      .select(`
        *,
        orders!transaction_id(id)
      `)
      .eq('id', params.id)
      .single();

    if (searchError) {
      console.error('[Reprocess] Erro ao buscar transação:', searchError);
      throw searchError;
    }

    if (!transaction) {
      console.error('[Reprocess] Transação não encontrada:', params.id);
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verificar se já tem pedidos
    if (transaction.orders && transaction.orders.length > 0) {
      console.log('[Reprocess] Transação já tem pedidos:', transaction.orders);
      return NextResponse.json({
        message: 'Transaction already has orders',
        orders: transaction.orders
      });
    }

    // Verificar se está aprovada
    if (transaction.status !== 'approved') {
      console.error('[Reprocess] Transação não está aprovada:', transaction.status);
      return NextResponse.json(
        { message: 'Transaction not approved' },
        { status: 400 }
      );
    }

    // Processar a transação
    console.log('[Reprocess] Processando transação...');
    const result = await processTransaction(params.id);
    console.log('[Reprocess] Resultado:', result);

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`[Reprocess] Finalizado em ${duration}ms`);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('[Reprocess] Erro:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Internal server error',
        details: error.response?.data || error
      },
      { status: 500 }
    );
  }
}
