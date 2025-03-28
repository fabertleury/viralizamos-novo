'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { PixPayment } from '@/components/payment/PixPayment';

interface Order {
  id: string;
  amount: number;
  quantity: number;
  target_username: string;
  metadata?: Record<string, unknown>;
}

interface PaymentResponse {
  id: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code_base64?: string;
      qr_code?: string;
    };
  };
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function PaymentPage({ params }: PageProps) {
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [pixData, setPixData] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    void fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      if (!order) {
        toast.error('Pedido não encontrado');
        return;
      }

      setOrder(order);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      toast.error('Erro ao buscar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method: string) => {
    try {
      if (method === 'pix' && order) {
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            amount: order.amount,
            method: 'pix'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao processar pagamento');
        }

        // Criar transação no banco
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              order_id: order.id,
              amount: order.amount,
              status: 'pending',
              payment_method: 'pix',
              payment_id: data.id?.toString(),
              metadata: {
                ...order.metadata,
                service_quantity: order.quantity,
                instagram_username: order.target_username,
                payment_response: data
              }
            }
          ])
          .select()
          .single();

        if (transactionError) {
          console.error('Erro ao criar transação:', transactionError);
          toast.error('Erro ao criar transação');
          return;
        }

        // Atualizar o pedido com o ID da transação
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            transaction_id: transaction.id
          })
          .eq('id', order.id);

        if (orderError) {
          console.error('Erro ao atualizar pedido:', orderError);
          toast.error('Erro ao atualizar pedido');
          return;
        }

        setPixData(data);
        setShowPixDialog(true);
      } else {
        toast.info('Pagamento com cartão em breve!');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro no pagamento:', error);
        toast.error(error.message || 'Erro ao processar pagamento');
      }
    }
  };

  const handlePaymentSuccess = () => {
    setShowPixDialog(false);
    toast.success('Pagamento confirmado com sucesso!');
    // Redirecionar para página de sucesso ou atualizar pedido
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Pedido não encontrado</h1>
        <p className="mt-2 text-gray-600">O pedido que você está procurando não existe.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pagamento do Pedido</h1>
        
        {order && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Detalhes do Pedido</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Valor:</p>
                <p className="font-medium">R$ {order.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Quantidade:</p>
                <p className="font-medium">{order.quantity}</p>
              </div>
              <div>
                <p className="text-gray-600">Usuário Instagram:</p>
                <p className="font-medium">{order.target_username}</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Escolha a forma de pagamento:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handlePayment("pix")}
                  className="flex items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <span className="font-medium">Pagar com PIX</span>
                </button>
                <button
                  onClick={() => handlePayment("card")}
                  className="flex items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
                  disabled
                >
                  <span className="font-medium">Pagar com Cartão</span>
                  <span className="text-sm text-gray-500">(em breve)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showPixDialog && pixData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <PixPayment
                qrCodeBase64={pixData.point_of_interaction?.transaction_data?.qr_code_base64 || ''}
                copyPasteCode={pixData.point_of_interaction?.transaction_data?.qr_code || ''}
                orderId={order.id}
                amount={order.amount}
                onPaymentSuccess={handlePaymentSuccess}
              />
              <button
                onClick={() => setShowPixDialog(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
