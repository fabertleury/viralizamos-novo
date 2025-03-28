import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import axios from 'axios';

// Definir interfaces para melhorar a tipagem
interface InstagramPost {
  id: string;
  code: string;
  shortcode?: string;
  media_type: number;
  is_video: boolean;
  is_carousel?: boolean;
  is_reel?: boolean;
  like_count: number;
  comment_count: number;
  views_count?: number;
  view_count?: number;
  caption: string | { text: string };
  image_versions2?: {
    candidates: Array<{ url: string, width?: number, height?: number }>
  };
  carousel_media?: any[];
  taken_at?: number;
}

interface ProcessedPost {
  id: string;
  code: string;
  type: string;
  is_video: boolean;
  is_carousel: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  caption: string;
  media_url: string;
  thumbnail_url?: string;
  timestamp: string | number;
  carousel_media?: Array<{
    id: string;
    media_type: number;
    media_url: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: { params: { username: string } }
) {
  const supabase = createClient();

  try {
    // Extrair o username diretamente dos parâmetros
    const params = await context.params;
    const username = params.username;
    
    // Verificar se queremos apenas reels
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const onlyReels = type === 'reels';
    
    console.log(`Buscando ${onlyReels ? 'reels' : 'posts'} para o usuário: ${username} usando exclusivamente RocketAPI`);
    
    try {
      // Buscar posts/reels com a RocketAPI
      const mediaData = await fetchWithRocketAPI(username, onlyReels);
      
      if (!mediaData || mediaData.length === 0) {
        console.warn(`Nenhum ${onlyReels ? 'reel' : 'post'} encontrado para o usuário`);
        return NextResponse.json({ 
          items: [],
          hasItems: false,
          message: `Nenhum ${onlyReels ? 'reel' : 'post'} encontrado para este perfil`,
          status: 'success'
        }, { status: 200 });
      }
      
      return NextResponse.json({
        items: mediaData,
        hasItems: true,
        status: 'success'
      });
    } catch (fetchError) {
      console.error(`Erro ao buscar ${onlyReels ? 'reels' : 'posts'} com RocketAPI:`, fetchError);
      
      // Capturar detalhes do erro para debug
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Erro desconhecido';
      const errorResponse = fetchError instanceof axios.AxiosError ? fetchError.response?.data : null;
      
      // Retornar resposta com detalhes de erro em vez de propagar para o handler global
      return NextResponse.json({
        items: [],
        hasItems: false,
        error: `Falha ao buscar ${onlyReels ? 'reels' : 'posts'}: ${errorMessage}`,
        debug: {
          errorDetails: errorMessage,
          responseData: errorResponse ? JSON.stringify(errorResponse).substring(0, 500) : null
        },
        status: 'error'
      }, { status: 200 }); // Usar 200 para que o cliente receba a resposta com os detalhes de erro
    }
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    
    // Detalhes do erro para debug
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar posts do Instagram',
        message: errorMessage,
        debug: {
          stack: error instanceof Error ? error.stack : null
        }
      },
      { status: 500 }
    );
  }
}

// Cache para armazenar resultados de consultas recentes
const mediaCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos em milissegundos

