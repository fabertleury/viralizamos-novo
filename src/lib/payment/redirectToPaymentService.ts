/**
 * Módulo de redirecionamento para o microserviço de pagamentos
 * Independente do React e de qualquer outro componente
 */

// Tipos para os dados de pagamento
export interface PaymentRedirectData {
  // Dados do serviço
  serviceId: string;
  serviceName?: string;
  
  // Dados do perfil
  profileUsername: string;
  
  // Dados financeiros
  amount: number;
  
  // Dados do cliente
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  
  // Configurações
  returnUrl?: string;
}

/**
 * Redireciona o usuário para o microserviço de pagamentos
 * Esta função é totalmente independente do React e pode ser chamada de qualquer lugar
 */
export function redirectToPaymentService(data: PaymentRedirectData): boolean {
  try {
    console.log('[PAGAMENTO] Iniciando redirecionamento:', data);
    
    // Validação de dados obrigatórios
    if (!data.serviceId) {
      console.error('[PAGAMENTO] ERRO: ID do serviço não informado');
      return false;
    }
    
    if (!data.profileUsername) {
      console.error('[PAGAMENTO] ERRO: Nome de usuário do perfil não informado');
      return false;
    }
    
    if (!data.amount || data.amount <= 0) {
      console.error('[PAGAMENTO] ERRO: Valor inválido:', data.amount);
      return false;
    }
    
    // Preparar dados para envio ao microserviço
    const paymentData = {
      service_id: data.serviceId,
      service_name: data.serviceName || 'Serviço Viralizamos',
      profile_username: data.profileUsername,
      amount: data.amount,
      customer_name: data.customerName || 'Cliente',
      customer_email: data.customerEmail || 'cliente@viralizamos.com',
      customer_phone: data.customerPhone || '',
      return_url: data.returnUrl || window.location.href
    };
    
    // Converter para JSON e codificar para URL
    const jsonData = JSON.stringify(paymentData);
    console.log('[PAGAMENTO] Dados JSON:', jsonData);
    
    // Codificar em base64 para transmissão segura
    const base64Data = btoa(encodeURIComponent(jsonData));
    console.log('[PAGAMENTO] Dados codificados (primeiros 50 caracteres):', base64Data.substring(0, 50));
    
    // Obter URL do microserviço
    const microserviceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
    
    // Construir URL final com os dados no hash
    const redirectUrl = `${microserviceUrl}/pagamento/pix#${base64Data}`;
    console.log('[PAGAMENTO] URL de redirecionamento (primeiros 100 caracteres):', redirectUrl.substring(0, 100));
    
    // Método 1: Redirecionamento direto
    window.location.href = redirectUrl;
    
    // Métodos de fallback (executados apenas se o redirecionamento principal falhar)
    setTimeout(() => {
      console.log('[PAGAMENTO] Tentando método alternativo de redirecionamento...');
      
      // Método 2: Criar um link e clicar nele
      try {
        const link = document.createElement('a');
        link.href = redirectUrl;
        link.target = '_self';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } catch (e) {
        console.error('[PAGAMENTO] Erro ao tentar método alternativo:', e);
        
        // Método 3: window.open como último recurso
        try {
          window.open(redirectUrl, '_self');
        } catch (e2) {
          console.error('[PAGAMENTO] Todos os métodos de redirecionamento falharam:', e2);
          return false;
        }
      }
    }, 200);
    
    return true;
  } catch (error) {
    console.error('[PAGAMENTO] Erro crítico durante o redirecionamento:', error);
    
    // Mostrar mensagem ao usuário como último recurso
    try {
      alert('Erro ao redirecionar para a página de pagamento. Por favor, contacte o suporte.');
    } catch {
      // Silenciar qualquer erro ao mostrar o alerta
    }
    
    return false;
  }
}

/**
 * Redireciona o usuário para a página de redirecionamento intermediária, que então
 * encaminhará para o microserviço de pagamentos.
 * 
 * Esta função resolve problemas de ciclo de vida do React, garantindo maior confiabilidade.
 * 
 * @param data Dados do pagamento
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export async function directRedirectToPaymentService(data: PaymentRedirectData): Promise<boolean> {
  try {
    console.log('[PAGAMENTO] Iniciando redirecionamento via página intermediária:', data);
    
    // Validação de dados obrigatórios
    if (!data.serviceId) {
      console.error('[PAGAMENTO] ERRO: ID do serviço não informado');
      return false;
    }
    
    if (!data.profileUsername) {
      console.error('[PAGAMENTO] ERRO: Nome de usuário do perfil não informado');
      return false;
    }
    
    if (!data.amount || data.amount <= 0) {
      console.error('[PAGAMENTO] ERRO: Valor inválido:', data.amount);
      return false;
    }
    
    // Construir a URL para a página de redirecionamento
    const params = new URLSearchParams({
      service_id: data.serviceId,
      service_name: data.serviceName || 'Serviço Viralizamos',
      username: data.profileUsername,
      amount: data.amount.toString(),
      customer_name: data.customerName || 'Cliente',
      customer_email: data.customerEmail || 'cliente@viralizamos.com',
      customer_phone: data.customerPhone || '',
      return_url: data.returnUrl || '/agradecimento'
    });
    
    // URL completa para a página de redirecionamento
    const redirectUrl = `/pagamento-direto?${params.toString()}`;
    
    console.log('[PAGAMENTO] Redirecionando para a página intermediária:', redirectUrl);
    
    // Atualizar os dados no localStorage para garantir que estejam disponíveis 
    // para a página de redirecionamento
    localStorage.setItem('checkoutProfileData', JSON.stringify({
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      profileData: {
        username: data.profileUsername
      },
      amount: data.amount,
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone
    }));
    
    // Redirecionar para a página intermediária
    window.location.href = redirectUrl;
    
    return true;
  } catch (error) {
    console.error('[PAGAMENTO] Erro crítico durante o redirecionamento:', error);
    
    // Mostrar mensagem ao usuário como último recurso
    try {
      alert('Erro ao redirecionar para a página de pagamento. Por favor, contacte o suporte.');
    } catch {
      // Silenciar qualquer erro ao mostrar o alerta
    }
    
    return false;
  }
} 