import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // Buscar todos os usuários do auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Buscar todos os perfis
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*');
    if (profileError) throw profileError;

    return NextResponse.json({
      authUsers: authUsers.users,
      profiles
    });
  } catch (error: any) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
