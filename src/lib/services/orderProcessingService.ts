import { createClient } from '@/lib/supabase/server';

/**
 * Extrai o código do post do Instagram a partir de um link
 */
export function extractPostCode(link: string): string | null {
  if (!link) return null;
  
  // Tenta extrair o código do post do formato completo da URL
  const postMatch = link.match(/instagram\.com\/p\/([^\/\?]+)/i);
  if (postMatch && postMatch[1]) {
    return postMatch[1];
  }
  
  // Tenta extrair o código do post do formato de URL curta
  const shortMatch = link.match(/instagr\.am\/p\/([^\/\?]+)/i);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }
  
  // Se a URL não parece ser de um post, pode ser um perfil
  const profileMatch = link.match(/instagram\.com\/([^\/\?]+)/i);
  if (profileMatch && profileMatch[1]) {
    // É um perfil, não um post
    return null;
  }
  
  // Verifica se o próprio link já é um código de post
  if (/^[A-Za-z0-9_-]{11}$/.test(link)) {
    return link;
  }
  
  return null;
}

/**
 * Formata um link do Instagram para o formato padrão
 */
export function formatInstagramLink(link: string): string | null {
  if (!link) return null;
  
  console.log('Link original recebido:', link);
  
  // Verifica se já é um link completo de um post do Instagram
  if (link.includes('instagram.com/p/')) {
    const postCode = extractPostCode(link);
    if (postCode) {
      console.log('Código do post extraído:', postCode);
      const formattedLink = `https://instagram.com/p/${postCode}`;
      console.log('Link formatado para post:', formattedLink);
      return formattedLink;
    }
  }
  
  // Verifica se é um nome de usuário ou link de perfil
  const usernameMatch = link.match(/instagram\.com\/([^\/\?]+)/i);
  let username = null;
  
  if (usernameMatch && usernameMatch[1]) {
    username = usernameMatch[1];
  } else if (!link.includes('instagram.com')) {
    // Se não tem instagram.com, pode ser apenas o nome de usuário
    username = link.startsWith('@') ? link.substring(1) : link;
  }
  
  if (username) {
    console.log('Username do Instagram detectado:', username);
    const formattedLink = `https://instagram.com/${username}`;
    console.log('Link formatado para perfil:', formattedLink);
    return formattedLink;
  }
  
  // Se chegou aqui, não conseguiu formatar o link
  console.error('Não foi possível formatar o link do Instagram:', link);
  return null;
}

/**
 * Envia um pedido para o provedor e registra na tabela orders
 */
