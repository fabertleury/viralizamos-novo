import { NextResponse } from 'next/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('check-pending-orders');

// Handler para solicitações GET
export async function GET() {
  logger.info('Endpoint check-pending-orders foi acessado');
  
  // Informar que a funcionalidade foi migrada para o microserviço de orders
  logger.warn('Este endpoint foi descontinuado no serviço principal');
  logger.info('A funcionalidade de processamento de pedidos foi migrada para o microserviço viralizamos_orders');
  logger.info('Por favor, acesse: https://orders.viralizamos.com/api/cron/check-pending-orders');
  
  // Retornar resposta informando sobre a migração
  return NextResponse.json({
    success: false,
    message: 'Endpoint descontinuado no serviço principal',
    migration: {
      status: 'migrated',
      microservice: 'viralizamos_orders',
      endpoint: 'https://orders.viralizamos.com/api/cron/check-pending-orders'
    }
  }, { status: 410 }); // Status 410 Gone
} 