'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getProxiedImageUrl } from '@/app/checkout/instagram-v2/utils/proxy-image';
import { formatCompactNumber } from '@/utils/formatNumber';

interface Post {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  thumbnail_url?: string;
  display_url?: string;
  is_reel?: boolean;
}

interface PostSelectorProps {
  posts?: Post[];
  loading: boolean;
  loadingMessage?: string;
  maxSelectable?: number;
  onSelect?: (selectedPosts: Post[]) => void;
  selectedPosts?: Post[];
  serviceType?: 'curtidas' | 'visualizacao' | 'comentarios';
  username?: string;
  onPostSelect?: (selectedPosts: Post[]) => void;
  maxPosts?: number;
  selectedReels?: Post[];
  serviceTotalQuantity?: number;
  totalSelectedItems?: number;
  onTotalSelectedChange?: (total: number) => void;
}

export default function PostSelector({
  posts = [],
  loading,
  loadingMessage = 'Carregando posts...',
  maxSelectable,
  onSelect,
  selectedPosts = [],
  serviceType = 'curtidas',
  onPostSelect,
  maxPosts,
  selectedReels = [],
  serviceTotalQuantity = 0,
  totalSelectedItems = 0,
  onTotalSelectedChange
}: PostSelectorProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  const effectiveMaxSelectable = maxPosts || maxSelectable || 1;

  const handleSelect = (posts: Post[]) => {
    if (onPostSelect) {
      onPostSelect(posts);
    } else if (onSelect) {
      onSelect(posts);
    }
  };

  useEffect(() => {
    const initialSelected: Record<string, boolean> = {};
    selectedPosts.forEach(post => {
      initialSelected[post.id] = true;
    });
    setSelected(initialSelected);
  }, [selectedPosts]);

  const handlePostClick = (post: Post) => {
    const newSelected = { ...selected };
    const isCurrentlySelected = !!newSelected[post.id];

    if (isCurrentlySelected) {
      // Desselecionar o post
      delete newSelected[post.id];
      setSelected(newSelected);
      
      // Atualizar o total de itens selecionados
      if (onTotalSelectedChange) {
        onTotalSelectedChange(totalSelectedItems - 1);
      }

      const updatedSelectedPosts = posts.filter(post => newSelected[post.id]);
      handleSelect(updatedSelectedPosts);
    } else {
      // Verificar o limite total
      if (totalSelectedItems >= effectiveMaxSelectable) {
        toast.warning(`Você só pode selecionar até ${effectiveMaxSelectable} itens no total (posts + reels)`);
        return;
      }
      
      // Selecionar o post
      newSelected[post.id] = true;
      setSelected(newSelected);
      
      // Atualizar o total de itens selecionados
      if (onTotalSelectedChange) {
        onTotalSelectedChange(totalSelectedItems + 1);
      }

      const updatedSelectedPosts = posts.filter(post => newSelected[post.id]);
      handleSelect(updatedSelectedPosts);
    }
  };

  const getServiceLabel = () => {
    switch (serviceType) {
      case 'curtidas':
        return 'curtidas';
      case 'visualizacao':
        return 'visualizações';
      case 'comentarios':
        return 'comentários';
      default:
        return 'curtidas';
    }
  };

  // Função para calcular a quantidade por post
  const calculateQuantityPerPost = () => {
    const totalSelected = Object.keys(selected).length + (selectedReels?.length || 0);
    if (totalSelected === 0 || serviceTotalQuantity === 0) return 0;
    
    // Distribuição básica
    const baseQuantity = Math.floor(serviceTotalQuantity / totalSelected);
    return baseQuantity;
  };
  
  // Função para calcular a distribuição detalhada com o resto
  const getItemDistribution = () => {
    const totalSelected = Object.keys(selected).length + (selectedReels?.length || 0);
    if (totalSelected === 0 || serviceTotalQuantity === 0) return [];
    
    const baseQuantity = Math.floor(serviceTotalQuantity / totalSelected);
    const remainder = serviceTotalQuantity % totalSelected;
    
    // Criar um array com a distribuição exata por item
    const distribution = Array(totalSelected).fill(baseQuantity);
    
    // Distribuir o resto entre os primeiros itens
    for (let i = 0; i < remainder; i++) {
      distribution[i]++;
    }
    
    return distribution;
  };
  
  // Obter a distribuição para exibição
  const itemDistribution = getItemDistribution();
  
  // Verificar se a distribuição é desigual (com resto)
  const hasUnevenDistribution = 
    itemDistribution.length >= 2 && 
    itemDistribution[0] !== itemDistribution[itemDistribution.length - 1];
  
  // Função para obter a quantidade específica para um post selecionado
  const getPostQuantity = (postId: string) => {
    if (itemDistribution.length === 0) return 0;
    
    // Encontrar o índice deste post na lista de posts selecionados
    const selectedPostIds = [...selectedPosts, ...selectedReels].map(p => p.id);
    const postIndex = selectedPostIds.indexOf(postId);
    
    // Se o post não estiver na lista ou ainda não foi selecionado, usar a quantidade base
    if (postIndex === -1) return calculateQuantityPerPost();
    
    // Retornar a quantidade específica deste post
    return itemDistribution[postIndex];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-600">{loadingMessage}</p>
        <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 font-medium">Nenhum post encontrado para este perfil.</p>
        <p className="text-yellow-600 mt-2">Verifique se o perfil possui posts públicos ou tente outro perfil.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Selecione posts para seu Instagram
        </h3>
      </div>
      
      {/* Contador de itens selecionados - Agora posicionado acima */}
      <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
        <p className="text-sm font-medium text-indigo-700 flex items-center justify-between">
          <span>Total de itens selecionados (posts + reels):</span>
          <span className="font-bold">{totalSelectedItems} / {effectiveMaxSelectable}</span>
        </p>
        {selectedReels.length > 0 && (
          <p className="text-xs text-indigo-600 mt-1">
            Você já selecionou {selectedReels.length} reels na aba Reels
          </p>
        )}
      </div>
      
      {serviceTotalQuantity > 0 && Object.keys(selected).length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg text-purple-700 text-sm">
          {!hasUnevenDistribution ? (
            <p className="font-medium">Distribuição: {calculateQuantityPerPost()} {getServiceLabel()} por item selecionado</p>
          ) : (
            <div>
              <p className="font-medium">Distribuição detalhada ({getServiceLabel()}):</p>
              <div className="grid grid-cols-2 gap-x-2 mt-1 text-xs">
                {itemDistribution.map((quantity, index) => (
                  <div key={index} className="flex justify-between">
                    <span>Item {index + 1}:</span>
                    <span className="font-bold">{quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {posts.slice(0, 12).map((post) => {
          const isSelected = !!selected[post.id];
          const isHovered = hoveredPost === post.id;

          return (
            <Card
              key={post.id}
              className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-purple-500 scale-[1.02]' : ''
              }`}
              onClick={() => handlePostClick(post)}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <div className="relative aspect-square">
                <img
                  src={getProxiedImageUrl(post.image_url || post.thumbnail_url || post.display_url || '')}
                  alt={post.caption || 'Instagram post'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = '/images/placeholder-post.svg';
                  }}
                />

                {/* Mostrar quantidade de curtidas por post quando selecionado */}
                {isSelected && serviceTotalQuantity > 0 && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
                    +{getPostQuantity(post.id)}
                  </div>
                )}

                {/* Overlay para posts selecionados */}
                {isSelected && (
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Overlay para hover */}
                {isHovered && !isSelected && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="font-semibold">Clique para selecionar</p>
                    </div>
                  </div>
                )}

                {/* Métricas sempre visíveis */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black from-40% via-black/70 to-transparent text-white p-1">
                  <div className="flex justify-between items-center text-[10px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center space-x-1.5">
                      {/* Curtidas */}
                      <span className="flex items-center">
                        <span className="mr-0.5 text-[9px]">❤️</span>
                        {formatCompactNumber(post.like_count || 0)}
                      </span>
                      {/* Comentários */}
                      <span className="flex items-center">
                        <span className="mr-0.5 text-[9px]">💬</span>
                        {formatCompactNumber(post.comment_count || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {posts.length > 12 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Mostrando 12 de {posts.length} itens disponíveis
        </div>
      )}
    </div>
  );
}
