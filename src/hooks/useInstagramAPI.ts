import axios from 'axios';

// Definir interfaces para tipagem
interface InstagramProfile {
  username: string;
  full_name: string;
  biography: string;
  followers_count: number;
  following_count: number;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
  media_count: number;
}

interface InstagramPost {
  id: string;
  code: string;
  type: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  media_url: string;
  thumbnail_url?: string;
  is_video: boolean;
  video_url?: string;
  views_count?: number;
  timestamp?: string;
}

interface InstagramReel {
  id: string;
  code: string;
  shortcode?: string;
  type: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  media_url: string;
  thumbnail_url: string;
  video_url: string;
  views_count: number;
  timestamp?: string;
  is_video?: boolean;
  is_reel?: boolean;
  media_type?: number;
  link?: string;
  display_url?: string;
  owner?: {
    username: string;
    full_name: string;
    id: string;
  };
}

// Interface para os dados brutos recebidos da API
interface RawPostData {
  id: string;
  code?: string;
  shortcode?: string;
  is_video?: boolean;
  is_carousel?: boolean;
  is_reel?: boolean;
  caption?: string | { text: string };
  like_count?: number;
  comment_count?: number;
  display_url?: string;
  image_versions?: { items?: Array<{ url: string }> };
  thumbnail_src?: string;
  video_url?: string;
  views_count?: number;
  timestamp?: string;
  [key: string]: any; // Para outras propriedades que possam existir
}

// Interface para os dados brutos de reels recebidos da API
interface RawReelData {
  id: string;
  code?: string;
  shortcode?: string;
  caption?: string | { text: string };
  like_count?: number;
  comment_count?: number;
  display_url?: string;
  image_versions?: { items?: Array<{ url: string }> };
  thumbnail_url?: string;
  video_url?: string;
  views_count?: number;
  timestamp?: string;
  [key: string]: any; // Para outras propriedades que possam existir
}

// Interface para dados brutos da RocketAPI
interface RawMediaItem {
  id: string;
  pk?: string | number;
  code?: string;
  media_type?: number;
  caption?: { text: string } | null;
  like_count?: number;
  comment_count?: number;
  taken_at?: number;
  view_count?: number;
  play_count?: number;
  image_versions2?: {
    candidates?: Array<{ url: string; width?: number; height?: number }>;
  };
  carousel_media?: Array<{
    image_versions2?: {
      candidates?: Array<{ url: string; width?: number; height?: number }>;
    };
  }>;
  [key: string]: any; // Para outras propriedades que possam existir
}

interface InstagramLikes {
  likes_count: number;
  likes_list?: {
    username: string;
    full_name: string;
    profile_pic_url: string;
  }[];
}

interface InstagramAPIStatus {
  status: 'online' | 'offline' | 'degraded';
  detail: string;
  last_checked: Date;
}

interface ContentData {
  id: string;
  code: string;
  type: "video" | "image" | "carousel" | string;
  caption: string;
  likes: number;
  comments: number;
  mediaUrl: string;
  timestamp: number;
  views?: number;
  isFromRocketAPI?: boolean;
}

// Interface para dados de stories do Instagram
interface InstagramStoryItem {
  id: string;
  taken_at: number;
  media_type: number;
  code: string;
  caption?: string | null;
  image_url: string;
  video_url?: string;
  mentions: Array<{
    username: string;
    full_name: string;
    profile_pic_url: string;
  }>;
  expiring_at: number;
}

interface InstagramStories {
  items: InstagramStoryItem[];
  user: {
    pk: string | number;
    username: string;
    full_name: string;
    profile_pic_url: string;
  };
}

// Interface para retorno de dados do perfil
interface ProfileInfoResponse {
  username: string;
  full_name: string;
  biography: string;
  followers: number;
  following: number;
  totalPosts: number;
  profilePicture: string;
  isVerified: boolean;
  is_private: boolean;
  source: string;
  [key: string]: string | number | boolean;
}

// Interface para as tags do usuário
interface InstagramTags {
  recent_tags: Array<{ tag: string; count: number }>;
  popular_tags: Array<{ tag: string; count: number }>;
}

