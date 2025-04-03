import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/payment-service/lib/providers/mercadopago';
import { IdempotencyService } from '@/payment-service/lib/idempotency/idempotencyService';
import { createClient } from '@/lib/supabase/server';
import { QueueWorker } from '@/payment-service/lib/queue/worker';

// Certificar que o worker está rodando
const startWorker = () => {
  QueueWorker.getInstance().start();
};

// Iniciar o worker quando este módulo for carregado
startWorker();

export async function POST(request: NextRequest) {
  try {
    // Obter e validar os dados da requisição
    const body = await request.json();
    console.log('Requisição de criação de pagamento recebida:', {
      service: body.service?.id,
      profile: body.profile?.username,
      customer: body.customer?.email,
      posts: body.posts?.length
    });
    
    // Validar dados obrigatórios
    if (!body.service || !body.profile || !body.customer) {
      return NextResponse.json(
        { error: 'Dados incompletos para criar pagamento' },
        { status: 400 }
      );
    }
    
    const { service, profile, customer, posts = [], amount } = body;
    
    // Buscar informações completas do serviço
    const supabase = createClient();
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service.id)
      .single();
    
    if (serviceError || !serviceData) {
      console.error('Erro ao buscar serviço:', serviceError || 'Serviço não encontrado');
      return NextResponse.json(
        { error: 'Serviço não encontrado ou inválido' },
        { status: 404 }
      );
    }
    
    // Construir dados completos do serviço
    const completeService = {
      ...service,
      provider_id: serviceData.provider_id // Usar o provider_id do banco
    };
    
    // Usar valor do serviço ou personalizado
    const paymentAmount = amount || completeService.price || completeService.preco || 0;
    
    // Preparar metadados do pagamento
    const paymentData = {
      service_id: completeService.id,
      provider_id: completeService.provider_id,
      customer_email: customer.email,
      target_username: profile.username,
      amount: paymentAmount
    };
    
    // Processar posts (se houver)
    const processedPosts = posts.map((post: any) => {
      // Processar código/URL do post
      const postCode = extractPostCode(post);
      
      return {
        id: post.id,
        code: postCode,
        username: post.username || profile.username,
        caption: post.caption || '',
        url: `https://instagram.com/p/${postCode}`
      };
    });
    
    // Processar solicitação de forma idempotente
    const result = await IdempotencyService.processIdempotentRequest(
      paymentData,
      async (data, idempotencyKey) => {
        // Criar pagamento no Mercado Pago
        const pixPayment = await MercadoPagoService.createPixPayment(
          Number(data.amount),
          `${completeService.name} para @${profile.username}`,
          {
            email: customer.email,
            name: customer.name,
            phone: customer.phone
          },
          {
            service_id: completeService.id,
            service_name: completeService.name,
            profile_username: profile.username,
            customer_email: customer.email
          }
        );
        
        // Salvar transação no banco de dados
        const { data: user } = await supabase.auth.getUser();
        const userId = user.user?.id || null;
        
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'payment',
            amount: Number(data.amount),
            status: pixPayment.status,
            payment_method: 'pix',
            payment_id: pixPayment.payment_id,
            payment_external_reference: pixPayment.external_reference,
            external_id: pixPayment.payment_id,
            payment_qr_code: pixPayment.qr_code,
            payment_qr_code_base64: pixPayment.qr_code_base64,
            service_id: completeService.id,
            order_created: false,
            customer_name: customer.name || 'N/A',
            customer_email: customer.email || 'N/A',
            customer_phone: customer.phone || 'N/A',
            target_username: profile.username || 'N/A',
            target_full_name: profile.full_name || 'N/A',
            target_profile_link: profile.link || `https://instagram.com/${profile.username}`,
            idempotency_key: idempotencyKey,
            metadata: {
              service: {
                id: completeService.id,
                provider_id: completeService.provider_id || null,
                name: completeService.name,
                quantity: completeService.quantity
              },
              profile: {
                username: profile.username,
                full_name: profile.full_name,
                link: profile.link || `https://instagram.com/${profile.username}`
              },
              customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone
              },
              posts: processedPosts,
              payment: {
                id: pixPayment.payment_id,
                qr_code: pixPayment.qr_code,
                qr_code_base64: pixPayment.qr_code_base64
              }
            }
          })
          .select()
          .single();
        
        if (transactionError) {
          console.error('Erro ao salvar transação:', transactionError);
          throw new Error(`Erro ao salvar transação: ${transactionError.message}`);
        }
        
        return transaction;
      }
    );
    
    // Retornar dados do pagamento
    return NextResponse.json({
      qr_code: result.transaction.payment_qr_code,
      qr_code_base64: result.transaction.payment_qr_code_base64,
      id: result.transaction.payment_id,
      status: result.transaction.status,
      transaction_id: result.transaction.id,
      is_new: result.isNew
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar pagamento' },
      { status: 500 }
    );
  }
}

/**
 * Função auxiliar para extrair o código correto de um post do Instagram
 */
function extractPostCode(post: any): string {
  // Se o post já tem um código que não é numérico, usar esse código
  if (post.code && !/^\d+$/.test(post.code)) {
    return post.code;
  }
  
  // Se tem shortcode, usar o shortcode
  if (post.shortcode) {
    return post.shortcode;
  }
  
  // Se tem permalink ou link, extrair o código da URL
  if (post.permalink || post.link || post.url) {
    const url = post.permalink || post.link || post.url;
    const match = url.match(/instagram\.com\/p\/([^\/]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Se nada funcionar, usar o ID (não ideal, mas é o que temos)
  return post.id;
} 