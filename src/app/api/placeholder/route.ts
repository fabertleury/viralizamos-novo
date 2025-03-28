import { NextResponse } from 'next/server';

export async function GET() {
  // Criar uma imagem simples com texto "Reel Indisponível"
  const width = 640;
  const height = 640;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fundo cinza
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, width, height);
    
    // Texto
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Reel Indisponível', width / 2, height / 2);
    
    // Converter para blob
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.8,
    });
    
    // Converter para ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    
    // Retornar como resposta
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
  
  // Fallback
  return NextResponse.json({ error: 'Failed to generate placeholder' }, { status: 500 });
}
