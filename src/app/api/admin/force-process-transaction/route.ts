import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

export async function POST(request: NextRequest) {
  try {
    // Obter o ID da transação do corpo da requisição
    const { transactionId } = await request.json();
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação não informado' },
        { status: 400 }
      );
    }
    
    console.log('[ForceProcessTransaction] Forçando processamento da transação:', transactionId);
    
    const supabase = createClient();
    
    // Verificar se a transação existe
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (transactionError) {
      console.error('[ForceProcessTransaction] Erro ao buscar transação:', transactionError);
      return NextResponse.json(
        { error: `Transação não encontrada: ${transactionError.message}` },
        { status: 404 }
      );
    }
    
    // Registrar no log da transação que estamos forçando o processamento
    await supabase
      .from('transaction_logs')
      .insert({
        transaction_id: transactionId,
        level: 'info',
        message: 'Processamento forçado da transação via API admin',
        metadata: {
          forced_at: new Date().toISOString(),
          previous_status: transaction.status,
          previous_order_created: transaction.order_created
        }
      });
    
    // Forçar o status como 'approved' se ainda não estiver
    if (transaction.status !== 'approved') {
      console.log('[ForceProcessTransaction] Atualizando status da transação para approved');
      await supabase
        .from('transactions')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
    }
    
    // Processar a transação
    console.log('[ForceProcessTransaction] Iniciando processamento da transação');
    const result = await processTransaction(transactionId);
    
    // Verificar e registrar os resultados
    if (Array.isArray(result) && result.length > 0) {
      console.log(`[ForceProcessTransaction] Processamento bem-sucedido! ${result.length} pedidos criados`);
      
      // Verificar se pelo menos um pedido foi criado
      const orderIds = result.map(order => order.id);
      
      return NextResponse.json({
        success: true,
        message: `Transação processada com sucesso! ${result.length} pedidos criados`,
        orders: orderIds
      });
    } else {
      console.log('[ForceProcessTransaction] Processamento concluído sem pedidos');
      
      // Forçar a marcação da transação como processada
      await supabase
        .from('transactions')
        .update({
          order_created: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
      
      return NextResponse.json({
        success: true,
        message: 'Transação processada, mas nenhum pedido foi criado',
        orders: []
      });
    }
  } catch (error) {
    console.error('[ForceProcessTransaction] Erro ao processar transação:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar transação',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 