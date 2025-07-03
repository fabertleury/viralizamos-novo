import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Criar cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Interface para o perfil bloqueado
interface BlockedProfile {
  username: string;
  reason: string;
  blocked_at: string;
  blocked_until?: string | null;
}

// Verificar se o usuário é administrador
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    // Verificar se o usuário tem a role de admin
    const { data, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !data || data.role !== 'admin') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar permissão de administrador:', error);
    return false;
  }
}

// GET - Listar todos os perfis bloqueados
export async function GET(request: NextRequest) {
  // Verificar se o usuário é administrador
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('instagram_blocked_profiles')
      .select('*')
      .order('blocked_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar perfis bloqueados:', error);
      return NextResponse.json({ error: 'Erro ao listar perfis bloqueados' }, { status: 500 });
    }

    return NextResponse.json({ profiles: data || [] });
  } catch (error) {
    console.error('Erro ao listar perfis bloqueados:', error);
    return NextResponse.json({ error: 'Erro ao listar perfis bloqueados' }, { status: 500 });
  }
}

// POST - Adicionar um perfil à lista de bloqueio
export async function POST(request: NextRequest) {
  // Verificar se o usuário é administrador
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, reason, blocked_until } = body;

    if (!username) {
      return NextResponse.json({ error: 'Nome de usuário é obrigatório' }, { status: 400 });
    }

    // Normalizar o nome de usuário
    const normalizedUsername = username.replace('@', '').toLowerCase();

    const { error } = await supabase
      .from('instagram_blocked_profiles')
      .insert({
        username: normalizedUsername,
        reason: reason || 'Bloqueado manualmente',
        blocked_at: new Date().toISOString(),
        blocked_until: blocked_until || null
      });

    if (error) {
      console.error('Erro ao bloquear perfil:', error);
      return NextResponse.json({ error: 'Erro ao bloquear perfil' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Perfil ${normalizedUsername} bloqueado com sucesso` 
    });
  } catch (error) {
    console.error('Erro ao bloquear perfil:', error);
    return NextResponse.json({ error: 'Erro ao bloquear perfil' }, { status: 500 });
  }
}

// DELETE - Remover um perfil da lista de bloqueio
export async function DELETE(request: NextRequest) {
  // Verificar se o usuário é administrador
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Nome de usuário é obrigatório' }, { status: 400 });
    }

    // Normalizar o nome de usuário
    const normalizedUsername = username.replace('@', '').toLowerCase();

    const { error } = await supabase
      .from('instagram_blocked_profiles')
      .delete()
      .eq('username', normalizedUsername);

    if (error) {
      console.error('Erro ao desbloquear perfil:', error);
      return NextResponse.json({ error: 'Erro ao desbloquear perfil' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Perfil ${normalizedUsername} desbloqueado com sucesso` 
    });
  } catch (error) {
    console.error('Erro ao desbloquear perfil:', error);
    return NextResponse.json({ error: 'Erro ao desbloquear perfil' }, { status: 500 });
  }
} 