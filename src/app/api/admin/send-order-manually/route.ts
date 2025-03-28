import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verificar autenticação como admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    // Obter dados do corpo da requisição
    const { order_id, transaction_id, username, link, quantity } = await request.json();
    
    if (!order_id || !transaction_id || !username || !link || !quantity) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Buscar detalhes do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        service:service_id (*)
      `)
      .eq('id', order_id)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    
    // Buscar detalhes do provedor
    const { data: providerInfo, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', order.metadata?.provider_id)
      .single();
      
    if (providerError || !providerInfo) {
      return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });
    }
    
    // Enviar requisição para o provedor manualmente
    try {
      const provider = providerInfo;
      const serviceId = order.service?.external_id || order.metadata?.external_id;
      
      if (!serviceId) {
        return NextResponse.json({ error: 'ID do serviço não encontrado' }, { status: 404 });
      }
      
      // Preparar dados para o provedor
      const providerRequestData = {
        service: serviceId,
        link: link,
        quantity: quantity, // Usar quantidade corrigida
        action: 'add',
        key: provider.api_key
      };
      
      console.log(`Enviando pedido manual para o provedor: ${provider.name}`, providerRequestData);
      
      // Fazer requisição para o provedor
      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerRequestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na resposta do provedor: ${errorText}`);
      }
      
      const providerResponse = await response.json();
      
      // Verificar se a resposta contém um ID de pedido
      if (!providerResponse.order) {
        return NextResponse.json({ 
          error: 'Provedor não retornou ID do pedido', 
          provider_response: providerResponse 
        }, { status: 400 });
      }
      
      // Atualizar o pedido com o novo ID e status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          external_order_id: providerResponse.order,
          status: 'pending', // Ou o status retornado pelo provedor
          needs_admin_attention: false,
          metadata: {
            ...order.metadata,
            provider_response: providerResponse,
            provider_request: providerRequestData,
            manual_fix: {
              fixed_at: new Date().toISOString(),
              fixed_by: session.user.email,
              original_error: order.metadata?.provider_error,
              original_status: order.status
            },
            provider_error: null, // Limpar erro
            admin_notes: `Corrigido manualmente por ${session.user.email} em ${new Date().toLocaleString()}`
          }
        })
        .eq('id', order_id);
        
      if (updateError) {
        return NextResponse.json({ error: 'Erro ao atualizar pedido', details: updateError }, { status: 500 });
      }
      
      // Adicionar registro na tabela de logs admin
      await supabase
        .from('admin_logs')
        .insert({
          user_id: session.user.id,
          action: 'manual_order_fix',
          entity_type: 'order',
          entity_id: order_id,
          description: `Pedido enviado manualmente para o provedor ${provider.name}`,
          metadata: {
            previous_status: order.status,
            new_status: 'pending',
            provider_response: providerResponse,
            provider_request: providerRequestData
          }
        });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Pedido enviado com sucesso',
        provider_response: providerResponse,
        order_id: order_id
      });
      
    } catch (error: any) {
      console.error('Erro ao enviar pedido para o provedor:', error);
      return NextResponse.json({ 
        error: 'Erro ao enviar pedido para o provedor', 
        details: error.message 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Erro geral ao processar envio manual:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { status: 500 });
  }
} 