/**
 * MICROSERVIÇO: Esta funcionalidade foi movida para o microserviço de pagamentos
 * 
 * Esta API é mantida para compatibilidade, mas não executa mais a verificação
 * de pagamentos, que agora é responsabilidade do microserviço dedicado.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('AVISO: API de verificação de pagamentos foi migrada para o microserviço de pagamentos');
  
  return NextResponse.json({
    message: 'Esta funcionalidade foi migrada para o microserviço de pagamentos',
    status: 'success'
  });
}

export const dynamic = 'force-dynamic'; 