import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Verificar se as variáveis de ambiente existem
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_KEY não configurada');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { payment_id } = await request.json();

    if (!payment_id) {
      return NextResponse.json(
        { message: 'ID do pagamento não informado' },
        { status: 400 }
      );
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    // Buscar dados do pagamento
    const paymentData = await payment.get({ id: payment_id });
    console.log('Payment data:', paymentData);

    // O status vem dentro do response
    const paymentStatus = paymentData.response?.status || paymentData.status;
    if (!paymentStatus) {
      return NextResponse.json(
        { message: 'Status do pagamento não encontrado' },
        { status: 400 }
      );
    }

    // Buscar transação no Supabase
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_id', payment_id)
      .single();

    if (error) {
      console.error('Erro ao buscar transação:', error);
      return NextResponse.json(
        { message: 'Transação não encontrada', error: error.message },
        { status: 404 }
      );
    }

    // Verificar se o status mudou
    if (transaction.status !== paymentStatus) {
      console.log(`Status mudou de ${transaction.status} para ${paymentStatus}`);
      
      // Atualizar status no Supabase
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: paymentStatus,
          metadata: {
            ...transaction.metadata,
            payment_details: paymentData.response
          }
        })
        .eq('id', transaction.id);
      
      if (updateError) {
        console.error('Erro ao atualizar status:', updateError);
      }
      
      // Se o pagamento foi aprovado, processar o pedido
      if (paymentStatus === 'approved' && transaction.status !== 'approved') {
        console.log('Pagamento aprovado! Processando pedido...');
        
        // Extrair email dos metadados da transação
        const email = transaction.metadata?.email || 
                     transaction.metadata?.contact?.email || 
                     transaction.metadata?.profile?.email;
        
        // Extrair nome do usuário
        const userName = transaction.metadata?.profile?.full_name || 
                        transaction.metadata?.profile?.username || 
                        transaction.metadata?.target_username;
        
        // Salvar ou atualizar o perfil do usuário se tiver email
        if (email) {
          // Verificar se o usuário já existe
          const { data: existingUser, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
          
          if (userError) {
            // Usuário não existe, criar novo
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                email: email,
                name: userName || email.split('@')[0],
                role: 'user',
                active: true
              });
            
            if (createError) {
              console.error('Erro ao criar perfil do usuário:', createError);
            } else {
              console.log('Perfil do usuário criado com sucesso');
            }
          } else {
            console.log('Usuário já existe no sistema:', existingUser);
          }
        }
        
        // Extrair dados do serviço da transação
        const service = transaction.metadata?.service;
        const posts = transaction.metadata?.posts;
        const profile = transaction.metadata?.profile;
        
        // Atualizar a transação com o email para rastreabilidade
        if (email && (!transaction.metadata?.email)) {
          await supabase
            .from('transactions')
            .update({
              metadata: {
                ...transaction.metadata,
                email
              }
            })
            .eq('id', transaction.id);
        }
        
        if (service && posts && posts.length > 0 && profile) {
          console.log('Dados para criação de pedidos:', {
            service,
            posts: posts.length,
            profile,
            email
          });
          
          // Para cada post, criar um pedido separado
          const orderResults = [];
          for (const post of posts) {
            try {
              // Verificar se o post tem um link válido
              if (!post.link) {
                // Construir o link do post a partir do código
                const postCode = post.code || post.shortcode || post.id;
                if (postCode) {
                  post.link = `https://instagram.com/p/${postCode}`;
                  console.log(' Link do post construído:', post.link);
                } else {
                  console.error(' Post sem código para construir link:', post);
                  orderResults.push({ success: false, error: 'Post sem código para construir link', post });
                  continue; // Pular este post
                }
              }
              
              // Enviar pedido para o provedor
              const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/providers/fama-redes/add-order`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  service: service.provider_id,
                  link: post.link,
                  quantity: service.quantity,
                  transaction_id: transaction.id,
                  target_username: profile.username
                }),
              });
              
              if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                console.error('Erro ao enviar pedido para o provedor:', errorData);
                orderResults.push({ success: false, error: errorData, post });
              } else {
                const orderData = await orderResponse.json();
                console.log('Pedido enviado com sucesso para o provedor:', orderData);
                orderResults.push({ success: true, data: orderData, post });
              }
            } catch (orderError) {
              console.error('Erro ao processar pedido para o post:', post.link, orderError);
              orderResults.push({ success: false, error: String(orderError), post });
            }
          }
          
          // Atualizar a transação com os resultados dos pedidos
          await supabase
            .from('transactions')
            .update({
              metadata: {
                ...transaction.metadata,
                order_results: orderResults
              }
            })
            .eq('id', transaction.id);
        }
      }
    }

    // Retornar status atual e detalhes do pagamento
    return NextResponse.json({
      status: paymentStatus,
      transaction_id: transaction.id,
      payer_email: paymentData.response?.payer?.email || transaction.metadata?.email || transaction.metadata?.profile?.email,
      details: paymentData.response
    });
  } catch (error) {
    console.error('Error checking payment:', error);
    return NextResponse.json(
      { message: 'Erro ao verificar pagamento', error },
      { status: 500 }
    );
  }
}
