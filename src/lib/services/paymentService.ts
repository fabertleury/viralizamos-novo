import mercadopago from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { formatInstagramLink, sendOrderToProvider } from './orderProcessingService';
import { createOrUpdateCustomer } from '../customerService';

// Configuração do Mercado Pago
mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');

// Cache temporário para reduzir consultas ao Mercado Pago
// Formato: { paymentId: { status, timestamp } }
const statusCache: Record<string, { status: string, timestamp: number }> = {};

// Tempo de validade do cache em milissegundos (5 segundos)
const CACHE_TTL = 5000;

/**
 * Verifica o status de um pagamento no Mercado Pago
 * @param paymentId ID do pagamento no Mercado Pago
 * @returns Status do pagamento
 */
export async function checkPaymentStatus(paymentId: string) {
  console.log('VERIFICANDO STATUS DE PAGAMENTO:', { payment_id: paymentId });

  if (!paymentId) {
    console.error('Erro: Payment ID não fornecido');
    throw new Error('Payment ID is required');
  }

  // Verificar se temos um cache válido para este pagamento
  const now = Date.now();
  const cachedData = statusCache[paymentId];
  
  if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
    console.log(`Usando cache para payment_id ${paymentId}, status: ${cachedData.status}`);
    return {
      status: cachedData.status,
      source: 'cache'
    };
  }

  const supabase = createClient();

  // Buscar transação no Supabase
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_external_reference', paymentId)
    .single();

  if (transactionError) {
    console.log('Transação não encontrada no Supabase, buscando no Mercado Pago');

    // Tentar buscar diretamente no Mercado Pago
    try {
      const paymentResponse = await mercadopago.payment.findById(paymentId);
      const paymentData = paymentResponse.body;

      console.log(`Status do pagamento (Mercado Pago direto): ${paymentData.status}`);

      // Armazenar no cache
      statusCache[paymentId] = {
        status: paymentData.status,
        timestamp: now
      };

      return {
        status: paymentData.status,
        statusDetail: paymentData.status_detail,
        payment: paymentData,
        source: 'mercadopago_direct'
      };
    } catch (mpError) {
      console.error('Erro ao buscar pagamento no Mercado Pago:', mpError);
      throw new Error('Payment not found');
    }
  }

  // Se encontrou a transação no Supabase
  console.log('Transação encontrada no Supabase:', {
    id: transaction.id,
    status: transaction.status,
    payment_id: transaction.payment_external_reference
  });

  // Verificar status atual no Mercado Pago
  try {
    const paymentResponse = await mercadopago.payment.findById(paymentId);
    const paymentData = paymentResponse.body;
    const currentStatus = paymentData.status;

    console.log(`Status atual do pagamento (Mercado Pago): ${currentStatus}`);

    // Armazenar no cache
    statusCache[paymentId] = {
      status: currentStatus,
      timestamp: now
    };

    // Se o status mudou, atualizar no Supabase
    if (transaction.status !== currentStatus) {
      console.log('Status mudou:', {
        old: transaction.status,
        new: currentStatus
      });

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: currentStatus,
          metadata: {
            ...transaction.metadata,
            payment_details: paymentData
          }
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Erro ao atualizar status da transação:', updateError);
      } else {
        console.log('Status da transação atualizado com sucesso no Supabase');
      }
    }
    
    return {
      status: currentStatus,
      statusDetail: paymentData.status_detail,
      payment: paymentData,
      transaction,
      source: 'mercadopago'
    };
  } catch (mpError) {
    console.error('Erro ao verificar status no Mercado Pago:', mpError);
    
    // Retornar o status atual do Supabase se não conseguir verificar no MP
    return {
      status: transaction.status,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        created_at: transaction.created_at
      },
      source: 'supabase_only'
    };
  }
}

/**
 * Processa um pagamento aprovado, enviando pedidos para o provedor
 * @param transaction Transação aprovada
 * @returns Resultados dos pedidos processados
 */
