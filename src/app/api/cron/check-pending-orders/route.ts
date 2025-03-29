import { NextResponse } from 'next/server';
import { Logger } from '@/lib/core/utils/logger';
import { backgroundOrderProcessor } from '@/lib/services/backgroundOrderProcessor';

const logger = new Logger('check-pending-orders');

// Handler para solicitações GET
export async function GET() {
  try {
    logger.info('Iniciando processamento de pedidos pendentes via endpoint...');
    
    // Usar o processador em background já inicializado
    const result = await backgroundOrderProcessor.processPendingOrders();
    
    logger.info(`Processamento concluído: ${JSON.stringify(result)}`);
    
    return NextResponse.json({
      success: true,
      message: 'Pedidos pendentes processados com sucesso',
      result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error(`Erro ao processar pedidos pendentes: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      message: `Erro ao processar pedidos pendentes: ${errorMessage}`
    }, { status: 500 });
  }
} 