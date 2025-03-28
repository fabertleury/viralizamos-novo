import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import axios from 'axios';

// Definir interfaces para melhorar a tipagem
interface InstagramReel {
  id: string;
  code: string;
  shortcode?: string;
  media_type: number;
  is_video: boolean;
  is_reel: boolean;
  like_count: number;
  comment_count: number;
  views_count?: number;
  view_count?: number;
  caption: string | { text: string };
  image_versions?: {
    items: Array<{ url: string }>
  };
  thumbnail_url?: string;
  video_url?: string;
  display_url?: string;
  link?: string;
}

interface ProcessedReel {
  id: string;
  code: string;
  media_type: number;
  is_video: boolean;
  is_reel: boolean;
  like_count: number;
  comment_count: number;
  views_count: number;
  caption: { text: string };
  link: string;
  image_versions: {
    items: Array<{ url: string }>
  };
  video_url: string;
}

// Cache para armazenar resultados de consultas recentes
const reelsCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos em milissegundos

export async function GET(
  request: NextRequest,
  context: { params: { username: string } }
) {
  const supabase = createClient();

  try {
    // Extrair o username diretamente dos parâmetros
    const username = await context.params.username;
    
    console.log(`Buscando reels para o usuário: ${username}`);
    
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
    
    // Verificar se temos dados em cache para este usuário
    const cacheKey = `reels_${username}`;
    const cachedData = reelsCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando dados em cache para reels de ${username}`);
      return NextResponse.json({
        data: {
          items: cachedData.data,
          hasReels: cachedData.data.length > 0
        },
        status: 'success',
        fromCache: true,
        cacheAge: Math.round((Date.now() - cachedData.timestamp) / 1000) // Idade do cache em segundos
      });
    }
    
    // Buscar reels com a API do ScapeCreators
    const reelsData = await fetchWithScapeCreatorsAPI(username);
    
    if (!reelsData || !reelsData.data || !reelsData.data.items || reelsData.data.items.length === 0) {
      console.warn(`Nenhum reel encontrado para o usuário ${username}`);
      return NextResponse.json({ 
        data: {
          items: [],
          hasReels: false,
          message: `O usuário ${username} não possui reels disponíveis.`
        },
        status: 'success'
      }, { status: 200 });
    }
    
    // Armazenar no cache
    reelsCache.set(cacheKey, {
      data: reelsData.data.items,
      timestamp: Date.now()
    });
    
    // Retorna no formato esperado pelo hook useInstagramAPI
    return NextResponse.json({
      data: {
        items: reelsData.data.items,
        hasReels: true
      },
      status: 'success'
    });
  } catch (error: any) {
    console.error('Erro ao buscar reels:', error);
    // Incluir mais detalhes sobre o erro para facilitar o debug
    const errorMessage = error.message || 'Erro desconhecido';
    const errorResponse = error.response?.data || {};
    console.error('Detalhes do erro:', { message: errorMessage, response: errorResponse });
    
    return NextResponse.json(
      { error: 'Erro ao buscar reels do Instagram', details: errorMessage },
      { status: 500 }
    );
  }
}

async function fetchWithScapeCreatorsAPI(username: string) {
  try {
    console.log(`Buscando reels com ScapeCreators API para: ${username}`);
    
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
      return {
        data: {
          items: []
        }
      };
    }
    
    console.log(`Encontrados ${response.data.data.length} reels com ScapeCreators API`);
    
    // Processar os dados recebidos
    const processedItems = response.data.data.map((item: any): ProcessedReel => {
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
