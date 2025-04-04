'use client';

// Importamos apenas o necessário
import { useEffect, useRef } from 'react';

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
  // Referência ao formulário HTML que vamos usar para redirecionamento
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    // Se o modal não estiver aberto, não fazemos nada
    if (!isOpen) return;
    
    console.log('[PaymentPixModal] Modal aberto, preparando redirecionamento');
    
    try {
      // Verificamos se temos dados válidos
      if (!serviceId) {
        console.error('[PaymentPixModal] ERRO: serviceId não definido');
        return;
      }
      
      if (!profileData?.username) {
        console.error('[PaymentPixModal] ERRO: profileData.username não definido');
        return;
      }
      
      if (!amount) {
        console.error('[PaymentPixModal] ERRO: amount não definido');
        return;
      }
      
      // Para evitar problemas de renderização do React, usamos um timeout
      const timer = setTimeout(() => {
        console.log('[PaymentPixModal] Acionando redirecionamento automático');
        
        // Usamos o submit do formulário que configuramos no HTML
        if (formRef.current) {
          formRef.current.submit();
        } else {
          // Como fallback, usamos o método tradicional
          console.log('[PaymentPixModal] Fallback: usando window.location');
          // Preparar dados para URL
          const paymentData = {
            amount,
            service_id: serviceId,
            profile_username: profileData.username,
            customer_email: customerEmail || 'cliente@exemplo.com',
            customer_name: customerName || 'Cliente',
            service_name: serviceName || 'Serviço Viralizamos',
            return_url: returnUrl
          };
          
          // Codificar dados em base64
          const jsonString = JSON.stringify(paymentData);
          const base64Data = btoa(encodeURIComponent(jsonString));
          
          // Gerar URL para o serviço de pagamento
          const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
          const paymentUrl = `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
          
          // Redirecionar usando window.location
          window.location.href = paymentUrl;
        }
      }, 200);
      
      // Limpeza ao desmontar o componente
      return () => {
        clearTimeout(timer);
      };
    } catch (error) {
      console.error('[PaymentPixModal] Erro ao processar redirecionamento:', error);
      if (onClose) onClose();
    }
  }, [isOpen]);
  
  // Geramos a URL de pagamento para o formulário
  const generatePaymentUrl = () => {
    try {
      // Gerar dados de pagamento
      const paymentData = {
        amount,
        service_id: serviceId,
        profile_username: profileData?.username || '',
        customer_email: customerEmail || 'cliente@exemplo.com',
        customer_name: customerName || 'Cliente',
        service_name: serviceName || 'Serviço Viralizamos',
        return_url: returnUrl
      };
      
      // Codificar dados em base64
      const jsonString = JSON.stringify(paymentData);
      const base64Data = btoa(encodeURIComponent(jsonString));
      
      // Construir URL
      const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
      return `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
    } catch (error) {
      console.error('[PaymentPixModal] Erro ao gerar URL:', error);
      return '#';
    }
  };
  
  // Se o modal não estiver aberto, não renderizamos nada
  if (!isOpen) return null;
  
  const paymentUrl = generatePaymentUrl();
  
  // Renderizamos um formulário HTML padrão que será enviado automaticamente
  return (
    <div style={{ display: 'none' }}>
      <form 
        ref={formRef}
        action={paymentUrl} 
        method="get"
        target="_self"
        id="payment-redirect-form"
      >
        <input type="hidden" name="redirect" value="true" />
        <button type="submit">Redirecionar para pagamento</button>
      </form>
    </div>
  );
}
