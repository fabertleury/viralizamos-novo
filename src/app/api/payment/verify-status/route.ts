import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus, processApprovedPayment } from '@/lib/services/paymentService';
import { createClient } from '@/lib/supabase/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validar os dados necessários
    if (!body.payment_id) {
      return NextResponse.json(
        { error: 'ID do pagamento não informado' },
        { status: 400 }
      );
    }
    
    const { payment_id } = body;
    console.log('Verificando status do pagamento:', payment_id);
    
    // Verificar o status do pagamento
    const paymentStatus = await checkPaymentStatus(payment_id);
    console.log('Status do pagamento:', paymentStatus);
    
    if (paymentStatus && paymentStatus.transaction) {
      const supabase = createClient();
      
      // Se o pagamento foi aprovado, processar a transação
      if (paymentStatus.status === 'approved') {
        try {
          console.log('Processando transação aprovada...');
          
          // Verificar se a transação já foi processada
          if (paymentStatus.transaction.order_created) {
            console.log('Transação já foi processada anteriormente.');
          } else {
            // Processar a transação (criar pedidos)
            const orders = await processTransaction(paymentStatus.transaction.id);
            
            // Se temos pedidos, atualizar a transação com o ID do primeiro pedido
            if (orders && orders.length > 0) {
              console.log(`Atualizando transação com order_id: ${orders[0].id}`);
              const { error: updateOrderIdError } = await supabase
                .from('transactions')
                .update({
                  order_created: true,
                  order_id: orders[0].id
                })
                .eq('id', paymentStatus.transaction.id);
              
              if (updateOrderIdError) {
                console.error('Erro ao atualizar order_id na transação:', updateOrderIdError);
              } else {
                console.log('Transação atualizada com order_id:', orders[0].id);
              }
            } else {
              // Atualizar apenas a flag order_created
              const { error: updateOrderCreatedError } = await supabase
                .from('transactions')
                .update({
                  order_created: true
                })
                .eq('id', paymentStatus.transaction.id);
              
              if (updateOrderCreatedError) {
                console.error('Erro ao atualizar flag order_created:', updateOrderCreatedError);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao processar transação:', error);
        }
      }
      
      return NextResponse.json({
        status: paymentStatus.status,
        transaction_id: paymentStatus.transaction.id,
        payment_id: payment_id
      });
    }
    
    return NextResponse.json({
      status: paymentStatus?.status || 'unknown',
      payment_id: payment_id
    });
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return NextResponse.json(
      { error: `Erro ao verificar status do pagamento: ${error}` },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
