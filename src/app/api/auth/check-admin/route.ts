import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Criar cliente com service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest) {
  console.log('Iniciando verificação de admin');
  
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    console.log('Verificando usuário autenticado');
    // Verificar se o usuário está autenticado
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Erro ao obter usuário:', userError);
      return NextResponse.json(
        { isAdmin: false, error: 'Erro ao obter usuário' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('Usuário não autenticado');
      return NextResponse.json(
        { isAdmin: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log('Usuário autenticado:', user.id);

    // Verificar se o usuário é admin usando o service role key
    console.log('Verificando role do usuário');
    const { data: userData, error: roleError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError) {
      console.error('Erro ao verificar role do usuário:', roleError);
      return NextResponse.json(
        { isAdmin: false, error: 'Erro ao verificar permissões: ' + roleError.message },
        { status: 500 }
      );
    }

    console.log('Role do usuário:', userData?.role);
    const isAdmin = userData?.role === 'admin';

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Erro interno do servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
