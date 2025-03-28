import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Função para validar username do Instagram
function validateInstagramUsername(username: string): boolean {
  // Regex atualizada para permitir underscores no final
  const instagramUsernameRegex = /^[a-zA-Z0-9](?!.*\.\.|.*\.$)(?!.*\.{2,})[a-zA-Z0-9._]+_?$/;
  return instagramUsernameRegex.test(username);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  console.log('Recebendo requisição GET para username:', username); // Log de depuração

  if (!username) {
    console.log('Username não fornecido'); // Log de depuração
    return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 });
  }

  // Validar username
  if (!validateInstagramUsername(username)) {
    console.log('Username inválido:', username); // Log de depuração
    return NextResponse.json({ 
      error: 'Username inválido. Use apenas letras, números, pontos e underscores.' 
    }, { status: 400 });
  }

  try {
    console.log('Fazendo requisição para a API do Instagram'); // Log de depuração
    const response = await axios.get(
      'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
      {
        params: {
          username_or_id_or_url: username
        },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        },
        timeout: 5000
      }
    );

    console.log('Resposta da API recebida:', response.data); // Log de depuração

    const userData = response.data.data;

    console.log('Dados do usuário:', userData); // Log de depuração

    if (!userData) {
      console.log('Usuário não encontrado'); // Log de depuração
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const userResponse = {
      username: userData.username,
      isPrivate: userData.is_private,
      fullName: userData.full_name,
      biography: userData.biography || '',
      followerCount: userData.follower_count,
      followingCount: userData.following_count,
      profilePicUrl: userData.profile_pic_url,
      isVerified: userData.is_verified || false,
      externalUrl: userData.external_url || ''
    };

    console.log('Resposta final:', userResponse); // Log de depuração

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Erro completo na API:', error); // Log de depuração detalhada
    
    if (error.response) {
      console.log('Erro com resposta:', error.response.data); // Log de depuração
      return NextResponse.json({ 
        error: 'Erro ao buscar perfil', 
        details: error.response.data 
      }, { status: error.response.status });
    } else if (error.request) {
      console.log('Sem resposta do servidor'); // Log de depuração
      return NextResponse.json({ 
        error: 'Sem resposta do servidor de busca' 
      }, { status: 503 });
    } else {
      console.log('Erro na configuração da requisição'); // Log de depuração
      return NextResponse.json({ 
        error: 'Erro na configuração da busca' 
      }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username } = body;

  if (!username) {
    return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 });
  }

  // Validar username
  if (!validateInstagramUsername(username)) {
    return NextResponse.json({ 
      error: 'Username inválido. Use apenas letras, números, pontos e underscores.' 
    }, { status: 400 });
  }

  try {
    const response = await axios.get(
      'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
      {
        params: {
          username_or_id_or_url: username
        },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        },
        timeout: 5000
      }
    );

    const userData = response.data.data;

    if (!userData) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      username: userData.username,
      isPrivate: userData.is_private,
      fullName: userData.full_name,
      biography: userData.biography || '',
      followerCount: userData.follower_count,
      followingCount: userData.following_count,
      profilePicUrl: userData.profile_pic_url,
      isVerified: userData.is_verified || false,
      externalUrl: userData.external_url || ''
    });
  } catch (error) {
    console.error('Instagram API Error:', error);
    
    if (error.response) {
      return NextResponse.json({ 
        error: 'Erro ao buscar perfil', 
        details: error.response.data 
      }, { status: error.response.status });
    } else if (error.request) {
      return NextResponse.json({ 
        error: 'Sem resposta do servidor de busca' 
      }, { status: 503 });
    } else {
      return NextResponse.json({ 
        error: 'Erro na configuração da busca' 
      }, { status: 500 });
    }
  }
}
