import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário tem permissão de admin
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!userRoles) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    const { orderId, externalOrderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
    }

    // Obter informações do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Se o pedido já estiver cancelado, retornar sucesso
    if (order.status.toLowerCase() === 'canceled') {
      return NextResponse.json({ message: 'Pedido já estava cancelado', order });
    }

    // Atualizar o status do pedido para cancelado
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError);
      return NextResponse.json({ error: 'Erro ao cancelar pedido' }, { status: 500 });
    }

    // Se tivermos um ID externo e informações do provedor, tentamos cancelar no provedor
    let providerResponse = null;
    if (externalOrderId && order.metadata?.provider) {
      try {
        // Aqui você pode implementar a lógica para cancelar o pedido no provedor
        // Isso dependerá da API do provedor específico
        
        // Exemplo para Fama Redes (você precisará implementar isso)
        if (order.metadata.provider.toLowerCase() === 'fama') {
          // Implementar chamada para API da Fama para cancelar pedido
          // providerResponse = await cancelFamaOrder(externalOrderId);
        } else {
          // Implementar para outros provedores conforme necessário
        }
      } catch (providerError) {
        console.error('Erro ao cancelar no provedor:', providerError);
        // Não retornamos erro aqui, pois o pedido já foi marcado como cancelado no nosso sistema
      }
    }

    // Obter o pedido atualizado
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    return NextResponse.json({ 
      message: 'Pedido cancelado com sucesso', 
      order: updatedOrder,
      providerResponse 
    });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
