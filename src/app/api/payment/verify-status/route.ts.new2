import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus, processApprovedPayment } from '@/lib/services/paymentService';

export async function POST(request: NextRequest) {
  try {
    const { payment_id } = await request.json();

    if (!payment_id) {
      console.error('Erro: Payment ID não fornecido');
      return NextResponse.json({
        error: 'Payment ID is required',
        status: 'error'
      }, { status: 400 });
    }

    // Verificar status do pagamento
    const paymentStatus = await checkPaymentStatus(payment_id);
    
    // Se o pagamento foi aprovado e a transação existe, processar os pedidos
    if (paymentStatus.status === 'approved' && 
        paymentStatus.transaction && 
        paymentStatus.transaction.status !== 'approved') {
      
      const orderResults = await processApprovedPayment(paymentStatus.transaction);
      
      return NextResponse.json({
        ...orderResults,
        status: paymentStatus.status
      });
    }
    
    // Se não foi aprovado ou já foi processado, apenas retornar o status
    return NextResponse.json({
      status: paymentStatus.status,
      statusDetail: paymentStatus.statusDetail,
      payment: paymentStatus.payment,
      source: paymentStatus.source
    });
    
  } catch (error) {
    console.error('Erro interno na verificação de status:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: String(error),
      status: 'error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
