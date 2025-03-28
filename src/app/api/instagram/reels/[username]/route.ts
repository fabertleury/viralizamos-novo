import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import axios from 'axios';

// Interface para o reel retornado pela API do Apify
interface ApifyReel {
  id?: number;
  type?: string;
  shortCode?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  url?: string;
  commentsCount?: number;
  dimensionsHeight?: number;
  dimensionsWidth?: number;
  images?: string[];
  displayUrl?: string;
  videoUrl?: string;
  likesCount?: number;
  videoViewCount?: number;
  timestamp?: string;
  ownerFullName?: string;
  ownerUsername?: string;
  ownerId?: number;
  productType?: string;
  isSponsored?: boolean;
  videoDuration?: number;
}

// Interface para o reel processado que será retornado pela API
interface ProcessedReel {
  id: string;
  code: string;
  shortcode: string;
  media_type: number;
  is_video: boolean;
  is_carousel: boolean;
  is_reel: boolean;
  like_count: number;
  comment_count: number;
  views_count: number;
  caption: { text: string };
  link: string;
  image_versions: { items: Array<{ url: string }> };
  display_url: string;
  thumbnail_url: string;
  video_url: string;
  video_duration: number;
  type: string;
  product_type: string;
  timestamp: string;
  owner: {
    username: string;
    full_name: string;
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: { params: { username: string } }
) {
  try {
    // Obter o nome de usuário da URL
    const params = await context.params;
    const username = params.username;
    
    if (!username) {
      return NextResponse.json(
        { 
          error: 'Nome de usuário não fornecido' 
        },
        { status: 400 }
      );
    }

    console.log('Buscando reels para o usuário:', username);
    
    // Buscar reels usando a API do Apify
    const reels = await fetchWithApifyAPI(username);
    
    // Verificar se foram encontrados reels
    if (!reels || reels.length === 0) {
      return NextResponse.json(
        { 
          hasReels: false,
          message: `Nenhum reel encontrado para o usuário ${username}`,
          reels: []
        },
        { status: 200 }
      );
    }
    
    // Extrair informações do perfil (se disponível)
    let profileData = {};
    if (reels.length > 0) {
      const firstReel = reels[0];
      profileData = {
        username: firstReel.owner.username || username,
        full_name: firstReel.owner.full_name || '',
        biography: '',
        followers_count: 0,
        following_count: 0,
        profile_pic_url: '',
        is_private: false,
        is_verified: false,
        media_count: reels.length
      };
    }
    
    // Retornar os reels encontrados no mesmo formato que a API de posts
    return NextResponse.json(
      { 
        hasReels: true,
        message: `${reels.length} reels encontrados para o usuário ${username}`,
        reels: reels,
        data: {
          user: profileData,
          items: reels
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar reels:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar reels',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Cache para armazenar resultados de consultas recentes
const reelsCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos em milissegundos

async function fetchWithApifyAPI(username: string): Promise<ProcessedReel[]> {
  try {
    // Verificar se temos dados em cache para este usuário
    const cacheKey = `${username}_reels`;
    const cachedData = reelsCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando dados em cache para reels de ${username}`);
      return cachedData.data;
    }
    
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      throw new Error('APIFY_API_KEY não está configurada nas variáveis de ambiente');
    }

    console.log('Buscando reels com Apify API para:', username);
    
    // Configurar o input para o ator do Apify
    const input = {
      username: username,
      resultsLimit: 12, // Limitar o número de resultados para melhorar o desempenho
      resultsType: "reels",
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL']
      },
      maxRequestRetries: 3, // Reduzir o número de tentativas para evitar longos tempos de espera
      maxConcurrency: 5 // Aumentar a concorrência para acelerar o processamento
    };
    
    // Iniciar a execução do ator
    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${apiKey}`,
      { 
        ...input,
        // Configurações adicionais para melhorar o desempenho
        memoryMbytes: 2048, // Aumentar a memória disponível
        timeoutSecs: 60 // Definir um timeout mais curto (60 segundos)
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta inicial da Apify API recebida:', response.data);
    
    // Obter o ID da execução
    const runId = response.data.data.id;
    
    // Aguardar a conclusão da execução (polling)
    let runFinished = false;
    let maxAttempts = 15; // Reduzir o número máximo de tentativas (30 segundos no total)
    let attempts = 0;
    
    while (!runFinished && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos
      
      // Verificar o status da execução
      const statusResponse = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
      );
      
      const status = statusResponse.data.data.status;
      console.log(`Status da execução do Apify para reels: ${status} (tentativa ${attempts + 1})`);
      
      if (status === 'SUCCEEDED') {
        runFinished = true;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Execução do Apify falhou com status: ${status}`);
      }
      
      attempts++;
    }
    
    // Se não terminou, mas não houve erro, tentar obter os resultados parciais
    if (!runFinished) {
      console.log('Tempo limite excedido, tentando obter resultados parciais para reels...');
    }
    
    // Obter os resultados da execução (mesmo que parciais)
    const datasetResponse = await axios.get(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}`
    );
    
    const apifyReels = datasetResponse.data;
    console.log(`Recebidos ${apifyReels.length} reels do Apify`);
    
    // Se não temos dados e não terminou, aí sim lançamos erro
    if (apifyReels.length === 0 && !runFinished) {
      throw new Error('Tempo limite excedido ao aguardar a conclusão da execução do Apify para reels');
    }
    
    // Processar os reels recebidos do Apify
    const formattedReels = apifyReels
      .filter((reel: ApifyReel) => {
        // Verificar se é realmente um reel
        return reel.productType === 'clips' || 
               (reel.type === 'Video' && reel.url && reel.url.includes('/reel/'));
      })
      .map((reel: ApifyReel) => {
        return processReel(reel);
      });
    
    // Armazenar no cache
    reelsCache.set(cacheKey, {
      data: formattedReels,
      timestamp: Date.now()
    });
    
    return formattedReels;
  } catch (error) {
    console.error('Erro na Apify API para reels:', error);
    throw error;
  }
}

// Função auxiliar para processar um reel
function processReel(reel: ApifyReel): ProcessedReel {
  // Extrair shortcode
  const shortCode = reel.shortCode || '';
  
  // Criar uma URL proxy para as imagens para evitar problemas de CORS
  const proxyImageUrl = (url: string) => {
    // Se a URL já for do seu domínio ou estiver vazia, retorne como está
    if (!url || url.startsWith('/')) return url;
    
    // Usar uma URL de proxy para contornar as restrições de CORS
    try {
      // Retornar uma URL que será processada pelo servidor
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    } catch (error) {
      console.error('Erro ao processar URL de imagem:', error);
      return url;
    }
  };
  
  const displayUrl = proxyImageUrl(reel.displayUrl || '');
  
  return {
    id: reel.id?.toString() || '',
    code: shortCode,
    shortcode: shortCode,
    media_type: 2, // Vídeo
    is_video: true,
    is_carousel: false,
    is_reel: true,
    like_count: reel.likesCount || 0,
    comment_count: reel.commentsCount || 0,
    views_count: reel.videoViewCount || 0,
    caption: { text: reel.caption || '' },
    link: reel.url || `https://www.instagram.com/reel/${shortCode}/`,
    image_versions: {
      items: [{ url: displayUrl }]
    },
    display_url: displayUrl,
    thumbnail_url: displayUrl,
    video_url: reel.videoUrl || '',
    video_duration: reel.videoDuration || 0,
    type: 'video',
    product_type: 'clips',
    timestamp: reel.timestamp || new Date().toISOString(),
    owner: {
      username: reel.ownerUsername || '',
      full_name: reel.ownerFullName || '',
      id: reel.ownerId?.toString() || ''
    }
  };
}
