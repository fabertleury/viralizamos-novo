import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  console.log('[Job] Iniciando verificação de transações não processadas');
  const startTime = new Date();

  try {
    const supabase = createClient();

    // Buscar transações aprovadas sem pedidos
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        orders!transaction_id(id)
      `)
      .eq('status', 'approved')
      .is('processed_at', null)
      .limit(10);

    if (error) {
      console.error('[Job] Erro ao buscar transações:', error);
      throw error;
    }

    console.log(`[Job] Encontradas ${transactions.length} transações para processar`);

    // Processar cada transação
    const results = [];
    for (const transaction of transactions) {
      // Pular se já tem pedido
      if (transaction.orders && transaction.orders.length > 0) {
        console.log(`[Job] Transação ${transaction.id} já tem pedidos, pulando...`);
        continue;
      }

      try {
        console.log(`[Job] Processando transação ${transaction.id}`);
        const result = await processTransaction(transaction.id);
        results.push({ 
          transaction_id: transaction.id, 
          success: true, 
          result 
        });
      } catch (error) {
        console.error(`[Job] Erro ao processar transação ${transaction.id}:`, error);
        results.push({ 
          transaction_id: transaction.id, 
          success: false, 
          error: error.message 
        });
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`[Job] Verificação finalizada em ${duration}ms. Resultados:`, results);

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('[Job] Erro ao executar job:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
