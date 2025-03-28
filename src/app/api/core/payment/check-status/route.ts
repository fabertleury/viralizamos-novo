import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/core/payment/paymentService';

/**
 * Endpoint para verificar o status de um pagamento
 */
export async function GET(request: NextRequest) {
  try {
    // Obter o ID do pagamento da query string
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('id');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Verificando status do pagamento ${paymentId}...`);
    
    // Inicializar o serviço de pagamento
    const paymentService = new PaymentService();
    
    // Verificar o status do pagamento
    const result = await paymentService.checkPaymentStatus(paymentId);
    
    if (!result.success) {
      console.error('[API] Erro ao verificar status do pagamento:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    console.log(`[API] Status do pagamento ${paymentId}:`, result.status);
    
    // Retornar o status do pagamento
    return NextResponse.json({
      payment_id: paymentId,
      status: result.status,
      transaction_status: result.transactionStatus,
      transaction_id: result.transaction?.id,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Erro ao verificar status do pagamento:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 