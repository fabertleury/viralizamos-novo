import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkMultipleOrdersStatus } from '@/lib/transactions/transactionProcessor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // 1. Buscar pedidos pendentes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending'])
      .order('created_at', { ascending: true });

    if (ordersError) throw ordersError;
    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No orders to check' });
    }

    // 2. Agrupar pedidos por lotes de 100 (limite da API)
    const orderIds = orders.map(order => order.external_order_id);
    const batches = [];
    for (let i = 0; i < orderIds.length; i += 100) {
      batches.push(orderIds.slice(i, i + 100));
    }

    // 3. Verificar status de cada lote
    const results = [];
    for (const batch of batches) {
      const statusResponse = await checkMultipleOrdersStatus(batch);
      
      // 4. Atualizar cada pedido no banco
      for (const order of orders) {
        const orderStatus = statusResponse[order.external_order_id];
        if (!orderStatus || 'error' in orderStatus) continue;

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: orderStatus.data.status,
            metadata: {
              ...order.metadata,
              provider_status: {
                status: orderStatus.data.status,
                start_count: orderStatus.data.start_count,
                remains: orderStatus.data.remains,
                updated_at: new Date().toISOString()
              }
            }
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          continue;
        }

        results.push({
          order_id: order.id,
          external_order_id: order.external_order_id,
          old_status: order.status,
          new_status: orderStatus.data.status
        });
      }
    }

    return NextResponse.json({
      message: 'Orders checked successfully',
      updated_orders: results
    });

  } catch (error) {
    console.error('Error checking orders:', error);
    return NextResponse.json(
      { error: 'Error checking orders' },
      { status: 500 }
    );
  }
}
