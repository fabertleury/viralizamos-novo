import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import axios from 'axios';

// Interface para o conteúdo de visualização (posts e reels)
interface VisualizacaoContent {
  posts: any[];
  reels: any[];
  hasPosts: boolean;
  hasReels: boolean;
  message: {
    posts: string | null;
    reels: string | null;
  };
}

// Cache para armazenar resultados de consultas recentes
const visualizacaoCache = new Map();
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
    
    console.log(`Buscando visualizações (posts e reels) para o usuário: ${username}`);
    
    // Verificar se temos dados em cache para este usuário
    const cacheKey = `visualizacao_${username}`;
    const cachedData = visualizacaoCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando dados em cache para visualização de ${username}`);
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true,
        cacheAge: Math.round((Date.now() - cachedData.timestamp) / 1000) // Idade do cache em segundos
      });
    }
    
    // Verificar se a API key do ScapeCreators está configurada
    if (!process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY) {
      console.error('NEXT_PUBLIC_SCRAPECREATORS_API_KEY não está configurada');
      return NextResponse.json(
        { error: 'Configuração de API incompleta' },
        { status: 500 }
      );
    }
    
    // Buscar posts e reels simultaneamente
    const [postsData, reelsData] = await Promise.all([
      fetchPostsWithScapeCreatorsAPI(username),
      fetchReelsWithScapeCreatorsAPI(username)
    ]);
    
    // Verificar se os dados foram obtidos com sucesso
    if (!postsData && !reelsData) {
      throw new Error('Falha ao obter posts e reels com ScapeCreators API');
    }
    
    // Preparar a resposta
    const response: VisualizacaoContent = {
      posts: postsData || [],
      reels: reelsData || [],
      hasPosts: Array.isArray(postsData) && postsData.length > 0,
      hasReels: Array.isArray(reelsData) && reelsData.length > 0,
      message: {
        posts: (!postsData || postsData.length === 0) ? "Este usuário não possui posts" : null,
        reels: (!reelsData || reelsData.length === 0) ? "Este usuário não possui reels" : null
      }
    };
    
    console.log('Dados de visualização processados:', {
      postsCount: response.posts.length,
      reelsCount: response.reels.length,
      hasPosts: response.hasPosts,
      hasReels: response.hasReels
    });
    
    // Armazenar no cache
    visualizacaoCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar visualizações:', error);
    
    // Log detalhado de erros para diagnóstico
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro Axios:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar visualizações do Instagram',
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
}

// Função para buscar posts usando a API do ScapeCreators
async function fetchPostsWithScapeCreatorsAPI(username: string) {
  try {
    console.log(`Buscando posts para o usuário ${username} com ScapeCreators API`);
    
    // Chamar a API do ScapeCreators
    const apiUrl = 'https://api.scrapecreators.com/v2/instagram/user/posts';
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
      console.warn(`Nenhum post encontrado para o usuário ${username} com ScapeCreators API`);
      return [];
    }
    
    console.log(`Encontrados ${response.data.data.length} posts com ScapeCreators API`);
    
    // Processar os dados recebidos
    const processedItems = response.data.data.map((item: any, index: number) => {
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
    
    return processedItems;
  } catch (error) {
    console.error('Erro ao buscar posts com ScapeCreators API:', error);
    // Retornar array vazio em caso de erro para não bloquear a resposta completa
    return [];
  }
}

// Função para buscar reels usando a API do ScapeCreators
async function fetchReelsWithScapeCreatorsAPI(username: string) {
  try {
    console.log(`Buscando reels para o usuário ${username} com ScapeCreators API`);
    
    // Chamar a API do ScapeCreators
    const apiUrl = 'https://api.scrapecreators.com/v2/instagram/user/reels';
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
      console.warn(`Nenhum reel encontrado para o usuário ${username} com ScapeCreators API`);
      return [];
    }
    
    console.log(`Encontrados ${response.data.data.length} reels com ScapeCreators API`);
    
    // Processar os dados recebidos
    const processedItems = response.data.data.map((item: any) => {
      // Extrair a legenda
      let caption = '';
      if (item.caption) {
        caption = typeof item.caption === 'object' ? item.caption.text || '' : item.caption;
      }
      
      // Extrair URL da imagem de thumbnail
      let imageUrl = '';
      if (item.display_url) {
        imageUrl = item.display_url;
      } else if (item.thumbnail_url) {
        imageUrl = item.thumbnail_url;
      } else if (item.thumbnail_src) {
        imageUrl = item.thumbnail_src;
      }
      
      // Extrair URL do vídeo
      let videoUrl = '';
      if (item.video_url) {
        videoUrl = item.video_url;
      } else if (item.video_versions && item.video_versions.length > 0) {
        videoUrl = item.video_versions[0].url;
      }
      
      // Extrair contagem de curtidas
      const likeCount = item.like_count || item.likes || 0;
      
      // Extrair contagem de comentários
      const commentCount = item.comment_count || item.comments || 0;
      
      // Extrair contagem de visualizações
      const viewsCount = item.view_count || item.video_view_count || item.play_count || 0;
      
      // Extrair código/shortcode
      const code = item.shortcode || item.code || '';
      
      // Gerar um ID único se não existir
      const id = item.id || `reel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Construir o objeto processado
      return {
        id: id,
        code: code || id, // Usar o ID como código se não houver código
        media_type: 2, // Vídeo
        is_video: true,
        is_reel: true,
        like_count: likeCount,
        comment_count: commentCount,
        views_count: viewsCount,
        caption: { text: caption },
        link: `https://www.instagram.com/reel/${code}/`,
        image_versions: {
          items: [{ url: imageUrl || '' }]
        },
        video_url: videoUrl || ''
      };
    });
    
    return processedItems;
  } catch (error) {
    console.error('Erro ao buscar reels com ScapeCreators API:', error);
    // Retornar array vazio em caso de erro para não bloquear a resposta completa
    return [];
  }
}
