'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { toast } from 'sonner';
import PostSelector from '@/components/instagram/curtidas/PostSelector';

interface Service {
  id: string;
  name: string;
  description: string;
  preco: number;
  icon: string;
}

export default function PostSelectorPage({ params }: { params: { username: string } }) {
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const searchParams = useSearchParams();
  const supabase = useSupabase();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const serviceId = searchParams.get('service_id');
        if (!serviceId) {
          throw new Error('ID do serviço não encontrado');
        }

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (error) throw error;
        setService(data);
      } catch (error) {
        console.error('Erro ao carregar serviço:', error);
        toast.error('Erro ao carregar serviço');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [searchParams, supabase]);

  const handlePostsSelected = async (selectedPosts: any[]) => {
    try {
      // Criar o pedido com os posts selecionados
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          service_id: searchParams.get('service_id'),
          instagram_username: params.username,
          whatsapp: searchParams.get('whatsapp'),
          email: searchParams.get('email'),
          status: 'pending',
          metadata: {
            posts: selectedPosts,
            service_name: service?.name,
            service_price: service?.preco,
          }
        })
        .select()
        .single();

      if (error) throw error;

      if (!order) {
        throw new Error('Erro ao criar pedido');
      }

      // Redirecionar para a página de pagamento
      window.location.href = `/payment/${order.id}`;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao criar pedido. Por favor, tente novamente.');
    }
  };

  if (loading || !service) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Selecione os posts</h1>
              <p className="text-gray-600 mt-2">
                Escolha os posts do seu perfil @{params.username} que você deseja receber curtidas
              </p>
            </div>

            <PostSelector
              username={params.username}
              onPostsSelected={handlePostsSelected}
              service={service}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
