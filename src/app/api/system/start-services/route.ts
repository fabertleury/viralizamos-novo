import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth/verifyApiKey';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';
import { ExpireTransactionsService } from '@/lib/services/expireTransactionsService';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação com API key
    const isAuthenticated = await verifyApiKey(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get('service') || 'all';
    const force = searchParams.get('force') === 'true';

    logger.info(`Iniciando serviços de background (${service}), force=${force}`);

    // Iniciar serviços de background
    const results: Record<string, any> = {};

    // Iniciar verificador de pagamentos
    if (service === 'all' || service === 'payment-checker') {
      const paymentChecker = BackgroundPaymentChecker.getInstance();
      results.paymentChecker = await paymentChecker.startChecking(force);
      logger.info(`Serviço de verificação de pagamentos ${results.paymentChecker.status}`);
    }

    // Iniciar serviço de expiração de transações
    if (service === 'all' || service === 'expire-transactions') {
      const expireService = ExpireTransactionsService.getInstance();
      results.expireTransactions = await expireService.startChecking(force);
      logger.info(`Serviço de expiração de transações ${results.expireTransactions.status}`);
    }

    return NextResponse.json({
      success: true,
      message: `Serviços iniciados com sucesso`,
      services: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao iniciar serviços de background:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao iniciar serviços',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 