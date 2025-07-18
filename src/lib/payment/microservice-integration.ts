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
    
    // Priorizar o external_id (que já é um número simples) como ID do serviço no provedor
    // Conforme visto no banco de dados, esse valor já é numérico como "1528"
    let externalServiceId = serviceData.external_id || serviceData.provider_id || serviceData.external_service_id;
    
    // Garantir que o ID externo seja um formato numérico
    // Se for um UUID (formato xxxxx-xxxx-xxxx-xxxx), converter para um número simples
    if (externalServiceId && typeof externalServiceId === 'string' && externalServiceId.includes('-')) {
      console.log('Convertendo external_id de formato UUID para número:', externalServiceId);
      // Extrair apenas os dígitos do ID ou usar hash numérico simples
      const numericId = externalServiceId.replace(/-/g, '').slice(0, 10);
      externalServiceId = numericId;
      console.log('ID externo convertido para formato numérico:', externalServiceId);
    } else if (externalServiceId) {
      console.log('Service ID externo já está em formato adequado:', externalServiceId);
    } else {
      console.log('Service ID externo não encontrado, usando apenas o ID interno:', serviceData.id);
    }
    
    // Registrar o ID externo original para rastreamento
    console.log('Registrando informações de IDs para rastreamento:');
    console.log('- ID do serviço (interno):', serviceData.id);
    console.log('- ID do serviço no provedor (externo):', externalServiceId);
    console.log('- ID original no provedor:', serviceData.external_id);
    
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
          is_reel: post.is_reel || false,
          type: post.is_reel ? 'reel' : 'post',
          quantity: (post as any).quantity || Math.ceil((serviceData.quantity || 1) / selectedPosts.length),
          calculated_quantity: (post as any).calculated_quantity || Math.ceil((serviceData.quantity || 1) / selectedPosts.length)
        })),
        quantity: serviceData.quantity || 1,
        source: 'viralizamos_site_v2',
        origin: window.location.href,
        service_type: serviceType,
        // Incluir tanto o ID externo processado quanto o original para maior rastreabilidade
        external_service_id: externalServiceId,
        original_external_id: serviceData.external_id,
        provider_id: serviceData.provider_id,
        service_provider_id: serviceData.provider_id,
        timestamp: new Date().toISOString(),
        total_quantity: serviceData.quantity || 1,
        posts_count: selectedPosts.length
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
  
  try {
    // Primeira abordagem: redirecionamento padrão
    window.location.href = paymentUrl;
    
    // Caso o redirecionamento acima falhe silenciosamente por causa de CORS
    // Aguardar e tentar uma segunda abordagem
    setTimeout(() => {
      try {
        // Tentar abrir em uma nova aba
        console.log('Tentando abrir em uma nova aba:', paymentUrl);
        window.open(paymentUrl, '_blank');
      } catch (err) {
        console.error('Erro ao tentar abrir em nova aba:', err);
        
        // Terceira abordagem: criar um link e clicar nele
        try {
          const link = document.createElement('a');
          link.href = paymentUrl;
          link.target = '_self';
          link.rel = 'noopener noreferrer';
          link.click();
        } catch (finalErr) {
          console.error('Erro em todas as tentativas de redirecionamento:', finalErr);
          alert('Não foi possível redirecionar automaticamente. Por favor, clique OK para tentar novamente ou copie este link manualmente: ' + paymentUrl);
        }
      }
    }, 1000);
  } catch (e) {
    console.error('Erro no redirecionamento inicial:', e);
  }
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