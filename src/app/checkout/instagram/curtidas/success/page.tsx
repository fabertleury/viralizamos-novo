'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transaction_id');
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!transactionId) {
      router.push('/checkout/instagram/curtidas');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        // Buscar a transação no banco
        const { data: transaction, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (error) {
          console.error('Error fetching transaction:', error);
          return;
        }

        if (!transaction) {
          console.error('Transaction not found');
          return;
        }

        // Verificar status no Mercado Pago
        const response = await fetch('/api/payment/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_id: transaction.metadata.payment.id
          }),
        });

        const paymentData = await response.json();
        
        if (paymentData.status !== transaction.status) {
          // Atualizar status na transação
          await supabase
            .from('transactions')
            .update({
              status: paymentData.status,
              metadata: {
                ...transaction.metadata,
                payment: {
                  ...transaction.metadata.payment,
                  status: paymentData.status,
                  updated_at: new Date().toISOString()
                }
              }
            })
            .eq('id', transactionId);
        }

        setStatus(paymentData.status);
        
        if (paymentData.status === 'approved') {
          setLoading(false);
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          setLoading(false);
          // Redirecionar para a página de erro após 2 segundos
          setTimeout(() => {
            router.push('/checkout/instagram/curtidas/error');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Verificar o status a cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000);

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, [transactionId]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {loading ? (
              <>
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                  Verificando Pagamento
                </h2>
                <p className="mt-2 text-gray-600">
                  {status === 'pending' ? (
                    'Aguardando confirmação do pagamento...'
                  ) : (
                    'Processando seu pedido...'
                  )}
                </p>
              </>
            ) : status === 'approved' ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                  Pagamento Aprovado!
                </h2>
                <p className="mt-2 text-gray-600">
                  Seu pedido foi confirmado e está sendo processado.
                </p>
                <div className="mt-6 space-y-3">
                  <Link href={`/acompanhar-pedido?transaction_id=${transactionId}`}>
                    <Button className="w-full bg-pink-500 hover:bg-pink-600">
                      Acompanhar Pedido
                    </Button>
                  </Link>
                  <Link href="/checkout/instagram/curtidas">
                    <Button variant="outline" className="w-full">
                      Fazer Novo Pedido
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                  Pagamento não aprovado
                </h2>
                <p className="mt-2 text-gray-600">
                  Houve um problema com seu pagamento. Por favor, tente novamente.
                </p>
                <div className="mt-6">
                  <Link href="/checkout/instagram/curtidas">
                    <Button className="w-full">
                      Tentar Novamente
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
