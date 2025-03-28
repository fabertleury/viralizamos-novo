import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderToProvider } from '@/services/providerRouter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    // Verificar se é uma notificação do Mercado Pago
    if (!data || !data.id) {
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar o pedido pelo payment_id nos metadados
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        service:service_id (
          *,
          provider:provider_id (*)
        )
      `)
      .eq('metadata->payment->payment_id', data.id);

    if (ordersError || !orders || orders.length === 0) {
      console.error('Pedido não encontrado para o payment_id:', data.id);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Verificar o status do pagamento
    if (data.status !== 'approved') {
      console.log('Pagamento não aprovado:', data.status);
      return NextResponse.json({
        status: 'success',
        message: 'Payment status updated'
      });
    }

    // Atualizar o status do pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'pending',
        metadata: {
          ...order.metadata,
          payment: {
            ...order.metadata.payment,
            status: 'approved',
            approved_at: new Date().toISOString()
          }
        }
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Erro ao atualizar status do pedido:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Enviar o pedido para o provedor
    try {
      await sendOrderToProvider(order);
    } catch (error) {
      console.error('Erro ao enviar pedido para o provedor:', error);
      // Não vamos falhar aqui, apenas logar o erro
    }

    return NextResponse.json({
      status: 'success',
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 