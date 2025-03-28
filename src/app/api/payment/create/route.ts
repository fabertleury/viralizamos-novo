import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mercadopago from 'mercadopago';
import QRCode from 'qrcode';
import { processTransaction } from '@/lib/transactions/transactionProcessor';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    // Validar os dados necessários
    if (!body.service_id || !body.profile_username) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const { 
      service_id, 
      profile_username, 
      profile_url, 
      quantity, 
      amount, 
      customer_name, 
      customer_email, 
      customer_phone,
      checkout_type = 'mostrar-posts' // Valor padrão é 'mostrar-posts', mas pode ser 'apenas-link-usuario' ou outros
    } = body;
    
    // Buscar o serviço completo do banco de dados para garantir que temos o provider_id correto
    console.log(`Buscando serviço completo com ID: ${service_id}`);
    const supabase = createClient();
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single();
      
    if (serviceError) {
      console.error('Erro ao buscar serviço completo:', serviceError);
      return NextResponse.json(
        { error: `Erro ao buscar serviço: ${serviceError.message}` },
        { status: 500 }
      );
    }
    
    if (!serviceData) {
      console.error(`Serviço com ID ${service_id} não encontrado no banco de dados`);
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }
    
    // Usar o serviço completo do banco de dados
    const completeService = {
      id: serviceData.id,
      name: serviceData.name,
      provider_id: serviceData.provider_id,
      quantity: quantity || serviceData.quantidade,
      preco: serviceData.preco
    };
    
    console.log('Serviço completo do banco de dados:', {
      id: completeService.id,
      name: completeService.name,
      provider_id: completeService.provider_id,
      quantity: completeService.quantity,
      preco: completeService.preco
    });
    
    // Usar o amount do body ou calcular a partir do service.price
    const paymentAmount = amount || completeService.preco || 0;

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

    // Calcular data de expiração (30 minutos a partir de agora)
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);
    const expirationISOString = expirationDate.toISOString();

    // Criar o pagamento no Mercado Pago
    console.log('Criando pagamento PIX no Mercado Pago...');
    const result = await mercadopago.payment.create({
      transaction_amount: Number(finalAmount),
      description: `${completeService.name} para @${profile_username}`,
      payment_method_id: 'pix',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://viralizamos.com'}/api/webhooks/mercadopago?source_news=webhooks`,
      date_of_expiration: expirationISOString,
      payer: {
        email: customer_email,
        first_name: customer_name?.split(' ')[0] || 'Cliente',
        last_name: customer_name?.split(' ').slice(1).join(' ') || 'Anônimo'
      },
      metadata: {
        service_id: completeService.id,
        service_name: completeService.name,
        profile_username: profile_username,
        customer_email: customer_email,
        customer_name: customer_name,
        customer_phone: customer_phone,
        checkout_type: checkout_type
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
        customer_name: customer_name || 'N/A',
        customer_email: customer_email || 'N/A',
        customer_phone: customer_phone || 'N/A',
        target_username: profile_username || 'N/A',
        target_profile_link: profile_url || `https://instagram.com/${profile_username}`,
        metadata: {
          service: {
            id: completeService.id,
            provider_id: completeService.provider_id || null,
            name: completeService.name,
            quantity: completeService.quantity
          },
          profile: {
            username: profile_username,
            link: profile_url || `https://instagram.com/${profile_username}`
          },
          customer: {
            name: customer_name,
            email: customer_email,
            phone: customer_phone
          },
          checkout_type: checkout_type,
          payment: {
            id: result.body.id,
            qr_code: result.body.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: qrCodeBase64
          }
        }
      })
      .select();

    if (transactionError) {
      throw transactionError;
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
      }
    }

    // Iniciar verificador em segundo plano para este pagamento
    const checker = BackgroundPaymentChecker.getInstance();
    await checker.startChecking();
    
    console.log(`Verificador de pagamento em segundo plano iniciado para pagamento ${result.body.id}`);

    return NextResponse.json({
      qrCodeText: result.body.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: qrCodeBase64,
      paymentId: result.body.id.toString(),
      amount: Number(finalAmount),
      status: result.body.status,
      transaction_id: transaction?.[0]?.id || null
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Error creating payment' },
      { status: 500 }
    );
  }
}
