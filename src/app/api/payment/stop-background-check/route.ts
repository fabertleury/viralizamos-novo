import { NextRequest, NextResponse } from 'next/server';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';

export async function POST(request: NextRequest) {
  try {
    const checker = BackgroundPaymentChecker.getInstance();
    checker.stopChecking();

    return NextResponse.json({
      message: 'Background payment checker stopped successfully',
      status: 'success'
    });
  } catch (error) {
    console.error('Erro ao parar verificador de pagamentos:', error);
    return NextResponse.json({
      error: 'Failed to stop background payment checker',
      details: String(error)
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 