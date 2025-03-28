import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import axios from 'axios';

// Interface para o conteúdo de comentários (posts e reels)
interface ComentariosContent {
  posts: Array<{
    id: string;
    code: string;
    comments_count: number;
    media_url: string;
  }>;
  reels: Array<{
    id: string;
    code: string;
    comments_count: number;
    media_url: string;
  }>;
  totalComentarios: number;
  hasPosts: boolean;
  hasReels: boolean;
  message: {
    posts: string | null;
    reels: string | null;
  };
}

// Cache para armazenar resultados de consultas recentes
const comentariosCache = new Map();
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
    
    console.log(`Buscando comentários (posts e reels) para o usuário: ${username}`);
    
    // Verificar se temos dados em cache para este usuário
    const cacheKey = `comentarios_${username}`;
    const cachedData = comentariosCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando dados em cache para comentários de ${username}`);
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
    
    // Processar os dados de posts
    const posts = Array.isArray(postsData) ? postsData.map(post => ({
      id: post.id || '',
      code: post.code || post.shortcode || '',
      comments_count: post.comment_count || 0,
      media_url: post.display_url || (post.image_versions?.items?.[0]?.url) || ''
    })) : [];
    
    // Processar os dados de reels
    const reels = Array.isArray(reelsData) ? reelsData.map(reel => ({
      id: reel.id || '',
      code: reel.code || reel.shortcode || '',
      comments_count: reel.comment_count || 0,
      media_url: reel.display_url || (reel.image_versions?.items?.[0]?.url) || ''
    })) : [];
    
    // Calcular total de comentários
    const totalComentariosPosts = posts.reduce((total, post) => total + post.comments_count, 0);
    const totalComentariosReels = reels.reduce((total, reel) => total + reel.comments_count, 0);
    
    // Preparar a resposta
    const response: ComentariosContent = {
      posts,
      reels,
      totalComentarios: totalComentariosPosts + totalComentariosReels,
      hasPosts: posts.length > 0,
      hasReels: reels.length > 0,
      message: {
        posts: posts.length === 0 ? "Este usuário não possui posts" : null,
        reels: reels.length === 0 ? "Este usuário não possui reels" : null
      }
    };
    
    console.log('Dados de comentários processados:', {
      postsCount: response.posts.length,
      reelsCount: response.reels.length,
      totalComentarios: response.totalComentarios,
      hasPosts: response.hasPosts,
      hasReels: response.hasReels
    });
    
    // Armazenar no cache
    comentariosCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    
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
        error: 'Erro ao buscar comentários do Instagram',
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
    
    // Processar os dados recebidos para o formato esperado pela interface
    return response.data.data.map((item: any) => ({
      id: item.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      code: item.shortcode || item.code || '',
      comment_count: item.comment_count || item.comments || 0,
      display_url: item.display_url || item.thumbnail_url || item.thumbnail_src || '',
      image_versions: {
        items: [{ url: item.display_url || item.thumbnail_url || item.thumbnail_src || '' }]
      }
    }));
  } catch (error) {
    console.error('Erro ao buscar posts com ScapeCreators API:', error);
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
    
    // Processar os dados recebidos para o formato esperado pela interface
    return response.data.data.map((item: any) => ({
      id: item.id || `reel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      code: item.shortcode || item.code || '',
      comment_count: item.comment_count || item.comments || 0,
      display_url: item.display_url || item.thumbnail_url || item.thumbnail_src || '',
      image_versions: {
        items: [{ url: item.display_url || item.thumbnail_url || item.thumbnail_src || '' }]
      }
    }));
  } catch (error) {
    console.error('Erro ao buscar reels com ScapeCreators API:', error);
    return [];
  }
}
