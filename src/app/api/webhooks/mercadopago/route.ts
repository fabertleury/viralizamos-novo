'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

// Adicionar interface para erro
interface ProcessingError extends Error {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  console.log('[MercadoPagoWebhook] Recebendo notificação');
  const supabase = createClient();
  
  try {
    // Logar informações da requisição
    const userAgent = request.headers.get('user-agent') || '';
    const contentType = request.headers.get('content-type') || '';
    const xSignature = request.headers.get('x-signature') || '';
    const xRequestId = request.headers.get('x-request-id') || '';
    
    console.log('[MercadoPagoWebhook] User-Agent:', userAgent);
    console.log('[MercadoPagoWebhook] Content-Type:', contentType);
    console.log('[MercadoPagoWebhook] X-Signature:', xSignature);
    console.log('[MercadoPagoWebhook] X-Request-ID:', xRequestId);
    
    // Obter o corpo completo como texto primeiro
    const bodyText = await request.text();
    console.log('[MercadoPagoWebhook] Corpo da requisição (texto):', bodyText);
    
    // Validar a assinatura (se disponível)
    let signatureValid = false;
    
    if (xSignature && process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
      try {
        // Extrair timestamp e assinatura do header
        const signatureParts = xSignature.split(',');
        const ts = signatureParts[0].replace('ts=', '');
        const v1 = signatureParts[1]?.replace('v1=', '');
        
        console.log('[MercadoPagoWebhook] Timestamp da assinatura:', ts);
        console.log('[MercadoPagoWebhook] Assinatura v1:', v1);
        
        if (ts && v1) {
          // Importar crypto de forma dinâmica
          const crypto = await import('crypto');
          
          // Webhook Secret da sua aplicação no Mercado Pago
          const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
          
          // Testar múltiplos formatos de assinatura
          const templates = [
            { name: 'corpo_completo', value: bodyText },
            { name: 'timestamp', value: ts },
            { name: 'timestamp_corpo', value: `${ts}.${bodyText}` },
            { name: 'timestamp_primeiros_100', value: `${ts}.${bodyText.substring(0, 100)}` },
            { name: 'action_id', value: `${bodyText}.${ts}` }
          ];
          
          const allSignatures: Record<string, string> = {};
          
          // Calcular todas as assinaturas possíveis e verificar
          for (const template of templates) {
            const calculatedSignature = crypto.default
              .createHmac('sha256', webhookSecret)
              .update(template.value)
              .digest('hex');
              
            allSignatures[template.name] = calculatedSignature;
            
            if (v1 === calculatedSignature) {
              signatureValid = true;
              console.log(`[MercadoPagoWebhook] Assinatura válida com método: ${template.name}`);
              break;
            }
          }
          
          // Se não conseguiu validar, registrar todas as tentativas para análise
          if (!signatureValid) {
            console.warn('[MercadoPagoWebhook] Assinatura inválida, mas continuando processamento');
            console.warn('[MercadoPagoWebhook] NOTA: Este comportamento é temporário para garantir que não percamos pagamentos');
            console.warn('[MercadoPagoWebhook] Assinatura recebida: ', v1);
            console.warn('[MercadoPagoWebhook] Assinaturas calculadas: ', JSON.stringify(allSignatures, null, 2));
            
            // Registrar nos logs para análise posterior
            try {
              const { error: logError } = await supabase.from('webhook_logs').insert({
                event_type: 'invalid_signature',
                message: 'Assinatura inválida detectada',
                metadata: {
                  timestamp: ts,
                  received_signature: v1,
                  calculated_signatures: allSignatures,
                  headers: {
                    'x-signature': xSignature,
                    'content-type': contentType
                  }
                }
              });
              
              if (logError) {
                console.error('[MercadoPagoWebhook] Erro ao registrar log de assinatura inválida:', logError);
              }
            } catch (logError) {
              console.error('[MercadoPagoWebhook] Erro ao registrar log de assinatura inválida:', logError);
            }
          }
        }
      } catch (signatureError) {
        console.error('[MercadoPagoWebhook] Erro ao validar assinatura:', signatureError);
      }
    } else {
      if (!xSignature) {
        console.log('[MercadoPagoWebhook] Notificação sem assinatura de segurança');
      }
      if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
        console.log('[MercadoPagoWebhook] MERCADO_PAGO_WEBHOOK_SECRET não configurado');
      }
    }
    
