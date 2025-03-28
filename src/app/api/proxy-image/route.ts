import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL de imagem não fornecida' }, { status: 400 });
  }

  try {
    const imageResponse = await fetch(imageUrl, {
      headers: {
        // Adicionar headers para evitar bloqueios
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Origin': 'https://www.instagram.com',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    });

    if (!imageResponse.ok) {
      console.error(`Erro ao buscar imagem: ${imageResponse.status} ${imageResponse.statusText}`);
      return NextResponse.json({ 
        error: 'Não foi possível buscar a imagem', 
        status: imageResponse.status,
        statusText: imageResponse.statusText
      }, { status: 500 });
    }

    // Obter o buffer da imagem
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determinar o tipo de conteúdo com base na URL ou no Content-Type da resposta
    let contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';
    if (imageUrl.endsWith('.png')) {
      contentType = 'image/png';
    } else if (imageUrl.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (imageUrl.endsWith('.webp')) {
      contentType = 'image/webp';
    }

    // Configurar os headers da resposta
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

    // Retornar a imagem com os headers corretos
    return new NextResponse(buffer, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao processar imagem', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
