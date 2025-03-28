import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // NOTA: Esta rota está temporariamente desativada
  // Anteriormente usava uma API de estatísticas do Instagram
  // Agora usa endpoints específicos em outras rotas
  return NextResponse.json({ 
    error: 'Endpoint descontinuado. Use /api/instagram-profile ou /api/instagram-content',
    status: 'deprecated'
  }, { status: 404 });
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
