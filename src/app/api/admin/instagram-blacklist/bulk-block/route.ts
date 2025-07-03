import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { blockProfile } from '@/lib/core/instagram-blacklist';

// Configurar conexão com o PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:zacEqGceWerpWpBZZqttjamDOCcdhRbO@shinkansen.proxy.rlwy.net:29036/railway'
});

// Verificar se o usuário é administrador
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    
    // Verificar o token no banco de dados
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar permissão de administrador:', error);
    return false;
  }
}

// POST - Adicionar vários perfis à lista de bloqueio
export async function POST(request: NextRequest) {
  // Verificar se o usuário é administrador
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { usernames, reason, blocked_until } = body;

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return NextResponse.json({ error: 'Lista de usuários é obrigatória' }, { status: 400 });
    }

    // Normalizar os nomes de usuário
    const normalizedUsernames = usernames.map(username => 
      typeof username === 'string' ? username.replace('@', '').toLowerCase() : ''
    ).filter(username => username !== '');

    if (normalizedUsernames.length === 0) {
      return NextResponse.json({ error: 'Nenhum nome de usuário válido fornecido' }, { status: 400 });
    }

    // Bloquear cada perfil usando a função do core
    const results = await Promise.all(
      normalizedUsernames.map(username => 
        blockProfile({
          username,
          reason: reason || 'Bloqueado em massa',
          blocked_until: blocked_until || null
        })
      )
    );

    // Verificar se houve erros
    const errors = results.filter(result => !result.success);
    if (errors.length > 0) {
      console.error('Erros ao bloquear alguns perfis:', errors);
    }

    return NextResponse.json({ 
      success: true, 
      message: `${normalizedUsernames.length} perfis bloqueados com sucesso`,
      blocked_usernames: normalizedUsernames,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Erro ao bloquear perfis em massa:', error);
    return NextResponse.json({ error: 'Erro ao bloquear perfis em massa' }, { status: 500 });
  }
}
