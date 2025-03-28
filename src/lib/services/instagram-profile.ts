import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

interface ProfileResult {
  profileData?: {
    username: string;
    full_name: string;
    profile_pic_url: string;
    follower_count: number;
    following_count: number;
    media_count: number;
    is_private: boolean;
  };
  error?: string;
  details?: any;
}

export async function fetchInstagramProfile(username: string): Promise<ProfileResult> {
  console.log(`[INSTAGRAM PROFILE] Buscando perfil para: ${username}`);

  // Remover @ se estiver presente
  const cleanUsername = username.replace(/^@/, '');

  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
      params: {
        username_or_id_or_url: cleanUsername
      },
      headers: {
        'x-rapidapi-key': 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
        'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);

    console.log('[INSTAGRAM PROFILE] Resposta da API:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data) {
      const userData = response.data.data;

      console.log('[INSTAGRAM PROFILE] Valor de is_private:', userData.is_private);

      return {
        profileData: {
          username: userData.username,
          full_name: userData.full_name,
          profile_pic_url: userData.profile_pic_url_hd || userData.profile_pic_url,
          follower_count: userData.follower_count || 0,
          following_count: userData.following_count || 0,
          media_count: userData.media_count || 0,
          is_private: userData.is_private
        }
      };
    } else {
      console.error('[INSTAGRAM PROFILE] Erro ao processar dados:', response.data);
      return { 
        error: 'Perfil não encontrado', 
        details: response.data 
      };
    }
  } catch (error) {
    console.error('[INSTAGRAM PROFILE] Erro na requisição:', error);
    return { 
      error: 'Erro na requisição',
      details: error 
    };
  }
}
