import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { providerRouter } from '@/services/providerRouter';

export async function POST(request: Request) {
  try {
    const supabase = createClientComponentClient();
    const cookieStore = cookies();

    // Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Extrair dados do request
    const { orderId, email } = await request.json();
    
    if (!orderId) {
      return Response.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
    }

    // Buscar pedido - verificar se o usuário está autenticado ou se forneceu um email
    let orderQuery = supabase.from('orders').select('*, provider:provider_id(*)');
    
    if (session) {
      // Se o usuário está autenticado, verificar se o pedido pertence a ele
      orderQuery = orderQuery.eq('id', orderId).eq('user_id', session.user.id);
    } else if (email) {
      // Se o usuário não está autenticado, mas forneceu um email, verificar se o pedido está associado a esse email
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .single();
      
      if (customer) {
        orderQuery = orderQuery.eq('id', orderId).eq('customer_id', customer.id);
      } else {
        // Fallback para verificar o email nos metadados se não encontrar um cliente
        orderQuery = orderQuery.eq('id', orderId).filter('metadata->email', 'eq', email);
      }
    } else {
      return Response.json({ error: 'Autenticação ou email é obrigatório' }, { status: 401 });
    }
    
    const { data: order, error: orderError } = await orderQuery.single();

    if (orderError) {
      console.error('Erro ao buscar pedido:', orderError);
      return Response.json({ error: 'Pedido não encontrado ou não pertence a este usuário' }, { status: 404 });
    }

    if (!order) {
      return Response.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar se o pedido tem um ID externo
    if (!order.external_order_id) {
      return Response.json({ error: 'Pedido sem ID externo' }, { status: 400 });
    }

    // Usar o providerRouter para criar a reposição
    let refillResponse;
    try {
      // Determinar qual provedor usar
      const providerId = order.provider_id || 'default';
      refillResponse = await providerRouter.createRefill(providerId, order.external_order_id);
    } catch (error) {
      console.error('Erro ao criar reposição no provedor:', error);
      return Response.json(
        { error: 'Erro ao criar reposição no provedor', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

    // Registrar reposição no banco
    const { data: refill, error: refillError } = await supabase
      .from('refills')
      .insert({
        order_id: orderId,
        user_id: session?.user?.id || null,
        customer_id: order.customer_id || null,
        external_refill_id: refillResponse.refill || refillResponse.id || refillResponse.refillId,
        status: 'pending',
        metadata: {
          provider: order.provider?.name || 'default',
          provider_order_id: order.external_order_id,
          provider_refill_id: refillResponse.refill || refillResponse.id || refillResponse.refillId,
          email: email || order.metadata?.email || (session?.user ? session.user.email : null)
        }
      })
      .select()
      .single();

    if (refillError) {
      console.error('Erro ao registrar reposição:', refillError);
      throw refillError;
    }

    return Response.json(refill);
  } catch (error) {
    console.error('Erro ao criar reposição:', error);
    return Response.json(
      { error: 'Erro ao processar reposição', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
