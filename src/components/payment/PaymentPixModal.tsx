'use client';

import { useEffect } from 'react';

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

// Simplificando o componente ao máximo para evitar problemas de renderização
export default function PaymentPixModal({
  isOpen,
  onClose,
  serviceId,
  profileData,
  amount,
  customerEmail = '',
  customerName = '',
  serviceName = '',
  returnUrl = 'https://viralizamos.com/agradecimento'
}: PaymentPixModalProps) {
  // Log de diagnóstico detalhado
  console.log('[PaymentPixModal] Render', { 
    isOpen, 
    serviceId, 
    profileUsername: profileData?.username || 'undefined', 
    amount 
  });

  // Função para gerar URL de pagamento
  function generatePaymentUrl() {
    try {
      console.log('[PaymentPixModal] Gerando URL de pagamento');
      
      if (!serviceId) {
        console.error('[PaymentPixModal] ERRO: serviceId não definido');
        return null;
      }
      
      if (!profileData || !profileData.username) {
        console.error('[PaymentPixModal] ERRO: profileData.username não definido', profileData);
        return null;
      }
      
      if (!amount) {
        console.error('[PaymentPixModal] ERRO: amount não definido');
        return null;
      }
      
      // Criar objeto com dados do pagamento
      const paymentData = {
        amount,
        service_id: serviceId,
        profile_username: profileData.username,
        customer_email: customerEmail || 'cliente@exemplo.com',
        customer_name: customerName || 'Cliente',
        service_name: serviceName || 'Serviço Viralizamos',
        return_url: returnUrl
      };
      
      console.log('[PaymentPixModal] Dados de pagamento:', paymentData);
      
      // Codificar dados em base64
      const jsonString = JSON.stringify(paymentData);
      const base64Data = btoa(encodeURIComponent(jsonString));
      
      // Construir URL
      const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
      const paymentUrl = `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
      
      console.log('[PaymentPixModal] URL gerada:', paymentUrl);
      return paymentUrl;
    } catch (error) {
      console.error('[PaymentPixModal] Erro ao gerar URL:', error);
      return null;
    }
  }

  // Efeito simplificado para redirecionamento
  useEffect(() => {
    if (!isOpen) {
      console.log('[PaymentPixModal] Modal não está aberto, ignorando');
      return;
    }
    
    console.log('[PaymentPixModal] Modal aberto, iniciando redirecionamento');
    
    // Usar um timer para garantir que estamos fora do ciclo de renderização
    const redirectTimer = setTimeout(() => {
      try {
        console.log('[PaymentPixModal] Executando redirecionamento após timeout');
        const url = generatePaymentUrl();
        
        if (!url) {
          console.error('[PaymentPixModal] Falha ao gerar URL de pagamento');
          if (onClose) {
            console.log('[PaymentPixModal] Fechando modal devido a erro');
            onClose();
          }
          return;
        }
        
        // Registrar que vamos redirecionar
        console.log('[PaymentPixModal] Redirecionando para:', url);
        
        // Redirecionar usando o método mais direto
        if (typeof window !== 'undefined') {
          window.location.href = url;
        }
      } catch (error) {
        console.error('[PaymentPixModal] Erro durante redirecionamento:', error);
        if (onClose) onClose();
      }
    }, 100); // Pequeno atraso para garantir que saímos do ciclo de renderização
    
    // Limpeza
    return () => {
      console.log('[PaymentPixModal] Limpando timer de redirecionamento');
      clearTimeout(redirectTimer);
    };
  }, [isOpen]); // Apenas depender de isOpen para evitar loops infinitos
  
  // Não renderizar nada
  return null;
}