export async function sendOrderToProvider(params: {
  transaction: any;
  service: any;
  provider: any;
  post: any;
  customer: any;
  formattedLink: string;
  quantity: number | string;
}) {
  const { transaction, service, provider, post, customer, formattedLink, quantity } = params;
  const supabase = createClient();
  
  // Verificar se temos um customer_id válido, caso contrário, buscar ou criar
  let customerId = customer?.id;
  
  if (!customerId && transaction.customer_id) {
    customerId = transaction.customer_id;
    console.log('Usando customer_id da transação:', customerId);
  } else if (!customerId && (customer?.email || transaction.customer_email)) {
    // Buscar o cliente pelo email
    const email = customer?.email || transaction.customer_email;
    console.log('Buscando cliente pelo email:', email);
    
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log('Cliente encontrado pelo email:', customerId);
    }
  }
  
  // Preparar os dados para enviar para o provedor
  const providerRequestData = {
    key: provider.api_key,
    action: "add",
    service: service.external_id.toString(),
    link: formattedLink,
    quantity: quantity.toString()
  };
  
  console.log('Dados para o provedor:', providerRequestData);
  console.log('Enviando requisição para:', provider.api_url);
  
  try {
    // Enviar requisição para o provedor usando URLSearchParams (conforme MEMORY)
    const formData = new URLSearchParams();
    Object.entries(providerRequestData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    
    const orderRequest = await fetch(provider.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: formData,
    });
    
    console.log('Status da resposta:', orderRequest.status);
    
    if (!orderRequest.ok) {
      const errorText = await orderRequest.text();
      console.error(`Erro na resposta do provedor (${orderRequest.status}): ${errorText}`);
      
      let errorData;
      try {
        // Tentar analisar o erro como JSON
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // Se não for JSON, usar o texto bruto
        errorData = { error: errorText };
      }
      
      throw new Error(`Erro ao enviar pedido para o provedor: ${JSON.stringify(errorData)}`);
    }
    
    const responseData = await orderRequest.json();
    console.log('Resposta do provedor:', responseData);
    
    // Verificar se a resposta contém um erro
    if (responseData.error) {
      console.error('Erro ao enviar pedido para o provedor:', responseData.error);
      
      // Mapear erros conhecidos para mensagens amigáveis
      const errorMessages: { [key: string]: string } = {
        'neworder.error.not_enough_funds': 'Saldo insuficiente na conta do provedor. Por favor, entre em contato com o suporte.',
        'requested path is invalid': 'O link do Instagram fornecido é inválido. Verifique o formato e tente novamente.',
        'error.not_enough_funds': 'Saldo insuficiente na conta do provedor. Por favor, entre em contato com o suporte.',
        'not enough funds': 'Saldo insuficiente na conta do provedor. Por favor, entre em contato com o suporte.',
        'insufficient balance': 'Saldo insuficiente na conta do provedor. Por favor, entre em contato com o suporte.',
        'saldo insuficiente': 'Saldo insuficiente na conta do provedor. Por favor, entre em contato com o suporte.',
      };
      
      // Verificar se algum dos padrões de erro conhecidos está presente na mensagem de erro
      let errorMessage = responseData.error;
      for (const [errorPattern, friendlyMessage] of Object.entries(errorMessages)) {
        if (responseData.error.toLowerCase().includes(errorPattern.toLowerCase())) {
          errorMessage = friendlyMessage;
          break;
        }
      }
      
      // Verificar se é um erro de saldo insuficiente
      const errorMessageLower = errorMessage.toLowerCase();
      if (
        errorMessageLower.includes('insufficient') || 
        errorMessageLower.includes('saldo insuficiente') || 
        errorMessageLower.includes('balance') ||
        errorMessageLower.includes('not enough') ||
        errorMessageLower.includes('não possui saldo')
      ) {
        // Calcular o valor do pedido
        const { amount, unitPrice: finalUnitPrice, isVariationPrice } = calculateOrderAmount(service, parseInt(quantity.toString()));
        
        // Cadastrar o pedido na tabela orders mesmo com erro
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            transaction_id: transaction.id,
            service_id: service.id,
            customer_id: customerId,
            user_id: transaction.user_id,
            target_username: post.username || (post.caption ? post.caption.substring(0, 50) : 'Unknown'),
            quantity: quantity,
            amount: amount || 0, // Garantir que amount não seja null
            status: 'cancelled', // Alterado de 'failed' para 'cancelled' para compatibilidade com o enum
            payment_status: 'approved',
            payment_method: transaction.payment_method || 'pix',
            payment_id: transaction.payment_external_reference,
            metadata: {
              post,
              providerResponse: responseData,
              providerRequestData,
              formattedLink,
              error: `Saldo insuficiente no provedor: ${responseData.error}`,
              unitPrice: finalUnitPrice,
              calculatedAmount: amount,
              provider: {
                id: provider.id,
                name: provider.name
              }
            }
          })
          .select()
          .single();
        
        if (orderError) {
          console.error('Erro ao cadastrar pedido com erro:', orderError);
        } else {
          console.log('Pedido com erro cadastrado com sucesso:', orderData);
        }
        
        return {
          success: false,
          error: `Saldo insuficiente no provedor: ${responseData.error}`,
          post,
          providerResponse: responseData,
          orderData
        };
      }
      
      // Usar o mapeamento de erros definido anteriormente
      let friendlyErrorMessage = errorMessage;
      for (const [errorPattern, friendlyMessage] of Object.entries(errorMessages)) {
        if (responseData.error.toLowerCase().includes(errorPattern.toLowerCase())) {
          friendlyErrorMessage = friendlyMessage;
          break;
        }
      }
      
      // Calcular o valor do pedido
      const { amount, unitPrice: finalUnitPrice, isVariationPrice } = calculateOrderAmount(service, parseInt(quantity.toString()));
      
      // Cadastrar o pedido bem-sucedido na tabela orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          transaction_id: transaction.id,
          service_id: service.id,
          customer_id: customerId,
          user_id: transaction.user_id,
          target_username: post.username || (post.caption ? post.caption.substring(0, 50) : 'Unknown'),
          quantity: quantity,
          amount: amount || 0, // Garantir que amount não seja null
          status: 'cancelled', // Alterado de 'failed' para 'cancelled' para compatibilidade com o enum
          payment_status: 'approved',
          payment_method: transaction.payment_method || 'pix',
          payment_id: transaction.payment_external_reference,
          metadata: {
            post,
            providerResponse: responseData,
            providerRequestData,
            formattedLink,
            error: friendlyErrorMessage, // Adicionando a mensagem de erro nos metadados
            unitPrice: finalUnitPrice,
            calculatedAmount: amount,
            provider: {
              id: provider.id,
              name: provider.name
            }
          }
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('Erro ao cadastrar pedido com erro:', orderError);
      } else {
        console.log('Pedido com erro cadastrado com sucesso:', orderData);
      }
      
      return {
        success: false,
        error: friendlyErrorMessage,
        post,
        providerResponse: responseData,
        orderData
      };
    } else {
      // Se não houver erro, considerar como sucesso
      console.log('Pedido enviado com sucesso para o provedor:', responseData);
      
      // Calcular o valor do pedido
      const { amount, unitPrice: finalUnitPrice, isVariationPrice } = calculateOrderAmount(service, parseInt(quantity.toString()));
      
      // Cadastrar o pedido bem-sucedido na tabela orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          transaction_id: transaction.id,
          service_id: service.id,
          customer_id: customerId,
          user_id: transaction.user_id,
          target_username: post.username || (post.caption ? post.caption.substring(0, 50) : 'Unknown'),
          quantity: quantity,
          amount: amount || 0, // Garantir que amount não seja null
          status: 'pending',
          payment_status: 'approved',
          payment_method: transaction.payment_method || 'pix',
          payment_id: transaction.payment_external_reference,
          external_order_id: responseData.order || responseData.id || responseData.order_id || null,
          metadata: {
            post,
            providerResponse: responseData,
            providerRequestData,
            formattedLink,
            unitPrice: finalUnitPrice,
            calculatedAmount: amount,
            provider: {
              id: provider.id,
              name: provider.name
            }
          }
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('Erro ao cadastrar pedido:', orderError);
      } else {
        console.log('Pedido cadastrado com sucesso:', orderData);
      }
      
      return {
        success: true,
        order: responseData,
        post,
        orderData
      };
    }
  } catch (orderError) {
    console.error('Erro ao processar pedido:', orderError);
    
    // Calcular o valor do pedido
    const { amount, unitPrice: finalUnitPrice, isVariationPrice } = calculateOrderAmount(service, parseInt(quantity.toString()));
    
    // Cadastrar o pedido com erro na tabela orders
    const errorMessage = String(orderError);
    
    const { data: orderData, error: insertError } = await supabase
      .from('orders')
      .insert({
        transaction_id: transaction.id,
        service_id: service.id,
        customer_id: customerId,
        user_id: transaction.user_id,
        target_username: post.username || (post.caption ? post.caption.substring(0, 50) : 'Unknown'),
        quantity: quantity,
        amount: amount || 0, // Garantir que amount não seja null
        status: 'cancelled', // Alterado de 'failed' para 'cancelled' para compatibilidade com o enum
        payment_status: 'approved',
        payment_method: transaction.payment_method || 'pix',
        payment_id: transaction.payment_external_reference,
        metadata: {
          post,
          error: errorMessage,
          providerRequestData,
          formattedLink,
          unitPrice: finalUnitPrice,
          calculatedAmount: amount,
          provider: {
            id: provider.id,
            name: provider.name
          }
        }
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Erro ao cadastrar pedido com erro de requisição:', insertError);
    } else {
      console.log('Pedido com erro de requisição cadastrado com sucesso:', orderData);
    }
    
    return {
      success: false,
      error: errorMessage,
      post,
      orderData
    };
  }
}

