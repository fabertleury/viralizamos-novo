import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mercadopago from 'mercadopago';
import QRCode from 'qrcode';
import { processTransaction } from '@/lib/transactions/transactionProcessor';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';
import { transactionMonitoring } from '@/lib/monitoring/transactionMonitoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    // Validar os dados necessários
    if (!body.service || !body.profile || !body.customer) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const { service, profile, customer, posts = [], amount } = body;
    
    // Buscar o serviço completo do banco de dados para garantir que temos o provider_id correto
    console.log(`Buscando serviço completo com ID: ${service.id}`);
    const supabase = createClient();
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service.id)
      .single();
      
    if (serviceError) {
      console.error('Erro ao buscar serviço completo:', serviceError);
      return NextResponse.json(
        { error: `Erro ao buscar serviço: ${serviceError.message}` },
        { status: 500 }
      );
    }
    
    if (!serviceData) {
      console.error(`Serviço com ID ${service.id} não encontrado no banco de dados`);
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
    
    console.log('Serviço completo do banco de dados:', {
      id: completeService.id,
      name: completeService.name,
      provider_id: completeService.provider_id
    });
    
    // Usar o amount do body ou calcular a partir do service.price
    const paymentAmount = amount || completeService.price || completeService.preco || 0;

    // Não forçar mais um valor mínimo, usar o valor real do serviço
    const finalAmount = paymentAmount;

    console.log('Valor do pagamento:', finalAmount);

    // Verificar se o token do Mercado Pago está configurado
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Configuração incompleta' },
        { status: 500 }
      );
    }

    // Configurar o cliente do Mercado Pago
    mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');

    // Função para extrair o código correto de um post do Instagram
    const extractPostCode = (post: any): string => {
      // Se o post já tem um código que não é numérico, usar esse código
      if (post.code && !/^\d+$/.test(post.code)) {
        console.log('✅ Usando código existente:', post.code);
        return post.code;
      }
      
      // Se tem shortcode, usar o shortcode
      if (post.shortcode) {
        console.log('✅ Usando shortcode:', post.shortcode);
        return post.shortcode;
      }
      
      // Se tem permalink ou link, extrair o código da URL
      if (post.permalink || post.link || post.url) {
        const url = post.permalink || post.link || post.url;
        const match = url.match(/instagram\.com\/p\/([^\/]+)/);
        if (match && match[1]) {
          console.log('✅ Código extraído da URL:', match[1]);
          return match[1];
        }
      }
      
      // Se nada funcionar, usar o ID (não ideal, mas é o que temos)
      console.warn('⚠️ Não foi possível extrair um código curto válido, usando ID:', post.id);
      return post.id;
    };

    // Processar os posts (se houver)
    const processedPosts = posts.map((post: any) => {
      // Garantir que estamos usando o campo 'code' correto para o link do Instagram
      // Priorizar o campo 'code' sobre 'shortcode' ou 'id', conforme as boas práticas
      const postCode = extractPostCode(post);
      
      console.log('🔍 Processando post/reel na API de pagamento:', {
        id: post.id,
        code: post.code,
        shortcode: post.shortcode,
        postCode: postCode,
        finalUrl: `https://instagram.com/p/${postCode}`
      });
      
      return {
        id: post.id,
        code: postCode, // Armazenar o código correto
        username: post.username || profile.username,
        caption: post.caption || '',
        url: `https://instagram.com/p/${postCode}` // Garantir o formato correto do link
      };
    });

    // Calcular data de expiração (30 minutos a partir de agora)
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);
    const expirationISOString = expirationDate.toISOString();

    // Criar o pagamento no Mercado Pago
    console.log('Criando pagamento PIX no Mercado Pago...');
    const result = await mercadopago.payment.create({
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

    console.log('Resposta do Mercado Pago:', JSON.stringify(result, null, 2));

    // Gerar QR Code em base64
    const qrCodeText = result.body.point_of_interaction.transaction_data.qr_code;
    let qrCodeBase64 = '';
    
    try {
      // Gerar QR Code em base64 sem o prefixo data:image/png;base64,
      qrCodeBase64 = await QRCode.toDataURL(qrCodeText);
      // Remover o prefixo para armazenar apenas os dados base64
      qrCodeBase64 = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
      console.log('QR Code gerado com sucesso');
    } catch (qrError) {
      console.error('Erro ao gerar QR Code:', qrError);
      // Continuar mesmo se houver erro na geração do QR Code
    }

    // Obter o usuário atual (se autenticado)
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id || null;

    // Salvar a transação no banco de dados
    console.log('Salvando transação no banco de dados...');
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        type: 'payment',
        amount: Number(finalAmount),
        status: 'pending',
        payment_method: 'pix',
        payment_id: result.body.id.toString(),
        payment_external_reference: result.body.id.toString(),
        external_id: result.body.id.toString(),
        payment_qr_code: result.body.point_of_interaction.transaction_data.qr_code,
        payment_qr_code_base64: qrCodeBase64,
        service_id: completeService.id,
        order_created: false,
        customer_name: customer.name || 'N/A',
        customer_email: customer.email || 'N/A',
        customer_phone: customer.phone || 'N/A',
        target_username: profile.username || 'N/A',
        target_full_name: profile.full_name || 'N/A',
        target_profile_link: profile.link || `https://instagram.com/${profile.username}`,
        metadata: {
          service: {
            id: completeService.id,
            provider_id: completeService.provider_id || null, // Usar o provider_id do banco de dados
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
            id: result.body.id,
            qr_code: result.body.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: qrCodeBase64
          }
        }
      })
      .select();

    // Log detalhado dos dados salvos
    console.log('Dados da transação salvos:', JSON.stringify({
      columnData: {
        user_id,
        type: 'payment',
        amount: Number(finalAmount),
        status: 'pending',
        payment_method: 'pix',
        service_id: completeService.id,
        customer_name: customer.name || 'N/A',
        customer_email: customer.email || 'N/A',
        customer_phone: customer.phone || 'N/A',
        target_username: profile.username || 'N/A',
        target_full_name: profile.full_name || 'N/A',
        target_profile_link: profile.link || `https://instagram.com/${profile.username}`,
      },
      metadataData: {
        service: {
          id: completeService.id,
          provider_id: completeService.provider_id || null, // Usar o provider_id do banco de dados
          name: completeService.name,
          quantity: completeService.quantity
        },
        posts: processedPosts
      }
    }, null, 2));

    if (transactionError) {
      throw transactionError;
    }

    // Registrar a transação no sistema de monitoramento
    if (transaction && transaction.length > 0) {
      // Garantir que o status seja passado corretamente
      const transactionData = {
        ...transaction[0],
        status: 'pending' // Forçar o status como 'pending' para garantir
      };
      await transactionMonitoring.logTransaction(transactionData);
      console.log(`Transação ${transaction[0].id} registrada no sistema de monitoramento com status 'pending'`);
    }

    // Se o pagamento foi aprovado, processar a transação
    if (result.body.status === 'approved') {
      try {
        // Processar a transação (criar pedidos)
        const orders = await processTransaction(transaction[0].id);
        
        // Se temos pedidos, atualizar a transação com o ID do primeiro pedido
        if (orders && orders.length > 0) {
          const { error: updateOrderIdError } = await supabase
            .from('transactions')
            .update({
              order_created: true,
              order_id: orders[0].id
            })
            .eq('id', transaction[0].id);
          
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
            .eq('id', transaction[0].id);
          
          if (updateOrderCreatedError) {
            console.error('Erro ao atualizar flag order_created:', updateOrderCreatedError);
          }
        }
      } catch (error) {
        console.error('Erro ao processar transação:', error);
        
        // Mesmo com erro, continuamos para retornar o status do pagamento
        // O erro será registrado no log e na transação
      }
    }

    // Iniciar verificador em segundo plano para este pagamento
    const checker = BackgroundPaymentChecker.getInstance();
    await checker.startChecking();
    
    console.log(`Verificador de pagamento em segundo plano iniciado para pagamento ${result.body.id}`);

    return NextResponse.json({
      qr_code: result.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: qrCodeBase64,
      id: result.body.id.toString(),
      status: result.body.status,
      transaction_id: transaction?.[0]?.id || null
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Error creating payment' },
      { status: 500 }
    );
  }
}
