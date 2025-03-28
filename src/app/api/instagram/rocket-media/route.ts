import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ROCKET_API_KEY = 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8';
const ROCKET_API_HOST = 'rocketapi-for-developers.p.rapidapi.com';

// Interface para os dados de mídia da RocketAPI
interface RocketMediaItem {
  id: string;
  pk?: string | number;
  code?: string;
  media_type?: number;
  caption?: { text: string } | null;
  like_count?: number;
  comment_count?: number;
  taken_at?: number;
  view_count?: number;
  play_count?: number;
  image_versions2?: {
    candidates?: Array<{ url: string; width?: number; height?: number }>;
  };
  video_versions?: Array<{ url: string; width?: number; height?: number }>;
  carousel_media?: Array<{
    image_versions2?: {
      candidates?: Array<{ url: string; width?: number; height?: number }>;
    };
    video_versions?: Array<{ url: string; width?: number; height?: number }>;
  }>;
  carousel_media_count?: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const count = searchParams.get('count') || '12';
    
    if (!username) {
      return NextResponse.json(
        { message: 'Nome de usuário é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`Buscando mídia do Instagram com RocketAPI para: ${username}`);

    // Passo 1: Obter o ID do usuário primeiro
    const userResponse = await axios.request({
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
      timeout: 10000 // 10 segundos timeout
    });

    if (!userResponse.data || !userResponse.data.response || !userResponse.data.response.body || !userResponse.data.response.body.data || !userResponse.data.response.body.data.user) {
      throw new Error('Dados do usuário não encontrados na RocketAPI');
    }

    const userData = userResponse.data.response.body.data.user;
    const userId = parseInt(userData.id, 10);
    console.log(`ID do usuário ${username}: ${userId}`);

    // Passo 2: Obter a mídia do usuário
    try {
      const mediaResponse = await axios.request({
        method: 'POST',
        url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_media',
        headers: {
          'x-rapidapi-key': ROCKET_API_KEY,
          'x-rapidapi-host': ROCKET_API_HOST,
          'Content-Type': 'application/json'
        },
        data: {
          id: userId,
          count: parseInt(count),
          max_id: null
        },
        timeout: 15000 // 15s timeout
      });

      // Extrair todos os dados da resposta para debug
      const mediaData = mediaResponse.data;
      console.log(`Tipo de resposta da RocketAPI: ${typeof mediaData}`);
      console.log(`Conteúdo da resposta: ${JSON.stringify(mediaData, null, 2).substring(0, 500)}...`);
      
      // Verificar a estrutura da resposta correta
      if (!mediaData || !mediaData.response || !mediaData.response.body || !mediaData.response.body.items) {
        console.error('Resposta inválida da RocketAPI (get_media):', JSON.stringify(mediaData).substring(0, 500));
        return NextResponse.json(
          { 
            message: 'Formato de resposta inválido da RocketAPI',
            debug: {
              userId: userId,
              responsePreview: JSON.stringify(mediaData).substring(0, 500)
            }
          },
          { status: 500 }
        );
      }

      // Extrair itens de mídia da resposta corretamente
      const items = mediaData.response.body.items;
      console.log(`Total de itens recuperados: ${items.length}`);
      
      // Processar os itens de mídia para um formato padronizado
      const formattedMedia = items.map((item: RocketMediaItem) => {
        let mediaUrl = '';
        let mediaType = 'image';
        let thumbnailUrl = '';
        
        // Determinar URL da mídia e tipo
        if (item.media_type === 1) { // Foto
          mediaUrl = item.image_versions2?.candidates?.[0]?.url || '';
          thumbnailUrl = mediaUrl;
          mediaType = 'image';
        } else if (item.media_type === 2) { // Vídeo/Reel
          mediaUrl = item.video_versions?.[0]?.url || '';
          thumbnailUrl = item.image_versions2?.candidates?.[0]?.url || '';
          mediaType = 'video';
        } else if (item.media_type === 8) { // Carrossel
          const firstItem = item.carousel_media?.[0];
          mediaUrl = firstItem?.image_versions2?.candidates?.[0]?.url || '';
          thumbnailUrl = mediaUrl;
          mediaType = 'carousel';
        }
        
        const caption = item.caption?.text || '';
        
        return {
          id: item.id || `rocket_${item.pk}`,
          code: item.code || '',
          type: mediaType,
          caption: caption,
          likes: item.like_count || 0,
          comments: item.comment_count || 0,
          mediaUrl: mediaUrl,
          thumbnailUrl: thumbnailUrl,
          timestamp: item.taken_at ? item.taken_at * 1000 : Date.now(),
          views: item.view_count || item.play_count || 0,
          originalData: {
            media_type: item.media_type,
            taken_at: item.taken_at,
            carousel_media_count: item.carousel_media_count
          }
        };
      });

      // Retornar os resultados processados
      return NextResponse.json({
        items: formattedMedia,
        user: {
          username,
          id: userId
        },
        count: formattedMedia.length,
        source: 'rocketapi'
      });
    } catch (mediaError) {
      console.error('Erro específico ao buscar mídia do usuário:', mediaError);
      
      const errorMessage = mediaError instanceof Error ? mediaError.message : 'Erro desconhecido';
      const errorResponse = mediaError instanceof axios.AxiosError ? mediaError.response?.data : null;
      
      return NextResponse.json(
        { 
          message: 'Erro ao buscar mídia do usuário', 
          error: errorMessage,
          debug: {
            userId: userId,
            errorResponse: errorResponse ? JSON.stringify(errorResponse).substring(0, 500) : null
          }
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erro geral ao buscar mídia com RocketAPI:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorResponse = error instanceof axios.AxiosError ? error.response?.data : null;
    
    return NextResponse.json(
      { 
        message: 'Erro ao buscar mídia com RocketAPI', 
        error: errorMessage,
        debug: {
          errorResponse: errorResponse ? JSON.stringify(errorResponse).substring(0, 500) : null
        }
      },
      { status: 500 }
    );
  }
} 