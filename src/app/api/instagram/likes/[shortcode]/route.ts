import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface InstagramLikeUser {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  is_verified: boolean;
  followed_by_viewer?: boolean;
  follows_viewer?: boolean;
}

export async function GET(
  request: NextRequest,
  context: { params: { shortcode: string } }
) {
  try {
    // Extrair o shortcode diretamente dos parâmetros
    const params = await context.params;
    const shortcode = params.shortcode;
    
    const count = request.nextUrl.searchParams.get('count') || '24';
    const max_id = request.nextUrl.searchParams.get('max_id') || null;

    console.log('Buscando curtidas com RocketAPI...');
    const likesData = await fetchLikesWithRocketAPI(shortcode, parseInt(count), max_id);
    return NextResponse.json(likesData);
  } catch (error) {
    console.error('Erro ao buscar curtidas com RocketAPI:', error);
    
    // Verificar se é um erro de rate limit (429)
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar curtidas do Instagram' },
      { status: 500 }
    );
  }
}

async function fetchLikesWithRocketAPI(shortcode: string, count: number, max_id: string | null) {
  try {
    const options = {
      method: 'POST',
      url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/media/get_likes',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
        'X-RapidAPI-Host': 'rocketapi-for-developers.p.rapidapi.com'
      },
      data: {
        shortcode: shortcode,
        max_id: max_id || undefined
      }
    };
    
    console.log('Fazendo requisição para RocketAPI (likes):', options.url);
    
    const response = await axios.request(options);
    
    if (!response.data || response.data.error) {
      throw new Error(`Erro na resposta da RocketAPI: ${response.data?.error || 'Resposta vazia'}`);
    }
    
    // Processar a resposta da RocketAPI
    const responseData = response.data.response?.body?.data;
    
    if (!responseData) {
      throw new Error('Formato de resposta inválido da RocketAPI');
    }
    
    const users = responseData.users || [];
    const nextMaxId = responseData.next_max_id || null;
    
    // Mapear para o formato esperado
    const formattedUsers = users.map((user: any) => ({
      pk: user.pk || user.id || '',
      username: user.username || '',
      full_name: user.full_name || '',
      is_private: user.is_private || false,
      profile_pic_url: user.profile_pic_url || '',
      is_verified: user.is_verified || false
    }));
    
    return {
      users: formattedUsers,
      next_max_id: nextMaxId,
      status: 'success'
    };
  } catch (error) {
    console.error('Erro na RocketAPI para curtidas:', error);
    throw error;
  }
}
