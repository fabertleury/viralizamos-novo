import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export async function POST() {
  try {
    console.log('Iniciando setup do admin...');

    // Verificar se já existe um admin
    const { data: existingAdmin } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Já existe um usuário admin' },
        { status: 400 }
      );
    }

    console.log('Criando usuário admin...');
    // Criar usuário admin
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@viralizai.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    });

    if (adminError) {
      console.error('Erro ao criar usuário:', adminError);
      throw adminError;
    }

    console.log('Usuário criado:', adminUser.user.id);

    // Inserir usuário na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: adminUser.user.id,
        email: adminUser.user.email,
        name: 'Admin',
        role: 'admin'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Se der erro ao criar perfil, deletar o usuário
      await supabaseAdmin.auth.admin.deleteUser(adminUser.user.id);
      throw profileError;
    }

    console.log('Perfil criado:', profile);

    return NextResponse.json({ 
      message: 'Setup concluído com sucesso!',
      user: {
        email: 'admin@viralizai.com',
        password: 'admin123'
      }
    });
  } catch (error: any) {
    console.error('Erro durante o setup:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
