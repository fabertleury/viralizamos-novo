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
    const { order_id } = await request.json();
    
    if (!order_id) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Buscar detalhes do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    
    // Atualizar o pedido como resolvido
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'pending', // Marca como pendente para tratamento normal
        needs_admin_attention: false,
        metadata: {
          ...order.metadata,
          manual_resolution: {
            resolved_at: new Date().toISOString(),
            resolved_by: session.user.email,
            original_status: order.status,
            original_error: order.metadata?.provider_error || order.metadata?.error_message
          },
          provider_error: null, // Limpar erro
          error_message: null, // Limpar mensagem de erro
          admin_notes: `Marcado como resolvido por ${session.user.email} em ${new Date().toLocaleString()}`
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
        action: 'resolve_order',
        entity_type: 'order',
        entity_id: order_id,
        description: `Pedido marcado como resolvido`,
        metadata: {
          previous_status: order.status,
          new_status: 'pending',
          original_error: order.metadata?.provider_error || order.metadata?.error_message
        }
      });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pedido marcado como resolvido com sucesso',
      order_id: order_id
    });
    
  } catch (error: any) {
    console.error('Erro ao processar resolução manual:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { status: 500 });
  }
} 