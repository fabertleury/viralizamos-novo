import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { message: 'Nome de usuário é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`Verificando perfil com RocketAPI: ${username}`);

    // Fazer requisição para a RocketAPI
    const ROCKET_API_KEY = process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8';
    const ROCKET_API_HOST = 'rocketapi-for-developers.p.rapidapi.com';

    const response = await axios.request({
      method: 'POST',
      url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_info',
      headers: {
        'x-rapidapi-key': ROCKET_API_KEY,
        'x-rapidapi-host': ROCKET_API_HOST,
        'Content-Type': 'application/json'
      },
      data: {
        username: username
      },
      timeout: 15000 // 15 segundos timeout
    });

    // Extrair os dados do perfil da resposta
    if (!response.data || !response.data.response || !response.data.response.body || 
        !response.data.response.body.data || !response.data.response.body.data.user) {
      throw new Error('Dados do usuário não encontrados na RocketAPI');
    }

    const user = response.data.response.body.data.user;

    // Retornar os dados formatados
    return NextResponse.json({
      id: user.id,
      pk: user.id,
      username: user.username,
      full_name: user.full_name,
      biography: user.biography || '',
      follower_count: user.edge_followed_by?.count || 0,
      following_count: user.edge_follow?.count || 0,
      media_count: user.edge_owner_to_timeline_media?.count || 0,
      is_private: user.is_private === true,
      is_verified: user.is_verified === true,
      profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url,
      status: "success"
    });
  } catch (error: unknown) {
    console.error('Erro ao verificar perfil com RocketAPI:', error);
    
    return NextResponse.json(
      { 
        message: 'Erro ao verificar perfil com RocketAPI', 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
