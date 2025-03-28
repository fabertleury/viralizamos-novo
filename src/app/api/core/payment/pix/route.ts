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
    
    // Melhorar o log, excluindo detalhes desnecessários de posts
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
      console.error('[API] Dados incompletos para criar pagamento:', {
        has_service: !!body.service,
        has_service_id: body.service && !!body.service.id,
        has_profile: !!body.profile,
        has_profile_username: body.profile && !!body.profile.username,
        has_customer: !!body.customer,
        has_customer_email: body.customer && !!body.customer.email
      });
      
      return NextResponse.json(
        { error: 'Dados incompletos para criar pagamento. Verifique se o serviço, perfil e cliente estão preenchidos corretamente.' },
        { status: 400 }
      );
    }
    
    // Validar que temos um valor válido para o pagamento
    const paymentAmount = body.amount || body.service.price || body.service.preco;
    if (!paymentAmount || paymentAmount <= 0) {
      console.error('[API] Valor de pagamento inválido:', {
        amount: body.amount,
        service_price: body.service.price,
        service_preco: body.service.preco,
        calculated_payment_amount: paymentAmount
      });
      
      return NextResponse.json(
        { error: 'Valor de pagamento inválido. Verifique se o valor está sendo enviado corretamente.' },
        { status: 400 }
      );
    }

    // Buscar o serviço completo do banco de dados para garantir que temos o provider_id correto
    console.log(`[API] Buscando serviço completo com ID: ${service.id}`);
    const supabase = createClient();
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service.id)
      .single();
      
    if (serviceError) {
      console.error('[API] Erro ao buscar serviço completo:', {
        error_code: serviceError.code,
        error_message: serviceError.message,
        error_details: serviceError.details,
        service_id: service.id
      });
      
      return NextResponse.json(
        { error: `Erro ao buscar serviço: ${serviceError.message}` },
        { status: 500 }
      );
    }
    
    if (!serviceData) {
      console.error(`[API] Serviço com ID ${service.id} não encontrado no banco de dados`);
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }
    
    // Usar o serviço completo do banco de dados
    const completeService = {
      ...service,
      provider_id: serviceData.provider_id // Garantir que estamos usando o provider_id correto do banco de dados
    };
    
    console.log('[API] Serviço completo do banco de dados:', {
      id: completeService.id,
      name: completeService.name,
      provider_id: completeService.provider_id
    });
    
    // Usar o amount do body ou calcular a partir do service.price
    const finalAmount = amount || completeService.price || completeService.preco || 0;

    console.log('[API] Valor do pagamento:', finalAmount);

    // Inicializar o serviço de pagamento
    const paymentService = new PaymentService();
    
    try {
      // Primeiro criar o pagamento no Mercado Pago para obter o QR code
      console.log('[API] Criando pagamento PIX no Mercado Pago...');
      // Configurar o cliente do Mercado Pago
      if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        console.error('[API] Token do Mercado Pago não configurado');
        throw new Error('Token do Mercado Pago não configurado');
      }
      mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');
      
      // Calcular data de expiração (30 minutos a partir de agora)
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 30);
      const expirationISOString = expirationDate.toISOString();
      
      // Criar o pagamento no Mercado Pago
      const mpResult = await mercadopago.payment.create({
        transaction_amount: Number(finalAmount),
        description: `${completeService.name} para @${profile.username}`,
        payment_method_id: 'pix',
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://viralizamos.com'}/api/webhooks/mercadopago`,
        date_of_expiration: expirationISOString,
        payer: {
          email: customer.email,
          first_name: customer.name?.split(' ')[0] || 'Cliente',
          last_name: customer.name?.split(' ').slice(1).join(' ') || 'Anônimo'
        },
        metadata: {
          service_id: completeService.id,
          service_name: completeService.name,
          profile_username: profile.username,
          customer_email: customer.email,
          customer_name: customer.name,
          customer_phone: customer.phone
        }
      });
      
      console.log('[API] Resposta do Mercado Pago:', {
        status: mpResult.status,
        payment_id: mpResult.body.id,
        status_detail: mpResult.body.status_detail,
        has_qr_code: !!mpResult.body.point_of_interaction?.transaction_data?.qr_code
      });
      
      if (!mpResult.body.point_of_interaction?.transaction_data?.qr_code) {
        console.error('[API] QR Code não encontrado na resposta do Mercado Pago');
        throw new Error('QR Code não encontrado na resposta');
      }
      
      // Obter QR code do Mercado Pago
      const paymentId = mpResult.body.id.toString();
      const qrCodeText = mpResult.body.point_of_interaction.transaction_data.qr_code;
      
      // Gerar QR Code em base64
      let qrCodeBase64 = '';
      try {
        // Gerar QR Code em base64 sem o prefixo data:image/png;base64,
        qrCodeBase64 = await QRCode.toDataURL(qrCodeText);
        // Remover o prefixo para armazenar apenas os dados base64
        qrCodeBase64 = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
        console.log('[API] QR Code gerado com sucesso');
      } catch (qrError) {
        console.error('[API] Erro ao gerar QR Code:', qrError);
        // Continuar mesmo se houver erro na geração do QR Code
      }
      
      // Obter o usuário atual (se autenticado)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      // Verificar se os posts têm quantity definido e preservar esses valores
      let processedPosts: InstagramPost[] = [];
      if (posts && posts.length > 0) {
        // Log detalhado para debug dos posts originais e seus formatos
        console.log('[API] DEBUG - Posts originais recebidos:', 
          posts.map(p => ({ 
            id: p.id, 
            code: p.code || p.shortcode,
            hasQuantity: 'quantity' in p,
            quantityValue: p.quantity,
            hasMetadata: !!p.metadata,
            metadataQuantity: p.metadata?.quantity,
            postCode: p.postCode,
            isFromStep2: !!(p.postCode && 'quantity' in p),
            allKeys: Object.keys(p)
          }))
        );
        
        // Se os posts têm um campo 'quantity', manter. Se têm um campo metadata com quantity, extrair.
        processedPosts = posts.map((post, index) => {
          // Verificar se o post tem a propriedade quantity (forma mais comum)
          if (typeof post.quantity === 'number') {
            console.log(`[API] DEBUG - Post ${index} (${post.id || post.code}) tem quantity definido: ${post.quantity}`);
            return { ...post };
          }
          
          // Verificar se o post tem metadata.quantity
          if (post.metadata && typeof post.metadata.quantity === 'number') {
            console.log(`[API] DEBUG - Post ${index} (${post.id || post.code}) tem metadata.quantity: ${post.metadata.quantity}`);
            return { ...post, quantity: post.metadata.quantity };
          }
          
          // Para posts que vêm do componente InstagramPostsReelsStep2, a quantidade está nos metadados como 'quantity'
          if (post.postCode && typeof post.quantity === 'number') {
            console.log(`[API] DEBUG - Post ${index} do InstagramPostsReelsStep2 (${post.postId || post.id}) com quantity: ${post.quantity}`);
            return {
              id: post.postId || post.id,
              code: post.postCode || post.code,
              url: post.postLink || post.url,
              quantity: post.quantity,
              caption: post.caption
            };
          }
          
          // Se não tem quantidade específica, retornar o post original
          console.log(`[API] DEBUG - Post ${index} (${post.id || post.code}) sem quantidade definida`);
          return { ...post };
        });
        
        console.log('[API] Posts processados com quantidades:', 
          processedPosts.map((p, index) => ({ 
            index,
            id: p.id, 
            code: p.code || p.postCode, 
            quantity: p.quantity,
            hasQuantity: typeof p.quantity === 'number'
          }))
        );
      }
      
      // Calcular a quantidade total somando as quantidades individuais dos posts
      let totalServiceQuantity = 0;
      const postsToUse = processedPosts.length > 0 ? processedPosts : posts;
      
      // Verificar se todos os posts têm quantidade definida
      const allPostsHaveQuantity = postsToUse.every(post => typeof post.quantity === 'number');
      
      if (allPostsHaveQuantity) {
        // Somar as quantidades de todos os posts
        totalServiceQuantity = postsToUse.reduce((sum, post) => sum + (typeof post.quantity === 'number' ? post.quantity : 0), 0);
        console.log(`[API] Quantidade total calculada dos posts: ${totalServiceQuantity}`);
      } else {
        // Se nem todos os posts têm quantidade, buscar a quantidade do serviço
        console.log(`[API] Nem todos os posts têm quantidade definida. Usando quantidade do serviço.`);
        
        // Buscar a quantidade do serviço completo
        if (serviceData && typeof serviceData.quantidade === 'number') {
          totalServiceQuantity = serviceData.quantidade;
          console.log(`[API] Quantidade obtida do serviço: ${totalServiceQuantity}`);
          
          // Se usamos a quantidade do serviço, calcular a distribuição entre os posts
          const baseQuantity = Math.floor(totalServiceQuantity / postsToUse.length);
          const remainder = totalServiceQuantity % postsToUse.length;
          
          console.log(`[API] Distribuindo quantidade ${totalServiceQuantity} entre ${postsToUse.length} posts: base=${baseQuantity}, remainder=${remainder}`);
          
          // Atribuir quantidades aos posts que não têm
          postsToUse.forEach((post, index) => {
            if (typeof post.quantity !== 'number') {
              post.quantity = baseQuantity + (index < remainder ? 1 : 0);
              console.log(`[API] Atribuindo quantidade ${post.quantity} para post ${index} (${post.id || post.code})`);
            }
          });
          
          // Verificar se a soma bate com o total
          const totalAfterDistribution = postsToUse.reduce((sum, post) => sum + (post.quantity || 0), 0);
          console.log(`[API] Total após distribuição: ${totalAfterDistribution} (deveria ser ${totalServiceQuantity})`);
        }
      }
      
      // Log final dos posts que serão enviados para o PaymentService
      console.log('[API] Posts finais que serão enviados para o PaymentService:', 
        postsToUse.map((post, index) => ({ 
          index,
          id: post.id, 
          code: post.code || post.postCode, 
          quantity: post.quantity,
          hasFinalQuantity: typeof post.quantity === 'number'
        }))
      );
      
      // Agora criar a transação com o QR code já gerado
      const paymentResult = await paymentService.createPixPayment({
        userId,
        serviceId: completeService.id,
        amount: finalAmount,
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
        paymentId: paymentId,
        posts: postsToUse,
        qrCode: qrCodeText,
        qrCodeBase64: qrCodeBase64,
        quantity: totalServiceQuantity // Passar explicitamente a quantidade total
      });

      if (!paymentResult.success) {
        console.error('[API] Erro ao criar pagamento PIX:', {
          error: "Falha ao criar transação",
          service_id: completeService.id,
          profile_username: profile.username
        });
        
        return NextResponse.json(
          { error: "Falha ao criar transação no banco de dados" },
          { status: 500 }
        );
      }

      console.log('[API] Pagamento PIX criado com sucesso:', paymentId);
      
      // Retornar os dados necessários para o frontend
      return NextResponse.json({
        transaction_id: paymentResult.transaction?.id || '',
        payment_id: paymentId,
        qr_code: qrCodeText,
        qr_code_base64: qrCodeBase64,
        status: 'pending',
        message: 'Pagamento PIX criado com sucesso'
      });
    } catch (paymentServiceError) {
      // Capturar erros específicos do serviço de pagamento
      console.error('[API] Erro no serviço de pagamento:', {
        error: paymentServiceError instanceof Error ? paymentServiceError.message : 'Erro desconhecido',
        stack: paymentServiceError instanceof Error ? paymentServiceError.stack : undefined,
        name: paymentServiceError instanceof Error ? paymentServiceError.name : 'UnknownError'
      });
      
      const errorMessage = paymentServiceError instanceof Error
        ? paymentServiceError.message
        : 'Erro desconhecido ao processar pagamento';
        
      return NextResponse.json(
        { error: `Erro com o Mercado Pago: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] Erro no endpoint de pagamento PIX:', error);
    
    // Tentar obter detalhes mais específicos do erro
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      name: error instanceof Error ? error.name : 'UnknownError',
      stack: error instanceof Error ? error.stack : undefined
    };
    
    console.error('[API] Detalhes do erro:', errorDetails);
    
    return NextResponse.json(
      { error: errorDetails.message },
      { status: 500 }
    );
  }
} 