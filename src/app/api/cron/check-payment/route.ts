import { NextRequest, NextResponse } from 'next/server';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';
import { createClient } from '@/lib/supabase/server';

/**
 * Endpoint para verificar pagamentos específicos
 * Pode ser chamado pelo frontend ou por um cron job externo
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar se a solicitação tem corpo
    if (!req.body) {
      return NextResponse.json({ error: 'Corpo da requisição ausente' }, { status: 400 });
    }

    // Parse do corpo da requisição
    const body = await req.json();
    
    // Validar dados da requisição
    if (!body.paymentId) {
      return NextResponse.json({ error: 'ID do pagamento não especificado' }, { status: 400 });
    }
    
    console.log(`Solicitação para verificar pagamento: ${body.paymentId}`);
    
    // Inicializar o verificador de pagamento
    const backgroundChecker = BackgroundPaymentChecker.getInstance();
    
    // Verificar um pagamento específico
    const result = await backgroundChecker.checkPaymentStatus(body.paymentId);
    
    // Se houver transactionId e checkImmediate = true, verificar a transação também
    if (body.transactionId && body.checkImmediate === true) {
      console.log(`Verificando transação: ${body.transactionId}`);
      
      // Buscar a transação para verificar
      const supabase = createClient();
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', body.transactionId)
        .single();
      
      if (transaction) {
        // Se a transação existir, verificar
        await backgroundChecker.checkPayment(transaction);
      }
    }
    
    return NextResponse.json({
      message: 'Verificação de pagamento iniciada',
      payment_id: body.paymentId,
      transaction_id: body.transactionId,
      result
    });
  } catch (error) {
    console.error('Erro ao processar verificação de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar pagamento: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para lidar com solicitações GET (não recomendado, use POST)
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const paymentId = searchParams.get('id');
  
  if (!paymentId) {
    return NextResponse.json({ error: 'ID do pagamento não especificado' }, { status: 400 });
  }
  
  try {
    // Inicializar o verificador de pagamento
    const backgroundChecker = BackgroundPaymentChecker.getInstance();
    
    // Verificar um pagamento específico
    const result = await backgroundChecker.checkPaymentStatus(paymentId);
    
    return NextResponse.json({
      message: 'Verificação de pagamento iniciada',
      payment_id: paymentId,
      result
    });
  } catch (error) {
    console.error('Erro ao processar verificação de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar pagamento: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 