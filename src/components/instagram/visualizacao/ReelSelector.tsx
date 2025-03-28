'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'sonner';

interface Reel {
  id: string;
  code?: string;
  shortcode?: string;
  image_url?: string;
  display_url?: string;
  thumbnail_url?: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  views_count?: number;
  play_count?: number;
  selected?: boolean;
  displayName?: string;
}

interface ReelSelectorProps {
  username: string;
  onSelectReels: (reel: Reel[]) => void;
  selectedReels: Reel[];
  selectedPosts: Reel[];
  maxReels: number;
  totalViews: number;
  loading: boolean;
}

export function ReelSelector({
  username,
  onSelectReels,
  selectedReels,
  selectedPosts,
  maxReels,
  totalViews,
  loading
}: ReelSelectorProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loadingReels, setLoadingReels] = useState(loading);

  useEffect(() => {
    if (!username) return;

    const fetchReels = async () => {
      try {
        setLoadingReels(true);
        
        // Configurar a requisição para a API do RapidAPI
        const options = {
          method: 'GET',
          url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/user/reels',
          params: { username },
          headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
          }
        };

        console.log('Buscando reels para:', username);
        const response = await axios.request(options);
        const reelsData = response.data.data?.items || response.data.items || [];
        
        console.log(`Encontrados ${reelsData.length} reels para ${username}`);
        
        // Mapear os dados para o formato esperado
        const formattedReels = reelsData.map((reel: any) => {
          // Extrair a URL da imagem de thumbnail
          const thumbnailUrl = 
            reel.image_versions2?.candidates?.[0]?.url || 
            reel.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
            reel.thumbnail_url ||
            '';
          
          return {
            id: reel.id || `reel_${Math.random().toString(36).substring(2, 11)}`,
            code: reel.code || reel.shortcode,
            shortcode: reel.shortcode || reel.code,
            thumbnail_url: thumbnailUrl,
            image_url: thumbnailUrl,
            display_url: thumbnailUrl,
            caption: reel.caption?.text || reel.caption || '',
            like_count: reel.like_count || 0,
            comment_count: reel.comment_count || 0,
            views_count: reel.view_count || reel.play_count || 0,
            play_count: reel.play_count || reel.view_count || 0
          };
        });
        
        setReels(formattedReels);
      } catch (error) {
        console.error('Erro ao buscar reels:', error);
        toast.error('Não foi possível carregar os reels. Tente novamente.');
      } finally {
        setLoadingReels(false);
      }
    };

    fetchReels();
  }, [username]);

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

  // Função para obter URL da imagem através do proxy
  const getProxiedImageUrl = (url: string | undefined): string => {
    if (!url) {
      return '/images/placeholder-reel.svg';
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  // Função para selecionar um reel
  const handleSelectReel = (reel: Reel) => {
    console.log('Selecionando reel:', reel);
    
    // Verificar se o reel já está selecionado
    const isSelected = selectedReels.some(selectedReel => selectedReel.id === reel.id);
    
    if (isSelected) {
      // Remover reel da seleção
      console.log('Removendo reel da seleção:', reel.id);
      const newSelection = selectedReels.filter(r => r.id !== reel.id);
      onSelectReels(newSelection);
      return;
    }
    
    // Verificar se atingiu o limite de itens
    if (selectedPosts.length + selectedReels.length >= maxReels) {
      toast.error(`Você pode selecionar no máximo ${maxReels} itens (posts + reels).`);
      return;
    }

    // Adicionar reel com emoji de olhos e código correto
    const selectedReel = {
      ...reel,
      selected: true,
      displayName: `👀 ${reel.caption || 'Reel sem legenda'}`
    };

    console.log('✅ Reel adicionado à seleção:', {
      id: selectedReel.id,
      code: selectedReel.code,
      shortcode: selectedReel.shortcode
    });
    
    // Adicionar à seleção atual
    onSelectReels([...selectedReels, selectedReel]);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Selecione os reels para receber visualizações</h3>
        <p className="text-sm text-gray-600 mb-2">
          Você pode selecionar até {maxReels} itens (posts + reels)
        </p>
        {selectedReels.length > 0 && (
          <p className="text-sm font-medium text-green-600">
            Cada item receberá aproximadamente {formatNumber(calculateViewsPerItem())} visualizações
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-500">Carregando reels...</p>
        </div>
      ) : (
        <>
          {reels.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-gray-500">Nenhum reel encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {reels.map((reel) => {
                const isSelected = selectedReels.some(selectedReel => selectedReel.id === reel.id);
                const imageUrl = getProxiedImageUrl(reel.thumbnail_url || reel.image_url || reel.display_url);
                
                return (
                  <div 
                    key={reel.id} 
                    className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-pink-500 shadow-md scale-95' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectReel(reel)}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={imageUrl}
                        alt={reel.caption || 'Instagram reel'}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                        onError={(e) => {
                          // Fallback para imagem de placeholder em caso de erro
                          (e.target as HTMLImageElement).src = '/images/placeholder-post.svg';
                        }}
                      />
                      
                      {/* Ícone de vídeo para indicar que é um reel */}
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      
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
                      <p className="text-xs truncate">{reel.caption || 'Sem legenda'}</p>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{formatNumber(reel.views_count || reel.play_count || 0)} 👀</span>
                        <span>{formatNumber(reel.comment_count || 0)} 💬</span>
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
