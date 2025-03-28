import { NextRequest, NextResponse } from 'next/server';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';

export async function POST(request: NextRequest) {
  try {
    console.log('[StartBackgroundCheck] Iniciando verificador de pagamentos em background');
    const checker = BackgroundPaymentChecker.getInstance();
    
    // Forçar verificação imediata de pagamentos pendentes
    const result = await checker.startChecking(true);
    
    return NextResponse.json({
      message: 'Background payment checker started successfully',
      status: 'success',
      result: result
    });
  } catch (error) {
    console.error('[StartBackgroundCheck] Erro ao iniciar verificador de pagamentos:', error);
    return NextResponse.json({
      error: 'Failed to start background payment checker',
      details: String(error)
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 