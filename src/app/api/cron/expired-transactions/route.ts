import { NextRequest, NextResponse } from 'next/server';
import { TransactionExpirationChecker } from '@/lib/services/transactionExpirationChecker';
import { createClient } from '@/lib/supabase/server';

/**
 * API que pode ser chamada por um cron job para verificar e cancelar transações expiradas
 * Quando um QR Code PIX expira após 30 minutos, esta API marca a transação como cancelada
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar código de autorização se existir
    const apiKey = request.nextUrl.searchParams.get('key');
    const authKey = process.env.CRON_SECRET_KEY;
    
    // Se um código de autorização está definido nas variáveis de ambiente,
    // mas nenhum foi fornecido ou está incorreto, retornar erro
    if (authKey && (!apiKey || apiKey !== authKey)) {
      console.log('Tentativa de acesso não autorizado à API de expiração de transações');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Registrar execução
    const supabase = createClient();
    await supabase.from('system_logs').insert({
      event_type: 'cron_expired_transactions',
      description: 'Verificação agendada de transações expiradas',
      metadata: {
        source: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      }
    });

    // Inicializar e executar o verificador de expiração
    const checker = TransactionExpirationChecker.getInstance();
    const result = await checker.forceCheck();

    return NextResponse.json({
      success: true,
      message: 'Verificação de transações expiradas concluída',
      details: result
    });
  } catch (error) {
    console.error('Erro ao processar verificação de transações expiradas:', error);
    
    // Tentar gravar o erro no log
    try {
      const supabase = createClient();
      await supabase.from('system_logs').insert({
        event_type: 'cron_expired_transactions_error',
        description: 'Erro durante verificação de transações expiradas',
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
        message: 'Erro ao processar verificação', 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 