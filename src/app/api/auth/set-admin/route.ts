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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar se o usuário está autenticado
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Atualizar os metadados do usuário com role admin
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { role: 'admin' } }
    );

    if (error) {
      console.error('Erro ao definir role admin:', error);
      return NextResponse.json(
        { error: 'Erro ao definir permissões: ' + error.message },
        { status: 500 }
      );
    }

    // Também atualizar a role na tabela users
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar role na tabela users:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar permissões: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao definir admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
