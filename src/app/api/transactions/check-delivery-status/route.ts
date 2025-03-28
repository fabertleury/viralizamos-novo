import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkOrderStatus } from '@/lib/transactions/transactionProcessor';

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação é obrigatório' },
        { status: 400 }
      );
    }

    console.log('[CheckDeliveryStatus] Verificando status de entrega da transação:', transactionId);
    
    const supabase = createClient();

    // Buscar a transação
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('[CheckDeliveryStatus] Erro ao buscar transação:', transactionError);
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Buscar os pedidos associados à transação
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_id', transactionId);

    if (ordersError) {
      console.error('[CheckDeliveryStatus] Erro ao buscar pedidos:', ordersError);
      return NextResponse.json(
        { error: 'Erro ao buscar pedidos associados à transação' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      console.log('[CheckDeliveryStatus] Nenhum pedido encontrado para a transação:', transactionId);
      return NextResponse.json({
        status: 'warning',
        message: 'Nenhum pedido encontrado para esta transação'
      });
    }

    // Verificar o status de cada pedido no provedor
    const orderStatusResults = [];
    let allCompleted = true;

    for (const order of orders) {
      if (!order.external_order_id) {
        console.log(`[CheckDeliveryStatus] Pedido ${order.id} não tem ID externo`);
        allCompleted = false;
        continue;
      }

      try {
        console.log(`[CheckDeliveryStatus] Verificando status do pedido ${order.external_order_id}`);
        
        // Verificar se o pedido tem provider_id
        if (!order.provider_id) {
          console.log(`[CheckDeliveryStatus] Pedido ${order.id} não tem provider_id definido`);
          
          // Tentar obter o provider_id do metadata
          const providerId = order.metadata?.provider || order.metadata?.provider_id || order.metadata?.provider_name;
          
          if (!providerId) {
            console.log(`[CheckDeliveryStatus] Pedido ${order.id} não tem provider_id nem no metadata`);
            
            // Atualizar o status do pedido para completed para evitar verificações futuras
            await supabase
              .from('orders')
              .update({ 
                status: 'completed',
                updated_at: new Date().toISOString(),
                metadata: {
                  ...order.metadata,
                  auto_completed: true,
                  auto_completed_reason: 'Sem provider_id definido'
                }
              })
              .eq('id', order.id);
              
            orderStatusResults.push({
              orderId: order.id,
              externalOrderId: order.external_order_id,
              status: 'completed',
              message: 'Marcado como concluído automaticamente (sem provider_id)'
            });
            
            continue;
          }
          
          // Usar o provider_id do metadata
          const statusResponse = await checkOrderStatus(order.external_order_id, providerId);
          console.log(`[CheckDeliveryStatus] Status do pedido ${order.external_order_id}:`, JSON.stringify(statusResponse, null, 2));
        } else {
          // Usar o provider_id do pedido
          const statusResponse = await checkOrderStatus(order.external_order_id, order.provider_id);
          console.log(`[CheckDeliveryStatus] Status do pedido ${order.external_order_id}:`, JSON.stringify(statusResponse, null, 2));

          // Atualizar o status no banco de dados
          const providerStatus = {
            status: statusResponse.data.status,
            start_count: statusResponse.data.start_count,
            remains: statusResponse.data.remains,
            charge: statusResponse.data.charge,
            currency: statusResponse.data.currency,
            updated_at: new Date().toISOString()
          };

          const newMetadata = {
            ...order.metadata,
            provider_status: providerStatus
          };

          const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({
              status: statusResponse.data.status === 'Completed' ? 'completed' : 
                     statusResponse.data.status === 'In progress' ? 'processing' :
                     statusResponse.data.status === 'Pending' ? 'pending' :
                     statusResponse.data.status === 'Canceled' ? 'canceled' :
                     statusResponse.data.status === 'Partial' ? 'partial' : order.status,
              metadata: newMetadata
            })
            .eq('id', order.id)
            .select()
            .single();

          if (updateError) {
            console.error(`[CheckDeliveryStatus] Erro ao atualizar pedido ${order.id}:`, updateError);
            allCompleted = false;
          }

          orderStatusResults.push({
            orderId: order.id,
            externalOrderId: order.external_order_id,
            status: statusResponse.data.status,
            isCompleted: statusResponse.data.status === 'Completed'
          });

          if (statusResponse.data.status !== 'Completed') {
            allCompleted = false;
          }
        }
      } catch (error: unknown) {
        console.error(`[CheckDeliveryStatus] Erro ao verificar status do pedido ${order.external_order_id}:`, error);
        
        // Marcar o pedido como erro para evitar verificações futuras
        await supabase
          .from('orders')
          .update({
            status: 'error',
            metadata: {
              ...order.metadata,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              error_timestamp: new Date().toISOString()
            }
          })
          .eq('id', order.id);

        orderStatusResults.push({
          orderId: order.id,
          externalOrderId: order.external_order_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          isCompleted: false
        });
      }
    }

    // Se todos os pedidos estiverem completos, marcar a transação como entregue
    if (allCompleted) {
      console.log('[CheckDeliveryStatus] Todos os pedidos estão completos, marcando transação como entregue');
      
      const { data: updatedTransaction, error: updateTransactionError } = await supabase
        .from('transactions')
        .update({
          delivered: true,
          delivered_at: new Date().toISOString(),
          metadata: {
            ...transaction.metadata,
            delivery: {
              delivered: true,
              delivered_at: new Date().toISOString(),
              auto_delivered: true,
              order_statuses: orderStatusResults
            }
          }
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (updateTransactionError) {
        console.error('[CheckDeliveryStatus] Erro ao atualizar transação:', updateTransactionError);
        return NextResponse.json({
          status: 'partial_success',
          message: 'Pedidos verificados, mas houve erro ao marcar transação como entregue',
          order_statuses: orderStatusResults,
          error: updateTransactionError.message
        });
      }

      return NextResponse.json({
        status: 'success',
        message: 'Todos os pedidos estão completos. Transação marcada como entregue.',
        transaction: updatedTransaction,
        order_statuses: orderStatusResults
      });
    }

    return NextResponse.json({
      status: 'pending',
      message: 'Nem todos os pedidos estão completos.',
      order_statuses: orderStatusResults
    });
  } catch (error: any) {
    console.error('[CheckDeliveryStatus] Erro geral:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
