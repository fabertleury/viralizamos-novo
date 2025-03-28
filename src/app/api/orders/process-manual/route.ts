import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação é obrigatório' },
        { status: 400 }
      );
    }

    console.log('[ProcessManual] Processando transação:', transactionId);
    
    const supabase = createClient();

    // Buscar a transação primeiro
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('[ProcessManual] Erro ao buscar transação:', transactionError);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Importar a função processTransaction do sistema de transações
    const { processTransaction } = await import('@/lib/transactions/transactionProcessor');

    // Processar a transação
    console.log('[ProcessManual] Iniciando processamento...');
    const result = await processTransaction(transactionId);
    console.log('[ProcessManual] Processamento concluído:', result);

    return NextResponse.json({
      success: true,
      orders: result
    });
  } catch (error: any) {
    console.error('[ProcessManual] Erro:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
