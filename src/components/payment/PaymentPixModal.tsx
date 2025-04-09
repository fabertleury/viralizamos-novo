'use client';

/**
 * Interface para dados de pagamento
 */
export interface PaymentData {
  serviceId: string;
  profileUsername: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  serviceName?: string;
  returnUrl?: string;
  posts?: string[];
  quantity?: number;
  externalServiceId?: string; // ID do serviço no provedor externo
  customerPhone?: string;     // Telefone do cliente
}

/**
 * Utility para processar redirecionamentos de pagamento
 * Usa técnicas puras de JavaScript, sem React
 */
export const PaymentService = {
  /**
   * Redireciona para a página de pagamento do microserviço
   */
  redirecionarParaPagamentoPixNoMicroservico: (dados: PaymentData): boolean => {
    try {
      console.log('[PaymentService] Iniciando redirecionamento para pagamento PIX:', dados);
      
      // Validação de dados obrigatórios
      if (!dados.serviceId) {
        console.error('[PaymentService] Erro: serviceId não informado.');
        return false;
      }
      if (!dados.profileUsername) {
        console.error('[PaymentService] Erro: profileUsername não informado.');
        return false;
      }
      if (!dados.amount) {
        console.error('[PaymentService] Erro: amount não informado ou inválido.');
        return false;
      }

      // URL do microserviço de pagamento
      let paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL;
      if (!paymentServiceUrl) {
        console.warn('[PaymentService] URL do serviço de pagamento não configurada em variáveis de ambiente. Usando URL padrão.');
        paymentServiceUrl = 'https://pagamentos.viralizamos.com';
      }

      // Dados de pagamento para enviar ao microserviço
      const paymentRequestData = {
        amount: dados.amount,
        service_id: dados.serviceId,
        external_service_id: dados.externalServiceId, // ID do serviço no provedor externo
        profile_username: dados.profileUsername,
        customer_email: dados.customerEmail || 'cliente@viralizamos.com',
        customer_name: dados.customerName || 'Cliente',
        customer_phone: dados.customerPhone || '',
        service_name: dados.serviceName || 'Serviço Viralizamos',
        return_url: dados.returnUrl || window.location.href,
        additional_data: {
          posts: dados.posts || [],
          quantity: dados.quantity || 1,
          external_service_id: dados.externalServiceId, // Repetindo no additional_data para garantir
          source: 'viralizamos_site_v2',
          origin: window.location.href
        }
      };
      
      console.log('[PaymentService] Enviando dados para API de solicitação de pagamento:', paymentRequestData);
      
      // Fazer requisição à API do microserviço
      fetch(`${paymentServiceUrl}/api/payment-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequestData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Falha na criação da solicitação de pagamento: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('[PaymentService] Solicitação de pagamento criada com sucesso:', data);
        
        // Redirecionar para a URL de pagamento
        if (data.payment_url) {
          console.log('[PaymentService] Redirecionando para:', data.payment_url);
          window.location.href = data.payment_url;
        } else {
          throw new Error('URL de pagamento não retornada pela API');
        }
      })
      .catch(error => {
        console.error('[PaymentService] Erro ao criar solicitação de pagamento:', error);
        
        // Tratamento de fallback em caso de erro - usar método antigo
        try {
          // URL de fallback usando método antigo (localStorage)
          const timestamp = Date.now().toString(36);
          const orderId = `${timestamp}-${dados.serviceId.substring(0, 8).replace(/[^a-zA-Z0-9]/g, '')}`;
          const storageKey = `payment_data_${orderId}`;
          
          // Usar o método antigo (localStorage) como fallback
          localStorage.setItem(storageKey, JSON.stringify({
            amount: dados.amount,
            service_id: dados.serviceId,
            profile_username: dados.profileUsername,
            customer_email: dados.customerEmail || 'cliente@viralizamos.com',
            customer_name: dados.customerName || 'Cliente',
            service_name: dados.serviceName || 'Serviço Viralizamos',
            return_url: dados.returnUrl || window.location.href
          }));
          
          // Redirecionar para o método antigo
          const fallbackUrl = `${paymentServiceUrl}/pagamento/pix?oid=${orderId}`;
          console.log('[PaymentService] Usando fallback de redirecionamento:', fallbackUrl);
          window.location.href = fallbackUrl;
        } catch (fallbackError) {
          console.error('[PaymentService] Falha no fallback:', fallbackError);
          return false;
        }
      });
      
      return true;
    } catch (error) {
      console.error('[PaymentService] Erro crítico no processamento de pagamento:', error);
      return false;
    }
  }
};

/**
 * Componente vazio para compatibilidade com a interface atual
 * @deprecated Usar PaymentService diretamente
 */
function PaymentPixModal() {
  return null;
}

// Exportar o componente como default para compatibilidade com importações existentes
export default PaymentPixModal;

// Exportar o componente também como named export para compatibilidade com outras importações
export { PaymentPixModal };
