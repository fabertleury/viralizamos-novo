import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 });
  }

  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-statistics-api.p.rapidapi.com/community',
      params: {
        url: `https://www.instagram.com/${username}/`
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
        'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!data || !data.data) {
      return NextResponse.json({ error: 'Dados não encontrados' }, { status: 404 });
    }

    // Formatar a resposta para o formato padrão usado pela aplicação
    const formattedResponse = {
      username: data.data.screenName,
      full_name: data.data.name,
      profile_pic_url: data.data.image,
      is_private: false, // Esta API não fornece informação sobre perfil privado
      is_verified: data.data.verified || false,
      biography: data.data.description || '',
      external_url: null,
      edge_followed_by: {
        count: data.data.usersCount
      },
      edge_follow: {
        count: 0 // Esta API não fornece contagem de seguindo
      },
      edge_owner_to_timeline_media: {
        count: 0 // Esta API não fornece contagem de posts
      },
      is_business_account: false,
      business_category_name: null,
      category_name: null,
      is_joined_recently: false,
      overall_category_name: null,
      profile_context_links_with_user_ids: null,
      has_guides: false,
      has_channel: false
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Erro ao buscar dados do Instagram Statistics API:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: `Erro na API Instagram Statistics: ${error.response.status} - ${error.response.statusText}` },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar dados do Instagram Statistics API' },
      { status: 500 }
    );
  }
}
