import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('check-payment');

/**
 * Endpoint para verificar pagamentos específicos
 * Esta funcionalidade foi migrada para o microserviço de pagamentos
 */
export async function POST(req: NextRequest) {
  logger.info('Endpoint check-payment (POST) foi acessado');
  logger.warn('Este endpoint foi descontinuado no serviço principal');
  logger.info('A funcionalidade de verificação de pagamentos foi migrada para o microserviço viralizamos_pagamentos');
  logger.info('Por favor, acesse: https://payments.viralizamos.com/api/cron/check-payment');
  
  return NextResponse.json({
    success: false,
    message: 'Endpoint descontinuado no serviço principal',
    migration: {
      status: 'migrated',
      microservice: 'viralizamos_pagamentos',
      endpoint: 'https://payments.viralizamos.com/api/cron/check-payment'
    }
  }, { status: 410 }); // Status 410 Gone
}

/**
 * Endpoint para lidar com solicitações GET (não recomendado, use POST)
 * Esta funcionalidade foi migrada para o microserviço de pagamentos
 */
export async function GET(req: NextRequest) {
  logger.info('Endpoint check-payment (GET) foi acessado');
  logger.warn('Este endpoint foi descontinuado no serviço principal');
  logger.info('A funcionalidade de verificação de pagamentos foi migrada para o microserviço viralizamos_pagamentos');
  logger.info('Por favor, acesse: https://payments.viralizamos.com/api/cron/check-payment');
  
  return NextResponse.json({
    success: false,
    message: 'Endpoint descontinuado no serviço principal',
    migration: {
      status: 'migrated',
      microservice: 'viralizamos_pagamentos',
      endpoint: 'https://payments.viralizamos.com/api/cron/check-payment'
    }
  }, { status: 410 }); // Status 410 Gone
} 