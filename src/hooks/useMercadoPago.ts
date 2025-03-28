'use client';

import { useEffect, useState } from 'react';

interface PaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  additional_info?: {
    items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
    }>;
  };
}

interface PaymentResponse {
  status: string;
  status_detail: string;
  id: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
}

export const useMercadoPago = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      return response.json();
    } catch (error) {
      console.error('Erro no pagamento:', error);
      throw error;
    }
  };

  return { createPayment, isReady };
};