async function fetchWithRocketAPI(username: string, onlyReels: boolean = false) {
  try {
    // Verificar se temos dados em cache para este usuário
    const cacheKey = `${username}_${onlyReels ? 'reels' : 'posts'}_rocket`;
    const cachedData = mediaCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando dados em cache para ${username} (${onlyReels ? 'reels' : 'posts'})`);
      return cachedData.data;
    }
    
    console.log(`Buscando dados do usuário ${username} com RocketAPI`);
    
    // Primeiro, obter o ID do usuário com a RocketAPI
    const ROCKET_API_KEY = process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8';
    const ROCKET_API_HOST = 'rocketapi-for-developers.p.rapidapi.com';
    
    const userResponse = await axios.request({
      method: 'POST',
      url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_by_username',
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
    
    if (!userResponse.data || !userResponse.data.body || !userResponse.data.body.pk) {
      throw new Error('ID do usuário não encontrado na RocketAPI');
    }
    
    const userId = userResponse.data.body.pk;
    console.log(`ID do usuário ${username} na RocketAPI: ${userId}`);
    
    // Agora, buscar posts/reels com a RocketAPI
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
        count: 12, // Número de itens a serem retornados
        max_id: null
      },
      timeout: 10000 // 10 segundos timeout
    });
    
    if (!mediaResponse.data || !mediaResponse.data.body || !mediaResponse.data.body.items) {
      throw new Error('Dados de mídia não encontrados na RocketAPI');
    }
    
    const items = mediaResponse.data.body.items;
    console.log(`RocketAPI retornou ${items.length} itens de mídia`);
    
    // Filtrar os itens com base no tipo (reels ou posts)
    const filteredItems = items.filter((item: InstagramPost) => {
      const isReel = item.media_type === 2; // Vídeos/Reels
      const isPost = item.media_type === 1 || item.media_type === 8; // Fotos ou Carrosséis
      
      return onlyReels ? isReel : isPost;
    });
    
    console.log(`Itens filtrados (${onlyReels ? 'reels' : 'posts'}): ${filteredItems.length}`);
    
    // Processar os itens para o formato esperado
    const processedItems = filteredItems.map((item: InstagramPost) => {
      let mediaUrl = '';
      let thumbnailUrl = '';
      let type = 'image';
      
      // Determinar URL da mídia e tipo
      if (item.media_type === 1) { // Foto
        mediaUrl = item.image_versions2?.candidates?.[0]?.url || '';
        type = 'image';
      } else if (item.media_type === 2) { // Vídeo/Reel
        mediaUrl = item.image_versions2?.candidates?.[0]?.url || ''; // Thumbnail
        thumbnailUrl = mediaUrl;
        type = 'video';
      } else if (item.media_type === 8) { // Carrossel
        mediaUrl = item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url || '';
        type = 'carousel';
      }
      
      // Processar o caption
      const caption = item.caption?.text || '';
      
      return {
        id: item.id,
        code: item.code || '',
        type: type,
        is_video: type === 'video',
        is_carousel: type === 'carousel',
        likes_count: item.like_count || 0,
        comments_count: item.comment_count || 0,
        views_count: item.view_count || 0,
        caption: caption,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl || mediaUrl,
        timestamp: item.taken_at ? item.taken_at * 1000 : Date.now() // Converter timestamp para milissegundos
      };
    });
    
    // Armazenar no cache
    mediaCache.set(cacheKey, {
      data: processedItems,
      timestamp: Date.now()
    });
    
    return processedItems;
  } catch (error) {
    console.error(`Erro na RocketAPI para ${onlyReels ? 'reels' : 'posts'}:`, error);
    
    // Detalhes mais específicos do erro
    if (error instanceof axios.AxiosError) {
      console.error('Detalhes do erro Axios:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data ? JSON.stringify(error.response.data).substring(0, 500) : null
      });
    }
    
    throw error;
  }
}

// Função para processar os posts da ScapeCreators API
function processScapeCreatorsPost(post: any, isReel: boolean) {
  try {
    // Implementação para processar post
    return {
      id: post.id || '',
      code: post.code || post.shortcode || '',
      type: isReel ? 'video' : (post.carousel_media_count && post.carousel_media_count > 0 ? 'carousel' : 'image'),
      is_video: isReel || post.is_video,
      is_carousel: !!(post.carousel_media_count && post.carousel_media_count > 0),
      likes_count: post.like_count || 0,
      comments_count: post.comment_count || 0,
      views_count: post.views_count || post.view_count || 0,
      caption: typeof post.caption === 'object' ? post.caption.text : (post.caption || ''),
      media_url: post.image_url || (post.image_versions?.items?.[0]?.url || ''),
      thumbnail_url: post.display_url || post.thumbnail_src || '',
      timestamp: post.taken_at ? post.taken_at * 1000 : Date.now(),
    };
  } catch (error) {
    console.error('Erro ao processar post:', error);
    return null;
  }
}
