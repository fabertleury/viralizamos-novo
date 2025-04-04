/**
 * MICROSERVIÇO: Esta funcionalidade foi movida para o microserviço de pagamentos
 * 
 * Esta API é mantida para compatibilidade, mas não executa mais a verificação
 * de pagamentos prestes a expirar, que agora é responsabilidade do microserviço.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  console.log('AVISO: API de verificação de transações prestes a expirar foi migrada para o microserviço de pagamentos');
  
  return NextResponse.json({
    success: true,
    message: 'Esta funcionalidade foi migrada para o microserviço de pagamentos'
  });
}

// Configurar como rota dinâmica para executar a cada requisição
export const dynamic = 'force-dynamic'; 