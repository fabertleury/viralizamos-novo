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
      url: 'https://instagram230.p.rapidapi.com/user/details',
      params: { username },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
        'x-rapidapi-host': 'instagram230.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const data = response.data;

    // Formatar a resposta para o formato padrão usado pela aplicação
    const formattedResponse = {
      username: data.username,
      full_name: data.user_full_name,
      profile_pic_url: data.profile_pic_url,
      is_private: data.is_private,
      is_verified: data.is_verified,
      biography: data.biography,
      external_url: data.external_url,
      edge_followed_by: {
        count: data.number_of_followers
      },
      edge_follow: {
        count: data.number_of_following
      },
      edge_owner_to_timeline_media: {
        count: data.number_of_posts
      },
      is_business_account: data.is_professional_account,
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
    console.error('Erro ao buscar dados do Instagram230:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: `Erro na API Instagram230: ${error.response.status} - ${error.response.statusText}` },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar dados do Instagram230' },
      { status: 500 }
    );
  }
}
