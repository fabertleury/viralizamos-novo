import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar provedor
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('slug', params.provider)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Aqui você faria a chamada real para a API do provedor
    // Por enquanto vamos retornar dados simulados
    const mockServices = [
      {
        id: '1',
        name: 'Instagram Followers',
        description: 'High quality Instagram followers',
        min_order: 100,
        max_order: 10000,
        price: 10.00,
        category: 'Instagram',
      },
      {
        id: '2',
        name: 'Instagram Likes',
        description: 'Real Instagram likes',
        min_order: 50,
        max_order: 5000,
        price: 5.00,
        category: 'Instagram',
      },
      {
        id: '3',
        name: 'TikTok Views',
        description: 'High retention TikTok views',
        min_order: 1000,
        max_order: 100000,
        price: 2.00,
        category: 'TikTok',
      },
      {
        id: '4',
        name: 'TikTok Followers',
        description: 'Real TikTok followers',
        min_order: 100,
        max_order: 10000,
        price: 8.00,
        category: 'TikTok',
      },
      {
        id: '5',
        name: 'YouTube Views',
        description: 'High retention YouTube views',
        min_order: 1000,
        max_order: 50000,
        price: 15.00,
        category: 'YouTube',
      },
    ];

    return NextResponse.json({
      services: mockServices
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
