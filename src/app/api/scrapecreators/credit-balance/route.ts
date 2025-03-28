import { NextResponse } from 'next/server';
import axios from 'axios';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Verificar se o usuário está autenticado e é admin
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profileData?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Obter a chave da API do .env
    const apiKey = process.env.SCRAPECREATORS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'SCRAPECREATORS_API_KEY não configurada' }, 
        { status: 500 }
      );
    }

    // Fazer a requisição para a API do ScrapCreators
    const { data } = await axios.get(
      'https://api.scrapecreators.com/v1/credit-balance',
      {
        headers: {
          'x-api-key': apiKey
        }
      }
    );

    // Retornar o saldo
    return NextResponse.json({
      creditCount: data.creditCount,
      success: true
    });
  } catch (error: unknown) {
    console.error('Erro ao verificar saldo da ScrapCreators:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false
    }, { status: 500 });
  }
} 