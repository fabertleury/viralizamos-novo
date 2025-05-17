'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getProxiedImageUrl } from '@/app/checkout/instagram-v2/utils/proxy-image';
import { formatCompactNumber } from '@/utils/formatNumber';
import axios from 'axios';

interface Post {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  thumbnail_url?: string;
  display_url?: string;
  is_reel?: boolean;
}

interface InstagramItem {
  id?: string;
  pk?: string;
  code?: string;
  shortcode?: string;
  media_type?: number;
  is_video?: boolean;
  like_count?: number;
  likes?: number;
  comment_count?: number;
  comments?: number;
  view_count?: number;
  play_count?: number;
  play?: number;
  views?: number;
  video_views?: number;
  video_view_count?: number;
  caption?: string | { text: string };
  display_url?: string;
  display_uri?: string;
  thumbnail_url?: string;
  thumbnail_src?: string;
  image_versions2?: {
    candidates?: Array<{
      url: string;
    }>;
  };
  video_url?: string;
  product_type?: string;
  link?: string;
  is_reel?: boolean;
}

interface ReelSelectServiceReelProps {
  reels?: Post[];
  loading: boolean;
  loadingMessage?: string;
  maxSelectable?: number;
  onSelectReels: (selectedReels: Post[]) => void;
  selectedReels?: Post[];
  username?: string;
  maxReels?: number;
  selectedPosts?: Post[];
  onLoadReels?: (reels: Post[]) => void;
}

