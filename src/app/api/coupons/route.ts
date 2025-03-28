import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    // Obter parâmetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const active = searchParams.get('active');
    
    // Construir consulta
    let query = supabase
      .from('coupons')
      .select(`
        *,
        service_restrictions:coupon_service_restrictions(
          service_id,
          service:service_id(name)
        ),
        customer_assignments:coupon_customer_assignments(
          customer_id,
          customer:customer_id(email)
        )
      `);
    
    // Aplicar filtros
    if (code) {
      query = query.eq('code', code);
    }
    
    if (active === 'true') {
      query = query.eq('is_active', true);
    }
    
    // Ordenar por data de criação
    query = query.order('created_at', { ascending: false });
    
    // Executar consulta
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    return NextResponse.json({ error: 'Erro ao buscar cupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.code || !body.discount_type || !body.discount_value || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }
    
    // Criar cupom
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: body.code,
        description: body.description,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_purchase_amount: body.min_purchase_amount || null,
        max_discount_amount: body.max_discount_amount || null,
        start_date: body.start_date,
        end_date: body.end_date,
        usage_limit: body.usage_limit || null,
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Código de cupom já existe' }, { status: 409 });
      }
      throw error;
    }
    
    // Adicionar restrições de serviço, se houver
    if (body.service_ids && body.service_ids.length > 0) {
      const serviceRestrictions = body.service_ids.map((serviceId: string) => ({
        coupon_id: data.id,
        service_id: serviceId
      }));
      
      const { error: restrictionError } = await supabase
        .from('coupon_service_restrictions')
        .insert(serviceRestrictions);
      
      if (restrictionError) {
        throw restrictionError;
      }
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.id || !body.code || !body.discount_type || !body.discount_value || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }
    
    // Atualizar cupom
    const { data, error } = await supabase
      .from('coupons')
      .update({
        code: body.code,
        description: body.description,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_purchase_amount: body.min_purchase_amount || null,
        max_discount_amount: body.max_discount_amount || null,
        start_date: body.start_date,
        end_date: body.end_date,
        usage_limit: body.usage_limit || null,
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Código de cupom já existe' }, { status: 409 });
      }
      throw error;
    }
    
    // Remover restrições de serviço existentes
    const { error: deleteError } = await supabase
      .from('coupon_service_restrictions')
      .delete()
      .eq('coupon_id', body.id);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Adicionar novas restrições de serviço, se houver
    if (body.service_ids && body.service_ids.length > 0) {
      const serviceRestrictions = body.service_ids.map((serviceId: string) => ({
        coupon_id: body.id,
        service_id: serviceId
      }));
      
      const { error: restrictionError } = await supabase
        .from('coupon_service_restrictions')
        .insert(serviceRestrictions);
      
      if (restrictionError) {
        throw restrictionError;
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cupom' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado e é admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    // Obter ID do cupom da URL
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID do cupom não fornecido' }, { status: 400 });
    }
    
    // Excluir cupom
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir cupom:', error);
    return NextResponse.json({ error: 'Erro ao excluir cupom' }, { status: 500 });
  }
}
