import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkOrderStatus, normalizeProviderStatus } from '@/services/providerRouter';

// Função para traduzir o status do pedido para português
function translateOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'processing': 'Processando',
    'in progress': 'Processando',
    'completed': 'Concluído',
    'success': 'Concluído',
    'failed': 'Falhou',
    'rejected': 'Falhou',
    'canceled': 'Cancelado',
    'partial': 'Parcial'
  };

  // Converter para minúsculas para garantir a correspondência
  const normalizedStatus = status?.toLowerCase();
  return statusMap[normalizedStatus] || status;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body;
    
    if (!order_id) {
      console.error('[CheckOrderStatusPublic] ID do pedido não fornecido');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('[CheckOrderStatusPublic] Verificando status do pedido:', order_id);
    
    const supabase = createClient();

    // Buscar o pedido diretamente pelo ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        service:service_id (
          *,
          provider:provider_id (*)
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('[CheckOrderStatusPublic] Pedido não encontrado:', orderError);
      return NextResponse.json(
        { error: 'Order not found', details: orderError?.message },
        { status: 404 }
      );
    }

    // Processar o status do pedido
    return await processOrderStatus(supabase, order);
  } catch (error: any) {
    console.error('[CheckOrderStatusPublic] Erro geral:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para processar o status do pedido
async function processOrderStatus(supabase: any, order: any) {
  try {
    // Verificar o status no provedor usando o providerRouter
    let providerResponse;
    
    // Verificar se o pedido tem um provedor associado (em qualquer um dos campos possíveis)
    if (!order.service?.provider && !order.metadata?.provider && !order.metadata?.provider_id && !order.metadata?.provider_name) {
      throw new Error('Pedido não tem provedor associado');
    }
    
    if (order.service?.provider) {
      // Usar o provedor associado ao serviço do pedido
      providerResponse = await checkOrderStatus(
        order.service.provider.id,
        order.external_order_id,
        order.service.provider.api_url,
        order.service.provider.api_key
      );
    } else if (order.metadata?.provider) {
      // Usar o provedor dos metadados
      const { data: metadataProvider, error: metadataProviderError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', order.metadata.provider.id)
        .single();
        
      if (metadataProviderError) {
        throw new Error('Provedor dos metadados não encontrado');
      }
      
      providerResponse = await checkOrderStatus(
        metadataProvider.id,
        order.external_order_id,
        metadataProvider.api_url,
        metadataProvider.api_key
      );
    } else if (order.metadata?.provider_id) {
      // Usar o provider_id dos metadados
      const { data: metadataProvider, error: metadataProviderError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', order.metadata.provider_id)
        .single();
        
      if (metadataProviderError) {
        throw new Error('Provedor dos metadados (provider_id) não encontrado');
      }
      
      providerResponse = await checkOrderStatus(
        metadataProvider.id,
        order.external_order_id,
        metadataProvider.api_url,
        metadataProvider.api_key
      );
    } else if (order.metadata?.provider_name) {
      // Buscar o provedor pelo nome nos metadados
      const { data: namedProvider, error: namedProviderError } = await supabase
        .from('providers')
        .select('*')
        .eq('name', order.metadata.provider_name)
        .single();
        
      if (namedProviderError) {
        throw new Error(`Provedor ${order.metadata.provider_name} não encontrado`);
      }
      
      providerResponse = await checkOrderStatus(
        namedProvider.id,
        order.external_order_id,
        namedProvider.api_url,
        namedProvider.api_key
      );
    } else {
      // Fallback para o provedor Fama nas Redes
      const { data: famaProvider, error: famaError } = await supabase
        .from('providers')
        .select('*')
        .eq('name', 'Fama nas Redes')
        .single();
        
      if (famaError) {
        throw new Error('Provedor padrão não encontrado');
      }
      
      providerResponse = await checkOrderStatus(
        famaProvider.id,
        order.external_order_id,
        famaProvider.api_url,
        famaProvider.api_key
      );
    }
    
    console.log('[CheckOrderStatusPublic] Status do provedor:', providerResponse);

    // Normalizar o status do provedor
    const normalizedStatus = providerResponse.normalized_status || normalizeProviderStatus(providerResponse);

    // Atualizar o status no banco de dados
    const providerStatus = {
      status: providerResponse.status,
      start_count: providerResponse.start_count,
      remains: providerResponse.remains,
      updated_at: new Date().toISOString(),
      charge: providerResponse.charge,
      currency: providerResponse.currency
    };

    const newMetadata = {
      ...order.metadata,
      provider_status: providerStatus
    };

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: normalizedStatus,
        metadata: newMetadata
      })
      .eq('id', order.id)
      .select(`
        *,
        service:service_id (*),
        provider:provider_id (*)
      `)
      .single();

    if (updateError) {
      console.error('[CheckOrderStatusPublic] Erro ao atualizar pedido:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status', details: updateError.message },
        { status: 500 }
      );
    }

    // Adicionar o status traduzido para o frontend
    const translatedStatus = translateOrderStatus(normalizedStatus);
    const responseData = {
      ...updatedOrder,
      translated_status: translatedStatus
    };

    return NextResponse.json({
      status: 'success',
      data: responseData
    });
  } catch (error: unknown) {
    console.error('[CheckOrderStatusPublic] Erro ao verificar status no provedor:', error);
    
    // Atualizar o metadata com o erro
    const newMetadata = {
      ...order.metadata,
      provider_status: {
        ...order.metadata.provider_status,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        updated_at: new Date().toISOString()
      }
    };

    await supabase
      .from('orders')
      .update({
        metadata: newMetadata
      })
      .eq('id', order.id);
      
    return NextResponse.json(
      { 
        error: 'Failed to check order status',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
