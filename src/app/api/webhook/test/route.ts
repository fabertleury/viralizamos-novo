import { NextResponse } from 'next/server';

/**
 * Rota simples para testar se a API está funcionando
 */
export async function GET() {
  return NextResponse.json({
    message: 'API está funcionando!',
    timestamp: new Date().toISOString(),
    routes: {
      'callback': '/api/webhook/n8n-callback',
      'test': '/api/webhook/test'
    }
  });
} 