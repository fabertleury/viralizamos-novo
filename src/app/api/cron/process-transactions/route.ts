import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('process-transactions');

/**
 * Endpoint para processar transações pendentes
 * Esta funcionalidade foi migrada para o microserviço de pagamentos
 */
export async function GET(request: NextRequest) {
  logger.info('Endpoint process-transactions foi acessado');
  logger.warn('Este endpoint foi descontinuado no serviço principal');
  logger.info('A funcionalidade de processamento de transações foi migrada para o microserviço viralizamos_pagamentos');
  logger.info('Por favor, acesse: https://payments.viralizamos.com/api/cron/process-transactions');
  
  return NextResponse.json({
    success: false,
    message: 'Endpoint descontinuado no serviço principal',
    migration: {
      status: 'migrated',
      microservice: 'viralizamos_pagamentos',
      endpoint: 'https://payments.viralizamos.com/api/cron/process-transactions'
    }
  }, { status: 410 }); // Status 410 Gone
} 