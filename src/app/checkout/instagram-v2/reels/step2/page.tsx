'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { InstagramPostsReelsStep2 } from '@/components/checkout/InstagramPostsReelsStep2';

export default function ReelsStep2Page() {
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
        serviceType: 'reels'
      };

      console.log('Salvando dados no localStorage:', checkoutData);
      localStorage.setItem('checkoutProfileData', JSON.stringify(checkoutData));
    }
  }, [searchParams]);

  return (
    <InstagramPostsReelsStep2
      serviceType="reels"
      title="Turbinar Visualizações para Reels 🚀"
    />
  );
}
