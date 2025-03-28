import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.code || !body.order_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }
    
    // Obter informações do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        service_id,
        amount,
        status
      `)
      .eq('id', body.order_id)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    
    // Verificar se o pedido já foi pago
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Pedido já foi processado' }, { status: 400 });
    }
    
    // Verificar se o cupom é válido usando a função SQL
    const { data: result, error: functionError } = await supabase.rpc(
      'is_coupon_valid',
      {
        p_coupon_code: body.code,
        p_customer_id: order.customer_id,
        p_service_id: order.service_id,
        p_purchase_amount: order.amount
      }
    );
    
    if (functionError) {
      throw functionError;
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Cupom inválido para este pedido' }, { status: 400 });
    }
    
    // Aplicar o cupom usando a função SQL
    const { data: discount, error: discountError } = await supabase.rpc(
      'apply_coupon',
      {
        p_coupon_code: body.code,
        p_customer_id: order.customer_id,
        p_service_id: order.service_id,
        p_purchase_amount: order.amount
      }
    );
    
    if (discountError) {
      throw discountError;
    }
    
    if (!discount) {
      return NextResponse.json({ error: 'Erro ao aplicar desconto' }, { status: 500 });
    }
    
    // Atualizar o pedido com o desconto aplicado
    const newAmount = Math.max(0, order.amount - discount);
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        discount_amount: discount,
        final_amount: newAmount,
        coupon_code: body.code
      })
      .eq('id', body.order_id)
      .select()
      .single();
      
    if (updateError) {
      throw updateError;
    }
    
    return NextResponse.json({
      success: true,
      discount_amount: discount,
      final_amount: newAmount,
      message: 'Cupom aplicado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao aplicar cupom:', error);
    return NextResponse.json({ error: 'Erro ao aplicar cupom' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.order_id) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
    }
    
    // Obter informações do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        amount,
        status,
        coupon_code
      `)
      .eq('id', body.order_id)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    
    // Verificar se o pedido já foi pago
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Pedido já foi processado' }, { status: 400 });
    }
    
    // Verificar se o pedido tem um cupom aplicado
    if (!order.coupon_code) {
      return NextResponse.json({ error: 'Pedido não possui cupom aplicado' }, { status: 400 });
    }
    
    // Atualizar o pedido removendo o cupom
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        discount_amount: 0,
        final_amount: order.amount,
        coupon_code: null
      })
      .eq('id', body.order_id)
      .select()
      .single();
      
    if (updateError) {
      throw updateError;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cupom removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
