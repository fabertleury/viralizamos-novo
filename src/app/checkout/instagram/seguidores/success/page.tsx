'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: string;
  amount: number;
  quantity: number;
  target_username: string;
  created_at: string;
  payment_status: string;
  service: {
    name: string;
  }
}

export default function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const supabase = createClient();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            amount,
            quantity,
            target_username,
            created_at,
            payment_status,
            service:service_id (
              name
            )
          `)
          .eq('payment_id', paymentId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do pedido:', error);
        toast.error('Não foi possível carregar os detalhes do pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [paymentId, supabase]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pedido Recebido!</h1>
            <p className="text-gray-600 max-w-md">
              Seu pedido de seguidores para o Instagram foi recebido com sucesso e está sendo processado.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : order ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalhes do Pedido</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviço:</span>
                  <span className="font-medium text-gray-800">{order.service?.name || 'Seguidores Instagram'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade:</span>
                  <span className="font-medium text-gray-800">{order.quantity} seguidores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Perfil:</span>
                  <span className="font-medium text-gray-800">@{order.target_username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium text-gray-800">R$ {order.amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status do Pagamento:</span>
                  <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment_status === 'paid' ? 'Pago' : 'Aguardando Pagamento'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status do Pedido:</span>
                  <span className="font-medium text-blue-600">
                    {order.status === 'completed' ? 'Concluído' : 'Em Processamento'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-yellow-700 text-center">
                Não foi possível encontrar os detalhes do seu pedido. Se você acabou de realizar a compra, aguarde alguns instantes e atualize a página.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Próximos Passos</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Seu pedido será processado em breve e os seguidores começarão a aparecer em seu perfil.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Mantenha seu perfil público durante todo o processo para garantir a entrega completa.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Você receberá uma notificação por email quando o pedido for concluído.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/instagram/seguidores" passHref>
              <Button variant="outline" className="w-full">
                Voltar para Serviços
              </Button>
            </Link>
            <Link href="/meus-pedidos" passHref>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Ver Meus Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
