import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Interface para os posts do Instagram
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
  image_url?: string;
  display_url?: string;
  thumbnail_src?: string;
  carousel_media?: any[];
  carousel_media_count?: number;
  product_type?: string;
  link?: string;
}

// Interface para a resposta da API ScapeCreators
interface ScapeCreatorsResponse {
  num_results: number;
  more_available: boolean;
  auto_load_more_enabled: boolean;
  items: any[];
  status: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const type = searchParams.get('type');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    console.log(`Iniciando busca de visualizações para o usuário ${username}`);

    // Buscar posts e reels com a API do ScapeCreators
    const [postsResult, reelsResult] = await Promise.all([
      fetchPostsWithScapeCreatorsAPI(username),
      fetchReelsWithScapeCreatorsAPI(username)
    ]);
    
    // Verificar se temos erros nas respostas
    if ('error' in postsResult && 'error' in reelsResult) {
      console.error(`Erro ao buscar posts e reels para ${username}`);
      return NextResponse.json({ 
        error: 'Erro ao buscar posts e reels do Instagram' 
      }, { status: 500 });
    }
    
    // Verificar se temos dados de posts ou reels
    const hasPosts = postsResult.items && postsResult.items.length > 0;
    const hasReels = reelsResult.items && reelsResult.items.length > 0;
    
    // Se não temos nenhum dado, retornar lista vazia
    if (!hasPosts && !hasReels) {
      console.warn(`Nenhum post ou reel encontrado para ${username}`);
      return NextResponse.json({ 
        posts: [],
        reels: [],
        hasPosts: false,
        hasReels: false,
        postsCount: 0,
        reelsCount: 0
      });
    }
    
    console.log(`Retornando ${hasPosts ? postsResult.items.length : 0} posts e ${hasReels ? reelsResult.items.length : 0} reels para ${username}`);
    
