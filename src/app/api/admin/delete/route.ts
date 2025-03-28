import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Deletar o usuário do auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authError) {
      throw authError;
    }

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
