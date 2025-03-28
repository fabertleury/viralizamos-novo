import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Request } from 'next/server';

const supabaseAdmin = createClient();

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Verificar se o usuário está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      throw error;
    }

    // Buscar todos os usuários usando o service role key
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // Combinar os dados
    const usersList = users.map(user => {
      const authUser = authUsers.users.find(u => u.id === user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: !authUser?.banned_until,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Verificar se o usuário está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Criar o usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: {
        name: body.name,
        role: body.role
      }
    });

    if (authError) throw authError;

    // Inserir os dados adicionais na tabela de usuários
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: body.email,
          name: body.name,
          role: body.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