export default function ReelSelectServiceReel({
  reels: initialReels = [],
  loading: initialLoading = false,
  loadingMessage = 'Carregando reels...',
  maxSelectable,
  onSelectReels,
  selectedReels = [],
  username,
  maxReels,
  selectedPosts = [],
  onLoadReels
}: ReelSelectServiceReelProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hoveredReel, setHoveredReel] = useState<string | null>(null);
  const [reels, setReels] = useState<Post[]>(initialReels);
  const [loading, setLoading] = useState<boolean>(initialLoading);

  const effectiveMaxSelectable = maxReels || maxSelectable || 5;

  // Função para buscar reels do Instagram usando a API
  const fetchReels = async (username: string, nextId: string = '') => {
    if (!username) return;
    
    setLoading(true);
    
    try {
      console.log('Buscando reels para:', username);
      
      // Usar a API correta com o next_max_id
      const response = await axios.get(
        `https://api.scrapecreators.com/v2/instagram/user/posts`,
        {
          params: {
            handle: username,
            ...(nextId ? { next_max_id: nextId } : {})
          },
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY
          }
        }
      );
      
      // Log detalhado da resposta
      console.log('Resposta da API para reels:', response.data);
      console.log('Status:', response.status);
      console.log('Estrutura da resposta:', Object.keys(response.data));
      
      if (response.data) {
        // Verificar se temos o novo formato de resposta com items
        let reelsData = [];
        
        if (response.data.items && Array.isArray(response.data.items)) {
          console.log(`Recebidos ${response.data.items.length} itens do Instagram`);
          reelsData = response.data.items;
        } else if (Array.isArray(response.data)) {
          console.log(`Recebidos ${response.data.length} itens do Instagram`);
          reelsData = response.data;
        } else {
          console.error('Formato de resposta inesperado:', response.data);
          if (!nextId) setReels([]); // Limpar reels apenas se for primeira chamada
          return;
        }
        
        // Filtrar somente reels (media_type = 2 ou produto_type = "clips" são reels)
        const filteredReels = reelsData.filter((item: InstagramItem) => {
          // Critério principal: media_type === 2 (vídeo)
          const isVideoType = item.media_type === 2;
          
          // Critérios auxiliares
          const isReelProductType = item.product_type === "clips" || item.product_type === "reels";
          const hasVideoUrl = !!item.video_url;
          const hasPlayCount = item.play_count !== undefined || item.view_count !== undefined;
          
          // Deve ser do tipo vídeo E ter pelo menos um dos critérios auxiliares
          return isVideoType && (isReelProductType || hasVideoUrl || hasPlayCount);
        });
        
        // Limitar a 12 itens apenas na primeira página
        const limitedReels = nextId ? filteredReels : filteredReels.slice(0, 12);
        
        console.log(`Filtrados ${filteredReels.length} reels do Instagram${!nextId ? ' (limitado a 12 na primeira página)' : ''}`);
        
        // Normalizar os reels para o formato esperado pelo componente
        const normalizedReels = limitedReels.map((reel: InstagramItem) => {
          // Buscar contagem de visualizações
          const viewCount = 
            reel.view_count || 
            reel.play_count || 
            reel.video_view_count || 
            reel.play ||
            reel.views ||
            reel.video_views || 
            0;
          
          // Buscar contagem de curtidas
          const likeCount = 
            reel.like_count || 
            reel.likes || 
            0;
            
          // Buscar contagem de comentários
          const commentCount = 
            reel.comment_count || 
            reel.comments || 
            0;
          
          // Verificar todos os campos possíveis para URL da imagem
          let imageUrl = '';
          if (reel.display_uri) imageUrl = reel.display_uri;
          else if (reel.thumbnail_url) imageUrl = reel.thumbnail_url;
          else if (reel.display_url) imageUrl = reel.display_url;
          else if (reel.image_versions2 && reel.image_versions2.candidates && reel.image_versions2.candidates.length > 0) {
            imageUrl = reel.image_versions2.candidates[0].url;
          }
          
          return {
            id: reel.id || '',
            code: reel.code || '',
            shortcode: reel.shortcode || reel.code || '',
            image_url: imageUrl, 
            thumbnail_url: imageUrl,
            display_url: imageUrl,
            is_reel: true,
            caption: typeof reel.caption === 'object' && reel.caption ? reel.caption.text : (typeof reel.caption === 'string' ? reel.caption : ''),
            like_count: likeCount,
            view_count: viewCount,
            comment_count: commentCount
          };
        });
        
        console.log('Reels normalizados:', normalizedReels.slice(0, 2));
        
        // Atualizar o estado com os novos reels
        setReels(prevReels => nextId ? [...prevReels, ...normalizedReels] : normalizedReels);
        
        // Notificar o componente pai sobre os reels carregados
        if (onLoadReels) {
          onLoadReels(nextId ? [...reels, ...normalizedReels] : normalizedReels);
        }
      } else {
        console.error('Formato de resposta inválido para reels:', response.data);
        if (!nextId) setReels([]); // Limpar reels apenas se for primeira chamada
      }
    } catch (error) {
      console.error('Erro ao buscar reels:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro Axios:');
        console.error('Status:', error.response?.status);
        console.error('Dados:', error.response?.data);
      }
      
      toast.error('Erro ao carregar reels. Tente novamente.');
      if (!nextId) setReels([]); // Limpar reels apenas se for primeira chamada
    } finally {
      setLoading(false);
    }
  };

  // Efeito para inicializar o estado de seleção
  useEffect(() => {
    const initialSelected: Record<string, boolean> = {};
    selectedReels.forEach(reel => {
      initialSelected[reel.id] = true;
    });
    setSelected(initialSelected);
  }, [selectedReels]);

  // Efeito para buscar reels quando o username mudar
  useEffect(() => {
    if (username) {
      fetchReels(username);
    }
  }, [username]);

  // Função para lidar com clique em um reel
  const handleReelClick = (reel: Post) => {
    const newSelected = { ...selected };

    if (newSelected[reel.id]) {
      delete newSelected[reel.id];
    } else {
      // Verificar se já atingimos o limite de seleção
      const totalSelected = Object.keys(newSelected).length + selectedPosts.length;
      if (totalSelected >= effectiveMaxSelectable) {
        toast.warning(`Você só pode selecionar até ${effectiveMaxSelectable} itens no total`);
        return;
      }
      newSelected[reel.id] = true;
    }

    setSelected(newSelected);

    const updatedSelectedReels = reels.filter(reel => newSelected[reel.id]);
    onSelectReels(updatedSelectedReels);
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

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 font-medium">Nenhum reel encontrado para este perfil.</p>
        <p className="text-yellow-600 mt-2">Verifique se o perfil possui reels públicos ou tente outro perfil.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Selecione até {effectiveMaxSelectable} reels para receber visualizações
        </h3>
        <span className="text-sm text-gray-600">
          {Object.keys(selected).length} de {effectiveMaxSelectable} selecionados
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
        {reels.map((reel) => (
          <div 
            key={reel.id} 
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selected[reel.id] ? 'border-pink-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleReelClick(reel)}
            onMouseEnter={() => setHoveredReel(reel.id)}
            onMouseLeave={() => setHoveredReel(null)}
          >
            {/* Thumbnail do Reel com proporção quadrada */}
            <div className="relative pb-[100%]">
              <img
                src={getProxiedImageUrl(reel.image_url)}
                alt={reel.caption || 'Instagram Reel'}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-post.svg';
                }}
              />
              
              {/* Etiqueta de "Reel" */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                📹 Reel
              </div>
              
              {/* Overlay de seleção */}
              {selected[reel.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="bg-pink-500 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                    <span className="text-xl">✓</span>
                  </div>
                </div>
              )}
              
              {/* Overlay ao passar o mouse */}
              {hoveredReel === reel.id && !selected[reel.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                  <span className="text-white font-medium">Selecionar</span>
                </div>
              )}
              
              {/* Informações de estatísticas no gradient na parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center">
                    <span className="mr-1 text-base">👁️</span>
                    {formatCompactNumber(reel.view_count || 0)}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-1 text-base">❤️</span>
                    {formatCompactNumber(reel.like_count || 0)}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-1 text-base">💬</span>
                    {formatCompactNumber(reel.comment_count || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Aviso quando nenhum reel foi selecionado */}
      {reels.length > 0 && Object.keys(selected).length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⚠️ Selecione pelo menos um reel para receber visualizações
          </p>
        </div>
      )}
    </div>
  );
} 