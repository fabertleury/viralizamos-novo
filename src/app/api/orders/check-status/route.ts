import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkOrderStatus, updateOrderStatus } from '@/lib/transactions/transactionProcessor';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { order_id } = data;

    if (!order_id) {
      return NextResponse.json({ error: 'ID do pedido não fornecido' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Buscar o pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, service:service_id(*)')
      .eq('id', order_id)
      .single();
    
    if (orderError) {
      console.error('Erro ao buscar pedido:', orderError);
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    
    // Verificar se o pedido tem um provedor associado (em qualquer um dos campos possíveis)
    if (!order.external_order_id) {
      // Verificar se é um pedido que precisa ser reprocessado
      if (order.status === 'needs_retry') {
        return NextResponse.json({
          success: true,
          status: order.status,
          data: order,
          provider_response: {
            status: 'needs_retry',
            message: 'Este pedido precisa ser reprocessado devido a um erro de conexão com o provedor.',
            connection_error: true,
            updated_at: new Date().toISOString()
          }
        });
      } else {
        return NextResponse.json({ error: 'Pedido não tem ID externo' }, { status: 400 });
      }
    }
    
    try {
      // Verificar o status do pedido no provedor
      let providerId = order.provider_id;
      
      // Se não tiver provider_id direto, tentar pegar do metadata
      if (!providerId && order.metadata?.provider_id) {
        providerId = order.metadata.provider_id;
      }
      
      // Se ainda não tiver, tentar pegar do metadata.provider
      if (!providerId && order.metadata?.provider?.id) {
        providerId = order.metadata.provider.id;
      }
      
      // Se ainda não tiver, tentar usar o provider_name como fallback
      if (!providerId && order.metadata?.provider_name) {
        providerId = order.metadata.provider_name;
      }
      
      if (!providerId) {
        return NextResponse.json({ 
          error: 'Pedido não tem provedor associado válido',
          order_id: order_id,
          external_order_id: order.external_order_id
        }, { status: 400 });
      }
      
      const statusResponse = await checkOrderStatus(
        order.external_order_id, // Manter como string, a função checkOrderStatus fará a conversão
        providerId
      );
      
      console.log('Status do pedido:', statusResponse);
      
      // Atualizar o status do pedido no banco de dados
      if (statusResponse && statusResponse.status && statusResponse.status !== order.status) {
        await updateOrderStatus(order_id, statusResponse.status);
        
        // Atualizar os metadados do pedido com as informações de status
        const { error: updateMetadataError } = await supabase
          .from('orders')
          .update({
            metadata: {
              ...order.metadata,
              provider_status: statusResponse
            }
          })
          .eq('id', order_id);
        
        if (updateMetadataError) {
          console.error('Erro ao atualizar metadados do pedido:', updateMetadataError);
        }
      }
      
      // Atualizar o pedido com as informações mais recentes
      const { data: updatedOrder, error: updatedOrderError } = await supabase
        .from('orders')
        .select('*, service:service_id(*)')
        .eq('id', order_id)
        .single();
      
      if (updatedOrderError) {
        console.error('Erro ao buscar pedido atualizado:', updatedOrderError);
      }
      
      return NextResponse.json({
        success: true,
        order_id: order_id,
        external_order_id: order.external_order_id,
        status: statusResponse.status,
        remains: statusResponse.remains,
        start_count: statusResponse.start_count,
        charge: statusResponse.charge,
        currency: statusResponse.currency,
        data: updatedOrder || order,
        provider_response: statusResponse
      });
    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
      return NextResponse.json({ 
        error: 'Erro ao verificar status do pedido',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
