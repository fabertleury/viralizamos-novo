/**
 * Integração com o microserviço de pagamentos
 * Contém as funções necessárias para enviar dados e gerenciar pagamentos
 */

interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

interface PostData {
  id: string;
  code?: string;
  shortcode?: string;
  image_url?: string;
  caption?: string;
  is_reel?: boolean;
}

interface ServiceData {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  provider_id?: string;
  external_id?: string;
  external_service_id?: string;
}

interface PaymentServiceResponse {
  success: boolean;
  token?: string;
  payment_url?: string;
  expires_at?: string;
  error?: string;
}

/**
 * Envia os dados do checkout para o microserviço de pagamentos
 * 
 * @param params Parâmetros do pagamento
 * @returns Resposta do serviço de pagamento
 */
export async function sendCheckoutToPaymentService({
  amount,
  serviceData,
  profileUsername,
  selectedPosts,
  customerData,
  returnUrl = '/agradecimento',
  serviceType
}: {
  amount: number;
  serviceData: ServiceData;
  profileUsername: string;
  selectedPosts: PostData[];
  customerData: CustomerData;
  returnUrl?: string;
  serviceType: string;
}): Promise<PaymentServiceResponse> {
  try {
    // URL do microserviço de pagamento
    const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
    
    // Log detalhado para debugging
    console.log('Iniciando envio para microserviço de pagamentos', { 
      serviceType, 
      amount, 
      profileUsername,
      postsCount: selectedPosts.length
    });
    
    // Verificar se temos o external_id do serviço
    const externalServiceId = serviceData.external_id || serviceData.external_service_id;
    
    if (externalServiceId) {
      console.log('Service ID externo identificado:', externalServiceId);
    } else {
      console.log('Service ID externo não encontrado, usando apenas o ID interno:', serviceData.id);
    }
    
    // Preparar dados para enviar ao microserviço de pagamentos
    const requestData = {
      amount,
      service_id: serviceData.id,
      external_service_id: externalServiceId,
      profile_username: profileUsername,
      customer_email: customerData.email,
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      service_name: serviceData.name || 'Serviço Viralizamos',
      return_url: returnUrl,
      additional_data: {
        posts: selectedPosts.map(post => ({
          id: post.id,
          code: post.code || post.shortcode || post.id,
          image_url: post.image_url || '',
          is_reel: post.is_reel || false
        })),
        quantity: serviceData.quantity || 1,
        source: 'viralizamos_site_v2',
        origin: window.location.href,
        service_type: serviceType,
        external_service_id: externalServiceId,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Enviando dados para API de solicitação de pagamento:', requestData);
    
    // Enviar solicitação para o microserviço de pagamentos
    const response = await fetch(`${paymentServiceUrl}/api/payment-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Source': 'viralizamos-site-v2',
      },
      body: JSON.stringify(requestData),
    });
    
    // Verificar resposta
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta do serviço de pagamentos:', errorText);
      throw new Error(`Erro ao criar solicitação de pagamento: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Verificar se a resposta contém URL de pagamento
    if (!data.payment_url) {
      throw new Error('URL de pagamento não retornada pela API');
    }
    
    // Salvar dados importantes no localStorage
    if (data.token) {
      localStorage.setItem('viralizamos_payment_token', data.token);
      localStorage.setItem('viralizamos_payment_timestamp', new Date().toISOString());
      localStorage.setItem('viralizamos_payment_data', JSON.stringify({
        amount,
        service_id: serviceData.id,
        external_service_id: externalServiceId,
        profile_username: profileUsername,
        token: data.token
      }));
    }
    
    console.log('Resposta recebida do microserviço:', data);
    
    return {
      success: true,
      token: data.token,
      payment_url: data.payment_url,
      expires_at: data.expires_at
    };
  } catch (error) {
    console.error('Erro ao enviar dados para microserviço de pagamentos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Redireciona o usuário para a página de pagamento
 * 
 * @param paymentUrl URL de pagamento
 */
export function redirectToPaymentPage(paymentUrl: string): void {
  // Redirecionar para a URL de pagamento
  console.log('Redirecionando para:', paymentUrl);
  window.location.href = paymentUrl;
}

/**
 * Função completa que envia os dados e redireciona para pagamento
 * Combina envio de dados e redirecionamento em uma única função
 */
export async function processCheckoutAndRedirect(params: {
  amount: number;
  serviceData: ServiceData;
  profileUsername: string;
  selectedPosts: PostData[];
  customerData: CustomerData;
  returnUrl?: string;
  serviceType: string;
}): Promise<boolean> {
  try {
    // Enviar dados para o microserviço
    const result = await sendCheckoutToPaymentService(params);
    
    if (!result.success || !result.payment_url) {
      console.error('Falha ao processar pagamento:', result.error);
      return false;
    }
    
    // Redirecionar para a página de pagamento
    redirectToPaymentPage(result.payment_url);
    return true;
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    return false;
  }
} 