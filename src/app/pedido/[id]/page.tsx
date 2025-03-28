'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
  id: string;
  service: {
    name: string;
    descricao: string;
    category: {
      name: string;
      icon: string;
    };
  };
  quantity: number;
  amount: number;
  status: string;
  target_username: string;
  payment_status: string;
  payment_method: string;
  payment_id: string;
  external_order_id: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

export default function OrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Você precisa estar logado para ver este pedido');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            service:services(
              name,
              descricao,
              category:categories(name, icon)
            )
          `)
          .eq('id', params.id)
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        setOrder(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Pedido não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">{order.service.category.icon}</span>
              <span className="text-sm text-gray-500">{order.service.category.name}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{order.service.name}</h1>
            <p className="text-gray-600 mb-6">{order.service.descricao}</p>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Quantidade:</span>
                <span className="font-semibold">{order.quantity}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(order.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Username:</span>
                <span className="font-semibold">{order.target_username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Status do Pedido:</span>
                <span className={`font-semibold ${
                  order.status === 'completed' ? 'text-green-600' :
                  order.status === 'pending' ? 'text-yellow-600' :
                  order.status === 'processing' ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Status do Pagamento:</span>
                <span className={`font-semibold ${
                  order.payment_status === 'paid' ? 'text-green-600' :
                  order.payment_status === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Método de Pagamento:</span>
                  <span className="font-semibold">{order.payment_method}</span>
                </div>
              )}
              {order.payment_id && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">ID do Pagamento:</span>
                  <span className="font-semibold">{order.payment_id}</span>
                </div>
              )}
              {order.external_order_id && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">ID do Pedido Externo:</span>
                  <span className="font-semibold">{order.external_order_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Data do Pedido:</span>
                <span className="font-semibold">
                  {new Date(order.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              {order.updated_at !== order.created_at && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Última Atualização:</span>
                  <span className="font-semibold">
                    {new Date(order.updated_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Precisa de Ajuda?</h2>
              <p className="text-gray-600 mb-6">
                Se você tiver alguma dúvida sobre seu pedido ou precisar de suporte,
                nossa equipe está pronta para ajudar.
              </p>
              <Button
                className="w-full"
                onClick={() => window.location.href = `/suporte?order=${order.id}`}
              >
                Abrir Ticket de Suporte
              </Button>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
