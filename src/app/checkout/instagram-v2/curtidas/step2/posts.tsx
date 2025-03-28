import { InstagramPostsReelsStep2 } from '@/components/checkout/InstagramPostsReelsStep2';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export default function Step2Page() {
  const [instagramData, setInstagramData] = useState({ posts: [], reels: [] });

  const fetchInstagramData = async (username: string, nextMaxId?: string) => {
    console.log('Fetching Instagram data for username:', username); // Log para verificar o username
    try {
      const options = {
        method: 'GET',
        url: 'https://api.scrapecreators.com/v2/instagram/user/posts',
        params: { 
          handle: username, 
          next_max_id: nextMaxId || 12 
        },
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY
        }
      };
      const response = await axios.request(options);
      console.log('API Response:', response.data); // Log para verificar a resposta da API
      const data = response.data.data || {};
      setInstagramData({ posts: data.posts || [], reels: data.reels || [] });
    } catch (error) {
      console.error('Erro ao buscar dados do Instagram:', error);
      toast.error('Erro ao buscar dados do Instagram.');
    }
  };

  useEffect(() => {
    const username = new URLSearchParams(window.location.search).get('username');
    console.log('Username from URL:', username); // Log para verificar o username
    if (username) {
      fetchInstagramData(username);
    }
  }, []);

  return (
    <InstagramPostsReelsStep2
      serviceType="curtidas"
      title="Comprar Curtidas para Posts"
    />
  );
}
