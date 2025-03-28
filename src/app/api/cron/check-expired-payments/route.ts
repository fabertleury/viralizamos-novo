import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mercadopago from 'mercadopago';

// Verificar a chave secreta para garantir que apenas o cron autorizado chame o endpoint
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  // O formato esperado é "Bearer CHAVE_SECRETA"
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') return false;
  
  // Verifica se o token coincide com a chave secreta definida no env
  return token === process.env.CRON_SECRET_KEY;
}

export async function GET(request: NextRequest) {
  // Verificar autorização
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    // Configurar o cliente do Mercado Pago
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Configuração incompleta' },
        { status: 500 }
      );
    }

    mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');
    
    // Obter transações pendentes com pagamentos criados há mais de 30 minutos
    const supabase = createClient();
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    const { data: pendingTransactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending')
      .eq('payment_method', 'pix')
      .lt('created_at', thirtyMinutesAgo.toISOString());
    
    if (txError) {
      console.error('Erro ao buscar transações pendentes:', txError);
      return NextResponse.json(
        { error: 'Erro ao buscar transações pendentes' },
        { status: 500 }
      );
    }

    console.log(`Encontradas ${pendingTransactions?.length || 0} transações PIX pendentes expiradas`);
    
    const results = [];
    
    // Processar cada transação pendente
    for (const tx of pendingTransactions || []) {
      try {
        const paymentId = tx.payment_id;
        
        if (!paymentId) {
          console.warn(`Transação ${tx.id} não possui payment_id, pulando`);
          continue;
        }
        
        console.log(`Verificando status do pagamento ${paymentId} da transação ${tx.id}`);
        
        // Consultar o status atual do pagamento no Mercado Pago
        const paymentResponse = await mercadopago.payment.get(paymentId);
        const paymentStatus = paymentResponse.body.status;
        
        console.log(`Status atual do pagamento ${paymentId}: ${paymentStatus}`);
        
        // Se o pagamento ainda está pendente, cancelá-lo
        if (paymentStatus === 'pending') {
          console.log(`Cancelando pagamento expirado ${paymentId}`);
          
          // Cancelar o pagamento no Mercado Pago
          await mercadopago.payment.update({
            id: paymentId,
            status: 'cancelled'
          });
          
          // Atualizar o status da transação no banco de dados
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
              metadata: {
                ...tx.metadata,
                payment: {
                  ...tx.metadata?.payment,
                  status: 'cancelled',
                  cancelled_at: new Date().toISOString(),
                  cancellation_reason: 'expired'
                }
              }
            })
            .eq('id', tx.id);
          
          if (updateError) {
            console.error(`Erro ao atualizar transação ${tx.id}:`, updateError);
            results.push({
              transaction_id: tx.id,
              payment_id: paymentId,
              status: 'error',
              message: updateError.message
            });
          } else {
            results.push({
              transaction_id: tx.id,
              payment_id: paymentId,
              status: 'cancelled',
              message: 'Pagamento expirado cancelado com sucesso'
            });
          }
        } else if (paymentStatus === 'approved') {
          // O pagamento foi aprovado, mas não atualizamos a transação
          console.log(`Pagamento ${paymentId} já aprovado, atualizando transação ${tx.id}`);
          
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString(),
              metadata: {
                ...tx.metadata,
                payment: {
                  ...tx.metadata?.payment,
                  status: 'approved'
                }
              }
            })
            .eq('id', tx.id);
          
          if (updateError) {
            console.error(`Erro ao atualizar transação ${tx.id}:`, updateError);
            results.push({
              transaction_id: tx.id,
              payment_id: paymentId,
              status: 'error',
              message: updateError.message
            });
          } else {
            results.push({
              transaction_id: tx.id,
              payment_id: paymentId,
              status: 'approved',
              message: 'Transação atualizada para aprovada'
            });
          }
        } else {
          // Pagamento já está em outro status (cancelled, rejected, etc.)
          console.log(`Pagamento ${paymentId} já está no status ${paymentStatus}, atualizando transação ${tx.id}`);
          
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              status: paymentStatus === 'cancelled' ? 'cancelled' : 
                     paymentStatus === 'rejected' ? 'failed' : 'unknown',
              updated_at: new Date().toISOString(),
              metadata: {
                ...tx.metadata,
                payment: {
                  ...tx.metadata?.payment,
                  status: paymentStatus
                }
              }
            })
            .eq('id', tx.id);
          
          if (updateError) {
            console.error(`Erro ao atualizar transação ${tx.id}:`, updateError);
            results.push({
              transaction_id: tx.id,
              payment_id: paymentId,
              status: 'error',
              message: updateError.message
            });
          } else {
            results.push({
              transaction_id: tx.id,
              payment_id: paymentId,
              status: paymentStatus,
              message: `Transação atualizada para ${paymentStatus}`
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao processar transação ${tx.id}:`, error);
        results.push({
          transaction_id: tx.id,
          payment_id: tx.payment_id,
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
    
    return NextResponse.json({
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Erro ao verificar pagamentos expirados:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar pagamentos expirados' },
      { status: 500 }
    );
  }
} 