import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mercadopago from 'mercadopago';
import { addToQueue } from '@/payment-service/lib/queue/redis';

export async function POST(request: NextRequest) {
  try {
    // Obter e validar os dados da requisição
    const body = await request.json();
    console.log('Webhook recebido do Mercado Pago:', body);
    
    // Registrar o webhook no banco de dados
    const supabase = createClient();
    await supabase.from('webhook_logs').insert({
      webhook_type: 'mercadopago',
      source: 'payment-service',
      payload: body,
      processed: false,
      received_at: new Date().toISOString()
    });
    
    // Verificar tipo do webhook
    const type = body.type || body.action;
    const id = body.data?.id;
    
    // Se não for notificação de pagamento, retornar OK
    if (type !== 'payment' && type !== 'payment.updated' && type !== 'payment.created') {
      console.log(`Webhook do tipo ${type} ignorado`);
      return NextResponse.json({ status: 'ignored', type });
    }
    
    // Se não tiver ID do pagamento, retornar erro
    if (!id) {
      console.error('ID do pagamento não encontrado no webhook');
      return NextResponse.json({ status: 'error', message: 'ID do pagamento não fornecido' }, { status: 400 });
    }
    
    console.log(`Processando webhook de pagamento: ID ${id}`);
    
    try {
      // Configurar Mercado Pago
      if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        throw new Error('Token do Mercado Pago não configurado');
      }
      
      mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);
      
      // Buscar detalhes do pagamento
      const paymentInfo = await mercadopago.payment.get(id);
      const payment = paymentInfo.body;
      
      console.log(`Pagamento ${id} - Status: ${payment.status}`);
      
      // Buscar transação relacionada ao pagamento
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_id', id.toString())
        .limit(1);
      
      if (transactionError) {
        throw new Error(`Erro ao buscar transação: ${transactionError.message}`);
      }
      
      if (!transactions || transactions.length === 0) {
        console.log(`Nenhuma transação encontrada para o pagamento ${id}`);
        return NextResponse.json({ status: 'not_found', payment_id: id });
      }
      
      const transaction = transactions[0];
      const transactionId = transaction.id;
      
      // Atualizar status da transação
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: payment.status,
          last_updated: new Date().toISOString()
        })
        .eq('id', transactionId);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar transação: ${updateError.message}`);
      }
      
      console.log(`Transação ${transactionId} atualizada com status ${payment.status}`);
      
      // Se o pagamento foi aprovado, adicionar à fila de processamento
      if (payment.status === 'approved' && !transaction.order_created) {
        await addToQueue('processApprovedTransaction', { transactionId }, {
          transactionId,
          priority: 2 // Prioridade alta
        });
        
        console.log(`Transação ${transactionId} adicionada à fila de processamento`);
      }
      
      // Atualizar o log do webhook como processado
      await supabase
        .from('webhook_logs')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          status_code: 200,
          response_body: { transaction_id: transactionId, status: payment.status }
        })
        .eq('webhook_type', 'mercadopago')
        .eq('payload->data->id', id);
      
      return NextResponse.json({
        status: 'processed',
        payment_id: id,
        transaction_id: transactionId,
        payment_status: payment.status
      });
    } catch (error) {
      console.error(`Erro ao processar pagamento ${id}:`, error);
      
      // Retornar sucesso para o Mercado Pago não retentar
      // Mas registramos o erro para processamento manual
      return NextResponse.json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao processar pagamento',
        payment_id: id
      });
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
} 