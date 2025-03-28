import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderProcessor } from '@/lib/transactions/modules/orderProcessor';
import { ProviderService } from '@/lib/transactions/modules/provider/providerService';

export async function POST(request: NextRequest) {
  try {
    const currentTime = new Date().toISOString();
    console.log(`[MercadoPagoWebhook] Recebendo notificação`);
    
    // Extrair cabeçalhos importantes
    const userAgent = request.headers.get('User-Agent') || '';
    const contentType = request.headers.get('Content-Type') || '';
    const signature = request.headers.get('X-Signature') || '';
    const requestId = request.headers.get('X-Request-ID') || '';
    
    console.log(`[MercadoPagoWebhook] User-Agent: ${userAgent}`);
    console.log(`[MercadoPagoWebhook] Content-Type: ${contentType}`);
    console.log(`[MercadoPagoWebhook] X-Signature: ${signature}`);
    console.log(`[MercadoPagoWebhook] X-Request-ID: ${requestId}`);
    
    // Extrair timestamp da assinatura
    const timestampMatch = signature.match(/ts=(\d+)/);
    const timestamp = timestampMatch ? timestampMatch[1] : '';
    console.log(`[MercadoPagoWebhook] Timestamp da assinatura: ${timestamp}`);
    
    // Extrair a assinatura v1
    const signatureMatch = signature.match(/v1=([a-f0-9]+)/);
    const signatureV1 = signatureMatch ? signatureMatch[1] : '';
    console.log(`[MercadoPagoWebhook] Assinatura v1: ${signatureV1}`);
    
    // Capturar o corpo da requisição como texto
    const bodyText = await request.text();
    console.log(`[MercadoPagoWebhook] Corpo da requisição (texto): ${bodyText}`);
    
    // Transformar o texto em objeto JSON
    const body = JSON.parse(bodyText);
    console.log(`[MercadoPagoWebhook] Corpo da requisição (JSON):`, body);
    
    // Verificar os dados do webhook
    const { resource, topic } = body;
    
    // Se não for uma notificação de pagamento, retornamos um erro
    if (topic !== 'payment') {
      console.log(`[MercadoPagoWebhook] Tópico não reconhecido: ${topic}`);
      return NextResponse.json({ success: false, error: 'Tópico não reconhecido' }, { status: 400 });
    }
    
    // O resource contém o id do pagamento
    const paymentId = resource;
    console.log(`[MercadoPagoWebhook] ID do pagamento: ${paymentId}`);
    
    // Consultar o status do pagamento
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error(`[MercadoPagoWebhook] Erro ao consultar pagamento: ${errorText}`);
      return NextResponse.json({ success: false, error: 'Erro ao consultar pagamento' }, { status: 500 });
    }
    
    const paymentData = await paymentResponse.json();
    const { status, external_reference } = paymentData;
    
    console.log(`[MercadoPagoWebhook] Status do pagamento: ${status}`);
    console.log(`[MercadoPagoWebhook] Referência externa: ${external_reference}`);
    
    // Inicializar o cliente do Supabase
    const supabase = createClient();
    
    // Buscar a transação pelo ID
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', external_reference)
      .single();
    
    if (transactionError || !transaction) {
      console.error(`[MercadoPagoWebhook] Erro ao buscar transação: ${transactionError?.message || 'Transação não encontrada'}`);
      return NextResponse.json({ success: false, error: 'Transação não encontrada' }, { status: 404 });
    }
    
    console.log(`[MercadoPagoWebhook] Transação encontrada: ${transaction.id}`);
    
    // Atualizar o status da transação no banco
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: status,
        updated_at: currentTime,
        metadata: {
          ...transaction.metadata,
          payment_status: status,
          payment_updated_at: currentTime
        }
      })
      .eq('id', transaction.id);
    
    if (updateError) {
      console.error(`[MercadoPagoWebhook] Erro ao atualizar transação: ${updateError.message}`);
      return NextResponse.json({ success: false, error: 'Erro ao atualizar transação' }, { status: 500 });
    }
    
    console.log(`[MercadoPagoWebhook] Transação atualizada com status: ${status}`);
    
    // Se o pagamento foi aprovado, processar o pedido imediatamente
    if (status === 'approved') {
      try {
        console.log(`[MercadoPagoWebhook] Pagamento aprovado, processando pedido automaticamente...`);
        
        // Verificar se já existem pedidos para esta transação
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('transaction_id', transaction.id);
        
        if (existingOrders && existingOrders.length > 0) {
          console.log(`[MercadoPagoWebhook] Já existem ${existingOrders.length} pedidos para esta transação, ignorando processamento automático`);
          return NextResponse.json({ success: true, message: 'Pagamento processado, pedidos já existem' });
        }
        
        // Obter o provedor pelo ID do serviço
        const providerService = new ProviderService();
        const provider = await providerService.getProviderByServiceId(transaction.service_id);
        
        if (!provider) {
          console.error(`[MercadoPagoWebhook] Provedor não encontrado para o serviço ${transaction.service_id}`);
          
          // Registrar erro no log da transação
          await supabase
            .from('transaction_logs')
            .insert({
              transaction_id: transaction.id,
              level: 'error',
              message: `Erro ao processar pedido automaticamente: Provedor não encontrado para o serviço ${transaction.service_id}`,
              metadata: {
                service_id: transaction.service_id,
                created_at: currentTime
              }
            });
            
          return NextResponse.json({ success: false, error: 'Provedor não encontrado' }, { status: 500 });
        }
        
        // Instanciar o processador de pedidos
        const orderProcessor = new OrderProcessor();
        
        // Determinar o tipo de checkout com base nos metadados da transação
        const checkoutType = transaction.metadata?.checkout_type || '';
        
        let result;
        
        // Processar o pedido de acordo com o tipo
        if (checkoutType.includes('curtidas') || transaction.metadata?.posts) {
          console.log(`[MercadoPagoWebhook] Processando pedido de curtidas`);
          const posts = transaction.metadata?.posts || transaction.metadata?.selectedPosts || [];
          const username = transaction.metadata?.username || transaction.metadata?.profile?.username;
          
          result = await orderProcessor.processLikesOrder(transaction, provider, posts, username);
        } 
        else if (checkoutType.includes('reels') || transaction.metadata?.reels) {
          console.log(`[MercadoPagoWebhook] Processando pedido de reels`);
          const reels = transaction.metadata?.reels || transaction.metadata?.selectedReels || [];
          const username = transaction.metadata?.username || transaction.metadata?.profile?.username;
          
          result = await orderProcessor.processReelsOrder(transaction, provider, reels, username);
        }
        else {
          // Processar pedido genérico (único link/username)
          console.log(`[MercadoPagoWebhook] Processando pedido genérico`);
          const targetLink = transaction.metadata?.target_link || transaction.metadata?.link;
          const username = transaction.metadata?.username || transaction.metadata?.profile?.username;
          
          if (!targetLink) {
            console.error(`[MercadoPagoWebhook] Link alvo não encontrado nos metadados da transação`);
            
            // Registrar erro no log da transação
            await supabase
              .from('transaction_logs')
              .insert({
                transaction_id: transaction.id,
                level: 'error',
                message: 'Erro ao processar pedido automaticamente: Link alvo não encontrado',
                metadata: {
                  transaction_metadata: transaction.metadata,
                  created_at: currentTime
                }
              });
              
            return NextResponse.json({ success: false, error: 'Link alvo não encontrado' }, { status: 400 });
          }
          
          result = await orderProcessor.processOrderGeneric(transaction, provider, targetLink, username);
        }
        
        // Registrar resultado no log da transação
        await supabase
          .from('transaction_logs')
          .insert({
            transaction_id: transaction.id,
            level: 'info',
            message: 'Pedido processado automaticamente após confirmação do pagamento',
            metadata: {
              result: result,
              created_at: currentTime
            }
          });
          
        // Atualizar o status da transação para 'processed'
        await supabase
          .from('transactions')
          .update({ 
            status: 'processed',
            updated_at: currentTime,
            metadata: {
              ...transaction.metadata,
              processing_status: 'success',
              processing_completed_at: currentTime
            }
          })
          .eq('id', transaction.id);
          
        console.log(`[MercadoPagoWebhook] Pedido processado automaticamente com sucesso`);
        
        return NextResponse.json({ success: true, message: 'Pagamento aprovado e pedido processado automaticamente' });
      } catch (error) {
        console.error(`[MercadoPagoWebhook] Erro ao processar pedido automaticamente: ${error}`);
        
        // Registrar erro no log da transação
        await supabase
          .from('transaction_logs')
          .insert({
            transaction_id: transaction.id,
            level: 'error',
            message: `Erro ao processar pedido automaticamente: ${error}`,
            metadata: {
              error_stack: error instanceof Error ? error.stack : null,
              created_at: currentTime
            }
          });
          
        // A transação continuará como 'approved' e será processada pelo job de processamento
        return NextResponse.json({ success: false, error: 'Erro ao processar pedido automaticamente' }, { status: 500 });
      }
    }
    
    // Tudo ok, retornar sucesso
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[MercadoPagoWebhook] Erro geral: ${error}`);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
} 