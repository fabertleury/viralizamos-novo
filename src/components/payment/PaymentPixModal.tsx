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

// Simplifying the component - removing all UI rendering and focusing only on redirection
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
  // Use a single ref to track if we've redirected
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Separate side effect from component rendering cycle
  useEffect(() => {
    // Only attempt redirection if we haven't already and the modal is open
    if (isOpen && !hasRedirected && typeof window !== 'undefined') {
      try {
        // Mark as redirected immediately to prevent multiple redirects
        setHasRedirected(true);
        
        // Create payment data object
        const paymentData = {
          amount,
          service_id: serviceId,
          profile_username: profileData?.username || '',
          customer_email: customerEmail || 'cliente@exemplo.com',
          customer_name: customerName || 'Cliente',
          service_name: serviceName || 'Serviço Viralizamos',
          return_url: returnUrl
        };
        
        // Encode as base64 using browser's native API
        const jsonString = JSON.stringify(paymentData);
        const base64Data = btoa(encodeURIComponent(jsonString));
        
        // Build payment URL
        const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
        const paymentUrl = `${paymentServiceUrl}/pagamento/pix#${base64Data}`;
        
        // Redirect to payment service in the browser
        window.location.href = paymentUrl;
      } catch (error) {
        console.error('Erro ao redirecionar para serviço de pagamento:', error);
        // If redirect fails, reset flag and close modal if possible
        setHasRedirected(false);
        if (onClose) onClose();
      }
    }
    
    // When modal closes, reset the redirect flag for next time
    if (!isOpen && hasRedirected) {
      setHasRedirected(false);
    }
  }, [
    isOpen, 
    hasRedirected, 
    serviceId, 
    profileData, 
    amount, 
    customerEmail, 
    customerName, 
    serviceName, 
    returnUrl, 
    onClose
  ]);
  
  // Don't render anything - this component only handles redirection
  return null;
}
