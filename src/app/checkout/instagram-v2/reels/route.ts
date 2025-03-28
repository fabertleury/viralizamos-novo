import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Interface para os items do Instagram
interface InstagramItem {
  id?: string;
  pk?: string;
  code?: string;
  shortcode?: string;
  media_type?: number;
  is_video?: boolean;
  like_count?: number;
  likes?: number;
  comment_count?: number;
  comments?: number;
  view_count?: number;
  play_count?: number;
  video_view_count?: number;
  caption?: string | { text: string };
  display_url?: string;
  thumbnail_src?: string;
  image_versions2?: {
    candidates?: Array<{
      url: string;
    }>;
  };
  video_url?: string;
  product_type?: string;
  link?: string;
}

interface ReelsResponse {
  reels: InstagramItem[];
  hasReels: boolean;
  reelsCount: number;
  next_max_id: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  const nextMaxId = url.searchParams.get('next_max_id') || '';

  if (!username) {
    return NextResponse.json(
      { error: 'Username não fornecido' },
      { status: 400 }
    );
  }

  try {
    console.log(`Buscando reels para o usuário: ${username}, next_max_id: ${nextMaxId || 'primeira página'}`);
    
    // Buscar reels com a API do ScapeCreators
    const reelsData = await fetchReelsWithScapeCreatorsAPI(username, nextMaxId);

    if (!reelsData || !reelsData.reels || reelsData.reels.length === 0) {
      console.warn(`Nenhum reel encontrado para o usuário ${username}`);
      return NextResponse.json({
        reels: [],
        hasReels: false,
        message: 'Nenhum reel encontrado para este perfil',
        next_max_id: '',
        status: 'success'
      }, { status: 200 });
    }

    return NextResponse.json({
      reels: reelsData.reels,
      hasReels: reelsData.hasReels,
      reelsCount: reelsData.reelsCount,
      next_max_id: reelsData.next_max_id,
      status: 'success'
    });
  } catch (error) {
    console.error('Erro ao buscar reels:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reels do Instagram' },
      { status: 500 }
    );
  }
}

async function fetchReelsWithScapeCreatorsAPI(username: string, nextMaxId: string): Promise<ReelsResponse> {
  const apiKey = process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY;
  
  try {
    console.log('Buscando posts para o usuário:', username);
    const response = await axios.get('https://api.scrapecreators.com/v2/instagram/user/posts', {
      params: {
        handle: username,
        ...(nextMaxId ? { next_max_id: nextMaxId } : {})
      },
      headers: {
        'x-api-key': apiKey,
      },
      timeout: 10000 // Timeout de 10 segundos
    });

    console.log('Resposta da API ao buscar posts:', JSON.stringify(response.data, null, 2));

    // Verificar se temos dados válidos
    if (!response.data) {
      return {
        reels: [],
        hasReels: false,
        reelsCount: 0,
        next_max_id: ''
      };
    }

    // Verificar se temos o novo formato de resposta com items
    if (response.data.items && Array.isArray(response.data.items)) {
      // Filtrar apenas os reels com critérios específicos
      const filteredReels = response.data.items.filter((item: InstagramItem) => {
        // Critério principal: media_type === 2 (vídeo)
        const isVideoType = item.media_type === 2;
        
        // Critérios auxiliares
        const isReelProductType = item.product_type === "clips" || item.product_type === "reels";
        const hasVideoUrl = !!item.video_url;
        const hasPlayCount = item.play_count !== undefined || item.view_count !== undefined;
        
        // Deve ser do tipo vídeo E ter pelo menos um dos critérios auxiliares
        return isVideoType && (isReelProductType || hasVideoUrl || hasPlayCount);
      });
      
      // Limitar a 12 itens apenas na primeira página
      const limitedReels = nextMaxId ? filteredReels : filteredReels.slice(0, 12);
      
      // Mapear para o formato esperado
      const reels = limitedReels.map((item: InstagramItem) => ({
        id: item.id || item.pk,
        code: item.code || item.shortcode,
        shortcode: item.shortcode || item.code,
        media_type: item.media_type || (item.is_video ? 2 : 1),
        is_video: item.is_video || item.media_type === 2,
        like_count: item.like_count || item.likes || 0,
        comment_count: item.comment_count || item.comments || 0,
        views_count: item.view_count || item.play_count || item.video_view_count || 0,
        caption: typeof item.caption === 'object' && item.caption ? item.caption.text : (typeof item.caption === 'string' ? item.caption : ''),
        image_url: item.display_url || item.thumbnail_src || (item.image_versions2?.candidates?.[0]?.url),
        video_url: item.video_url,
        product_type: item.product_type,
        link: item.link
      }));

      return {
        reels,
        hasReels: reels.length > 0,
        reelsCount: reels.length,
        next_max_id: response.data.next_max_id || ''
      };
    }

    // Se não temos items, retornar resposta vazia
    return { 
      reels: [], 
      hasReels: false, 
      reelsCount: 0, 
      next_max_id: ''
    };

  } catch (error) {
    console.error('Erro ao buscar reels:', error);
    throw error;
  }
}
