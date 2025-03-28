import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Criar cliente Supabase com service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`Criando usuário admin: ${email}`);
    
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      console.log(`Usuário ${email} já existe. Atualizando role para admin...`);
      
      // Atualizar role para admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', active: true })
        .eq('email', email);
      
      if (updateError) {
        throw updateError;
      }
      
      return NextResponse.json({
        success: true,
        message: `Usuário ${email} atualizado para admin com sucesso.`
      });
    }
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'admin'
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    console.log(`Usuário criado no auth: ${authData.user.id}`);
    
    // Inserir dados na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'admin',
        active: true
      });
    
    if (profileError) {
      throw profileError;
    }
    
    return NextResponse.json({
      success: true,
      message: `Perfil admin criado com sucesso para: ${email}`
    });
  } catch (error: any) {
    console.error(`Erro ao criar admin:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 