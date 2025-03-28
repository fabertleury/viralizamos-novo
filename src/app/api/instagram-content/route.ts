import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

export async function GET(request: NextRequest) {
  // Extrair parâmetros da URL
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const type = searchParams.get('type') || 'all'; // posts, reels ou all

  console.log('[INSTAGRAM CONTENT] Recebendo solicitação para username:', username);
  console.log('[INSTAGRAM CONTENT] Tipo de conteúdo solicitado:', type);

  // Validar username
  if (!username) {
    console.error('[INSTAGRAM CONTENT] Username não fornecido');
    return NextResponse.json({ 
      error: 'Nome de usuário não fornecido' 
    }, { status: 400 });
  }

  // Configurações da API
  const options = {
    method: 'GET',
    hostname: 'instagram-scraper-api2.p.rapidapi.com',
    port: null,
    path: `/v1/posts?username_or_id_or_url=${username}`,
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
    }
  };

  // Função para fazer a requisição
  const fetchInstagramContent = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            const responseData = JSON.parse(body.toString());
            console.log('[INSTAGRAM CONTENT] Dados recebidos:', JSON.stringify(responseData, null, 2));
            resolve(responseData);
          } catch (error) {
            console.error('[INSTAGRAM CONTENT] Erro ao parsear resposta:', error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('[INSTAGRAM CONTENT] Erro na requisição:', error);
        reject(error);
      });

      req.end();
    });
  };

  try {
    const contentData = await fetchInstagramContent();

    // Verificar se há dados
    if (!contentData.data || !contentData.data.items || contentData.data.items.length === 0) {
      console.warn('[INSTAGRAM CONTENT] Nenhum conteúdo encontrado');
      return NextResponse.json({
        username: username,
        totalPosts: 0,
        totalReels: 0,
        content: []
      });
    }

    // Processar posts e reels
    const processedContent = contentData.data.items.flatMap((item: any) => {
      // Para carrosséis, retornar múltiplas entradas
      if (item.media_type === 8 && item.carousel_media) {
        const carouselItems = item.carousel_media.map((media: any) => ({
          id: media.id || item.id,
          type: media.media_type === 1 ? 'image' : 
                 media.media_type === 2 ? 'video' : 
                 media.media_type === 8 ? 'carousel' : 'unknown',
          caption: item.caption?.text || item.caption || '',
          likes: item.like_count || item.likes_count || item.likes || 0,
          comments: item.comment_count || item.comments_count || item.comments || 0,
          mediaUrl: 
            media.image_versions?.items?.[0]?.url || 
            media.image_url || 
            media.display_url || 
            media.thumbnail_url || 
            '',
          timestamp: media.taken_at || item.taken_at || item.timestamp || null,
          parentId: item.id
        }));

        return carouselItems;
      }
      
      // Para posts normais
      return [{
        id: item.id || item.code || item.pk,
        type: item.media_type === 1 ? 'image' : 
               item.media_type === 2 ? 'video' : 
               item.media_type === 8 ? 'carousel' : 'unknown',
        caption: item.caption?.text || item.caption || '',
        likes: item.like_count || item.likes_count || item.likes || 0,
        comments: item.comment_count || item.comments_count || item.comments || 0,
        mediaUrl: 
          item.image_versions?.items?.[0]?.url || 
          item.display_url || 
          item.image_url || 
          item.video_url || 
          item.thumbnail_url || 
          '',
        timestamp: item.taken_at || item.timestamp || null,
        
        // Informações específicas para Reels
        ...(item.media_type === 2 ? {
          videoDuration: item.video_duration || null,
          videoUrl: item.video_url || null,
          videoVersions: item.video_versions || [],
          hasViewsFetching: item.has_views_fetching || false,
          views: item.video_view_count || 0
        } : {})
      }];
    });

    console.log(`[INSTAGRAM CONTENT] Conteúdo processado: ${processedContent.length} itens`);

    // Filtrar conteúdo com base no tipo solicitado
    const posts = processedContent.filter(post => 
      post.type === 'image' || post.type === 'carousel'
    );

    const reels = processedContent.filter(post => 
      post.type === 'video'
    );

    // Filtrar conteúdo com base no tipo solicitado
    let filteredContent = processedContent;
    if (type === 'posts') {
      filteredContent = posts;
    } else if (type === 'reels') {
      filteredContent = reels;
    }

    return NextResponse.json({
      username: username,
      totalPosts: posts.length,
      totalReels: reels.length,
      content: filteredContent
    });

  } catch (error) {
    console.error('[INSTAGRAM CONTENT] Erro ao buscar conteúdo:', error);
    return NextResponse.json({ 
      error: 'Erro ao buscar conteúdo',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Configuração para permitir chamadas de qualquer origem
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
