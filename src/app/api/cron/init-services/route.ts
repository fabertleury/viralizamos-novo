import { NextRequest, NextResponse } from 'next/server';
import { BackgroundServices } from '@/lib/services/backgroundServices';
import { createClient } from '@/lib/supabase/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('init-services');

/**
 * API que pode ser chamada para inicializar serviços de background
 * Útil para garantir que os serviços estão rodando em ambientes serverless como Railway
 * Nota: Os processadores de pagamento e pedidos foram migrados para seus respectivos microserviços
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar código de autorização se existir
    const apiKey = request.nextUrl.searchParams.get('key');
    const authKey = process.env.CRON_SECRET_KEY;
    
    // Se um código de autorização está definido nas variáveis de ambiente,
    // mas nenhum foi fornecido ou está incorreto, retornar erro
    if (authKey && (!apiKey || apiKey !== authKey)) {
      logger.warn('Tentativa de acesso não autorizado à API de inicialização de serviços');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    logger.info('Inicializando serviços de background no serviço principal');
    logger.info('Nota: Os processadores de pagamento e pedidos foram migrados para seus microserviços específicos');

    // Registrar a execução
    const supabase = createClient();
    await supabase.from('system_logs').insert({
      event_type: 'cron_init_services',
      description: 'Verificação e inicialização de serviços de background',
      metadata: {
        source: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      }
    });

    // Inicializar os serviços
    const backgroundServices = BackgroundServices.getInstance();
    backgroundServices.init();
    
    // Obter serviços ativos
    const activeServices = backgroundServices.getActiveServices();

    // Adicionar informações sobre os serviços migrados
    const response = {
      success: true,
      message: 'Serviços de background verificados e inicializados',
      active_services: activeServices,
      migrated_services: [
        {
          name: 'backgroundOrderProcessor',
          status: 'migrated',
          microservice: 'viralizamos_orders',
          endpoint: 'https://orders.viralizamos.com'
        },
        {
          name: 'backgroundPaymentChecker',
          status: 'migrated',
          microservice: 'viralizamos_pagamentos',
          endpoint: 'https://payments.viralizamos.com'
        }
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Erro ao inicializar serviços de background:', error);
    
    // Tentar gravar o erro no log
    try {
      const supabase = createClient();
      await supabase.from('system_logs').insert({
        event_type: 'cron_init_services_error',
        description: 'Erro durante inicialização de serviços de background',
        metadata: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      logger.error('Erro adicional ao registrar falha:', logError);
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao inicializar serviços', 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 