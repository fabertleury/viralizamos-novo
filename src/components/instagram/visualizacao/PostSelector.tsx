'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { getProxiedImageUrl } from '@/app/checkout/instagram/utils/proxy-image';
import { toast } from 'sonner';

interface Post {
  id: string;
  code?: string;
  shortcode?: string;
  image_url?: string;
  display_url?: string;
  thumbnail_url?: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  selected?: boolean;
  displayName?: string;
}

interface PostSelectorProps {
  username: string;
  onPostSelect: (post: Post[]) => void;
  selectedPosts: Post[];
  selectedReels: Post[];
  maxPosts: number;
  service: any;
  posts: Post[] | null;
  totalViews: number;
  loading: boolean;
}

export function PostSelector({
  username,
  onPostSelect,
  selectedPosts,
  selectedReels,
  maxPosts,
  service,
  posts: providedPosts,
  totalViews,
  loading: loadingProp
}: PostSelectorProps) {
  const [loadingState, setLoadingState] = useState(loadingProp);
  const [posts, setPosts] = useState<Post[]>(providedPosts || []);

  // Filtrar posts para remover reels/vídeos
  const filteredPosts = posts.filter(post => {
    // Verificar se não é um reel ou vídeo
    return !post.id?.includes('reel_');
  });

  useEffect(() => {
    if (providedPosts) {
      setPosts(providedPosts);
    }
  }, [providedPosts]);

  useEffect(() => {
    setLoadingState(loadingProp);
  }, [loadingProp]);

  // Função para formatar números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  // Calcular visualizações por item
  const calculateViewsPerItem = (): number => {
    const totalSelectedItems = selectedPosts.length + selectedReels.length;
    if (totalSelectedItems === 0) return 0;
    
    return Math.floor(totalViews / totalSelectedItems);
  };

  // Função para extrair o código do post
  const extractPostCode = (post: Post): string => {
    if (post.code) return post.code;
    if (post.shortcode) return post.shortcode;
    
    // Tentar extrair do ID ou outras propriedades
    const idParts = post.id?.split('_');
    if (idParts && idParts.length > 1) {
      return idParts[1];
    }
    
    console.error('Não foi possível extrair o código do post:', post);
    return 'unknown';
  };

  // Função para obter URL da imagem através do proxy
  const getProxiedImageUrl = (url: string | undefined): string => {
    if (!url) {
      return '/images/placeholder-post.svg';
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  // Função para selecionar um post
  const handleSelectPost = (post: Post) => {
    console.log('Selecionando post:', post);
    
    // Verificar se o post já está selecionado
    const isSelected = selectedPosts.some(selectedPost => selectedPost.id === post.id);
    
    if (isSelected) {
      // Remover post da seleção
      console.log('Removendo post da seleção:', post.id);
      const newSelection = selectedPosts.filter(p => p.id !== post.id);
      onPostSelect(newSelection);
      return;
    }
    
    // Verificar se atingiu o limite de itens
    if (selectedPosts.length + selectedReels.length >= maxPosts) {
      toast.error(`Você pode selecionar no máximo ${maxPosts} itens (posts + reels).`);
      return;
    }
    
    // Extrair código do post
    const postCode = extractPostCode(post);
    if (!postCode) {
      console.error('Código do post não encontrado:', post);
      toast.error('Erro ao selecionar post. Tente novamente.');
      return;
    }

    // Adicionar post com emoji de olhos e código correto
    const selectedPost = {
      ...post,
      code: postCode, // Usar o código extraído
      shortcode: postCode,
      selected: true,
      displayName: `👀 ${post.caption || 'Post sem legenda'}`
    };

    console.log('✅ Post adicionado à seleção:', {
      id: selectedPost.id,
      code: selectedPost.code,
      shortcode: selectedPost.shortcode
    });
    
    // Adicionar à seleção atual
    onPostSelect([...selectedPosts, selectedPost]);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Selecione os posts para receber visualizações</h3>
        <p className="text-sm text-gray-600 mb-2">
          Você pode selecionar até {maxPosts} itens (posts + reels)
        </p>
        {selectedPosts.length > 0 && (
          <p className="text-sm font-medium text-green-600">
            Cada item receberá aproximadamente {formatNumber(calculateViewsPerItem())} visualizações
          </p>
        )}
      </div>
      
      {loadingState ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-500">Carregando posts...</p>
        </div>
      ) : (
        <>
          {filteredPosts.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-gray-500">Nenhum post encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPosts.map((post) => {
                const isSelected = selectedPosts.some(selectedPost => selectedPost.id === post.id);
                const imageUrl = getProxiedImageUrl(post.image_url || post.display_url || post.thumbnail_url);
                
                return (
                  <div 
                    key={post.id} 
                    className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-pink-500 shadow-md scale-95' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectPost(post)}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={imageUrl}
                        alt={post.caption || 'Instagram post'}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                        onError={(e) => {
                          // Fallback para imagem de placeholder em caso de erro
                          (e.target as HTMLImageElement).src = '/images/placeholder-post.svg';
                        }}
                      />
                      
                      {isSelected && (
                        <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                          <div className="bg-pink-500 text-white rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 bg-white">
                      <p className="text-xs truncate">{post.caption || 'Sem legenda'}</p>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{formatNumber(post.like_count || 0)} ❤️</span>
                        <span>{formatNumber(post.comment_count || 0)} 💬</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