    // Tentar converter o corpo para JSON
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log('[MercadoPagoWebhook] Corpo da requisição (JSON):', JSON.stringify(body, null, 2));
    } catch (error) {
      console.error('[MercadoPagoWebhook] Erro ao fazer parse do JSON:', error);
      // Se não conseguir ler como JSON, retornar 200 para evitar reenvios
      return NextResponse.json({ 
        warning: 'Formato de corpo inválido, mas requisição aceita',
        received_content: bodyText.substring(0, 200) // Limitar tamanho para log
      }, { status: 200 });
    }

    // Extrair o ID do pagamento com base no formato do body
    let paymentId = null;
    let action = null;
    
    // Tentar extrair o ID de todas as possíveis localizações
    if (body.data && body.data.id) {
      paymentId = body.data.id.toString();
      action = body.action || body.type || 'unknown';
    } else if (body.id) {
      paymentId = body.id.toString();
      action = 'direct';
    } else if (body.resource && typeof body.resource === 'string') {
      // Formatos possíveis:
      // 1. /v1/payments/123456789
      // 2. Apenas o número: 123456789
      const matchUrl = body.resource.match(/\/v1\/payments\/(\d+)/);
      if (matchUrl && matchUrl[1]) {
        paymentId = matchUrl[1];
        action = 'resource_url';
      } else if (/^\d+$/.test(body.resource)) {
        // Se é apenas um número (ID direto)
        paymentId = body.resource;
        action = 'resource_id';
      }
    } else if (body.topic === 'payment' && body.resource) {
      // Formato usado pelo Feed v2.0 do Mercado Pago
      paymentId = body.resource;
      action = body.topic;
    } else {
      // Procurar por qualquer chave que possa conter "id" e um valor numérico ou string
      for (const key in body) {
        if (typeof body[key] === 'object' && body[key] !== null) {
          if (body[key].id) {
            paymentId = body[key].id.toString();
            action = `found_in_${key}`;
            break;
          }
        } else if (key.toLowerCase().includes('id') && body[key]) {
          paymentId = body[key].toString();
          action = `found_key_${key}`;
          break;
        } else if (key === 'resource' && body[key]) {
          // Caso resource seja o ID direto
          paymentId = body[key].toString();
          action = 'resource_direct';
          break;
        }
      }
    }
    
    console.log('[MercadoPagoWebhook] Extração de ID:', { paymentId, action });

    // Se ainda não encontrou o ID, logar o erro mas retornar 200
    if (!paymentId) {
      console.error('[MercadoPagoWebhook] ID de pagamento não encontrado na notificação:', body);
      return NextResponse.json({ 
        warning: 'ID de pagamento não encontrado, mas requisição aceita',
        received_body: body
      }, { status: 200 });
    }

    console.log('[MercadoPagoWebhook] Ação:', action);
    console.log('[MercadoPagoWebhook] ID do pagamento:', paymentId);
    
    // Obter token de acesso do Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('[MercadoPagoWebhook] Token de acesso do Mercado Pago não configurado');
      return NextResponse.json({ 
        warning: 'Token de acesso não configurado, mas requisição aceita' 
      }, { status: 200 });
    }

    try {
      // Consultar detalhes do pagamento na API do Mercado Pago
      console.log('[MercadoPagoWebhook] Consultando detalhes do pagamento:', paymentId);
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!paymentResponse.ok) {
        const responseText = await paymentResponse.text();
        console.error('[MercadoPagoWebhook] Erro ao consultar pagamento:', responseText);
        return NextResponse.json({ 
          warning: 'Erro ao consultar pagamento, mas requisição aceita',
          details: responseText
        }, { status: 200 });
      }

      const paymentData = await paymentResponse.json();
      console.log('[MercadoPagoWebhook] Detalhes do pagamento:', JSON.stringify({
        id: paymentData.id,
        status: paymentData.status,
        external_reference: paymentData.external_reference,
        date_created: paymentData.date_created,
        date_approved: paymentData.date_approved
      }, null, 2));

      // Verificar status do pagamento
      const status = paymentData.status;
      console.log('[MercadoPagoWebhook] Status do pagamento:', status);

      // Buscar a transação correspondente no banco de dados
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .or(`payment_id.eq.${paymentId},payment_external_reference.eq.${paymentId}`);
      
      let finalTransactions = transactions;

      // Se não encontrou, busca pelo ID em metadata.payment.id
      if (!finalTransactions || finalTransactions.length === 0) {
        console.log('[MercadoPagoWebhook] Transação não encontrada diretamente, buscando em metadata');
        const { data: metadataTransactions, error: metadataError } = await supabase
          .from('transactions')
          .select('*')
          .filter('metadata->>payment', 'neq', 'null')
          .filter('metadata->payment->id', 'eq', paymentId);
        
        if (!metadataError && metadataTransactions && metadataTransactions.length > 0) {
          finalTransactions = metadataTransactions;
        } else if (metadataError) {
          console.error('[MercadoPagoWebhook] Erro ao buscar transação por metadata:', metadataError);
        }
      }

      if (transactionError) {
        console.error('[MercadoPagoWebhook] Erro ao buscar transação:', transactionError);
        return NextResponse.json({ 
          warning: 'Erro ao buscar transação, mas requisição aceita' 
        }, { status: 200 });
      }

      if (!finalTransactions || finalTransactions.length === 0) {
        console.error('[MercadoPagoWebhook] Transação não encontrada para o pagamento:', paymentId);
        
        // Tentar criar uma nova transação se tivermos os dados necessários
        if (status === 'approved' && paymentData.additional_info && paymentData.transaction_details) {
          console.log('[MercadoPagoWebhook] Tentando criar transação para pagamento aprovado');
          try {
            const { data: newTransaction, error: createError } = await supabase
              .from('transactions')
              .insert({
                type: 'payment',
                amount: paymentData.transaction_amount || 0,
                status: 'approved',
                payment_method: 'pix',
                payment_id: paymentId,
                payment_external_reference: paymentId,
                external_id: paymentId,
                customer_name: paymentData.payer?.first_name 
                  ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`
                  : 'Cliente via webhook',
                customer_email: paymentData.payer?.email || 'webhook@example.com',
                metadata: {
                  payment_data: paymentData,
                  created_from: 'webhook',
                  webhook_processed_at: new Date().toISOString(),
                }
              })
              .select();
              
            if (createError) {
              console.error('[MercadoPagoWebhook] Erro ao criar transação:', createError);
            } else if (newTransaction && newTransaction.length > 0) {
              console.log('[MercadoPagoWebhook] Transação criada com sucesso:', newTransaction[0].id);
              return NextResponse.json({ 
                message: 'Transação criada com sucesso via webhook', 
                transaction_id: newTransaction[0].id 
              }, { status: 200 });
            }
          } catch (createError) {
            console.error('[MercadoPagoWebhook] Erro ao tentar criar transação:', createError);
          }
        }
        
        // Se não conseguiu criar, retorna 200 OK para não bloquear o Mercado Pago
        return NextResponse.json({ 
          message: 'Transação não encontrada, mas webhook processado' 
        }, { status: 200 });
      }

      const transaction = finalTransactions[0];
      console.log('[MercadoPagoWebhook] Transação encontrada:', transaction.id);

      // Mapear status do Mercado Pago para status da transação
      let transactionStatus;
      switch (status) {
        case 'approved':
          transactionStatus = 'approved';
          break;
        case 'pending':
          transactionStatus = 'pending';
          break;
        case 'in_process':
          transactionStatus = 'pending';
          break;
        case 'rejected':
          transactionStatus = 'rejected';
          break;
        case 'cancelled':
          transactionStatus = 'rejected';
          break;
        case 'refunded':
          transactionStatus = 'refunded';
          break;
        default:
          transactionStatus = 'pending';
      }

      // Atualizar a transação com o novo status
      try {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: transactionStatus,
            updated_at: new Date().toISOString(),
            metadata: {
              ...transaction.metadata,
              payment_data: paymentData,
              webhook_processed_at: new Date().toISOString(),
              email: paymentData.payer?.email || transaction.metadata?.email,
              customer_name: paymentData.payer?.first_name 
                ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`
                : transaction.customer_name
            }
          })
          .eq('id', transaction.id);

        if (updateError) {
          console.error('[MercadoPagoWebhook] Erro ao atualizar transação:', updateError);
          return NextResponse.json({ 
            warning: 'Erro ao atualizar transação, mas webhook aceito',
            transaction_id: transaction.id
          }, { status: 200 });
        }

        console.log('[MercadoPagoWebhook] Transação atualizada com status:', transactionStatus);
      } catch (updateError) {
        console.error('[MercadoPagoWebhook] Exceção ao atualizar transação:', updateError);
        return NextResponse.json({ 
          warning: 'Exceção ao atualizar transação, mas webhook aceito',
          transaction_id: transaction.id
        }, { status: 200 });
      }

      // Se o pagamento foi aprovado, processar a transação
      if (status === 'approved' && transaction.status !== 'approved') {
        console.log('[MercadoPagoWebhook] Pagamento aprovado, processando transação...');
        
        // Atualizar os dados do cliente na transação
        if (paymentData.payer?.email) {
          try {
            const { error: customerUpdateError } = await supabase
              .from('transactions')
              .update({
                customer_email: paymentData.payer.email,
                customer_name: paymentData.payer.first_name 
                  ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`
                  : transaction.customer_name
              })
              .eq('id', transaction.id);
            
            if (customerUpdateError) {
              console.error('[MercadoPagoWebhook] Erro ao atualizar dados do cliente:', customerUpdateError);
            } else {
              console.log('[MercadoPagoWebhook] Dados do cliente atualizados com sucesso');
            }
          } catch (customerError) {
            console.error('[MercadoPagoWebhook] Exceção ao atualizar dados do cliente:', customerError);
          }
        }
        
        try {
          const result = await processTransaction(transaction.id);
          console.log('[MercadoPagoWebhook] Transação processada com sucesso:', result);
          return NextResponse.json({ 
            message: 'Pagamento processado com sucesso', 
            transaction_id: transaction.id,
            order_id: result.id 
          }, { status: 200 });
        } catch (error: unknown) {
          const processingError = error as ProcessingError;
          console.error('[MercadoPagoWebhook] Erro ao processar transação:', processingError);
          // Mesmo em caso de erro no processamento, retornamos status 200
          // para que o Mercado Pago não reenvie o webhook
          return NextResponse.json({ 
            warning: 'Erro ao processar transação, mas webhook aceito',
            transaction_id: transaction.id
          });
        }
      }

      // Depois de atualizar o status da transação, verificar se podemos processar automaticamente
      // Adicionar após atualizar o status da transação para 'approved'
      if (status === 'approved' && finalTransactions && finalTransactions.length > 0) {
        const transaction = finalTransactions[0];
        
        // Verificar se o pedido já foi criado
        if (!transaction.order_created) {
          console.log('[MercadoPagoWebhook] Transação aprovada sem pedido criado, processando automaticamente:', transaction.id);
          
          try {
            // Verificar se a transação está sendo processada neste momento
            const { data: lockCheck } = await supabase
              .from('order_locks')
              .select('id')
              .eq('transaction_id', transaction.id)
              .single();
            
            if (lockCheck) {
              console.log('[MercadoPagoWebhook] Transação já está sendo processada por outro processo. Não iniciando novo processamento.');
              
              // Registrar evento de verificação de lock
              await supabase.from('transaction_logs').insert({
                transaction_id: transaction.id,
                event_type: 'webhook_processing_skipped',
                message: `Processamento automático via webhook ignorado para transação ${transaction.id} - já está em processamento`,
                metadata: {
                  payment_id: paymentId,
                  payment_status: status,
                  reason: 'already_processing'
                }
              });
              
              return NextResponse.json({ 
                message: 'Webhook recebido, transação já está em processamento',
                transaction_id: transaction.id
              }, { status: 200 });
            }
            
            // Registrar no log
            await supabase.from('transaction_logs').insert({
              transaction_id: transaction.id,
              event_type: 'webhook_auto_processing_start',
              message: `Iniciando processamento automático via webhook para transação ${transaction.id}`,
              metadata: {
                payment_id: paymentId,
                payment_status: status
              }
            });
            
            // Processar a transação
            const processingResult = await processTransaction(transaction.id);
            
            console.log('[MercadoPagoWebhook] Resultado do processamento automático:', processingResult);
            
            // Registrar o resultado
            await supabase.from('transaction_logs').insert({
              transaction_id: transaction.id,
              event_type: 'webhook_auto_processing_complete',
              message: `Processamento automático via webhook concluído para transação ${transaction.id}`,
              metadata: {
                processing_result: processingResult,
                success: !!processingResult.success
              }
            });
            
            console.log('[MercadoPagoWebhook] Processamento automático concluído com sucesso');
          } catch (error: unknown) {
            const processingError = error as ProcessingError;
            console.error('[MercadoPagoWebhook] Erro ao processar transação automaticamente:', processingError);
            
            // Registrar o erro
            await supabase.from('transaction_logs').insert({
              transaction_id: transaction.id,
              event_type: 'webhook_auto_processing_error',
              message: `Erro no processamento automático via webhook para transação ${transaction.id}`,
              metadata: {
                error: processingError.message || 'Erro desconhecido'
              }
            });
          }
        } else {
          console.log('[MercadoPagoWebhook] Transação já possui pedido criado:', transaction.id);
        }
      }

      return NextResponse.json({ 
        message: 'Notificação processada com sucesso',
        transaction_id: transaction.id,
        payment_status: status,
        transaction_status: transactionStatus
      }, { status: 200 });
    } catch (apiError) {
      console.error('[MercadoPagoWebhook] Erro ao processar pagamento:', apiError);
      // Retornar 200 mesmo em caso de erro para evitar que o Mercado Pago tente novamente
      return NextResponse.json({ 
        warning: 'Erro ao processar pagamento, mas webhook aceito',
        error_details: apiError instanceof Error ? apiError.message : String(apiError)
      });
    }
  } catch (error) {
    console.error('[MercadoPagoWebhook] Erro ao processar webhook:', error);
    // Retornar 200 mesmo em caso de erro para evitar que o Mercado Pago tente novamente
    return NextResponse.json({ 
      warning: 'Erro ao processar webhook, mas requisição aceita',
      error_details: error instanceof Error ? error.message : String(error)
    });
  }
}
