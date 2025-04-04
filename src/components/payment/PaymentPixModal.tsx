'use client';

// Importamos apenas o necessário
import { useRef, useLayoutEffect } from 'react';

interface PaymentPixModalProps {
  isOpen: boolean;
  onClose?: () => void;
  serviceId: string;
  profileData: {
    username: string;
  };
  amount: number;
  customerEmail?: string;
  customerName?: string;
  serviceName?: string;
  returnUrl?: string;
}

/**
 * IMPORTANTE: Este componente não é mais um modal.
 * Ele é apenas um redirecionador para a página de pagamento do microserviço,
 * mas mantém a mesma interface para não quebrar o código existente.
 */
export default function PaymentPixModal(props: PaymentPixModalProps) {
  // Função que executa o redirecionamento diretamente
  function redirecionarParaPagamento() {
    try {
      // Extrair dados das props
      const { 
        serviceId, 
        profileData, 
        amount, 
        customerEmail = '', 
        customerName = '', 
        serviceName = '', 
        returnUrl = 'https://viralizamos.com/agradecimento' 
      } = props;
      
      console.log('Preparando redirecionamento para pagamento:', { 
        serviceId, 
        username: profileData?.username, 
        amount 
      });
      
      // Verificar dados obrigatórios
      if (!serviceId) {
        console.error('Redirecionamento falhou: serviceId não fornecido');
        return false;
      }
      
      if (!profileData?.username) {
        console.error('Redirecionamento falhou: username não fornecido');
        return false;
      }
      
      if (!amount) {
        console.error('Redirecionamento falhou: amount não fornecido');
        return false;
      }
      
      // Preparar dados para codificação
      const paymentData = {
        amount,
        service_id: serviceId,
        profile_username: profileData.username,
        customer_email: customerEmail || 'cliente@exemplo.com',
        customer_name: customerName || 'Cliente',
        service_name: serviceName || 'Serviço Viralizamos',
        return_url: returnUrl
      };
      
      // Codificar em base64
      let base64Data = '';
      try {
        const jsonString = JSON.stringify(paymentData);
        base64Data = btoa(encodeURIComponent(jsonString));
      } catch (e) {
        console.error('Erro ao codificar dados:', e);
        return false;
      }
      
      // Construir URL final
      const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
      const url = `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
      
      // Iniciar redirecionamento
      console.log('Redirecionando para:', url);
      window.location.href = url;
      
      return true;
    } catch (error) {
      console.error('Erro durante redirecionamento:', error);
      return false;
    }
  }
  
  // Se o modal estiver "aberto", executamos o redirecionamento
  if (props.isOpen && typeof window !== 'undefined') {
    // Executar redirecionamento imediatamente
    const resultado = redirecionarParaPagamento();
    
    // Se falhar e houver callback de fechamento, chamá-lo
    if (!resultado && props.onClose) {
      props.onClose();
    }
  }
  
  // Este componente não renderiza nada visualmente
  return null;
}
