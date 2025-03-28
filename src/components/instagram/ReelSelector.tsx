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
  view_count?: number;
  thumbnail_url?: string;
  display_url?: string;
  is_reel?: boolean;
  media_type?: number;
}

interface ReelSelectorProps {
  reels?: Post[];
  loading: boolean;
  loadingMessage?: string;
  maxSelectable?: number;
  onSelect?: (selectedReels: Post[]) => void;
  selectedReels?: Post[];
  serviceType?: 'curtidas' | 'visualizacao' | 'comentarios';
  username?: string;
  totalSelectedItems?: number;
  onTotalSelectedChange?: (total: number) => void;
  serviceTotalQuantity?: number;
}

export default function ReelSelector({
  reels = [],
  loading,
  loadingMessage = 'Carregando reels...',
  maxSelectable = 5,
  onSelect,
  selectedReels = [],
  serviceType = 'visualizacao',
  totalSelectedItems = 0,
  onTotalSelectedChange,
  serviceTotalQuantity = 0,
}: ReelSelectorProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hoveredReel, setHoveredReel] = useState<string | null>(null);

  const effectiveMaxSelectable = maxSelectable;

  // Inicializar o objeto 'selected' baseado nos reels já selecionados
  useEffect(() => {
    const initialSelected: Record<string, boolean> = {};
    selectedReels.forEach(reel => {
      initialSelected[reel.id] = true;
    });
    setSelected(initialSelected);
  }, [selectedReels]);

  const handleReelClick = (reel: Post) => {
    const newSelected = { ...selected };
    const isCurrentlySelected = !!newSelected[reel.id];

    if (isCurrentlySelected) {
      // Desselecionar o reel
      delete newSelected[reel.id];
      setSelected(newSelected);
      
      // Notificar o componente pai sobre a mudança no total
      if (onTotalSelectedChange) {
        onTotalSelectedChange(totalSelectedItems - 1);
      }
      
      // Atualizar a lista de reels selecionados
      const updatedSelectedReels = reels.filter(r => newSelected[r.id]);
      if (onSelect) {
        onSelect(updatedSelectedReels);
      }
    } else {
      // Verificar se ainda há slots disponíveis
      if (totalSelectedItems >= effectiveMaxSelectable) {
        toast.warning(`Você só pode selecionar até ${effectiveMaxSelectable} itens no total`);
        return;
      }
      
      // Selecionar o novo reel
      newSelected[reel.id] = true;
      setSelected(newSelected);
      
      // Notificar o componente pai sobre a mudança no total
      if (onTotalSelectedChange) {
        onTotalSelectedChange(totalSelectedItems + 1);
      }
      
      // Atualizar a lista de reels selecionados
      const updatedSelectedReels = reels.filter(r => newSelected[r.id]);
      if (onSelect) {
        onSelect(updatedSelectedReels);
      }
    }
  };

  // Função para calcular a quantidade por item
  const calculateQuantityPerItem = () => {
    if (totalSelectedItems === 0 || serviceTotalQuantity === 0) return 0;
    return Math.floor(serviceTotalQuantity / totalSelectedItems);
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
        <p className="text-yellow-700 font-medium">Nenhum item encontrado para este perfil.</p>
        <p className="text-yellow-600 mt-2">Verifique se o perfil possui posts públicos ou tente outro perfil.</p>
      </div>
    );
  }

  // Calcular quantos desse tipo específico estão selecionados
  const currentlySelectedCount = Object.keys(selected).length;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Selecione reels para seu Instagram
        </h3>
      </div>
      
      {/* Contador de itens selecionados - Agora posicionado acima */}
      <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
        <p className="text-sm font-medium text-indigo-700 flex items-center justify-between">
          <span>Total de itens selecionados (posts + reels):</span>
          <span className="font-bold">{totalSelectedItems} / {effectiveMaxSelectable}</span>
        </p>
        {totalSelectedItems > currentlySelectedCount && (
          <p className="text-xs text-indigo-600 mt-1">
            Você já selecionou {totalSelectedItems - currentlySelectedCount} posts na aba Posts
          </p>
        )}
      </div>

      {serviceTotalQuantity > 0 && currentlySelectedCount > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg text-purple-700 text-sm">
          <p className="font-medium">
            Distribuição: {calculateQuantityPerItem()} {serviceType === 'curtidas' ? 'curtidas' : 
              serviceType === 'visualizacao' ? 'visualizações' : 'comentários'} por item selecionado
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {reels.slice(0, 12).map((reel) => {
          const isSelected = !!selected[reel.id];
          const isHovered = hoveredReel === reel.id;

          return (
            <Card
              key={reel.id}
              className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-purple-500 scale-[1.02]' : ''
              }`}
              onClick={() => handleReelClick(reel)}
              onMouseEnter={() => setHoveredReel(reel.id)}
              onMouseLeave={() => setHoveredReel(null)}
            >
              <div className="relative aspect-square">
                <img
                  src={getProxiedImageUrl(reel.image_url || reel.thumbnail_url || reel.display_url || '')}
                  alt={reel.caption || 'Instagram post'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = '/images/placeholder-reel.jpg';
                  }}
                />
                
                {/* Indicadores de tipo de mídia */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  {/* Indicador de carrossel */}
                  {reel.media_type === 8 && (
                    <div className="bg-black bg-opacity-60 rounded-full p-1">
                      <span className="text-white">🖼️</span>
                    </div>
                  )}
                  {/* Indicador de reel */}
                  {reel.is_reel && (
                    <div className="bg-black bg-opacity-60 rounded-full p-1">
                      <span className="text-white">🎬</span>
                    </div>
                  )}
                </div>

                {/* Mostrar quantidade por item quando selecionado */}
                {isSelected && serviceTotalQuantity > 0 && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
                    +{calculateQuantityPerItem()}
                  </div>
                )}

                {/* Overlay para itens selecionados */}
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
                      <p className="font-semibold">Selecione</p>
                    </div>
                  </div>
                )}

                {/* Métricas sempre visíveis */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black from-40% via-black/70 to-transparent text-white p-1">
                  <div className="flex justify-between items-center text-[10px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center space-x-1.5">
                      {/* Visualizações (apenas para reels) */}
                      {reel.is_reel && (
                        <span className="flex items-center">
                          <span className="mr-0.5 text-[9px]">👁️</span>
                          {formatCompactNumber(reel.view_count || 0)}
                        </span>
                      )}
                      {/* Curtidas */}
                      <span className="flex items-center">
                        <span className="mr-0.5 text-[9px]">❤️</span>
                        {formatCompactNumber(reel.like_count || 0)}
                      </span>
                      {/* Comentários */}
                      <span className="flex items-center">
                        <span className="mr-0.5 text-[9px]">💬</span>
                        {formatCompactNumber(reel.comment_count || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {reels.length > 12 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Mostrando 12 de {reels.length} itens disponíveis
        </div>
      )}
    </div>
  );
}
