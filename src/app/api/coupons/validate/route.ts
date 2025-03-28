import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.code) {
      return NextResponse.json({ error: 'Código do cupom não fornecido' }, { status: 400 });
    }
    
    // Obter informações do usuário
    const { data: { user } } = await supabase.auth.getUser();
    let customerId = null;
    
    if (user) {
      // Buscar o customer_id do usuário autenticado
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!customerError && customer) {
        customerId = customer.id;
      }
    } else if (body.email) {
      // Buscar o customer_id pelo email para usuários não autenticados
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', body.email)
        .single();
        
      if (!customerError && customer) {
        customerId = customer.id;
      }
    }
    
    // Buscar o cupom
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select(`
        *,
        service_restrictions:coupon_service_restrictions(
          service_id
        )
      `)
      .eq('code', body.code)
      .eq('is_active', true)
      .single();
      
    if (couponError || !coupon) {
      return NextResponse.json({ valid: false, message: 'Cupom inválido ou expirado' }, { status: 200 });
    }
    
    // Verificar se o cupom está dentro do período de validade
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);
    
    if (now < startDate || now > endDate) {
      return NextResponse.json({ valid: false, message: 'Cupom fora do período de validade' }, { status: 200 });
    }
    
    // Verificar se o cupom atingiu o limite de uso
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, message: 'Limite de uso do cupom atingido' }, { status: 200 });
    }
    
    // Verificar restrições de serviço
    if (body.service_id && coupon.service_restrictions && coupon.service_restrictions.length > 0) {
      const serviceAllowed = coupon.service_restrictions.some(
        (restriction: any) => restriction.service_id === body.service_id
      );
      
      if (!serviceAllowed) {
        return NextResponse.json({ valid: false, message: 'Cupom não é válido para este serviço' }, { status: 200 });
      }
    }
    
    // Verificar valor mínimo de compra
    if (coupon.min_purchase_amount !== null && body.amount && parseFloat(body.amount) < coupon.min_purchase_amount) {
      return NextResponse.json({ 
        valid: false, 
        message: `Valor mínimo para este cupom é R$ ${coupon.min_purchase_amount.toFixed(2)}` 
      }, { status: 200 });
    }
    
    // Verificar atribuições de cliente
    if (customerId) {
      const { data: customerAssignments, error: assignmentError } = await supabase
        .from('coupon_customer_assignments')
        .select('is_used')
        .eq('coupon_id', coupon.id)
        .eq('customer_id', customerId);
        
      if (!assignmentError && customerAssignments && customerAssignments.length > 0) {
        // O cupom está atribuído a este cliente
        if (customerAssignments[0].is_used) {
          return NextResponse.json({ valid: false, message: 'Você já utilizou este cupom' }, { status: 200 });
        }
      } else {
        // Verificar se o cupom está restrito a clientes específicos
        const { count, error: countError } = await supabase
          .from('coupon_customer_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('coupon_id', coupon.id);
          
        if (!countError && count && count > 0) {
          return NextResponse.json({ valid: false, message: 'Este cupom não está disponível para você' }, { status: 200 });
        }
      }
    } else {
      // Verificar se o cupom está restrito a clientes específicos
      const { count, error: countError } = await supabase
        .from('coupon_customer_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id);
        
      if (!countError && count && count > 0) {
        return NextResponse.json({ valid: false, message: 'Este cupom é exclusivo para clientes registrados' }, { status: 200 });
      }
    }
    
    // Calcular o valor do desconto
    let discountAmount = 0;
    let finalAmount = 0;
    
    if (body.amount) {
      const purchaseAmount = parseFloat(body.amount);
      
      if (coupon.discount_type === 'percentage') {
        discountAmount = purchaseAmount * (coupon.discount_value / 100);
      } else {
        discountAmount = coupon.discount_value;
      }
      
      // Aplicar limite máximo de desconto, se existir
      if (coupon.max_discount_amount !== null && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
      
      // Garantir que o desconto não seja maior que o valor da compra
      if (discountAmount > purchaseAmount) {
        discountAmount = purchaseAmount;
      }
      
      // Calcular o valor final
      finalAmount = purchaseAmount - discountAmount;
    }
    
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      },
      discount_amount: discountAmount,
      final_amount: finalAmount,
      message: 'Cupom válido'
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 });
  }
}
