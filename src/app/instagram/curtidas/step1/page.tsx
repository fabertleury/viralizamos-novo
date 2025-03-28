'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { PostSelector } from '@/components/instagram/curtidas/PostSelector';
import { InstagramPost } from '@/types/instagram';

export default function Step1Page() {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const supabase = createClient();

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;

      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            category:categories(
              id,
              name,
              subcategories(id, name)
            )
          `)
          .eq('id', serviceId)
          .single();

        if (error) throw error;
        setService(data);
      } catch (error) {
        console.error('Erro ao carregar serviço:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleSelectPosts = (posts: InstagramPost[]) => {
    // Implementar lógica de seleção de posts
    console.log('Posts selecionados:', posts);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!service) {
    return <div>Serviço não encontrado</div>;
  }

  return (
    <div>
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Selecione seu Post</h1>
            <p className="text-lg text-gray-600">
              Escolha o post que receberá {service.quantidade} curtidas
            </p>
          </div>

          <PostSelector 
            username=""
            onSelectPosts={handleSelectPosts}
            maxPosts={1}
            service={service}
          />
        </div>
      </div>
    </div>
  );
}