export async function processApprovedPayment(transaction: any) {
  console.log('Pagamento aprovado! Enviando pedido para o provedor...');
  const supabase = createClient();

  try {
    // Extrair dados do serviço da transação
    const serviceMetadata = transaction.metadata?.service;
    const posts = transaction.metadata?.posts;
    const profile = transaction.metadata?.profile;
    const customer = transaction.metadata?.customer;
    const email = transaction.customer_email || 
                  transaction.metadata?.customer?.email || 
                  transaction.metadata?.email || 
                  transaction.metadata?.contact?.email || 
                  transaction.metadata?.profile?.email;
    const customerName = transaction.customer_name || 
                        transaction.metadata?.customer?.name || 
                        transaction.metadata?.name || 
                        transaction.metadata?.contact?.name || 
                        transaction.metadata?.profile?.full_name;
    const phone = transaction.metadata?.customer?.phone || 
                  transaction.metadata?.phone || 
                  transaction.metadata?.contact?.phone;
                        
    // Se não tiver cliente, criar um novo
    let customerData = customer;
    if (!customerData) {
      console.log('Cliente não encontrado, criando um novo...');
      
      if (!email) {
        console.error('Email não encontrado nos metadados da transação');
        throw new Error('Email não encontrado para criar cliente');
      }
      
      const { data: newCustomer, error: customerError } = await createOrUpdateCustomer({
        email,
        name: customerName || email.split('@')[0],
        phone
      });
      
      if (customerError) {
        console.error('Erro ao criar cliente:', customerError);
        throw new Error(`Erro ao criar cliente: ${customerError.message}`);
      }
      
      console.log('Novo cliente criado:', newCustomer);
      customerData = newCustomer;
    }
    
    // Buscar o serviço diretamente do banco de dados usando o service_id da transação
    console.log(`Buscando serviço com ID: ${transaction.service_id}`);
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', transaction.service_id)
      .single();
      
    if (serviceError) {
      console.error('Erro ao buscar serviço:', serviceError);
      throw new Error(`Erro ao buscar serviço: ${serviceError.message}`);
    }
    
    if (!serviceData) {
      console.error(`Serviço com ID ${transaction.service_id} não encontrado`);
      throw new Error(`Serviço não encontrado. Verifique o ID do serviço na transação.`);
    }
    
    // Combinar os dados do serviço do banco com os metadados da transação
    const service = {
      ...serviceData,
      ...serviceMetadata // Sobrescrever com os dados da transação, se existirem
    };
    
    console.log('Serviço completo:', service);
    console.log('Dados do perfil:', profile);
    console.log('Posts recebidos:', posts);
    
    // Verificar se o serviço tem todas as propriedades necessárias
    if (!service || !service.id || !service.provider_id) {
      console.error('Serviço inválido:', service);
      throw new Error('Serviço inválido ou incompleto');
    }
    
    // Buscar o provedor associado ao serviço
    let provider = null;
        
    if (service.provider_id) {
      console.log(`Buscando provedor com ID: ${service.provider_id}`);
      
      // Verificar se o provider_id é um UUID válido
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(service.provider_id);
      
      if (!isUUID) {
        console.error(`Provider_id "${service.provider_id}" não é um UUID válido.`);
        throw new Error(`Provider ID inválido: ${service.provider_id}. Verifique o cadastro do serviço.`);
      }
      
      // Se for um UUID válido, buscar diretamente pelo ID
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', service.provider_id)
        .single();
      
      if (providerError) {
        console.error('Erro ao buscar provedor:', providerError);
        throw new Error(`Erro ao buscar provedor: ${providerError.message}`);
      }
      
      if (!providerData) {
        console.error(`Provedor com ID ${service.provider_id} não encontrado`);
        throw new Error(`Provedor não encontrado para o serviço. Verifique o cadastro do serviço.`);
      }
      
      provider = providerData;
      console.log('Provedor encontrado:', {
        id: provider.id,
        name: provider.name
      });
    } else {
      console.error('Serviço não tem provider_id:', service);
      throw new Error('Serviço não tem provider_id configurado');
    }
    
    // Array para armazenar os resultados dos pedidos
    const orderResults = [];
    
    // Se não há posts, criar um post padrão com o link do perfil
    if (!posts || posts.length === 0) {
      console.log('Nenhum post encontrado, criando post padrão com o link do perfil');
      
      if (!profile || !profile.link) {
        console.error('Perfil ou link do perfil não encontrado');
        throw new Error('Não foi possível criar post padrão: perfil não encontrado');
      }
      
      // Criar post padrão com o link do perfil
      const defaultPost = {
        link: profile.link,
        caption: profile.username || profile.full_name || 'Perfil',
        username: profile.username || profile.full_name || 'N/A'
      };
      
      console.log('Post padrão criado:', defaultPost);
      
      // Processar o post padrão
      try {
        // Formatar o link do Instagram
        const formattedLink = formatInstagramLink(defaultPost.link);
        if (!formattedLink) {
          throw new Error(`Link do Instagram inválido: ${defaultPost.link}`);
        }
        
        // Garantir que quantity seja um número ou string
        const quantity = service.quantity || 0;
        
        // Enviar pedido para o provedor
        const result = await sendOrderToProvider({
          transaction,
          service,
          provider,
          post: defaultPost,
          customer: customerData,
          formattedLink,
          quantity
        });
        
        orderResults.push(result);
      } catch (orderError) {
        console.error('Erro ao processar pedido para o post padrão:', defaultPost.link, orderError);
        orderResults.push({ success: false, error: String(orderError), post: defaultPost });
      }
    } else {
      // Processar cada post recebido
      for (const post of posts) {
        try {
          console.log('Processando post:', post);
          
          // Verificar se o post tem um link válido (pode estar em post.link ou post.url)
          let postLink = post.link || post.url;
          
          // Se tiver o código do post, mas não tiver o link completo
          if (post.code && (!postLink || !postLink.includes('instagram.com'))) {
            console.log('Post tem código mas não tem link completo, construindo link:', post.code);
            postLink = `https://instagram.com/p/${post.code}`;
            console.log('Link construído a partir do código:', postLink);
          }
          
          if (!postLink) {
            console.log('Post sem link, tentando usar o link do perfil:', profile?.link);
            
            // Se não tiver link no post, usar o link do perfil
            if (profile && profile.link) {
              postLink = profile.link;
              console.log('Usando link do perfil como fallback:', postLink);
            } else {
              console.error('Não foi possível determinar um link válido para o post');
              orderResults.push({ success: false, error: 'Link do Instagram não encontrado', post });
              continue; // Pular este post
            }
          }
          
          // Formatar o link do Instagram
          const formattedLink = formatInstagramLink(postLink);
          if (!formattedLink) {
            throw new Error(`Link do Instagram inválido: ${postLink}`);
          }
          
          // Garantir que quantity seja um número ou string
          const quantity = service.quantity || 0;
          
          // Enviar pedido para o provedor
          const result = await sendOrderToProvider({
            transaction,
            service,
            provider,
            post,
            customer: customerData,
            formattedLink,
            quantity
          });
          
          orderResults.push(result);
        } catch (orderError) {
          console.error('Erro ao processar pedido para o post:', post.link, orderError);
          orderResults.push({ success: false, error: String(orderError), post });
        }
      }
    }
    
    return {
      success: true,
      orders: orderResults
    };
  } catch (providerError) {
    console.error('Erro ao processar pedido para o provedor:', providerError);
    return {
      success: false,
      error: String(providerError)
    };
  }
}
