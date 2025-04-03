'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState, useCallback } from 'react';
import { PaymentSuccessModal } from './PaymentSuccessModal';

interface PaymentPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
  targetProfileLink?: string;
  serviceName?: string;
  amount?: number;
  customerData?: {
    name: string;
    email: string;
    phone: string;
  };
  profileData?: {
    username: string;
    full_name?: string;
  };
  postsData?: Array<any>;
}

// Definir interface PixData no início do arquivo
interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId?: string;
}

// Componente para mostrar o timer de expiração
function ExpireTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiresAt.getTime() - now.getTime();
      
      if (difference <= 0) {
        setExpired(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        return;
      }
      
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft({ minutes, seconds });
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  if (expired) {
    return (
      <div className="text-red-600 font-medium text-center my-2">
        O código PIX expirou! Por favor, gere um novo.
      </div>
    );
  }
  
  return (
    <div className="text-center my-2">
      <p className="text-sm text-gray-600 mb-1">Tempo para pagamento:</p>
      <p className="text-lg font-semibold">
        {timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
      </p>
      <p className="text-xs text-gray-500">O código PIX expira em 30 minutos</p>
    </div>
  );
}

export function PaymentPixModal({ 
  isOpen, 
  onClose, 
  serviceId,
  targetProfileLink,
  serviceName,
  amount,
  customerData,
  profileData,
  postsData
}: PaymentPixModalProps) {
  const [serviceUrl] = useState<string>(
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com'
  );

  // Redirecionar diretamente para o microserviço quando o modal é aberto
  useEffect(() => {
    if (isOpen && serviceId && profileData?.username && amount) {
      redirectToPaymentService();
    }
  }, [isOpen, serviceId, profileData, amount]);

  // Função para redirecionar diretamente para o microserviço de pagamentos
  const redirectToPaymentService = async () => {
    if (!serviceId || !profileData?.username || !amount) {
      console.error('Dados insuficientes para pagamento');
      onClose();
      return;
    }

    try {
      console.log('Redirecionando para serviço de pagamento:', {
        amount,
        serviceId,
        profile: profileData.username
      });

      // Construir a URL de pagamento com parâmetros para redirecionamento após o pagamento
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/agradecimento`;
      
      const paymentUrl = `${serviceUrl}/pagamento/pix?` + new URLSearchParams({
        amount: amount.toString(),
        service_id: serviceId,
        profile_username: profileData.username,
        customer_email: customerData?.email || '',
        customer_name: customerData?.name || '',
        service_name: serviceName || '',
        return_url: returnUrl
      }).toString();

      // Redirecionar para a página de pagamento
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Erro ao redirecionar para pagamento:', error);
      onClose();
    }
  };

  // Não renderizar o modal, apenas usar o efeito para redirecionar
  return null;
}
