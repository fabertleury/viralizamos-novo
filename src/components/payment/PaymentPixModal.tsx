'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState, useCallback } from 'react';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { useRouter } from 'next/navigation';

interface PaymentPixModalProps {
  isOpen: boolean;
  onClose?: () => void;
  serviceId: string;
  profileData: {
    username: string;
  };
  amount: number;
  onPaymentConfirmed?: (paymentId: string) => void;
  customerEmail?: string;
  customerName?: string;
  serviceName?: string;
  returnUrl?: string;
}

interface PaymentData {
  amount: number;
  service_id: string;
  profile_username: string;
  customer_email: string;
  customer_name: string;
  service_name: string;
  return_url: string;
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
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  // Only attempt redirect if component is mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  useEffect(() => {
    // Only redirect if modal is open, component is mounted, and we're not already redirecting
    if (mounted && isOpen && serviceId && profileData?.username && amount && !redirecting) {
      try {
        setRedirecting(true);
        redirectToPaymentService();
      } catch (error) {
        console.error('Erro ao redirecionar para o serviço de pagamento:', error);
        setRedirecting(false);
        // If there's an onClose handler, call it to close the modal on error
        if (onClose) onClose();
      }
    }
  }, [isOpen, serviceId, profileData, amount, mounted, redirecting]);
  
  const redirectToPaymentService = () => {
    if (typeof window === 'undefined') return; // Guard against server-side execution
    
    // Criar objeto com dados do pagamento
    const paymentData: PaymentData = {
      amount,
      service_id: serviceId,
      profile_username: profileData.username,
      customer_email: customerEmail || 'cliente@exemplo.com',
      customer_name: customerName || 'Cliente',
      service_name: serviceName || 'Serviço Viralizamos',
      return_url: returnUrl
    };
    
    try {
      // Codificar dados em base64 usando API nativa do browser
      const jsonString = JSON.stringify(paymentData);
      const base64Data = btoa(encodeURIComponent(jsonString));
      
      // Construir URL para o serviço de pagamento
      const paymentUrl = `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com'}/pagamento/pix#${base64Data}`;
      
      // Usar setTimeout para garantir que o redirect aconteça depois de toda a lógica React
      setTimeout(() => {
        // Redirecionar para o serviço de pagamento
        window.location.href = paymentUrl;
      }, 0);
    } catch (error) {
      console.error('Erro ao preparar dados para redirecionamento:', error);
      throw error;
    }
  };
  
  // O componente não renderiza nada, apenas redireciona
  return null;
}
