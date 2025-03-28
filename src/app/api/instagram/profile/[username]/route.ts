import { NextResponse } from 'next/server';
import axios from 'axios';

// Funções tipadas com interfaces para evitar erros de tipo

interface ProfileData {
  username: string;
  full_name: string;
  biography: string;
  followers_count: number;
  following_count: number;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
  media_count: number;
  source: string;
  [key: string]: any; // Para campos opcionais adicionados posteriormente
}

interface PostData {
  id: string;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  play_count?: number;
  media_type?: number;
  is_video?: boolean;
  [key: string]: any; // Para outros campos que possam estar presentes
}

// Função para verificar se um perfil é público usando a RocketAPI
async function checkProfileWithRocketAPI(username: string) {
  try {
    console.log('Verificando perfil com RocketAPI:', username);
    
    const response = await fetch('https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
        'X-RapidAPI-Host': 'rocketapi-for-developers.p.rapidapi.com'
      },
      body: JSON.stringify({
        username: username
      })
    });

    if (!response.ok) {
      throw new Error(`RocketAPI respondeu com status ${response.status}`);
    }

    const data = await response.json();
    
    // Verificar se a resposta é válida
    if (data?.response?.body?.data?.user) {
      const user = data.response.body.data.user;
      
      return {
        username: user.username,
        full_name: user.full_name,
        biography: user.biography || '',
        followers_count: user.edge_followed_by?.count || 0,
        following_count: user.edge_follow?.count || 0,
        profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url,
        is_private: user.is_private === true,
        is_verified: user.is_verified === true,
        media_count: user.edge_owner_to_timeline_media?.count || 0,
        source: 'rocketapi'
      };
    }
    
    throw new Error('Formato de resposta inválido da RocketAPI');
  } catch (error) {
    console.error('Erro na RocketAPI:', error);
    throw error;
  }
}

// Função para enriquecer dados do perfil usando a API ScapeCreators
async function enrichProfileWithScapeCreators(username: string, baseProfileData: ProfileData): Promise<ProfileData> {
  try {
    console.log('Enriquecendo perfil com ScapeCreators APIs:', username);
    
    // 1. Buscar dados básicos do perfil
    const profileApiUrl = `https://api.scrapecreators.com/v1/instagram/profile?handle=${username}`;
    console.log('URL da API de perfil:', profileApiUrl);
    
    const profileResponse = await axios.get(profileApiUrl, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY || '',
      }
    });

    if (profileResponse.status !== 200) {
      console.warn(`ScapeCreators API de perfil respondeu com status ${profileResponse.status}`);
      return baseProfileData; // Retorna os dados básicos se falhar
    }

    const profileData = profileResponse.data;
    console.log('Resposta da API de perfil:', profileData?.data ? 'Dados recebidos' : 'Sem dados');
    
    // 2. Buscar posts para obter métricas adicionais
    const postsApiUrl = `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${username}`;
    console.log('URL da API de posts:', postsApiUrl);
    
    const postsResponse = await axios.get(postsApiUrl, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY || '',
      }
    });

    const postsData = postsResponse.data;
    console.log('Resposta da API de posts:', postsData?.items ? `${postsData.items.length} posts encontrados` : 'Sem posts');
    
    // Combinar dados das duas APIs
    const userData = profileData?.data || {};
    const posts = postsData?.items || [];
    
    // Calcular métricas médias dos posts se disponíveis
    let avgLikes = 0;
    let avgComments = 0;
    let totalReelViews = 0;
    let reelCount = 0;
    
    if (posts.length > 0) {
      const totalLikes = posts.reduce((sum: number, post: PostData) => sum + (post.like_count || 0), 0);
      const totalComments = posts.reduce((sum: number, post: PostData) => sum + (post.comment_count || 0), 0);
      
      avgLikes = Math.round(totalLikes / posts.length);
      avgComments = Math.round(totalComments / posts.length);
      
      // Contar visualizações de reels
      posts.forEach((post: PostData) => {
        if (post.media_type === 2 || post.is_video) { // Identificar reels/vídeos
          totalReelViews += (post.view_count || post.play_count || 0);
          reelCount++;
        }
      });
    }
    
    // Combinar os dados e enriquecer o perfil
    return {
      ...baseProfileData,
      username: userData.username || baseProfileData.username,
      full_name: userData.full_name || baseProfileData.full_name,
      biography: userData.biography || baseProfileData.biography,
      followers_count: userData.follower_count || userData.edge_followed_by?.count || baseProfileData.followers_count,
      following_count: userData.following_count || userData.edge_follow?.count || baseProfileData.following_count,
      profile_pic_url: userData.profile_pic_url || baseProfileData.profile_pic_url,
      media_count: userData.media_count || userData.edge_owner_to_timeline_media?.count || baseProfileData.media_count,
      // Métricas enriquecidas
      avg_likes: avgLikes,
      avg_comments: avgComments,
      total_reel_views: reelCount > 0 ? totalReelViews : undefined,
      reel_count: reelCount > 0 ? reelCount : undefined,
      has_posts: posts.length > 0,
      source: 'combined',
      source_details: {
        profile: profileData?.data ? 'scapecreators_v1' : 'rocketapi',
        posts: posts.length > 0 ? 'scapecreators_v2' : 'none'
      }
    };
  } catch (error) {
    console.error('Erro ao enriquecer perfil com ScapeCreators API:', error);
    return baseProfileData; // Retorna os dados básicos se falhar
  }
}

export async function GET(
  request: Request,
  context: { params: { username: string } }
) {
  try {
    // Extrair o username diretamente dos parâmetros
    const params = await context.params;
    const username = params.username;

    if (!username) {
      return NextResponse.json(
        { error: 'Nome de usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Usar apenas a RocketAPI para obter dados do perfil
    try {
      console.log('Buscando dados do perfil usando exclusivamente a RocketAPI:', username);
      const profileData = await checkProfileWithRocketAPI(username);
      
      // Retornar os dados obtidos pela RocketAPI, sem enriquecimento com outras APIs
      console.log('Perfil obtido com sucesso via RocketAPI');
      return NextResponse.json(profileData);
    } catch (error) {
      console.error('Falha ao verificar com RocketAPI:', error);
      
      // Em caso de erro com a RocketAPI, retornar 404
      return NextResponse.json(
        { error: 'Perfil não encontrado ou indisponível' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erro geral na rota de perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do perfil' },
      { status: 500 }
    );
  }
}
