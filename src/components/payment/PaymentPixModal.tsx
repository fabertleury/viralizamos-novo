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

// Função para gerar URL de pagamento separada do componente
function generatePaymentUrl(props: PaymentPixModalProps) {
  try {
    // Extrair props
    const { 
      serviceId, 
      profileData, 
      amount, 
      customerEmail = '', 
      customerName = '', 
      serviceName = '', 
      returnUrl = 'https://viralizamos.com/agradecimento' 
    } = props;
    
    // Validar dados críticos
    if (!serviceId || !profileData?.username || !amount) {
      console.error('Dados inválidos para geração de URL:', { serviceId, profileData, amount });
      return '';
    }
    
    // Gerar dados de pagamento
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
    
    // Construir URL
    const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
    return `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
  } catch (error) {
    console.error('Erro ao gerar URL de pagamento:', error);
    return '';
  }
}

// O componente é extremamente simples - apenas um redirecionamento direto
export default function PaymentPixModal(props: PaymentPixModalProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  
  // Não renderizar nada se não estiver aberto
  if (!props.isOpen) return null;
  
  // Gerar a URL de pagamento
  const paymentUrl = generatePaymentUrl(props);
  
  // Se não conseguimos gerar a URL, não renderizar nada
  if (!paymentUrl) {
    console.error('Não foi possível gerar URL de pagamento com os dados fornecidos');
    if (props.onClose) props.onClose();
    return null;
  }
  
  // Acionar o redirecionamento automaticamente ao renderizar
  if (typeof window !== 'undefined') {
    // Redirecionamento direto para evitar problemas com o React
    window.location.href = paymentUrl;
    
    // Retornar null para não renderizar nada
    return null;
  }
  
  // Caso o redirecionamento direto falhe, fornecemos um link de fallback
  return (
    <a 
      ref={linkRef}
      href={paymentUrl}
      style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
      id="payment-redirect-link"
    >
      Redirecionar para pagamento
    </a>
  );
}
