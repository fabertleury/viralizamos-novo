/**
 * MICROSERVIÇO: Esta funcionalidade foi movida para o microserviço de pagamentos
 * 
 * Esta API agora redireciona para o endpoint equivalente no microserviço de pagamentos.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('force-check-payment');
const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';

export async function GET(req: NextRequest) {
  try {
    // Obter o ID do pagamento da URL
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('payment_id');
    
    if (!paymentId) {
      return NextResponse.json({
        success: false,
        message: 'payment_id é obrigatório'
      }, { status: 400 });
    }
    
    logger.info(`Redirecionando verificação do pagamento para microserviço: ${paymentId}`);
    
    // Construir URL para o endpoint no microserviço
    const redirectUrl = `${PAYMENT_SERVICE_URL}/api/payments/check?payment_id=${paymentId}`;
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error(`Erro ao redirecionar verificação do pagamento: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      message: `Esta funcionalidade foi migrada para o microserviço de pagamentos`
    });
  }
} 