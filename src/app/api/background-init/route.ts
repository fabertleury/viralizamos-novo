import { NextResponse } from 'next/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('BackgroundInit');

// Importar processadores
import '@/lib/services/backgroundProcessors';

export async function GET() {
  logger.info('🚀 Endpoint de inicialização de serviços em background acionado');
  
  // Chamada explícita para inicializar os processadores se ainda não foram
  try {
    const { startBackgroundOrderProcessor } = await import('@/lib/services/backgroundOrderProcessor');
    startBackgroundOrderProcessor();
    logger.success('✅ Processador de pedidos inicializado explicitamente');
  } catch (error) {
    logger.error(`❌ Erro ao inicializar processador de pedidos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
  
  return NextResponse.json({
    success: true,
    message: 'Serviços em background inicializados'
  });
} 