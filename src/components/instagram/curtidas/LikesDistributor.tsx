'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/app/checkout/instagram/types';
import { Slider } from '@/components/ui/slider';
import { formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { getProxiedImageUrl } from '@/app/checkout/instagram/utils/proxy-image';

interface LikesDistributorProps {
  selectedContent: Post[];
  totalLikes: number;
  onDistributionChange?: (distributedContent: Post[]) => void;
}

export default function LikesDistributor({
  selectedContent,
  totalLikes,
  onDistributionChange
}: LikesDistributorProps) {
  const [distributedContent, setDistributedContent] = useState<Post[]>([]);
  const [remainingLikes, setRemainingLikes] = useState(totalLikes);
  
  // Inicializar a distribuição igualitária quando o conteúdo selecionado mudar
  useEffect(() => {
    if (selectedContent.length === 0) {
      setDistributedContent([]);
      setRemainingLikes(totalLikes);
      return;
    }
    
    // Distribuição inicial igualitária
    const likesPerItem = Math.floor(totalLikes / selectedContent.length);
    const initialDistribution = selectedContent.map(item => ({
      ...item,
      likesDistribution: likesPerItem
    }));
    
    // Calcular likes restantes após distribuição igualitária
    const distributedLikes = likesPerItem * selectedContent.length;
    const remaining = totalLikes - distributedLikes;
    
    setDistributedContent(initialDistribution);
    setRemainingLikes(remaining);
    
    // Notificar o componente pai sobre a distribuição
    if (onDistributionChange) {
      onDistributionChange(initialDistribution);
    }
  }, [selectedContent, totalLikes, onDistributionChange]);
  
  // Atualizar a distribuição de um item específico
  const updateDistribution = (itemId: string, newValue: number) => {
    // Encontrar o item atual
    const currentItem = distributedContent.find(item => item.id === itemId);
    if (!currentItem) return;
    
    // Calcular a diferença entre o valor antigo e o novo
    const oldValue = currentItem.likesDistribution || 0;
    const difference = newValue - oldValue;
    
    // Verificar se temos likes suficientes disponíveis
    if (difference > remainingLikes) {
      // Não temos likes suficientes, ajustar o valor
      const adjustedValue = oldValue + remainingLikes;
      
      // Atualizar o item com o valor ajustado
      const updatedContent = distributedContent.map(item => 
        item.id === itemId 
          ? { ...item, likesDistribution: adjustedValue } 
          : item
      );
      
      setDistributedContent(updatedContent);
      setRemainingLikes(0);
      
      // Notificar o componente pai
      if (onDistributionChange) {
        onDistributionChange(updatedContent);
      }
      
      return;
    }
    
    // Temos likes suficientes, atualizar normalmente
    const updatedContent = distributedContent.map(item => 
      item.id === itemId 
        ? { ...item, likesDistribution: newValue } 
        : item
    );
    
    setDistributedContent(updatedContent);
    setRemainingLikes(remainingLikes - difference);
    
    // Notificar o componente pai
    if (onDistributionChange) {
      onDistributionChange(updatedContent);
    }
  };
  
  // Função para redistribuir igualmente
  const redistributeEvenly = () => {
    if (selectedContent.length === 0) return;
    
    // Calcular o total de likes distribuídos atualmente
    const currentlyDistributed = distributedContent.reduce(
      (sum, item) => sum + (item.likesDistribution || 0), 
      0
    );
    
    // Calcular o total disponível para redistribuição
    const totalAvailable = currentlyDistributed + remainingLikes;
    
    // Distribuir igualmente
    const likesPerItem = Math.floor(totalAvailable / selectedContent.length);
    const updatedContent = selectedContent.map(item => ({
      ...item,
      likesDistribution: likesPerItem
    }));
    
    // Calcular likes restantes após redistribuição
    const redistributedLikes = likesPerItem * selectedContent.length;
    const remaining = totalAvailable - redistributedLikes;
    
    setDistributedContent(updatedContent);
    setRemainingLikes(remaining);
    
    // Notificar o componente pai
    if (onDistributionChange) {
      onDistributionChange(updatedContent);
    }
  };
  
  if (selectedContent.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Selecione posts ou reels para distribuir as curtidas.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Distribuição de curtidas</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {remainingLikes} curtidas disponíveis
          </span>
          <button
            onClick={redistributeEvenly}
            className="text-sm text-primary hover:underline"
          >
            Redistribuir igualmente
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {distributedContent.map(item => (
          <Card key={item.id} className="p-4">
            <div className="flex gap-4">
              {/* Miniatura do post/reel */}
              <div className="w-16 h-16 relative flex-shrink-0">
                <img
                  src={getProxiedImageUrl(item.image_url)}
                  alt={item.caption?.substring(0, 20) || 'Conteúdo do Instagram'}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = item.is_video || item.is_reel
                      ? '/images/placeholder-reel.svg'
                      : '/images/placeholder-post.svg';
                  }}
                />
                {(item.is_video || item.is_reel) && (
                  <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Informações e controle de distribuição */}
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {item.caption || 'Sem legenda'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.is_video || item.is_reel ? 'Reel' : 'Post'} • 
                      {formatNumber(item.like_count || 0)} curtidas atuais
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatNumber(item.likesDistribution || 0)}
                    </p>
                    <p className="text-xs text-gray-500">curtidas a adicionar</p>
                  </div>
                </div>
                
                {/* Slider para ajustar a distribuição */}
                <div className="pt-2">
                  <Slider
                    defaultValue={[item.likesDistribution || 0]}
                    max={totalLikes}
                    step={1}
                    value={[item.likesDistribution || 0]}
                    onValueChange={(values) => updateDistribution(item.id, values[0])}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