    return NextResponse.json({
      posts: hasPosts ? postsResult.items : [],
      reels: hasReels ? reelsResult.items : [],
      hasPosts,
      hasReels,
      postsCount: hasPosts ? postsResult.items.length : 0,
      reelsCount: hasReels ? reelsResult.items.length : 0
    });
  } catch (error) {
    console.error(`Erro ao processar requisição para ${username}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function fetchPostsWithScapeCreatorsAPI(username: string) {
  try {
    console.log('Iniciando fetchPostsWithScapeCreatorsAPI para username:', username);
    
    // Obter a chave da API do ScapeCreators - usar o valor fixo da memória
    const apiKey = "WbMAsgUCfyNxhn8FuDaqXs9hfwN2"; // Valor da memória
    
    // Verificar se a chave da API está configurada
    if (!apiKey) {
      console.error('Chave da API ScapeCreators não configurada');
      return { error: 'API key not configured' };
    }
    
    console.log('API Key configurada:', apiKey.substring(0, 5) + '...');
    
    // URL da API - corrigida para v2 conforme documentação
    const apiUrl = 'https://api.scrapecreators.com/v2/instagram/user/posts';
    
    console.log('Fazendo requisição para a API ScapeCreators:', apiUrl);
    console.log('Parâmetros:', { handle: username, limit: 50 });
    
    // Fazer a requisição para a API
    const response = await axios.get(apiUrl, {
      params: {
        handle: username,
        limit: 50
      },
      headers: {
        'x-api-key': apiKey
      },
      timeout: 60000
    });
    
    console.log('Resposta recebida da API ScapeCreators');
    console.log('Status da resposta:', response.status);
    
    // Verificar se temos dados na resposta
    if (!response.data) {
      console.error('Resposta da API ScapeCreators sem dados');
      return { error: 'No data in response' };
    }
    
    // Log da estrutura da resposta
    console.log('Estrutura da resposta:', Object.keys(response.data));
    console.log('Quantidade de itens na resposta:', response.data.items?.length || 0);
    
    // Se temos itens, mostrar um exemplo
    if (response.data.items && response.data.items.length > 0) {
      console.log('Exemplo de item na resposta:', JSON.stringify(response.data.items[0], null, 2));
    }
    
    // Filtrar apenas os posts da resposta (não reels)
    const postsOnly = {
      ...response.data,
      items: response.data.items.filter((item: any) => {
        // Filtrar apenas itens que não são reels/vídeos
        const isNotReel = 
          item.media_type !== 2 && 
          item.product_type !== 'clips' && 
          item.is_video !== true &&
          !(item.video_versions && item.video_versions.length > 0) &&
          !(item.video_url && item.video_url.length > 0) &&
          !(item.video_dash_manifest && item.video_dash_manifest.length > 0);
        
        // Log detalhado para debug
        console.log(`Item ${item.id || item.pk}: isNotReel=${isNotReel}, media_type=${item.media_type}, product_type=${item.product_type}, is_video=${item.is_video}`);
        
        return isNotReel;
      })
    };
    
    console.log(`Filtrados ${postsOnly.items.length} posts de ${response.data.items.length} itens`);
    
    // Processar a resposta para o formato esperado pela aplicação
    const processedResponse = processPostsResponse(postsOnly);
    
    console.log(`Retornando ${processedResponse.items.length} posts processados`);
    
    return processedResponse;
  } catch (error) {
    console.error('Erro ao buscar posts com ScapeCreators API:', error);
    
    // Log detalhado do erro
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro Axios:');
      console.error('Status:', error.response?.status);
      console.error('Dados:', error.response?.data);
      console.error('Cabeçalhos:', error.response?.headers);
      console.error('Configuração:', error.config);
    }
    
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function fetchReelsWithScapeCreatorsAPI(username: string) {
  try {
    console.log('Iniciando fetchReelsWithScapeCreatorsAPI para username:', username);
    
    // Obter a chave da API do ScapeCreators - usar o valor fixo da memória
    const apiKey = "WbMAsgUCfyNxhn8FuDaqXs9hfwN2"; // Valor da memória
    
    // Verificar se a chave da API está configurada
    if (!apiKey) {
      console.error('Chave da API ScapeCreators não configurada');
      return { error: 'API key not configured' };
    }
    
    console.log('API Key configurada:', apiKey.substring(0, 5) + '...');
    
    // URL da API - corrigida para v2 conforme documentação
    const apiUrl = 'https://api.scrapecreators.com/v2/instagram/user/posts';
    
    console.log('Fazendo requisição para a API ScapeCreators:', apiUrl);
    console.log('Parâmetros:', { handle: username, limit: 50 });
    
    // Fazer a requisição para a API
    const response = await axios.get(apiUrl, {
      params: {
        handle: username,
        limit: 50
      },
      headers: {
        'x-api-key': apiKey
      },
      timeout: 60000
    });
    
    console.log('Resposta recebida da API ScapeCreators');
    console.log('Status da resposta:', response.status);
    
    // Verificar se temos dados na resposta
    if (!response.data) {
      console.error('Resposta da API ScapeCreators sem dados');
      return { error: 'No data in response' };
    }
    
    // Log da estrutura da resposta
    console.log('Estrutura da resposta:', Object.keys(response.data));
    console.log('Quantidade de itens na resposta:', response.data.items?.length || 0);
    
    // Se temos itens, mostrar um exemplo
    if (response.data.items && response.data.items.length > 0) {
      console.log('Exemplo de item na resposta:', JSON.stringify(response.data.items[0], null, 2));
    }
    
    // Filtrar apenas os reels da resposta
    const reelsOnly = {
      ...response.data,
      items: response.data.items.filter((item: any) => {
        // Filtrar apenas itens que são reels/vídeos
        const isReel = 
          item.media_type === 2 || 
          item.product_type === 'clips' || 
          item.is_video === true ||
          (item.video_versions && item.video_versions.length > 0) ||
          (item.video_url && item.video_url.length > 0) ||
          (item.video_dash_manifest && item.video_dash_manifest.length > 0);
        
        // Log detalhado para debug
        if (isReel) {
          console.log(`Item ${item.id || item.pk}: identificado como REEL`);
          console.log(`  media_type: ${item.media_type}, product_type: ${item.product_type}`);
          console.log(`  is_video: ${item.is_video}, tem video_versions: ${!!(item.video_versions && item.video_versions.length > 0)}`);
        }
        
        return isReel;
      })
    };
    
    console.log(`Filtrados ${reelsOnly.items.length} reels de ${response.data.items.length} itens`);
    
    // Processar a resposta para o formato esperado pela aplicação
    const processedResponse = processReelsResponse(reelsOnly);
    
    console.log(`Retornando ${processedResponse.items.length} reels processados`);
    
    return processedResponse;
  } catch (error) {
    console.error('Erro ao buscar reels com ScapeCreators API:', error);
    
    // Log detalhado do erro
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro Axios:');
      console.error('Status:', error.response?.status);
      console.error('Dados:', error.response?.data);
      console.error('Cabeçalhos:', error.response?.headers);
      console.error('Configuração:', error.config);
    }
    
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Processar resposta de posts da ScapeCreators API
const processPostsResponse = (data: any) => {
  console.log('Processando resposta de posts da ScapeCreators API');
  
  if (!data || !data.items || !Array.isArray(data.items)) {
    console.error('Formato de resposta inválido para posts:', data);
    return { items: [], more_available: false, next_max_id: null };
  }
  
  console.log(`Processando ${data.items.length} posts da resposta`);
  
  const processedItems = data.items.map((item: any) => {
    // Extrair URL da imagem
    const imageUrl = item.display_url || 
                    item.thumbnail_url || 
                    item.image_url || 
                    (item.image_versions2?.candidates?.[0]?.url);
    
    // Extrair código/shortcode para URL
    const code = item.shortcode || 
                item.code || 
                (item.permalink ? item.permalink.split('/').filter(Boolean).pop() : null) || 
                item.id;
    
    // Extrair legenda
    const caption = item.caption?.text || 
                   item.edge_media_to_caption?.edges?.[0]?.node?.text || 
                   item.caption || 
                   '';
    
    // Extrair contadores
    const likeCount = item.like_count || 
                     item.likes?.count || 
                     item.edge_liked_by?.count || 
                     item.edge_media_preview_like?.count || 
                     0;
    
    const commentCount = item.comment_count || 
                        item.comments?.count || 
                        item.edge_media_to_comment?.count || 
                        0;
    
    // Criar objeto de post processado
    const processedItem = {
      id: item.id || item.pk,
      code: code,
      shortcode: item.shortcode || code,
      image_url: imageUrl,
      thumbnail_url: imageUrl,
      display_url: imageUrl,
      caption: caption,
      like_count: likeCount,
      comment_count: commentCount,
      is_reel: false
    };
    
    // Log detalhado para depuração
    console.log(`Post processado: id=${processedItem.id}, code=${processedItem.code}`);
    
    return processedItem;
  });
  
  return {
    items: processedItems,
    more_available: data.more_available || false,
    next_max_id: data.next_max_id || null
  };
};

// Processar resposta de reels da ScapeCreators API
const processReelsResponse = (data: any) => {
  console.log('Processando resposta de reels da ScapeCreators API');
  
  if (!data || !data.items || !Array.isArray(data.items)) {
    console.error('Formato de resposta inválido para reels:', data);
    return { items: [], more_available: false, next_max_id: null };
  }
  
  console.log(`Processando ${data.items.length} reels da resposta`);
  
  const processedItems = data.items.map((item: any) => {
    // Extrair URL do vídeo ou thumbnail
    const videoUrl = item.video_url || 
                    (item.video_versions && item.video_versions.length > 0 ? item.video_versions[0].url : null);
    
    // Extrair URL da thumbnail
    const thumbnailUrl = item.thumbnail_url || 
                        item.image_url || 
                        item.display_url || 
                        (item.image_versions2?.candidates?.[0]?.url);
    
    // Extrair código/shortcode para URL
    const code = item.shortcode || 
                item.code || 
                (item.permalink ? item.permalink.split('/').filter(Boolean).pop() : null) || 
                item.id;
    
    // Extrair legenda
    const caption = item.caption?.text || 
                   item.edge_media_to_caption?.edges?.[0]?.node?.text || 
                   item.caption || 
                   '';
    
    // Extrair contadores
    const viewCount = item.view_count || 
                     item.video_view_count || 
                     item.play_count || 
                     0;
    
    const likeCount = item.like_count || 
                     item.likes?.count || 
                     item.edge_liked_by?.count || 
                     item.edge_media_preview_like?.count || 
                     0;
    
    const commentCount = item.comment_count || 
                        item.comments?.count || 
                        item.edge_media_to_comment?.count || 
                        0;
    
    // Criar objeto de reel processado
    const processedItem = {
      id: item.id || item.pk,
      code: code,
      shortcode: item.shortcode || code,
      image_url: thumbnailUrl,
      thumbnail_url: thumbnailUrl,
      display_url: thumbnailUrl,
      video_url: videoUrl,
      caption: caption,
      like_count: likeCount,
      comment_count: commentCount,
      view_count: viewCount,
      is_reel: true
    };
    
    // Log detalhado para depuração
    console.log(`Reel processado: id=${processedItem.id}, code=${processedItem.code}`);
    
    return processedItem;
  });
  
  return {
    items: processedItems,
    more_available: data.more_available || false,
    next_max_id: data.next_max_id || null
  };
};
