import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar se o usuário está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário existe na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' },
        { status: 500 }
      );
    }

    // Verificar se o usuário tem role de admin
    const isAdmin = userData?.role === 'admin';

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: userData?.name,
        role: userData?.role,
      },
      isAdmin,
    });
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
