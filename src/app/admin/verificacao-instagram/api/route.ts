import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Criando o cliente Supabase com a abordagem correta para Next.js 14
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profileData?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar dados das APIs configuradas
    const { data: apiOrder, error: apiError } = await supabase
      .from('api_order')
      .select('*')
      .order('order', { ascending: true });

    if (apiError) {
      return NextResponse.json({ error: 'Erro ao buscar APIs' }, { status: 500 });
    }

    return NextResponse.json({ 
      apis: apiOrder,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: profileData.role
      }
    });
  } catch (error) {
    console.error('Erro na rota de verificação Instagram:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
