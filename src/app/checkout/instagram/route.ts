import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Obter a URL completa da requisição
  const url = new URL(request.url);
  
  // Extrair o caminho após /checkout/instagram/
  const path = url.pathname.replace('/checkout/instagram', '');
  
  // Construir a nova URL com o mesmo caminho, mas no diretório instagram-v2
  const newUrl = new URL(`/checkout/instagram-v2${path}${url.search}`, url.origin);
  
  // Redirecionar para a nova URL
  return NextResponse.redirect(newUrl);
}
