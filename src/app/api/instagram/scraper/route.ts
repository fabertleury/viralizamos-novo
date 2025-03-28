import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`[Server] Verificando perfil: ${username}`);
    
    // Usar a API do Instagram para verificar o perfil
    const response = await axios.get(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`,
      {
        headers: {
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || ''
        }
      }
    );
    
    const data = response.data;
    
    // Verificar se o perfil é privado com base na resposta da API
    const isPrivate = data.data?.user?.is_private === true;
    
    const result = {
      isPublic: !isPrivate,
      username,
      profilePicUrl: data.data?.user?.profile_pic_url || null,
      fullName: data.data?.user?.full_name || null,
      error: null
    };

    console.log(`[Server] Resultado para ${username}:`, result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`[Server] Erro ao verificar perfil ${username}:`, error.message);
    
    // Verificar se o erro é de perfil não encontrado (404)
    if (error.response && error.response.status === 404) {
      return NextResponse.json(
        { 
          isPublic: false,
          username,
          profilePicUrl: null,
          fullName: null,
          error: 'Perfil não encontrado'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        isPublic: false,
        username,
        profilePicUrl: null,
        fullName: null,
        error: `Erro ao verificar perfil: ${error.message}`
      },
      { status: 500 }
    );
  }
}
