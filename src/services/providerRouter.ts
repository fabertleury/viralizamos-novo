import { createClient } from '@/lib/supabase/server';

interface ProviderInfo {
  name: string;
  apiUrl: string;
  apiKey: string;
  serviceIdMapping: Record<string, string>;
}

interface ServiceInfo {
  id: string;
  provider_id: string;
  external_id: string;
  name: string;
}

export async function getProviderForService(serviceId: string): Promise<ProviderInfo | null> {
  try {
    const supabase = createClient();
    
    // Buscar informações do serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, provider_id, external_id, name')
      .eq('id', serviceId)
      .single();
    
    if (serviceError || !service) {
      console.error('Erro ao buscar serviço:', serviceError);
      return null;
    }
    
    // Buscar informações do provedor
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', service.provider_id)
      .single();
    
    if (providerError || !provider) {
      console.error('Erro ao buscar provedor:', providerError);
      return null;
    }
    
    // Retornar informações formatadas do provedor
    return {
      name: provider.name,
      apiUrl: provider.api_url,
      apiKey: provider.api_key,
      serviceIdMapping: {
        [service.id]: service.external_id
      }
    };
  } catch (error) {
    console.error('Erro ao determinar provedor para o serviço:', error);
    return null;
  }
}

export async function sendOrderToProvider(
  providerId: string, 
  serviceId: string, 
  externalServiceId: string,
  link: string, 
  quantity: number,
  transactionId: string,
  targetUsername: string,
  amount: number
): Promise<any> {
  try {
    // Função padronizada para extrair o código do post do Instagram
    function extractPostCode(link: string | undefined): string | null {
      if (!link) return null;
      
      // Se já for um código direto (não uma URL)
      if (link && !link.includes('http') && !link.includes('/')) {
        return link;
      }
      
      // Extrair o código da URL do post
      if (link.includes('instagram.com/p/')) {
        const postCode = link.split('/p/')[1]?.split('/')[0]?.split('?')[0];
        if (postCode) return postCode;
      }
      
      // Extrair o código da URL do reel
      if (link.includes('instagram.com/reel/')) {
        const postCode = link.split('/reel/')[1]?.split('/')[0]?.split('?')[0];
        if (postCode) return postCode;
      }
      
      return null;
    }

    // Formatar o link do Instagram corretamente
    function formatInstagramLink(link: string | undefined): string | null {
      const code = extractPostCode(link);
      if (!code) return null;
      return `https://instagram.com/p/${code}`;
    }

    // Verificar se o link é para um post do Instagram e garantir que esteja no formato correto
    let finalLink = link;
    if (link.includes('instagram.com')) {
      const formattedLink = formatInstagramLink(link);
      if (formattedLink) {
        console.log(`Link do Instagram formatado: ${link} -> ${formattedLink}`);
        finalLink = formattedLink;
      }
    }

    // Buscar informações do provedor
    const supabase = createClient();
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();
    
    if (providerError || !provider) {
      console.error('Erro ao buscar provedor:', providerError);
      throw new Error(`Provedor com ID ${providerId} não encontrado`);
    }

    // Verificar se o provedor tem API key e URL configuradas
    if (!provider.api_key || !provider.api_url) {
      console.error('Provedor não tem API key ou URL configurada:', provider.name);
      throw new Error(`Provedor ${provider.name} não tem API key ou URL configurada`);
    }

    console.log(`Usando provedor: ${provider.name} (${provider.api_url})`);

    // Enviar pedido diretamente para a API do provedor
    const response = await fetch(provider.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        key: provider.api_key,
        action: 'add',
        service: externalServiceId,
        link: finalLink,
        quantity: quantity.toString()
      }).toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro ao enviar pedido para provedor: ${errorData}`);
    }
    
    const responseData = await response.json();
    console.log(`Resposta do provedor ${provider.name}:`, responseData);

    // Normalizar a resposta para um formato padrão
    let normalizedResponse = {
      order: 0,
      orderId: '',
      status: 'pending'
    };

    if (responseData.order) {
      // Formato padrão da API
      normalizedResponse.order = responseData.order;
      normalizedResponse.orderId = String(responseData.order);
      normalizedResponse.status = 'pending';
    } else if (responseData.data && responseData.data.order_id) {
      // Formato alternativo (Fama)
      normalizedResponse.order = parseInt(responseData.data.order_id, 10);
      normalizedResponse.orderId = responseData.data.order_id;
      normalizedResponse.status = responseData.data.status || 'pending';
    }

    // Salvar o pedido no banco de dados
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        transaction_id: transactionId,
        service_id: serviceId,
        provider_id: providerId,
        external_order_id: normalizedResponse.orderId,
        status: normalizedResponse.status,
        quantity: quantity,
        amount: amount, // Adicionando o valor do pedido
        target_username: targetUsername,
        metadata: {
          provider: provider.name,
          provider_id: providerId,
          link: finalLink,
          service_id: serviceId,
          external_service_id: externalServiceId,
          order_details: responseData
        }
      })
      .select();

    if (orderError) {
      console.error('Erro ao salvar pedido:', orderError);
      throw new Error(`Erro ao salvar pedido: ${orderError.message}`);
    }

    return {
      ...normalizedResponse,
      provider: provider.name,
      order_db: order[0]
    };
  } catch (error) {
    console.error('Erro ao enviar pedido para provedor:', error);
    throw error;
  }
}

export async function checkOrderStatus(
  providerId: string,
  orderId: string,
  apiUrl?: string,
  apiKey?: string
): Promise<any> {
  try {
    // Validar parâmetros
    if (!orderId) {
      throw new Error('ID do pedido é obrigatório');
    }

    if (!providerId) {
      throw new Error('ID do provedor é obrigatório');
    }

    console.log(`[ProviderRouter] Verificando status do pedido: ${orderId} no provedor: ${providerId}`);
    
    // Construir o corpo da requisição
    const requestBody: any = {
      key: apiKey,
      action: 'status',
      order: orderId
    };
    
    // Se apiUrl e apiKey não foram fornecidos, usar valores padrão do provedor
    if (!apiUrl || !apiKey) {
      const supabase = createClient();
      const { data: provider, error } = await supabase
        .from('providers')
        .select('api_url, api_key, name')
        .eq('id', providerId)
        .single();
      
      if (error || !provider) {
        throw new Error(`Provedor não encontrado: ${providerId}`);
      }
      
      apiUrl = provider.api_url;
      apiKey = provider.api_key;
      
      console.log(`[ProviderRouter] Usando provedor ${provider.name} (${apiUrl}) para verificar pedido ${orderId}`);
    }
    
    // Fazer a requisição diretamente para a API do provedor
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestBody).toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ProviderRouter] Erro na API do provedor: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Erro na API do provedor: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[ProviderRouter] Resposta do provedor para pedido ${orderId}:`, data);
    
    // Normalizar a resposta do provedor
    const normalizedStatus = normalizeProviderStatus(data);
    
    return {
      ...data,
      normalized_status: normalizedStatus
    };
  } catch (error) {
    console.error('[ProviderRouter] Erro ao verificar status do pedido:', error);
    throw error;
  }
}