// Definir uma interface específica para o item de story da RocketAPI para substituir any
interface RocketAPIStoryItem {
  id?: string;
  pk?: string | number;
  taken_at?: number;
  media_type?: number;
  code?: string;
  caption?: string | null;
  image_versions2?: {
    candidates?: Array<{
      url: string;
      width?: number;
      height?: number;
    }>;
  };
  video_versions?: Array<{
    url: string;
    width?: number;
    height?: number;
  }>;
  reel_mentions?: Array<{
    user?: {
      username?: string;
      full_name?: string;
      profile_pic_url?: string;
    };
  }>;
  expiring_at?: number;
}

// Define interface para menção nos stories
interface RocketAPIStoryMention {
  user?: {
    username?: string;
    full_name?: string;
    profile_pic_url?: string;
  };
}

export const useInstagramAPI = () => {
  // Usar variáveis de ambiente para as chaves da API
  const ROCKET_API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8';
  const ROCKET_API_HOST = 'rocketapi-for-developers.p.rapidapi.com';

  // Função para obter a URL base da aplicação
  const getBaseUrl = () => {
    // No cliente, usamos a URL atual
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host;
      return `${protocol}//${host}`;
    }
    // No servidor, usamos a variável de ambiente ou um valor padrão
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  };

  const makeRequest = async (url: string, params: Record<string, string>) => {
    try {
      // Se a URL não começar com http ou https, consideramos uma URL relativa
      // e adicionamos a URL base
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Remover a barra inicial se existir, pois getBaseUrl já termina com /
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        fullUrl = `${getBaseUrl()}/${cleanUrl}`;
      }
      
      console.log('Fazendo requisição para:', fullUrl);
      const response = await axios.get(fullUrl, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  };

  const checkInstagramProfile = async (username: string): Promise<InstagramProfile | null> => {
    try {
      console.log('Verificando perfil do Instagram com API:', username);
      
      // Usar a API de verificação de perfil
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/instagram/profile/${username}`);
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro ao verificar perfil');
      }
      
      // Extrair dados do perfil
      const profileData: InstagramProfile = {
        username: data.username || username,
        full_name: data.full_name || '',
        biography: data.biography || data.bio || '',
        followers_count: data.followers_count || data.followers || 0,
        following_count: data.following_count || data.following || 0,
        profile_pic_url: data.profile_pic_url || data.profilePicture || '',
        is_private: data.is_private || false,
        is_verified: data.is_verified || data.isVerified || false,
        media_count: data.media_count || data.totalPosts || 0
      };
      
      console.log('Perfil encontrado:', profileData);
      return profileData;
    } catch (error) {
      console.error('Erro ao verificar perfil do Instagram:', error);
      return null;
    }
  };

  const fetchInstagramPosts = async (username: string): Promise<InstagramPost[]> => {
    try {
      console.log('Buscando posts do Instagram com ScapeCreators API:', username);
      
      // Usar a API atualizada com ScapeCreators
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/instagram/posts/${username}?type=posts`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao buscar posts: ${errorData.error || response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Verificar a estrutura da resposta
      if (!responseData || !responseData.items) {
        console.error('Estrutura de resposta inválida:', responseData);
        throw new Error('Formato de resposta inválido da API de posts');
      }
      
      const items = responseData.items;
      
      console.log(`Encontrados ${items.length} posts com ScapeCreators API`);
      return items;
    } catch (error) {
      console.error('Erro ao buscar posts do Instagram:', error);
      return []; // Retornar array vazio em vez de propagar o erro
    }
  };

  const fetchInstagramReels = async (username: string): Promise<InstagramReel[]> => {
    try {
      console.log('Buscando reels do Instagram com ScapeCreators API:', username);
      
      // Usar a API atualizada com ScapeCreators
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/instagram/posts/${username}?type=reels`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao buscar reels: ${errorData.error || response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Verificar a estrutura da resposta
      if (!responseData || !responseData.items) {
        console.warn('Estrutura de resposta inválida para reels:', responseData);
        // Se o usuário não tem reels, retornar array vazio em vez de lançar erro
        if (responseData.message && responseData.message.includes('Nenhum reel encontrado')) {
          console.log('Usuário não possui reels disponíveis:', responseData.message);
          return [];
        }
        throw new Error('Formato de resposta inválido da API de reels');
      }
      
      const items = responseData.items;
      
      console.log(`Encontrados ${items.length} reels com ScapeCreators API`);
      return items;
    } catch (error) {
      console.error('Erro ao buscar reels do Instagram:', error);
      console.log('Usuário não possui reels disponíveis: Este usuário não possui reels');
      return []; // Retornar array vazio em vez de propagar o erro
    }
  };

  const fetchPostLikes = async (postCode: string): Promise<InstagramLikes | null> => {
    try {
      const baseUrl = getBaseUrl();
      const likesData = await makeRequest(`${baseUrl}/api/instagram/likes/${postCode}`, {});

      return {
        likes_count: likesData?.likes_count || 0,
        likes_list: likesData?.likes_list?.map((like: Record<string, string>) => ({
          username: like.username,
          full_name: like.full_name,
          profile_pic_url: like.profile_pic_url
        })) || []
      };
    } catch (error) {
      console.error('Erro ao buscar likes:', error);
      return null;
    }
  };

  const checkInstagramAPIStatus = async (): Promise<InstagramAPIStatus> => {
    try {
      // Verificar o status da API usando um endpoint local
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/instagram/status`);
      
      if (!response.ok) {
        throw new Error('API do Instagram indisponível');
      }
      
      const status: InstagramAPIStatus = {
        status: 'online',
        detail: 'API disponível',
        last_checked: new Date()
      };

      console.log('Status da API do Instagram:', status);
      return status;
    } catch (error: unknown) {
      console.error('Erro ao verificar status da API do Instagram:', error);
      
      return {
        status: 'offline',
        detail: error instanceof Error ? error.message : 'Falha na conexão',
        last_checked: new Date()
      };
    }
  };

  // Função para buscar posts e reels do Instagram usando a RocketAPI
  const fetchRocketAPIMedia = async (username: string): Promise<ContentData[]> => {
    try {
      console.log('Buscando posts e reels do Instagram com RocketAPI:', username);
      
      // Tentar usar a rota de API interna para o RocketAPI primeiro
      try {
        console.log('Tentando usar a rota interna para RocketAPI...');
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/instagram/rocket-media?username=${username}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Sucesso! Encontrados ${data.items?.length || 0} itens via rota interna`);
          
          if (data.items && data.items.length > 0) {
            return data.items;
          }
        } else {
          console.log(`Rota interna falhou com status ${response.status}, tentando diretamente...`);
          // Armazenar o erro para log
          const errorData = await response.text();
          console.error('Erro na rota interna:', errorData);
        }
      } catch (internalRouteError: unknown) {
        console.error('Erro na rota interna:', internalRouteError);
        // Continuar com a chamada direta em caso de erro
      }
      
      // Se a rota interna falhar, tentar diretamente
      try {
        // Buscar ID do usuário primeiro usando a RocketAPI
        const userResponse = await axios.request({
          method: 'POST',
          url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_info',
          headers: {
            'x-rapidapi-key': ROCKET_API_KEY,
            'x-rapidapi-host': ROCKET_API_HOST,
            'Content-Type': 'application/json'
          },
          data: {
            username: username
          },
          timeout: 10000 // 10 segundos timeout
        });
        
        if (!userResponse.data || !userResponse.data.response || !userResponse.data.response.body || 
            !userResponse.data.response.body.data || !userResponse.data.response.body.data.user) {
          throw new Error('ID do usuário não encontrado na RocketAPI');
        }
        
        const userId = parseInt(userResponse.data.response.body.data.user.id, 10); // Converter para inteiro
        console.log(`ID do usuário ${username} na RocketAPI: ${userId}`);
        
        // Buscar posts e reels com o ID do usuário
        const mediaResponse = await axios.request({
          method: 'POST',
          url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_media',
          headers: {
            'x-rapidapi-key': ROCKET_API_KEY,
            'x-rapidapi-host': ROCKET_API_HOST,
            'Content-Type': 'application/json'
          },
          data: {
            id: userId, // Usar o ID como número inteiro
            count: 12,
            max_id: null
          },
          timeout: 10000 // 10 segundos timeout
        });
        
        // Verificar a estrutura correta da resposta (response.body.items)
        if (!mediaResponse.data || !mediaResponse.data.response || !mediaResponse.data.response.body || !mediaResponse.data.response.body.items) {
          throw new Error('Dados de mídia não encontrados na RocketAPI');
        }
        
        // Extrair os itens corretamente de response.body.items
        const items = mediaResponse.data.response.body.items;
        console.log(`Encontrados ${items.length} itens de mídia com RocketAPI direta`);
        
        // Mapear os itens para o formato ContentData
        const contentData: ContentData[] = items.map((item: RawMediaItem) => {
          let mediaUrl = '';
          let mediaType = 'image';
          
          // Determinar URL da mídia e tipo
          if (item.media_type === 1) { // Foto
            mediaUrl = item.image_versions2?.candidates?.[0]?.url || '';
            mediaType = 'image';
          } else if (item.media_type === 2) { // Vídeo/Reel
            mediaUrl = item.image_versions2?.candidates?.[0]?.url || ''; // Thumbnail
            mediaType = 'video';
          } else if (item.media_type === 8) { // Carrossel
            mediaUrl = item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url || '';
            mediaType = 'carousel';
          }
          
          const caption = item.caption?.text || '';
          
          return {
            id: item.id || `rocket_${item.pk}`,
            code: item.code || '',
            type: mediaType,
            caption: caption,
            likes: item.like_count || 0,
            comments: item.comment_count || 0,
            mediaUrl: mediaUrl,
            timestamp: item.taken_at ? item.taken_at * 1000 : Date.now(), // Converter timestamp para milissegundos
            views: item.view_count || item.play_count || 0,
            isFromRocketAPI: true
          };
        });
        
        return contentData;
      } catch (directApiError: unknown) {
        console.error('Erro ao chamar RocketAPI diretamente:', directApiError);
        // Falha em ambas as tentativas, retornando array vazio
        return [];
      }
    } catch (error: unknown) {
      console.error('Erro ao buscar mídia com RocketAPI:', error);
      return []; // Retornar array vazio em caso de erro
    }
  };

  // Função que busca conteúdo (posts/reels) de um perfil do Instagram
  const fetchContent = async (username: string, context = 'dashboard'): Promise<ContentData[]> => {
    // Adicionando logs sobre o contexto e username para debug
    console.log(`fetchContent chamado para username: ${username}, contexto: ${context}`);
    
    // Para a página de análise de perfil (analisar-perfil), usar exclusivamente RocketAPI
    if (context === 'profile_analysis') {
      try {
        console.log('Contexto de análise de perfil - usando exclusivamente RocketAPI');
        const rocketResult = await fetchRocketAPIMedia(username);
        
        if (rocketResult && rocketResult.length > 0) {
          console.log(`RocketAPI retornou ${rocketResult.length} itens de mídia`);
          return rocketResult;
        } else {
          console.warn('RocketAPI não retornou conteúdo para o perfil na análise');
          return [];
        }
      } catch (error: unknown) {
        console.error('Erro ao buscar conteúdo com RocketAPI para análise de perfil:', error);
        throw new Error('Erro ao buscar conteúdo do Instagram com RocketAPI');
      }
    }
    
    // Para outros contextos (dashboard, etc), continuar usando múltiplas APIs
    const results: ContentData[] = [];
    let hasRocketContent = false;
    
    // Tentar RocketAPI primeiro
    try {
      const rocketResult = await fetchRocketAPIMedia(username);
      if (rocketResult && rocketResult.length > 0) {
        results.push(...rocketResult);
        hasRocketContent = true;
        console.log(`Adicionados ${rocketResult.length} itens da RocketAPI aos resultados`);
      } else {
        console.warn('RocketAPI não retornou conteúdo');
      }
    } catch (error: unknown) {
      console.error('Erro na RocketAPI, tentando APIs alternativas:', error);
    }
    
    // Se não conseguimos dados da RocketAPI, usar ScapeCreators como fallback
    if (!hasRocketContent) {
      // Buscar posts
      try {
        console.log('Tentando buscar posts com API alternativa...');
        const postsResult = await fetchInstagramPosts(username);
        if (postsResult && postsResult.length > 0) {
          results.push(...postsResult.map((post: InstagramPost) => ({
          id: post.id,
            code: post.code || '',
            type: post.is_video ? 'video' : ('is_carousel' in post ? 'carousel' : 'image'),
            caption: typeof post.caption === 'object' ? (post.caption as {text: string}).text || '' : (post.caption || ''),
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            mediaUrl: post.media_url || post.thumbnail_url || '',
          timestamp: typeof post.timestamp === 'string' ? new Date(post.timestamp).getTime() : Date.now(),
            views: post.views_count || 0,
            isFromRocketAPI: false
          })));
          console.log(`Adicionados ${postsResult.length} posts aos resultados`);
        } else {
          console.warn('API alternativa não retornou posts');
        }
      } catch (postsError: unknown) {
        console.error('Erro ao buscar posts com API alternativa:', postsError);
      }
      
      // Buscar reels
      try {
        console.log('Tentando buscar reels com API alternativa...');
        const reelsResult = await fetchInstagramReels(username);
        if (reelsResult && reelsResult.length > 0) {
          results.push(...reelsResult.map((reel: InstagramReel) => ({
          id: reel.id,
          code: reel.code || reel.shortcode || '',
          type: 'video',
            caption: typeof reel.caption === 'object' ? (reel.caption as {text: string}).text || '' : (reel.caption || ''),
            likes: reel.likes_count || 0,
            comments: reel.comments_count || 0,
            mediaUrl: reel.media_url || reel.thumbnail_url || '',
          timestamp: typeof reel.timestamp === 'string' ? new Date(reel.timestamp).getTime() : Date.now(),
            views: reel.views_count || 0,
            isFromRocketAPI: false
          })));
          console.log(`Adicionados ${reelsResult.length} reels aos resultados`);
        } else {
          console.warn('API alternativa não retornou reels');
        }
      } catch (reelsError: unknown) {
        console.error('Erro ao buscar reels com API alternativa:', reelsError);
      }
    }
    
    return results;
  };

  const fetchInstagramProfileInfo = async (username: string): Promise<ProfileInfoResponse> => {
    try {
      console.log(`[useInstagramAPI] Buscando informações do perfil: ${username}`);
      
      // Usar o sistema de cascata para verificação de perfil
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/instagram/profile/${username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar perfil');
      }
      
      console.log('Resposta da API de perfil:', data);
      
      return {
        username: data.username || username,
        full_name: data.full_name || '',
        biography: data.bio || data.biography || '',
        followers: data.followers_count || data.followers || 0,
        following: data.following_count || data.following || 0,
        totalPosts: data.posts_count || data.media_count || 0,
        profilePicture: data.profile_pic_url || data.profilePicture || '',
        isVerified: data.is_verified || data.isVerified || false,
        is_private: data.is_private || false,
        // Incluir a fonte da API para debug
        source: data.source || 'API'
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar informações do perfil:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Erro desconhecido ao buscar informações do perfil');
      }
    }
  };

  // Função para buscar stories do Instagram usando a RocketAPI
  const fetchUserStories = async (username: string): Promise<InstagramStories | null> => {
    try {
      console.log('Buscando stories do Instagram com RocketAPI:', username);
      
      // Primeiro, buscar o ID do usuário
      let userId: string | number;
      
      try {
        // Usar a função existente para obter o ID
        const userResponse = await axios.request({
          method: 'POST',
          url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_info',
          headers: {
            'x-rapidapi-key': ROCKET_API_KEY,
            'x-rapidapi-host': ROCKET_API_HOST,
            'Content-Type': 'application/json'
          },
          data: { username }
        });
        
        if (!userResponse.data || !userResponse.data.response || !userResponse.data.response.body || 
            !userResponse.data.response.body.data || !userResponse.data.response.body.data.user) {
          throw new Error('ID do usuário não encontrado na RocketAPI');
        }
        
        userId = parseInt(userResponse.data.response.body.data.user.id, 10); // Converter para inteiro
        console.log(`ID do usuário ${username} para buscar stories: ${userId}`);
      } catch (idError: unknown) {
        console.error('Erro ao buscar ID do usuário para stories:', idError);
        throw new Error('Não foi possível obter o ID do usuário para buscar stories');
      }
      
      // Agora, buscar os stories com o ID do usuário usando o endpoint correto
      const storiesResponse = await axios.request({
        method: 'POST',
        url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_stories',
        headers: {
          'x-rapidapi-key': ROCKET_API_KEY,
          'x-rapidapi-host': ROCKET_API_HOST,
          'Content-Type': 'application/json'
        },
        data: {
          ids: [userId] // Array com o ID do usuário
        },
        timeout: 15000 // 15 segundos timeout
      });
      
      console.log('Resposta da API de stories:', JSON.stringify(storiesResponse.data, null, 2));
      
      // Verificar se a resposta contém dados válidos
      if (!storiesResponse.data || 
          !storiesResponse.data.response || 
          !storiesResponse.data.response.body || 
          !storiesResponse.data.response.body.reels) {
        console.log('Formato de resposta inválido para stories');
        return null;
      }
      
      // Verificar se existem stories para esse ID
      const reelData = storiesResponse.data.response.body.reels[userId];
      if (!reelData || !reelData.items || !reelData.items.length) {
        console.log('Nenhum story encontrado para este usuário');
        return null;
      }
      
      console.log(`Encontrados ${reelData.items.length} stories`);
      
      // Processar os dados dos stories
      const formattedItems: InstagramStoryItem[] = reelData.items.map((item: RocketAPIStoryItem) => {
        // Extrair menções (reel_mentions) se existirem
        const mentions = Array.isArray(item.reel_mentions) 
          ? item.reel_mentions.map((mention: RocketAPIStoryMention) => ({
              username: mention.user?.username || '',
              full_name: mention.user?.full_name || '',
              profile_pic_url: mention.user?.profile_pic_url || ''
            }))
          : [];
        
        // Extrair URL da imagem da estrutura aninhada
        let imageUrl = '';
        if (item.image_versions2 && 
            Array.isArray(item.image_versions2.candidates) && 
            item.image_versions2.candidates.length > 0) {
          imageUrl = item.image_versions2.candidates[0].url || '';
        }
        
        // Extrair URL do vídeo se existir
        let videoUrl = undefined;
        if (item.video_versions && 
            Array.isArray(item.video_versions) && 
            item.video_versions.length > 0) {
          videoUrl = item.video_versions[0].url || undefined;
        }
        
        return {
          id: item.id || `story_${item.pk}`,
          taken_at: item.taken_at || 0,
          media_type: item.media_type || 1,
          code: item.code || '',
          caption: item.caption || null,
          image_url: imageUrl,
          video_url: videoUrl,
          mentions,
          expiring_at: item.expiring_at || 0
        };
      });
      
      // Extrair informações do usuário
      return {
        items: formattedItems,
        user: {
          pk: userId,
          username: reelData.user?.username || username,
          full_name: reelData.user?.full_name || '',
          profile_pic_url: reelData.user?.profile_pic_url || ''
        }
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar stories do Instagram:', error);
      return null;
    }
  };

  // Função para buscar as tags do usuário
  const fetchUserTags = async (username: string): Promise<InstagramTags | null> => {
    try {
      console.log('Buscando tags do Instagram com RocketAPI:', username);
      
      // Usar a API de tags
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/instagram/rocket-tags?username=${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao buscar tags:', errorData.error || response.statusText);
        return null;
      }
      
      const tagsData = await response.json();
      
      return {
        recent_tags: tagsData.recent_tags || [],
        popular_tags: tagsData.popular_tags || []
      };
    } catch (error: unknown) {
      console.error('Erro ao buscar tags do Instagram:', error);
      return null;
    }
  };

  return {
    checkInstagramProfile,
    fetchInstagramPosts,
    fetchInstagramReels,
    fetchPostLikes,
    checkInstagramAPIStatus,
    fetchContent,
    fetchInstagramProfileInfo,
    fetchRocketAPIMedia,
    fetchUserStories,
    fetchUserTags
  };
};
