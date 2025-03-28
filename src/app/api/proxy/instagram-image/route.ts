import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // Criar uma resposta com o mesmo tipo de conteúdo da imagem
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano

    return new NextResponse(blob, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
