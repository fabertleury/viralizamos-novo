import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Fazer logout
    await supabase.auth.signOut();

    // Limpar todos os cookies
    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
      cookieStore.delete(cookie.name);
    });

    return new Response(null, {
      status: 200,
      headers: {
        // Limpar cache do navegador
        'Clear-Site-Data': '"cache", "cookies", "storage"',
        // Não cachear esta resposta
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar dados' },
      { status: 500 }
    );
  }
}
