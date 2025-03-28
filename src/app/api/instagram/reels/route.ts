import { NextResponse } from 'next/server';
import https from 'https';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'instagram-scraper-api2.p.rapidapi.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return new NextResponse('Username is required', { status: 400 });
    }

    if (!RAPIDAPI_KEY) {
      return new NextResponse('RapidAPI key is not configured', { status: 500 });
    }

    console.log('Buscando reels para:', username);

    const options = {
      method: 'GET',
      hostname: RAPIDAPI_HOST,
      port: null,
      path: `/v1/reels?username_or_id_or_url=${encodeURIComponent(username)}`,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    };

    const data = await new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks: any[] = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);
          try {
            const data = JSON.parse(body.toString());
            console.log('Resposta da API de reels:', data);
            
            if (!data?.data?.items) {
              console.error('Resposta inválida da API de reels:', data);
              reject(new Error('Formato de resposta inválido'));
              return;
            }

            const reels = data.data.items.map((reel: any) => {
              // Tentar diferentes caminhos para a imagem do reel
              const imageUrl = 
                reel.image_versions?.items?.[0]?.url || 
                reel.thumbnail_url || 
                reel.cover_frame_url || 
                reel.display_url;

              return {
                id: reel.code || reel.id || reel.shortcode,
                shortcode: reel.code || reel.id || reel.shortcode,
                image_url: imageUrl,
                caption: reel.caption 
                    ? (typeof reel.caption === 'object' 
                      ? reel.caption.text || 'Sem legenda'
                      : String(reel.caption)) 
                    : 'Sem legenda',
                like_count: reel.like_count || reel.likes_count || 0,
                comment_count: reel.comment_count || reel.comments_count || 0,
                view_count: reel.view_count || reel.play_count || 0,
                play_count: reel.play_count || 0,
                // Campos específicos para reels
                thumbnail_url: reel.thumbnail_url || '',
                display_url: reel.display_url || '',
                image_versions: reel.image_versions || null
              };
            }).filter(reel => reel.image_url || reel.thumbnail_url || reel.display_url); // Remover reels sem imagem

            console.log('Reels processados:', reels.length);

            resolve(reels);
          } catch (e) {
            console.error('Erro ao processar resposta de reels:', e);
            reject(e);
          }
        });
      });

      req.on('error', function (e) {
        console.error('Erro na requisição de reels:', e);
        reject(e);
      });

      req.end();
    });

    return NextResponse.json({ reels: data });
  } catch (error: any) {
    console.error('Erro ao buscar reels:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reels' },
      { status: 500 }
    );
  }
}
