import { NextRequest, NextResponse } from 'next/server';
import { BackgroundJobService } from '@/lib/core/jobs/backgroundJobs';
import { verifyApiKey } from '@/lib/core/utils/auth';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('BackgroundJobsAPI');

/**
 * Endpoint POST para executar jobs em background
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar API key
    const apiKey = request.headers.get('x-api-key');
    if (!verifyApiKey(apiKey)) {
      logger.warn('Tentativa de acesso não autorizado aos background jobs');
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    // Obter parâmetros
    const data = await request.json();
    const jobType = data.job_type || 'complete'; // 'transactions' | 'orders_status' | 'complete'
    const limit = data.limit ? parseInt(data.limit, 10) : undefined;

    // Validar tipo de job
    if (!['transactions', 'orders_status', 'complete'].includes(jobType)) {
      logger.error(`Tipo de job inválido: ${jobType}`);
      return NextResponse.json(
        { error: 'Tipo de job inválido' },
        { status: 400 }
      );
    }

    logger.info(`Executando job do tipo ${jobType}${limit ? ` com limite ${limit}` : ''}`);

    // Inicializar serviço de jobs
    const jobService = new BackgroundJobService();
    
    // Executar job conforme o tipo
    let result;
    
    if (jobType === 'transactions') {
      result = await jobService.processTransactions(limit);
    } else if (jobType === 'orders_status') {
      result = await jobService.checkOrdersStatus(limit);
    } else {
      result = await jobService.runCompleteBatch();
    }
    
    logger.info(`Job ${jobType} executado com ${
      jobType === 'complete' 
        ? result.transactions.success 
        : result.success 
          ? 'sucesso' 
          : 'falha'
    }`);
    
    // Retornar resultado
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Erro ao executar job em background:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno ao executar job', 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET para verificar status dos jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar API key
    const apiKey = request.headers.get('x-api-key');
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    // Obter status dos jobs
    const jobService = new BackgroundJobService();
    const status = jobService.getStatus();
    
    // Retornar status
    return NextResponse.json({
      jobsEnabled: true,
      ...status
    });
  } catch (error) {
    logger.error('Erro ao verificar status dos jobs:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno ao verificar status', 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
} 