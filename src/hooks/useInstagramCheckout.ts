import { useState } from 'react';
import { useInstagramAPI } from './useInstagramAPI';

interface CheckoutResult {
  loading: boolean;
  error: string | null;
  data: any;
}

export const useInstagramCheckout = () => {
  const [visualizacaoResult, setVisualizacaoResult] = useState<CheckoutResult>({
    loading: false,
    error: null,
    data: null
  });
  
  const [reelsResult, setReelsResult] = useState<CheckoutResult>({
    loading: false,
    error: null,
    data: null
  });
  
  const [comentariosResult, setComentariosResult] = useState<CheckoutResult>({
    loading: false,
    error: null,
    data: null
  });
  
  const [seguidoresResult, setSeguidoresResult] = useState<CheckoutResult>({
    loading: false,
    error: null,
    data: null
  });
  
  const [curtidasResult, setCurtidasResult] = useState<CheckoutResult>({
    loading: false,
    error: null,
    data: null
  });
  
  const instagramAPI = useInstagramAPI();
  
  // Checkout de visualização (posts e reels)
  const checkoutVisualizacao = async (username: string) => {
    try {
      setVisualizacaoResult({ loading: true, error: null, data: null });
      
      // Usar a nova API de visualização que retorna posts e reels
      const response = await fetch(`/api/instagram/visualizacao/${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar visualizações');
      }
      
      const result = await response.json();
      
      setVisualizacaoResult({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar visualizações';
      setVisualizacaoResult({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  // Checkout de reels (apenas reels)
  const checkoutReels = async (username: string) => {
    try {
      setReelsResult({ loading: true, error: null, data: null });
      
      // Buscar apenas reels usando a ApifyAPI
      const reels = await instagramAPI.fetchInstagramReels(username);
      
      // Verificar se o usuário tem reels
      if (!reels || reels.length === 0) {
        const result = {
          reels: [],
          total: 0,
          hasReels: false,
          message: "Este usuário não possui reels"
        };
        
        setReelsResult({ loading: false, error: null, data: result });
        return result;
      }
      
      const result = {
        reels,
        total: reels.length,
        hasReels: true
      };
      
      setReelsResult({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar reels';
      setReelsResult({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  // Checkout de comentários (posts e reels)
  const checkoutComentarios = async (username: string) => {
    try {
      setComentariosResult({ loading: true, error: null, data: null });
      
      // Usar a nova API de comentários que retorna posts e reels
      const response = await fetch(`/api/instagram/comentarios/${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar comentários');
      }
      
      const result = await response.json();
      
      setComentariosResult({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar comentários';
      setComentariosResult({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  // Checkout de seguidores (quantidade de seguidores)
  const checkoutSeguidores = async (username: string) => {
    try {
      setSeguidoresResult({ loading: true, error: null, data: null });
      
      // Buscar informações de seguidores usando a nova API Apify
      const response = await fetch(`/api/instagram/seguidores/${username}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar seguidores');
      }
      
      setSeguidoresResult({ loading: false, error: null, data: result.data });
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar seguidores';
      setSeguidoresResult({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  // Checkout de curtidas (posts e reels)
  const checkoutCurtidas = async (username: string) => {
    try {
      setCurtidasResult({ loading: true, error: null, data: null });
      
      // Buscar posts e reels simultaneamente usando a ApifyAPI
      const [posts, reels] = await Promise.all([
        instagramAPI.fetchInstagramPosts(username),
        instagramAPI.fetchInstagramReels(username)
      ]);
      
      // Calcular total de curtidas
      const totalCurtidasPosts = posts.reduce((total, post) => total + post.likes_count, 0);
      const totalCurtidasReels = reels.reduce((total, reel) => total + reel.likes_count, 0);
      
      const result = {
        posts: posts.map(post => ({
          id: post.id,
          code: post.code,
          likes_count: post.likes_count,
          media_url: post.media_url
        })),
        reels: reels.map(reel => ({
          id: reel.id,
          code: reel.code,
          likes_count: reel.likes_count,
          media_url: reel.media_url
        })),
        totalCurtidas: totalCurtidasPosts + totalCurtidasReels,
        hasPosts: posts.length > 0,
        hasReels: reels.length > 0,
        message: {
          posts: posts.length === 0 ? "Este usuário não possui posts" : null,
          reels: reels.length === 0 ? "Este usuário não possui reels" : null
        }
      };
      
      setCurtidasResult({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar curtidas';
      setCurtidasResult({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  return {
    visualizacaoResult,
    reelsResult,
    comentariosResult,
    seguidoresResult,
    curtidasResult,
    checkoutVisualizacao,
    checkoutReels,
    checkoutComentarios,
    checkoutSeguidores,
    checkoutCurtidas
  };
};
