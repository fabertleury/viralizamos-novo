import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendOrderToProvider } from '@/lib/services/orderProcessingService';

export async function POST(request: NextRequest) {
  try {
    // Criar cliente Supabase com cookies
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Verificar se o usuário está autenticado e é admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }
    
    // Obter dados do pedido
    const requestData = await request.json();
    const { 
      orderId, 
      transactionId, 
      serviceId, 
      providerRequestData, 
      formattedLink, 
      quantity 
    } = requestData;
    
    if (!orderId || !transactionId || !serviceId || !providerRequestData || !formattedLink) {
      return NextResponse.json({ error: 'Dados insuficientes para reenviar o pedido' }, { status: 400 });
    }
    
    // Buscar dados necessários
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
      
    if (!transaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    }
    
    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
      
    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }
    
    const { data: provider } = await supabase
      .from('providers')
      .select('*')
      .eq('id', service.provider_id)
      .single();
      
    if (!provider) {
      return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });
    }
    
    // Buscar dados do cliente
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('id', orderId)
      .single();
      
    let customer = null;
    if (order?.customer_id) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', order.customer_id)
        .single();
        
      customer = customerData;
    }
    
    // Extrair informações do post dos metadados
    const { data: originalOrder } = await supabase
      .from('orders')
      .select('metadata')
      .eq('id', orderId)
      .single();
      
    const post = originalOrder?.metadata?.post || {
      url: formattedLink,
      username: transaction.metadata?.profile?.username || 'Unknown'
    };
    
    // Enviar pedido para o provedor
    const result = await sendOrderToProvider({
      transaction,
      service,
      provider,
      post,
      customer,
      formattedLink,
      quantity
    });
    
    if (!result.success) {
      // Atualizar o status do pedido original com o erro atualizado
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          metadata: {
            ...originalOrder?.metadata,
            resent: true,
            resent_at: new Date().toISOString(),
            resent_by: user.id,
            resent_result: result,
            error: result.error || 'Erro desconhecido ao reenviar pedido'
          }
        })
        .eq('id', orderId);
      
      return NextResponse.json({ 
        success: false,
        error: result.error || 'Erro ao reenviar pedido para o provedor'
      }, { status: 400 });
    }
    
    // Atualizar o status do pedido original
    await supabase
      .from('orders')
      .update({
        status: 'pending',
        external_order_id: result.order?.order || null,
        metadata: {
          ...originalOrder?.metadata,
          resent: true,
          resent_at: new Date().toISOString(),
          resent_by: user.id,
          resent_result: result,
          error: null // Limpar o erro anterior
        }
      })
      .eq('id', orderId);
    
    return NextResponse.json({
      success: true,
      message: 'Pedido reenviado com sucesso',
      orderId: result.order?.order || null,
      result
    });
    
  } catch (error) {
    console.error('Erro ao reenviar pedido:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao reenviar pedido'
    }, { status: 500 });
  }
}
