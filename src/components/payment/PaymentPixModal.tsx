'use client';

interface PaymentData {
  serviceId: string;
  profileUsername: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  serviceName?: string;
  returnUrl?: string;
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

      // Dados de pagamento para enviar ao microserviço
      const paymentData = {
        amount: dados.amount,
        service_id: dados.serviceId,
        profile_username: dados.profileUsername,
        customer_email: dados.customerEmail || 'cliente@viralizamos.com',
        customer_name: dados.customerName || 'Cliente',
        service_name: dados.serviceName || 'Serviço Viralizamos',
        return_url: dados.returnUrl || window.location.href
      };
      
      // Converter para JSON e codificar em base64
      const jsonString = JSON.stringify(paymentData);
      console.log('[PaymentService] Dados para codificação:', jsonString);
      
      const base64Data = btoa(encodeURIComponent(jsonString));
      console.log('[PaymentService] Dados codificados:', { 
        base64Length: base64Data.length,
        base64First100Chars: base64Data.substring(0, 100) 
      });
      
      // URL do microserviço de pagamento
      let paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL;
      if (!paymentServiceUrl) {
        console.warn('[PaymentService] URL do serviço de pagamento não configurada em variáveis de ambiente. Usando URL padrão.');
        paymentServiceUrl = 'https://pagamentos.viralizamos.com';
      }
      
      // URL completa com hash para os dados
      const url = `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
      
      // Log da URL final
      console.log('[PaymentService] URL de redirecionamento:', {
        url: url.substring(0, 100) + '...',
        length: url.length
      });
      
      // ----- REDIRECIONAMENTO DIRETO -----
      // Opção 1: Redirecionamento direto via window.location
      window.location.href = url;
      
      // ----- FALLBACKS -----
      // Estes métodos serão executados apenas se o redirecionamento direto falhar
      setTimeout(() => {
        console.log('[PaymentService] Tentando método alternativo de redirecionamento...');
        
        // Opção 2: Criar um elemento <a> e simular clique (método alternativo)
        try {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_self';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log('[PaymentService] Redirecionamento via elemento <a> executado.');
        } catch (e) {
          console.error('[PaymentService] Erro no redirecionamento alternativo:', e);
          
          // Opção 3: Último recurso - window.open
          try {
            window.open(url, '_self');
            console.log('[PaymentService] Redirecionamento via window.open executado.');
          } catch (e2) {
            console.error('[PaymentService] Todos os métodos de redirecionamento falharam:', e2);
            return false;
          }
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('[PaymentService] Erro crítico no redirecionamento:', error);
      
      // Último recurso para situações extremas - mostrar instruções ao usuário
      try {
        alert('Erro ao redirecionar para a página de pagamento. Por favor, contacte o suporte.');
      } catch {
        // Silenciar qualquer erro ao mostrar o alerta
      }
      
      return false;
    }
  }
};

// Para compatibilidade com a interface atual
export default function PaymentPixModal() {
  return null;
}
