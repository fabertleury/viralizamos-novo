import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Interface para o perfil do Instagram
interface InstagramProfile {
  username: string;
  full_name: string;
  biography?: string;
  followers_count: number;
  following_count: number;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
  media_count?: number;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username não fornecido' },
      { status: 400 }
    );
  }

  try {
    console.log(`Buscando informações do perfil para o usuário: ${username}`);
    
    // Buscar informações do perfil com a API do ScapeCreators v1
    const profileData = await fetchProfileWithScapeCreatorsAPI(username);
    
    if (!profileData) {
      console.warn(`Nenhuma informação de perfil encontrada para o usuário ${username}`);
      return NextResponse.json({ 
        profile: null,
        hasProfile: false,
        message: `Nenhuma informação de perfil encontrada para este usuário`,
        status: 'success'
      }, { status: 200 });
    }
    
    return NextResponse.json({
      profile: profileData,
      hasProfile: true,
      status: 'success'
    });
  } catch (error) {
    console.error('Erro ao buscar informações do perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações do perfil do Instagram' },
      { status: 500 }
    );
  }
}

// Cache para armazenar resultados de consultas recentes
const profileCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos em milissegundos

async function fetchProfileWithScapeCreatorsAPI(username: string) {
  try {
    // Verificar se temos dados em cache para este usuário
    const cachedData = profileCache.get(username);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando dados em cache para o perfil de ${username}`);
      return cachedData.data;
    }
    
    console.log(`Buscando informações do perfil para o usuário ${username} com ScapeCreators API v1`);
    
    // Configurar a API key do ScapeCreators
    const apiKey = process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_SCRAPECREATORS_API_KEY não está configurada nas variáveis de ambiente');
    }
    
    // Usar a API v1 do ScapeCreators
    const { data } = await axios.get(
      `https://api.scrapecreators.com/v1/instagram/profile?handle=${username}`,
      {
        headers: {
          'x-api-key': apiKey
        },
        timeout: 30000 // 30 segundos de timeout
      }
    );
    
    // Verificar se a resposta tem o formato esperado
    if (!data || (!data.data && !data.user)) {
      console.log('Nenhuma informação de perfil encontrada para o usuário ' + username);
      return null;
    }
    
    // Processar os dados do perfil para o formato esperado pela aplicação
    const userInfo = data.data || data.user;
    
    // Verificar se temos as informações mínimas necessárias
    if (!userInfo.username) {
      console.log('Resposta da API não contém informações de usuário válidas para ' + username);
      return null;
    }
    
    const profileData = {
      username: userInfo.username,
      full_name: userInfo.full_name || userInfo.fullname || userInfo.username,
      biography: userInfo.biography || userInfo.bio || '',
      followers_count: userInfo.follower_count || userInfo.followers || userInfo.edge_followed_by?.count || 0,
      following_count: userInfo.following_count || userInfo.following || userInfo.edge_follow?.count || 0,
      profile_pic_url: userInfo.profile_pic_url || userInfo.profilePicUrl || '',
      is_private: userInfo.is_private || userInfo.private || false,
      is_verified: userInfo.is_verified || userInfo.verified || false,
      media_count: userInfo.media_count || userInfo.posts || userInfo.edge_owner_to_timeline_media?.count || 0
    };
    
    // Armazenar em cache
    profileCache.set(username, {
      data: profileData,
      timestamp: Date.now()
    });
    
    return profileData;
  } catch (error) {
    console.error('Erro ao buscar dados do perfil com ScapeCreators API:', error);
    return null;
  }
}
