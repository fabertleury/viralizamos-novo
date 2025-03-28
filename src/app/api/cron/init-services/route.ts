import { NextRequest, NextResponse } from 'next/server';
import { BackgroundServices } from '@/lib/services/backgroundServices';
import { createClient } from '@/lib/supabase/server';

/**
 * API que pode ser chamada para inicializar serviços de background
 * Útil para garantir que os serviços estão rodando em ambientes serverless como Railway
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar código de autorização se existir
    const apiKey = request.nextUrl.searchParams.get('key');
    const authKey = process.env.CRON_SECRET_KEY;
    
    // Se um código de autorização está definido nas variáveis de ambiente,
    // mas nenhum foi fornecido ou está incorreto, retornar erro
    if (authKey && (!apiKey || apiKey !== authKey)) {
      console.log('Tentativa de acesso não autorizado à API de inicialização de serviços');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

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

    return NextResponse.json({
      success: true,
      message: 'Serviços de background verificados e inicializados',
      active_services: activeServices
    });
  } catch (error) {
    console.error('Erro ao inicializar serviços de background:', error);
    
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
      console.error('Erro adicional ao registrar falha:', logError);
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