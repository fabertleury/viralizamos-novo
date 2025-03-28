import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest, 
  { params }: { params: { username: string } }
) {
  const username = params.username;

  console.log('[INSTAGRAM CONTENT] Username recebido:', username);

  if (!username) {
    console.error('[INSTAGRAM CONTENT] Username não fornecido');
    return NextResponse.json({ 
      error: 'Username é obrigatório' 
    }, { status: 400 });
  }

  // Configurações da API do RapidAPI
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
    }
  };

  try {
    const url = `https://instagram-scraper-api2.p.rapidapi.com/v1/posts?username_or_id_or_url=${username}`;
    console.log('[INSTAGRAM CONTENT] URL da requisição:', url);

    // Busca conteúdo do Instagram
    const contentResponse = await fetch(url, options);

    if (!contentResponse.ok) {
      console.error('[INSTAGRAM CONTENT] Erro na resposta:', contentResponse.status);
      return NextResponse.json({ 
        error: 'Erro ao buscar conteúdo',
        status: contentResponse.status
      }, { status: contentResponse.status });
    }

    const responseData = await contentResponse.json();

    // Verificar se a resposta tem o formato esperado
    if (!responseData || responseData.status !== 'done' || !responseData.response) {
      console.error('[INSTAGRAM CONTENT] Resposta inválida:', responseData);
      return NextResponse.json({ 
        error: 'Formato de resposta inválido',
        details: responseData
      }, { status: 500 });
    }

    const body = responseData.response.body;
    
    if (!body || !body.items || body.items.length === 0) {
      console.error('[INSTAGRAM CONTENT] Nenhum item encontrado');
      return NextResponse.json({ 
        error: 'Nenhum conteúdo encontrado',
        username: username
      }, { status: 404 });
    }

    // Processar posts e reels
    const processedPosts = body.items
      .filter((item: any) => item.media_type !== 2) // Excluir vídeos/reels
      .map((post: any) => ({
        id: post.pk || post.id,
        caption: post.caption?.text || '',
        likeCount: post.like_count || 0,
        commentCount: post.comment_count || 0,
        mediaType: post.media_type,
        isCarousel: post.media_type === 8,
        carouselMediaCount: post.carousel_media_count || 0,
        images: post.carousel_media 
          ? post.carousel_media.map((media: any) => 
              media.image_versions2?.candidates?.[0]?.url || ''
            )
          : [post.image_versions2?.candidates?.[0]?.url || ''],
        takenAt: post.taken_at ? new Date(post.taken_at * 1000) : null
      }));

    const processedReels = body.items
      .filter((item: any) => item.media_type === 2) // Apenas vídeos/reels
      .map((reel: any) => ({
        id: reel.pk || reel.id,
        caption: reel.caption?.text || '',
        likeCount: reel.like_count || 0,
        commentCount: reel.comment_count || 0,
        videoUrl: reel.video_versions?.[0]?.url || '',
        thumbnailUrl: reel.image_versions2?.candidates?.[0]?.url || '',
        videoDuration: reel.video_duration || 0,
        takenAt: reel.taken_at ? new Date(reel.taken_at * 1000) : null
      }));

    return NextResponse.json({
      username: username,
      totalPosts: processedPosts.length,
      totalReels: processedReels.length,
      posts: processedPosts,
      reels: processedReels
    });

  } catch (error) {
    console.error('[INSTAGRAM CONTENT] Erro fatal:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
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
