import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'ID do pedido não fornecido' }, { status: 400 });
    }

    // Buscar informações do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar se há ID externo do pedido
    if (!order.external_order_id) {
      return NextResponse.json({ 
        error: 'Este pedido não possui ID externo para verificação de status',
        success: false
      });
    }

    // Obter informações do provedor
    let providerId = order.provider_id;
    if (!providerId && order.metadata?.provider_id) {
      providerId = order.metadata.provider_id;
    }

    if (!providerId) {
      return NextResponse.json({ 
        error: 'Informações do provedor não encontradas',
        success: false
      });
    }

    // Buscar detalhes do provedor
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return NextResponse.json({ 
        error: 'Provedor não encontrado',
        success: false
      });
    }

    // Preparar os parâmetros da requisição
    const params = new URLSearchParams();
    params.append('key', provider.api_key);
    params.append('action', 'status');
    params.append('order', order.external_order_id);

    // Buscar status do pedido na API do provedor
    const response = await axios.post(provider.api_url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Processar resposta
    if (response.data) {
      // Atualizar o status no banco de dados
      const providerStatus = response.data;
      
      // Mapear o status do provedor para o status do sistema
      let systemStatus = order.status;
      
      if (providerStatus.status === 'Completed') {
        systemStatus = 'completed';
      } else if (providerStatus.status === 'In progress' || providerStatus.status === 'Processing') {
        systemStatus = 'processing';
      } else if (providerStatus.status === 'Partial') {
        systemStatus = 'partial';
      } else if (providerStatus.status === 'Canceled' || providerStatus.status === 'Cancelled') {
        systemStatus = 'canceled';
      } else if (providerStatus.status === 'Pending') {
        systemStatus = 'pending';
      } else if (providerStatus.status === 'Failed' || providerStatus.status.includes('Error')) {
        systemStatus = 'error_provider_' + providerStatus.status.toLowerCase().replace(' ', '_');
      }

      // Atualizar o pedido com o novo status
      await supabase
        .from('orders')
        .update({
          status: systemStatus,
          metadata: {
            ...order.metadata,
            provider_status: {
              ...providerStatus,
              updated_at: new Date().toISOString()
            }
          }
        })
        .eq('id', order_id);

      // Registrar a verificação de status no histórico
      await supabase
        .from('order_logs')
        .insert({
          order_id: order_id,
          action: 'check_status',
          details: {
            previous_status: order.status,
            new_status: systemStatus,
            provider_response: providerStatus,
            checked_by: session.user.id
          }
        });

      return NextResponse.json({ 
        success: true, 
        status: systemStatus,
        provider_status: providerStatus 
      });
    } else {
      return NextResponse.json({ 
        error: 'Resposta inválida do provedor',
        success: false
      });
    }
  } catch (error: unknown) {
    console.error('Erro ao verificar status do pedido:', error);
    
    let errorMessage = 'Erro ao verificar status do pedido';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Erro do provedor: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage = 'Não foi possível se conectar ao provedor. Verifique a conexão.';
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
} 