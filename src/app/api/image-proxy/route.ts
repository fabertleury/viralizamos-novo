import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 });
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
      }
    });
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return NextResponse.json({ error: 'Erro ao buscar imagem' }, { status: 500 });
  }
}