// Função auxiliar para calcular o valor do pedido com base na quantidade e no serviço
const calculateOrderAmount = (service: any, quantity: number): { amount: number, unitPrice: number, isVariationPrice: boolean } => {
  // Obter o preço base do serviço
  const baseUnitPrice = service.preco || (service.service_variations && service.service_variations.length > 0 ? 
                      service.service_variations[0].preco : 0);
  
  let finalUnitPrice = baseUnitPrice;
  let isVariationPrice = false;
  
  // Verificar se existe uma variação para a quantidade solicitada
  if (service.service_variations && service.service_variations.length > 0) {
    const matchingVariation = service.service_variations.find(
      (variation: any) => variation.quantidade === parseInt(quantity.toString())
    );
    
    if (matchingVariation) {
      finalUnitPrice = matchingVariation.preco;
      isVariationPrice = true;
      console.log(`Usando preço da variação para quantidade ${quantity}: ${finalUnitPrice}`);
    }
  }
  
  // Calcular o valor total
  // Se for um preço de variação, o valor já é o preço total para aquela quantidade
  // Caso contrário, multiplicamos a quantidade pelo preço unitário
  const amount = isVariationPrice ? finalUnitPrice : parseFloat(quantity.toString()) * finalUnitPrice;
  console.log(`Calculando valor: ${isVariationPrice ? 'Preço fixo da variação' : `${quantity} x ${finalUnitPrice}`} = ${amount}`);
  
  return { amount, unitPrice: finalUnitPrice, isVariationPrice };
};
