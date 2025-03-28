import React, { useState, useEffect } from 'react';
import { InstagramPost } from '@/types/instagram';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'sonner'; // Importar biblioteca de toast
import { formatNumber } from '@/utils/formatNumber'; // Importar função de formatação
import { Loader2 } from 'lucide-react';

interface ReelSelectorProps {
  username: string;
  onSelectReels?: (reels: InstagramPost[]) => void;
  maxReels?: number;
  selectedPosts?: InstagramPost[];
  totalViews?: number;
  totalLikes?: number;
  loading?: boolean;
  loadingMessage?: string;
  selectedReels?: InstagramPost[];
  showReelsOnly?: boolean;
}

function ReelSelector({ 
  username, 
  onSelectReels, 
  maxReels = 5,
  selectedPosts = [],  
  totalViews = 100, 
  totalLikes = 100,
  loading: initialLoading = false,
  loadingMessage = '',
  selectedReels: initialSelectedReels = [],
  showReelsOnly = true
}: ReelSelectorProps) {
  const [reels, setReels] = useState<InstagramPost[]>([]);
  const [filteredReels, setFilteredReels] = useState<InstagramPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedReels, setSelectedReels] = useState<InstagramPost[]>(initialSelectedReels);
  const [loading, setLoading] = useState(initialLoading);
  const [noReelsMessage, setNoReelsMessage] = useState<string>('');

  // Inicializar selectedReels com os valores recebidos via props
  useEffect(() => {
    if (selectedReels.length === 0 && reels.length > 0 && initialSelectedReels.length > 0) {
      // Verificar se algum reel já está selecionado nas props iniciais
      const preSelectedReels = reels.filter(reel => 
        initialSelectedReels.some(selectedReel => selectedReel.id === reel.id)
      );
      setSelectedReels(preSelectedReels);
    }
  }, [reels, initialSelectedReels]);

  useEffect(() => {
    fetchReels();
  }, [username]);

  useEffect(() => {
    // Filtrar reels para excluir posts já selecionados
    const postIds = selectedPosts.map(post => post.id);
    const filtered = reels.filter(reel => !postIds.includes(reel.id));
    setFilteredReels(filtered);
  }, [reels, selectedPosts]);

  const fetchReels = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se já temos os reels em cache
      const cachedReels = sessionStorage.getItem(`reels_${username}`);
      if (cachedReels) {
        const parsedReels = JSON.parse(cachedReels);
        setReels(parsedReels);
        setLoading(false);
        return;
      }
      
      // Usar a nova API de visualização combinada que retorna posts e reels
      console.log('Buscando reels com a API de visualização combinada para:', username);
      const response = await fetch(`/api/instagram/visualizacao/${username}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar reels (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Resposta da API de visualização combinada:', data);
      
      // Verificar se a resposta tem a estrutura esperada
      if (data && typeof data === 'object') {
        // Verificar se o usuário tem reels
        if (!data.hasReels) {
          console.log('Usuário não possui reels:', data.message);
          setNoReelsMessage(data.message || 'Este perfil não possui reels disponíveis.');
          setReels([]);
          setLoading(false);
          return;
        }
        
        // Determinar onde estão os dados dos reels na resposta
        let reelsData: any[] = [];
        
        if (data.reels && Array.isArray(data.reels)) {
          console.log('Resposta tem a propriedade reels com', data.reels.length, 'itens');
          reelsData = data.reels;
        } else if (Array.isArray(data)) {
          // Se a resposta é um array direto
          console.log('Resposta é um array direto com', data.length, 'itens');
          reelsData = data;
        } else {
          console.error('Formato de resposta inesperado:', data);
          toast.error('Formato de resposta inesperado. Por favor, tente novamente mais tarde.');
          setReels([]);
          return;
        }
        
        // Filtrar apenas reels se necessário
        if (showReelsOnly) {
          const reelsOnly = reelsData.filter((post: any) => 
            post.is_reel || 
            post.product_type === 'clips' ||
            post.type === 'video' ||
            post.media_type === 2 ||
            (post.is_video && (post.video_url || post.videoUrl))
          );
          
          if (reelsOnly.length === 0) {
            console.log('Nenhum reel encontrado para o usuário');
            setNoReelsMessage('Nenhum reel encontrado para este perfil.');
            setReels([]);
            setLoading(false);
            return;
          }
          
          console.log(`Encontrados ${reelsOnly.length} reels de ${reelsData.length} posts`);
          reelsData = reelsOnly;
        }
        
        // Processar os reels para o formato esperado pelo componente
        const processedReels = reelsData.map((reel: any) => {
          // Verificar se já está no formato esperado
          if (reel.id && reel.thumbnail_url && reel.like_count !== undefined) {
            return reel;
          }
          
          // Extrair informações do reel
          const id = reel.id || reel.pk || reel.shortCode || `reel_${Math.random().toString(36).substring(2, 11)}`;
          const code = reel.code || reel.shortCode || '';
          const caption = typeof reel.caption === 'string' ? reel.caption : (reel.caption?.text || '');
          
          // Extrair URL da thumbnail
          const thumbnailUrl = 
            reel.thumbnail_url || 
            reel.display_url || 
            reel.image_url ||
            (reel.image_versions2?.candidates?.[0]?.url) || 
            '/images/placeholder-post.svg';
          
          // Extrair contagens
          const likeCount = reel.like_count || reel.likesCount || 0;
          const commentCount = reel.comment_count || reel.commentsCount || 0;
          const viewsCount = reel.views_count || reel.view_count || reel.videoViewCount || 0;
          
          return {
            id,
            code,
            shortcode: code,
            thumbnail_url: thumbnailUrl,
            image_url: thumbnailUrl,
            display_url: thumbnailUrl,
            caption,
            like_count: likeCount,
            comment_count: commentCount,
            is_reel: true,
            is_video: true,
            video_url: reel.videoUrl || reel.video_url || '',
            views_count: viewsCount
          };
        });
        
        console.log(`Processados ${processedReels.length} reels`);
        
        // Salvar em cache
        sessionStorage.setItem(`reels_${username}`, JSON.stringify(processedReels));
        
        setReels(processedReels);
      } else {
        console.error('Formato de resposta inesperado:', data);
        toast.error('Formato de resposta inesperado. Por favor, tente novamente mais tarde.');
        setReels([]);
      }
    } catch (error) {
      console.error('Erro ao carregar reels:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error(`Erro ao carregar reels: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleReelSelection = (reel: InstagramPost) => {
    // Verificar se o reel já está selecionado
    const isSelected = selectedReels.some(r => r.id === reel.id);
    
    if (isSelected) {
      // Remover o reel da seleção
      const updatedReels = selectedReels.filter(r => r.id !== reel.id);
      setSelectedReels(updatedReels);
      
      // Notificar o componente pai
      if (onSelectReels) {
        onSelectReels(updatedReels);
      }
    } else {
      // Verificar se já atingiu o limite de seleção
      if (selectedReels.length >= maxReels) {
        toast.error(`Você só pode selecionar até ${maxReels} reels`);
        return;
      }
      
      // Adicionar o reel à seleção
      const updatedReels = [...selectedReels, reel];
      setSelectedReels(updatedReels);
      
      // Notificar o componente pai
      if (onSelectReels) {
        onSelectReels(updatedReels);
      }
    }
  };

  // Distribuir visualizações igualmente entre os reels selecionados
  const calculateViewsForReel = () => {
    if (selectedReels.length === 0) return 0;
    return Math.floor(totalViews / selectedReels.length);
  };

  // Renderizar mensagem quando não há reels
  if (!loading && filteredReels.length === 0 && noReelsMessage) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <p className="text-yellow-600 mb-4">{noReelsMessage}</p>
          <button 
            onClick={fetchReels} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Selecione os reels para receber visualizações</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">{loadingMessage || 'Carregando reels...'}</span>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {selectedReels.length > 0 
                ? `${selectedReels.length} de ${maxReels} reels selecionados (${formatNumber(calculateViewsForReel())} visualizações por reel)` 
                : `Selecione até ${maxReels} reels para distribuir ${formatNumber(totalViews)} visualizações`}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredReels.map((reel) => {
              const isSelected = selectedReels.some(r => r.id === reel.id);
              
              return (
                <div 
                  key={reel.id} 
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleReelSelection(reel)}
                >
                  <div className="relative pb-[100%]">
                    <Image
                      src={
                        (reel.image_versions2 && reel.image_versions2.candidates && reel.image_versions2.candidates[0]?.url) || 
                        (reel.image_versions && reel.image_versions[0]?.url) || 
                        reel.display_url || 
                        reel.thumbnail_url || 
                        reel.media_url ||
                        reel.image_url ||
                        '/placeholder-image.jpg'
                      }
                      alt={typeof reel.caption === 'string' ? reel.caption : (reel.caption?.text || 'Reel do Instagram')}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 150px, 200px"
                    />
                    
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      Reel
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30">
                    {isSelected && (
                      <div className="bg-blue-500 rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <div className="flex items-center text-white text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{formatNumber(reel.views_count || 0)}</span>
                      
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{formatNumber(reel.like_count || 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredReels.length > 0 && selectedReels.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Selecione pelo menos um reel para receber visualizações
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReelSelector;