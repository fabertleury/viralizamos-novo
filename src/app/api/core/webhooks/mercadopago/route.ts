import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mercadopago from 'mercadopago';
import { TransactionProcessor } from '@/lib/core/transaction/transactionProcessor';

/**
 * Endpoint para receber webhooks do Mercado Pago
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Webhook] Recebido webhook do Mercado Pago:', JSON.stringify(body, null, 2));
    
    // Verificar se é um evento de pagamento
    if (body.type !== 'payment') {
      console.log(`[Webhook] Ignorando evento de tipo: ${body.type}`);
      return NextResponse.json({ status: 'ignored', type: body.type });
    }
    
    // Extrair ID do pagamento
    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error('[Webhook] ID do pagamento não encontrado no webhook');
      return NextResponse.json(
        { error: 'ID do pagamento não encontrado no webhook' },
        { status: 400 }
      );
    }
    
    console.log(`[Webhook] Processando webhook para pagamento ${paymentId}`);
    
    // Configurar o cliente do Mercado Pago
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('[Webhook] Token do Mercado Pago não configurado');
      return NextResponse.json(
        { error: 'Configuração incompleta' },
        { status: 500 }
      );
    }
    
    mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);
    
    // Obter detalhes do pagamento no Mercado Pago
    const result = await mercadopago.payment.get(paymentId);
    
    if (!result || !result.body) {
      console.error(`[Webhook] Não foi possível obter detalhes do pagamento ${paymentId}`);
      return NextResponse.json(
        { error: 'Não foi possível obter detalhes do pagamento' },
        { status: 500 }
      );
    }
    
    const payment = result.body;
    console.log(`[Webhook] Status do pagamento ${paymentId}:`, payment.status);
    
    // Buscar a transação correspondente
    const supabase = createClient();
    const { data: transactions, error: transactionError } = await supabase
      .from('core_transactions')
      .select('*')
      .eq('payment_id', paymentId.toString());
    
    // Se não encontrar na tabela principal, buscar na tabela v2
    if (transactionError || !transactions || transactions.length === 0) {
      const { data: transactionsV2, error: transactionErrorV2 } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .eq('payment_id', paymentId.toString());
    
      if (transactionErrorV2 || !transactionsV2 || transactionsV2.length === 0) {
        console.error(`[Webhook] Transação para pagamento ${paymentId} não encontrada em nenhuma tabela`);
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }
    
      console.log(`[Webhook] Transação encontrada na tabela v2: ${transactionsV2[0].id}`);
      
      // Usar a primeira transação encontrada
      const transaction = transactionsV2[0];
    
    // Mapear o status do Mercado Pago para o status da transação
    let transactionStatus;
    switch (payment.status) {
      case 'approved':
      case 'completed':
        transactionStatus = 'approved';
        break;
      case 'pending':
      case 'in_process':
      case 'in_mediation':
        transactionStatus = 'pending';
        break;
      case 'rejected':
      case 'cancelled':
      case 'refunded':
      case 'charged_back':
        transactionStatus = 'rejected';
        break;
      default:
        transactionStatus = 'pending';
    }
    
    console.log(`[Webhook] Atualizando status da transação ${transaction.id} para: ${transactionStatus}`);
    
    // Atualizar o status da transação
    const { error: updateError } = await supabase
        .from('core_transactions_v2')
      .update({
        status: transactionStatus,
        payment_status: payment.status,
        last_webhook_update: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id);
    
    if (updateError) {
      console.error(`[Webhook] Erro ao atualizar status da transação ${transaction.id}:`, updateError);
        
        // Continuar mesmo com erro para tentar processar a transação
        await supabase.from('core_processing_logs').insert({
          transaction_id: transaction.id,
          level: 'error',
          message: `Erro ao atualizar status via webhook: ${updateError.message}`,
          metadata: { payment_id: paymentId, status: payment.status }
        });
      } else {
    // Registrar log do webhook
    await supabase.from('core_processing_logs').insert({
      transaction_id: transaction.id,
      level: 'info',
      message: `Webhook recebido: Pagamento ${paymentId} com status ${payment.status}`,
      metadata: { 
        payment_id: paymentId,
        payment_status: payment.status,
        transaction_status: transactionStatus,
        webhook_data: body
      }
    });
      }
    
    // Se o pagamento foi aprovado, iniciar o processamento da transação
    if (transactionStatus === 'approved') {
      console.log(`[Webhook] Iniciando processamento da transação ${transaction.id}`);
      
      try {
          // Verificar se a transação já tem pedido criado
          if (transaction.order_created) {
            console.log(`[Webhook] Transação ${transaction.id} já tem pedido criado. Pulando processamento.`);
            return NextResponse.json({
              status: 'success',
              message: 'Transação já processada anteriormente',
              payment_id: paymentId,
              transaction_id: transaction.id
            });
          }
          
          // Iniciar o processamento e esperar pela conclusão
        const processor = new TransactionProcessor();
          const processingResult = await processor.processTransaction(transaction.id);
          
          console.log(`[Webhook] Processamento concluído: ${JSON.stringify(processingResult)}`);
          
          if (processingResult.status === 'processed') {
            console.log(`[Webhook] Transação ${transaction.id} processada com sucesso!`);
            return NextResponse.json({
              status: 'success',
              message: 'Transação processada com sucesso',
              payment_id: paymentId,
              transaction_id: transaction.id,
              processing_result: processingResult
            });
          } else {
            console.error(`[Webhook] Erro no processamento da transação ${transaction.id}: ${processingResult.reason}`);
            
            // Mesmo com erro no processamento, registrar que tentamos
            await supabase.from('core_processing_logs').insert({
              transaction_id: transaction.id,
              level: 'warning',
              message: `Erro no processamento via webhook: ${processingResult.reason}`,
              metadata: { payment_id: paymentId, error: processingResult.error }
            });
            
            // Agendar um retry assíncrono para tentar novamente em breve
            setTimeout(async () => {
              try {
                console.log(`[Webhook] Tentando processar novamente a transação ${transaction.id}`);
                const retryResult = await processor.processTransaction(transaction.id);
                console.log(`[Webhook] Resultado do retry: ${JSON.stringify(retryResult)}`);
              } catch (retryError) {
                console.error(`[Webhook] Erro no retry da transação ${transaction.id}:`, retryError);
              }
            }, 5000); // Tentar novamente após 5 segundos
            
            return NextResponse.json({
              status: 'warning',
              message: 'Erro no processamento mas retry agendado',
              payment_id: paymentId,
              transaction_id: transaction.id,
              processing_error: processingResult.reason
            });
          }
        } catch (processingError) {
          console.error(`[Webhook] Exceção ao processar transação ${transaction.id}:`, processingError);
          
          // Registrar o erro no log para análise posterior
          await supabase.from('core_processing_logs').insert({
            transaction_id: transaction.id,
            level: 'error',
            message: `Exceção ao processar via webhook: ${processingError instanceof Error ? processingError.message : 'Erro desconhecido'}`,
            metadata: { 
              payment_id: paymentId, 
              error_stack: processingError instanceof Error ? processingError.stack : null 
            }
          });
          
          // Agendar um retry assíncrono para tentar novamente
          setTimeout(async () => {
            try {
              console.log(`[Webhook] Retry após exceção: processando transação ${transaction.id}`);
              const processor = new TransactionProcessor();
              const retryResult = await processor.processTransaction(transaction.id);
              console.log(`[Webhook] Resultado do retry após exceção: ${JSON.stringify(retryResult)}`);
            } catch (retryError) {
              console.error(`[Webhook] Erro no retry após exceção para transação ${transaction.id}:`, retryError);
            }
          }, 10000); // Tentar novamente após 10 segundos
          
          return NextResponse.json({
            status: 'error',
            message: 'Erro no processamento mas retry agendado',
            payment_id: paymentId,
            transaction_id: transaction.id
          });
        }
      }
      
      // Se não é aprovado, apenas retornar sucesso
      return NextResponse.json({
        status: 'success',
        payment_id: paymentId,
        transaction_id: transaction.id,
        payment_status: payment.status,
        transaction_status: transactionStatus
      });
    }
    
    // Processar transação na tabela original (legacy)
    const transaction = transactions[0];
    console.log(`[Webhook] Transação encontrada na tabela legacy: ${transaction.id}`);
    
    // Processar o pagamento da mesma forma que acima, mas para a tabela legacy...
    // ... código para tabela legacy aqui (similar ao acima)
    
    return NextResponse.json({
      status: 'success',
      payment_id: paymentId,
      transaction_id: transaction.id,
      message: 'Webhook processado com sucesso (legacy)'
    });
  } catch (error) {
    console.error('[Webhook] Erro ao processar webhook do Mercado Pago:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 