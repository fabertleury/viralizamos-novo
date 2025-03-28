import axios from 'axios';
import { Post, ProfileData } from '../types';

/**
 * Extrai o código do post a partir de diferentes formatos possíveis
 */
export const extractPostCode = (post: any): string => {
  // Tentar diferentes formatos de código
  if (post.code) return post.code;
  if (post.shortcode) return post.shortcode;
  
  // Tentar extrair de uma URL
  if (post.permalink) {
    const match = post.permalink.match(/\/p\/([^\/]+)/);
    if (match) return match[1];
  }
  
  // Fallback para ID
  return post.id || '';
};

/**
 * Busca posts do Instagram para um usuário específico
 */
export const fetchInstagramPosts = async (username: string): Promise<Post[]> => {
  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/posts',
      params: { username_or_id_or_url: username },
      headers: {
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
        'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    };
    
    const response = await axios.request(options);
    const posts = response.data.data?.items || response.data.items || [];
    
    // Mapear os posts para o formato esperado
    const formattedPosts: Post[] = posts.map((post: any) => {
      // Tentar diferentes caminhos para a imagem do post
      const imageUrl = 
        post.image_versions?.items?.[0]?.url || 
        post.thumbnail_url || 
        post.display_url;
      
      // Extrair o código correto do post para a URL
      const postCode = extractPostCode(post);
      
      return {
        id: post.id || '',
        code: postCode,
        shortcode: postCode,
        image_url: imageUrl,
        caption: post.caption 
          ? (typeof post.caption === 'object' 
            ? post.caption.text || 'Sem legenda'
            : String(post.caption)) 
          : 'Sem legenda',
        like_count: post.like_count || post.likes_count || 0,
        comment_count: post.comment_count || post.comments_count || 0,
        thumbnail_url: post.thumbnail_url || '',
        display_url: post.display_url || '',
        image_versions: post.image_versions || null
      };
    }).filter(post => post.image_url); // Remover posts sem imagem
    
    return formattedPosts;
  } catch (error) {
    console.error('Erro ao buscar posts do Instagram:', error);
    return [];
  }
};

/**
 * Busca reels do Instagram para um usuário específico
 */
export const fetchInstagramReels = async (username: string): Promise<Post[]> => {
  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/reels',
      params: { username_or_id_or_url: username },
      headers: {
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
        'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    };
    
    const response = await axios.request(options);
    const reels = response.data.data?.items || response.data.items || [];
    
    // Mapear os reels para o formato esperado
    const formattedReels: Post[] = reels.map((reel: any) => {
      // Tentar diferentes caminhos para a imagem do reel
      const imageUrl = 
        reel.image_versions?.items?.[0]?.url || 
        reel.thumbnail_url || 
        reel.cover_frame_url || 
        reel.display_url;
      
      // Extrair o código correto do reel para a URL
      const reelCode = extractPostCode(reel);
      
      return {
        id: reel.id || '',
        code: reelCode,
        shortcode: reelCode,
        image_url: imageUrl,
        caption: reel.caption 
          ? (typeof reel.caption === 'object' 
            ? reel.caption.text || 'Sem legenda'
            : String(reel.caption)) 
          : 'Sem legenda',
        like_count: reel.like_count || reel.likes_count || 0,
        comment_count: reel.comment_count || reel.comments_count || 0,
        thumbnail_url: reel.thumbnail_url || '',
        display_url: reel.display_url || '',
        image_versions: reel.image_versions || null
      };
    }).filter(reel => reel.image_url || reel.thumbnail_url || reel.display_url); // Remover reels sem imagem
    
    return formattedReels;
  } catch (error) {
    console.error('Erro ao buscar reels do Instagram:', error);
    return [];
  }
};
