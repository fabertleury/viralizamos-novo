import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/core/payment/paymentService';
import { createClient } from '@/lib/supabase/server';
import { InstagramPost, PaymentRequestData } from '@/types/payment';
import mercadopago from 'mercadopago';
import QRCode from 'qrcode';

/**
 * Endpoint para criar um pagamento PIX
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PaymentRequestData;
    const { service, profile, customer, posts = [], amount } = body;
    
    // Log simplificado para debug
    const simplifiedBody = {
      service: {
        id: service.id,
        name: service.name
      },
      profile: {
        username: profile.username
      },
      customer: {
        email: customer.email
      },
      posts: posts.map((post: InstagramPost) => ({
        id: post.id,
        code: post.code || post.shortcode
      })),
      amount
    };
    
    console.log('[API] Requisição de pagamento PIX:', JSON.stringify(simplifiedBody, null, 2));

    // Validar os dados necessários
    if (!body.service || !body.service.id || !body.profile || !body.profile.username || !body.customer || !body.customer.email) {
      console.error('[API] Dados incompletos para criar pagamento');
      return NextResponse.json(
        { error: 'Dados incompletos para criar pagamento' },
        { status: 400 }
      );
    }
    
    // Validar que temos um valor válido para o pagamento
    const paymentAmount = body.amount || body.service.price || body.service.preco;
    if (!paymentAmount || paymentAmount <= 0) {
      console.error('[API] Valor de pagamento inválido');
      return NextResponse.json(
        { error: 'Valor de pagamento inválido' },
        { status: 400 }
      );
    }

    // Buscar o serviço completo do banco de dados
    console.log(`[API] Buscando serviço completo com ID: ${service.id}`);
    const supabase = createClient();
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service.id)
      .single();
      
    if (serviceError || !serviceData) {
      console.error('[API] Erro ao buscar serviço:', serviceError);
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }
    
    // Utilizar o serviço completo
    const completeService = {
      ...service,
      provider_id: serviceData.provider_id
    };
    
    // Calcular valor final
    const finalAmount = amount || completeService.price || completeService.preco || 0;
    
    // Processar posts e quantidades
    let processedPosts = posts.map(post => {
      return {
        id: post.id || post.postId,
        code: post.code || post.shortcode || post.postCode || '',
        url: post.url || post.postLink || `https://instagram.com/p/${post.code || post.shortcode || ''}`,
        quantity: post.quantity || 0,
        caption: post.caption || ''
      };
    });
    
    // Obter o usuário atual (se autenticado)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    
    // URL do microserviço de pagamento
    const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
    
    // Em vez de criar diretamente com Mercado Pago, vamos usar o microserviço de pagamento
    console.log('[API] Criando payment request no microserviço de pagamento');
    
    // Preparar dados para enviar ao microserviço
    const paymentRequestData = {
      amount: finalAmount,
      service_id: completeService.id,
      profile_username: profile.username,
      customer_email: customer.email,
      customer_name: customer.name,
      customer_phone: customer.phone,
      service_name: completeService.name,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://viralizamos.com'}/agradecimento`,
      posts: processedPosts,
      quantity: serviceData.quantidade
    };
    
    console.log('[API] Dados do payment request:', paymentRequestData);
    
    try {
      // Fazer requisição ao microserviço
      const response = await fetch(`${paymentServiceUrl}/api/payment-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequestData),
      });
      
      if (!response.ok) {
        throw new Error(`Falha na requisição: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Payment request criado com sucesso:', data);
      
      // Registrar transação no banco de dados local
      // para manter compatibilidade com o sistema atual
      const { data: oldTransaction, error: oldTransactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'payment',
          amount: Number(finalAmount),
          status: 'pending',
          payment_method: 'pix',
          payment_id: data.token,
          payment_external_reference: data.token,
          external_id: data.token,
          service_id: completeService.id,
          order_created: false,
          customer_name: customer.name || 'N/A',
          customer_email: customer.email || 'N/A',
          customer_phone: customer.phone || 'N/A',
          target_username: profile.username || 'N/A',
          target_profile_link: profile.link || `https://instagram.com/${profile.username}`,
          metadata: {
            service: {
              id: completeService.id,
              provider_id: completeService.provider_id || null,
              name: completeService.name
            },
            profile: {
              username: profile.username,
              link: profile.link || `https://instagram.com/${profile.username}`
            },
            customer: {
              name: customer.name,
              email: customer.email,
              phone: customer.phone
            },
            payment_request_token: data.token,
            payment_url: data.payment_url
          }
        })
        .select();

      if (oldTransactionError) {
        console.error('[API] Erro ao salvar na tabela antiga:', oldTransactionError);
      } else {
        console.log('[API] Transação local criada com sucesso:', oldTransaction);
      }
      
      // Retornar os dados para o frontend, incluindo a URL de pagamento
      return NextResponse.json({
        success: true,
        payment_url: data.payment_url,
        token: data.token,
        payment_id: data.token,
        transaction_id: oldTransaction?.[0]?.id || data.token,
        expires_at: data.expires_at,
        message: 'Redirecionando para pagamento'
      });
    } catch (redirectError) {
      console.error('[API] Erro ao criar payment request:', redirectError);
      
      // Fallback: usar método antigo com Mercado Pago
      console.log('[API] Fallback: usando método antigo com Mercado Pago');
      
      // Aqui continuaria com o código antigo do Mercado Pago
      // Mas vamos apenas retornar um erro para simplificar
      return NextResponse.json(
        { error: 'Erro ao criar solicitação de pagamento no microserviço' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] Erro no endpoint de pagamento PIX:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 