import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Verificar se já existe algum usuário admin
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Um administrador já existe no sistema' },
        { status: 400 }
      );
    }

    // Criar usuário no Auth
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: auth, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) throw authError;

    // Atualizar role para admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', auth.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Administrador criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
