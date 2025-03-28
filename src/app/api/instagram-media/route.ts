import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Função para validar username do Instagram
function validateInstagramUsername(username: string): boolean {
  const instagramUsernameRegex = /^[a-zA-Z0-9](?!.*\.\.|.*\.$)(?!.*\.{2,})[a-zA-Z0-9._]+_?$/;
  return instagramUsernameRegex.test(username);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const count = searchParams.get('count') || '12';

  console.log('Recebendo requisição de mídia para username:', username); // Log de depuração

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
    // Primeiro, busca o perfil do usuário
    const userInfoResponse = await axios.get(
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

    const userData = userInfoResponse.data.data;
    console.log('Dados do usuário:', userData); // Log de depuração

    // Agora busca as mídias do usuário
    const mediaResponse = await axios.get(
      'https://instagram-scraper-api2.p.rapidapi.com/v1/posts',
      { 
        params: {
          username_or_id_or_url: username,
          count: parseInt(count)
        },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        },
        timeout: 8000
      }
    );

    console.log('Resposta da API de mídia:', mediaResponse.data); // Log de depuração

    const mediaData = mediaResponse.data.data;

    // Função para extrair o código correto de um post do Instagram
    const extractPostCode = (post: any): string => {
      // Se o post já tem um código que não é numérico, usar esse código
      if (post.code && !/^\d+$/.test(post.code)) {
        console.log('✅ Usando código existente:', post.code);
        return post.code;
      }
      
      // Se tem shortcode, usar o shortcode
      if (post.shortcode) {
        console.log('✅ Usando shortcode:', post.shortcode);
        return post.shortcode;
      }
      
      // Se tem permalink ou link, extrair o código da URL
      if (post.permalink || post.link) {
        const url = post.permalink || post.link;
        const match = url.match(/instagram\.com\/p\/([^\/]+)/);
        if (match && match[1]) {
          console.log('✅ Código extraído da URL:', match[1]);
          return match[1];
        }
      }
      
      // Se nada funcionar, usar o ID (não ideal, mas é o que temos)
      console.warn('⚠️ Não foi possível extrair um código curto válido, usando ID:', post.id);
      return post.id;
    };

    // Formata os dados das mídias
    const formattedMedia = mediaData.map((media: any) => {
      // Extrair o código correto do post
      const code = extractPostCode(media);
      
      return {
        id: media.id,
        code: code,
        type: media.media_type, // 1: foto, 2: vídeo, 8: carrossel
        url: media.display_url || media.video_url,
        caption: media.caption?.text || '',
        likes: media.like_count,
        comments: media.comment_count,
        timestamp: media.taken_at_timestamp,
        link: `https://instagram.com/p/${code}`
      };
    });

    console.log('Mídias formatadas:', formattedMedia); // Log de depuração

    return NextResponse.json({
      username: username,
      userId: userData.id,
      media: formattedMedia
    });

  } catch (error) {
    console.error('Erro completo na API de mídia:', error); // Log de depuração detalhada
    
    if (error.response) {
      console.log('Erro com resposta:', error.response.data); // Log de depuração
      return NextResponse.json({ 
        error: 'Erro ao buscar mídias do perfil', 
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
