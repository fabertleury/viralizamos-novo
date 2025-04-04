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
 * Objeto com métodos puros para processamento de pagamento
 * Não é um componente React, apenas um utilitário JavaScript
 */
const PaymentService = {
  /**
   * Redireciona o usuário para a página de pagamento PIX
   */
  redirecionarParaPagamentoPixNoMicroservico: (dados: PaymentData): boolean => {
    try {
      console.log('Iniciando redirecionamento para pagamento PIX:', dados);
      
      // Validar dados mínimos
      if (!dados.serviceId || !dados.profileUsername || !dados.amount) {
        console.error('Dados insuficientes para pagamento:', dados);
        return false;
      }
      
      // Criar dados de pagamento
      const paymentData = {
        amount: dados.amount,
        service_id: dados.serviceId,
        profile_username: dados.profileUsername,
        customer_email: dados.customerEmail || 'cliente@exemplo.com',
        customer_name: dados.customerName || 'Cliente',
        service_name: dados.serviceName || 'Serviço Viralizamos',
        return_url: dados.returnUrl || 'https://viralizamos.com/agradecimento'
      };
      
      // Codificar em base64
      let base64Data = '';
      try {
        const jsonString = JSON.stringify(paymentData);
        base64Data = btoa(encodeURIComponent(jsonString));
      } catch (e) {
        console.error('Erro ao codificar dados para pagamento:', e);
        return false;
      }
      
      // Gerar URL final para microserviço
      const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
      const url = `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
      
      // Executar redirecionamento direto
      console.log('Redirecionando para URL de pagamento:', url);
      window.location.href = url;
      return true;
    } catch (error) {
      console.error('Erro fatal durante redirecionamento:', error);
      return false;
    }
  }
};

/**
 * Apenas para manter compatibilidade com a API atual
 * Este componente não renderiza nada, apenas executa o redirecionamento
 */
export default function PaymentPixModal({ 
  isOpen, 
  onClose, 
  serviceId, 
  profileData, 
  amount, 
  customerEmail, 
  customerName, 
  serviceName, 
  returnUrl 
}: any) {
  // Se estiver "aberto", redirecionar imediatamente
  if (isOpen && typeof window !== 'undefined') {
    // Use setTimeout para executar o redirecionamento fora do ciclo do React
    setTimeout(() => {
      try {
        const resultado = PaymentService.redirecionarParaPagamentoPixNoMicroservico({
          serviceId,
          profileUsername: profileData?.username || '',
          amount,
          customerEmail,
          customerName,
          serviceName,
          returnUrl
        });
        
        // Se falhar e tiver callback de fechamento, chamá-lo
        if (!resultado && onClose) {
          onClose();
        }
      } catch (e) {
        console.error('Erro no redirecionamento:', e);
        if (onClose) onClose();
      }
    }, 0);
  }
  
  // Não renderizar nada
  return null;
}

// Exportar o serviço diretamente para uso independente
export { PaymentService };