/**
 * Normaliza o status do provedor para um formato padrão
 * @param providerResponse Resposta do provedor
 * @returns Status normalizado
 */
export function normalizeProviderStatus(providerResponse: any): string {
  if (!providerResponse) return 'unknown';
  
  // Extrair o status da resposta do provedor
  const status = providerResponse.status || '';
  
  // Verificar se o status é "Partial" com P maiúsculo (como no exemplo da API)
  if (status === 'Partial') {
    return 'partial';
  }
  
  // Mapear o status do provedor para o status do sistema
  switch (status.toLowerCase()) {
    case 'completed':
    case 'complete':
      return 'completed';
    
    case 'pending':
    case 'queued':
    case 'waiting':
      return 'pending';
    
    case 'in progress':
    case 'inprogress':
    case 'processing':
      return 'processing';
    
    case 'canceled':
    case 'cancelled':
      return 'canceled';
    
    case 'partial':
    case 'partially completed':
      return 'partial';
    
    case 'failed':
    case 'error':
    case 'rejected':
      return 'failed';
    
    default:
      console.log(`[ProviderRouter] Status desconhecido do provedor: "${status}"`);
      return status.toLowerCase();
  }
}

/**
 * Cria uma reposição para um pedido
 * @param providerId ID do provedor
 * @param orderId ID do pedido no provedor
 * @returns Resposta da API do provedor
 */
export async function createRefill(providerId: string, orderId: string): Promise<any> {
  try {
    const supabase = createClient();
    
    // Buscar informações do provedor
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();
    
    if (providerError || !provider) {
      console.error('Erro ao buscar provedor:', providerError);
      // Fallback para o provedor Fama nas Redes
      return createFamaRefill(orderId);
    }
    
    // Implementar lógica específica para cada provedor
    switch (provider.name.toLowerCase()) {
      case 'fama nas redes':
        return createFamaRefill(orderId);
      // Adicionar outros provedores conforme necessário
      default:
        throw new Error(`Reposição não suportada para o provedor ${provider.name}`);
    }
  } catch (error) {
    console.error('Erro ao criar reposição:', error);
    throw error;
  }
}

/**
 * Cria uma reposição para um pedido no provedor Fama nas Redes
 * @param orderId ID do pedido no provedor
 * @returns Resposta da API do provedor
 */
async function createFamaRefill(orderId: string): Promise<any> {
  const apiKey = process.env.FAMA_REDES_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key não configurada para o provedor Fama nas Redes');
  }
  
  const response = await fetch('https://famanasredes.com/api/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: apiKey,
      action: 'refill',
      order: orderId,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar reposição: ${errorText}`);
  }
  
  return response.json();
}

export const providerRouter = {
  getProviderForService,
  sendOrderToProvider,
  checkOrderStatus,
  normalizeProviderStatus,
  createRefill
};
