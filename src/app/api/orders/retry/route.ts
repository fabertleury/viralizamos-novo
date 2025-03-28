import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

/**
 * API para reprocessar pedidos que falharam devido a erros de conexão
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido não fornecido' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Buscar o pedido no banco de dados
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, transaction:transaction_id(*)')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('[RetryOrder] Erro ao buscar pedido:', orderError);
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    
    // Verificar se o pedido está em um estado que pode ser reprocessado
    if (order.status !== 'needs_retry' && order.status !== 'failed') {
      return NextResponse.json({ 
        error: 'Pedido não está em um estado que pode ser reprocessado',
        status: order.status
      }, { status: 400 });
    }
    
    // Atualizar o contador de tentativas nos metadados
    const metadata = order.metadata || {};
    const retryCount = (metadata.retry_count || 0) + 1;
    
    await supabase
      .from('orders')
      .update({
        status: 'retrying',
        metadata: {
          ...metadata,
          retry_count: retryCount,
          last_retry_at: new Date().toISOString()
        }
      })
      .eq('id', orderId);
    
    // Reprocessar a transação
    if (!order.transaction) {
      return NextResponse.json({ error: 'Transação associada não encontrada' }, { status: 404 });
    }
    
    // Chamar o processamento da transação
    try {
      const result = await processTransaction(order.transaction.id);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Pedido reprocessado com sucesso',
        data: result
      });
    } catch (processError) {
      console.error('[RetryOrder] Erro ao reprocessar transação:', processError);
      
      // Atualizar o status do pedido para 'needs_retry' novamente
      await supabase
        .from('orders')
        .update({
          status: 'needs_retry',
          metadata: {
            ...metadata,
            retry_count: retryCount,
            last_retry_at: new Date().toISOString(),
            last_error: processError instanceof Error ? processError.message : 'Erro desconhecido'
          }
        })
        .eq('id', orderId);
      
      return NextResponse.json({ 
        error: 'Erro ao reprocessar pedido', 
        details: processError instanceof Error ? processError.message : 'Erro desconhecido'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[RetryOrder] Erro geral:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
