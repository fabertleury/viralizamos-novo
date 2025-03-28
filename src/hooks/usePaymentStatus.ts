import { useState, useEffect } from 'react';

interface PaymentStatus {
  status: string;
  transaction_id: string;
  error?: string;
}

export const usePaymentStatus = (paymentId: string, initialStatus: string) => {
  const [status, setStatus] = useState<PaymentStatus>({
    status: initialStatus,
    transaction_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutos (10 segundos * 30 tentativas)

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        setStatus(prev => ({
          ...prev,
          error: 'Tempo limite de verificação excedido'
        }));
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/payments/check/' + paymentId);
        const data = await response.json();

        setStatus({
          status: data.status,
          transaction_id: data.transaction_id
        });

        // Se o pagamento foi aprovado ou recusado, parar de verificar
        if (['approved', 'rejected', 'cancelled'].includes(data.status)) {
          clearInterval(intervalId);
        }

        attempts++;
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setStatus(prev => ({
          ...prev,
          error: 'Erro ao verificar status do pagamento'
        }));
      } finally {
        setLoading(false);
      }
    };

    // Verificar imediatamente
    checkStatus();

    // Verificar a cada 10 segundos
    intervalId = setInterval(checkStatus, 10000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentId]);

  return { status, loading };
};
