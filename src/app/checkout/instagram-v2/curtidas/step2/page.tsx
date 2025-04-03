'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InstagramPostsReelsStep2 } from '@/components/checkout/InstagramPostsReelsStep2';
import { Loader2 } from 'lucide-react';

export default function Step2Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Carregando...</h2>
        </div>
      </div>
    }>
      <Step2Content />
    </Suspense>
  );
}

function Step2Content() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extrair parâmetros da URL
    const username = searchParams.get('username');
    const service_id = searchParams.get('service_id');
    const quantity = searchParams.get('quantity');

    console.log('Parâmetros da URL:', { username, service_id, quantity });

    // Se houver parâmetros, armazenar no localStorage para que o componente possa acessá-los
    if (username && service_id) {
      // Converter a quantidade para número se estiver disponível, ou usar um valor padrão
      const parsedQuantity = quantity ? parseInt(quantity, 10) : null;
      
      // Verificar se já existem dados de perfil no localStorage
      const existingData = localStorage.getItem('checkoutProfileData');
      let profileInfo = null;
      
      if (existingData) {
        try {
          const parsedData = JSON.parse(existingData);
          // Se existem dados de perfil, usar eles
          profileInfo = parsedData.profileData;
          console.log('Dados de perfil existentes encontrados:', profileInfo);
        } catch (e) {
          console.error('Erro ao parsear dados existentes:', e);
        }
      }
      
      // Se não foi possível recuperar dados de perfil, criar um objeto mínimo
      if (!profileInfo) {
        profileInfo = {
          username: username,
          full_name: username,
          profile_pic_url: 'https://i.imgur.com/6VBx3io.png', // Imagem padrão
          follower_count: 0,
          following_count: 0,
          is_private: false
        };
      }
      
      const checkoutData = {
        user: profileInfo, // Usar perfil completo em vez de apenas {username}
        profileData: profileInfo, // Adicionar também como profileData para compatibilidade
        external_id: service_id,
        service_id: service_id,
        quantidade: parsedQuantity, // Passar a quantidade exata da URL
        // Dados adicionais para garantir consistência
        serviceType: 'curtidas'
      };

      console.log('Salvando dados no localStorage:', checkoutData);
      localStorage.setItem('checkoutProfileData', JSON.stringify(checkoutData));
    }
  }, [searchParams]);

  return (
    <InstagramPostsReelsStep2
      serviceType="curtidas"
      title="Comprar Curtidas para Posts"
    />
  );
}