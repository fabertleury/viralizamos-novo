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
  image_versions?: {
    items: Array<{ url: string }>
  };
  image_url?: string;
  display_url?: string;
  thumbnail_src?: string;
  carousel_media?: any[];
  carousel_media_count?: number;
  product_type?: string;
  link?: string;
}

interface ProcessedPost {
  id: string;
  code: string;
  media_type: number;
  is_video: boolean;
  is_carousel: boolean;
  is_reel: boolean;
  like_count: number;
  comment_count: number;
  views_count: number;
  caption: { text: string };
  link: string;
  image_versions?: {
    items: Array<{ url: string }>
  };
  carousel_items?: Array<{
    id: string;
    media_type: number;
    is_video: boolean;
    image_versions?: {
      items: Array<{ url: string }>
    };
  }>;
  carousel_media_count?: number;
}

// Cache para armazenar resultados de consultas recentes
const postsCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos em milissegundos

export async function GET(
  request: NextRequest,
  context: { params: { username: string } }
) {
  const supabase = createClient();

  try {
    // Extrair o username diretamente dos parâmetros
    const params = await context.params;
    const username = params.username;
    
    if (!username || username.trim() === '') {
      console.error('Nome de usuário vazio ou inválido');
      return NextResponse.json(
        { error: 'Nome de usuário inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se a API key do ScapeCreators está configurada
    if (!process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY) {
      console.error('NEXT_PUBLIC_SCRAPECREATORS_API_KEY não está configurada');
      return NextResponse.json(
        { error: 'Configuração de API incompleta' },
        { status: 500 }
      );
    }
    
    // Verificar se queremos apenas reels
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const onlyReels = type === 'reels';
    
    console.log(`Buscando ${onlyReels ? 'reels' : 'posts'} para o usuário: ${username}`);
    
    // Verificar se temos dados em cache para este usuário
    const cacheKey = `posts_${username}_${onlyReels ? 'reels' : 'posts'}`;
    const cachedData = postsCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando dados em cache para ${username}`);
      return NextResponse.json({
        data: {
          items: cachedData.data,
          hasPosts: cachedData.data.length > 0
        },
        status: 'success',
        fromCache: true,
        cacheAge: Math.round((Date.now() - cachedData.timestamp) / 1000) // Idade do cache em segundos
      });
    }
    
    // Buscar posts com a API do ScapeCreators
    const postsData = await fetchWithScapeCreatorsAPI(username, onlyReels);
    
    if (!postsData || !postsData.data || !postsData.data.items || postsData.data.items.length === 0) {
      console.warn(`Nenhum ${onlyReels ? 'reel' : 'post'} encontrado para o usuário ${username}`);
      return NextResponse.json({ 
        data: {
          items: [],
          hasPosts: false,
          message: `O usuário ${username} não possui ${onlyReels ? 'reels' : 'posts'} disponíveis.`
        },
        status: 'success'
      }, { status: 200 });
    }
    
    // Armazenar no cache
    postsCache.set(cacheKey, {
      data: postsData.data.items,
      timestamp: Date.now()
    });
    
    // Retorna no formato esperado pelo hook useInstagramAPI
    return NextResponse.json({
      data: {
        items: postsData.data.items,
        hasPosts: true
      },
      status: 'success'
    });
  } catch (error: any) {
    console.error('Erro ao buscar posts:', error);
    // Incluir mais detalhes sobre o erro para facilitar o debug
    const errorMessage = error.message || 'Erro desconhecido';
    const errorResponse = error.response?.data || {};
    console.error('Detalhes do erro:', { message: errorMessage, response: errorResponse });
    
    return NextResponse.json(
      { error: 'Erro ao buscar posts do Instagram', details: errorMessage },
      { status: 500 }
    );
  }
}

async function fetchWithScapeCreatorsAPI(username: string, onlyReels: boolean) {
  try {
    console.log(`Buscando ${onlyReels ? 'reels' : 'posts'} com ScapeCreators API para: ${username}`);
    
    // Chamar a API do ScapeCreators
    const apiUrl = `https://api.scrapecreators.com/v2/instagram/user/${onlyReels ? 'reels' : 'posts'}`;
    const response = await axios.get(apiUrl, {
      params: {
        handle: username
      },
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY
      },
      timeout: 30000 // 30 segundos
    });
    
    if (!response.data || !response.data.data || response.data.data.length === 0) {
      console.warn(`Nenhum ${onlyReels ? 'reel' : 'post'} encontrado para o usuário ${username} com ScapeCreators API`);
      return {
        data: {
          items: []
        }
      };
    }
    
    console.log(`Encontrados ${response.data.data.length} ${onlyReels ? 'reels' : 'posts'} com ScapeCreators API`);
    
    // Processar os dados recebidos
    const processedItems = response.data.data.map((item: any, index: number): ProcessedPost => {
      // Extrair a legenda
      let caption = '';
      if (item.caption) {
        caption = typeof item.caption === 'object' ? item.caption.text || '' : item.caption;
      }
      
      // Extrair URL da imagem
      let imageUrl = '';
      if (item.display_url) {
        imageUrl = item.display_url;
      } else if (item.thumbnail_url) {
        imageUrl = item.thumbnail_url;
      } else if (item.thumbnail_src) {
        imageUrl = item.thumbnail_src;
      }
      
      // Extrair contagem de curtidas
      const likeCount = item.like_count || item.likes || 0;
      
      // Extrair contagem de comentários
      const commentCount = item.comment_count || item.comments || 0;
      
      // Extrair contagem de visualizações (para vídeos)
      const viewsCount = item.view_count || item.video_view_count || item.play_count || 0;
      
      // Extrair código/shortcode
      let code = item.shortcode || item.code || '';
      
      // Determinar tipo de mídia
      const isVideo = item.is_video || item.media_type === 2;
      const isCarousel = item.is_carousel || item.carousel_media_count > 0 || (item.children && item.children.length > 0);
      const isReel = item.is_reel || (item.product_type === 'clips') || (isVideo && item.product_type === 'igtv');
      
      // Processar itens do carrossel, se houver
      let carouselItems = undefined;
      if (isCarousel && item.children && item.children.length > 0) {
        carouselItems = item.children.map((child: any) => {
          return {
            id: child.id || `carousel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            media_type: child.is_video ? 2 : 1,
            is_video: child.is_video || false,
            image_versions: {
              items: [{ url: child.display_url || child.thumbnail_url || '' }]
            }
          };
        });
      }
      
      // Construir o objeto processado
      return {
        id: item.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        code: code || `code_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        media_type: isVideo ? 2 : (isCarousel ? 8 : 1),
        is_video: isVideo,
        is_carousel: isCarousel,
        is_reel: isReel,
        like_count: likeCount,
        comment_count: commentCount,
        views_count: viewsCount,
        caption: { text: caption },
        link: `https://www.instagram.com/p/${code}/`,
        image_versions: {
          items: [{ url: imageUrl }]
        },
        carousel_items: carouselItems,
        carousel_media_count: carouselItems ? carouselItems.length : undefined
      };
    });
    
    return {
      data: {
        items: processedItems
      }
    };
  } catch (error) {
    console.error('Erro ao buscar com ScapeCreators API:', error);
    throw error;
  }
}
