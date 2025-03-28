import React, { useState, useEffect } from 'react';
import { InstagramPost } from '@/types/instagram';
import Image from 'next/image';
import { toast } from 'sonner'; // Importar biblioteca de toast
import { formatNumber } from '@/utils/formatNumber'; // Importar função de formatação

interface ReelSelectorProps {
  username: string;
  onSelectReels?: (reels: InstagramPost[]) => void;
  maxReels?: number;
  selectedPosts?: InstagramPost[];
  totalViews?: number;
  loading?: boolean;
  selectedReels?: InstagramPost[];
  reels?: InstagramPost[]; // Adicionando propriedade para receber reels externamente
  serviceTotalQuantity?: number; // Propriedade para a quantidade total do serviço
  serviceType?: 'visualizacao' | 'curtidas' | 'comentarios'; // Tipo de serviço
}

function ReelSelector({ 
  username, 
  onSelectReels, 
  maxReels = 5,
  selectedPosts = [],  
  totalViews = 100, 
  loading: initialLoading = false,
  selectedReels: initialSelectedReels = [],
  reels: externalReels = [],
  serviceTotalQuantity = 0,
  serviceType = 'visualizacao'
}: ReelSelectorProps) {
  const [reels, setReels] = useState<InstagramPost[]>(externalReels);
  const [error, setError] = useState<string | null>(null);
  const [selectedReels, setSelectedReels] = useState<InstagramPost[]>(initialSelectedReels);
  const [loading, setLoading] = useState(initialLoading);

  // Função para extrair o código correto de um post do Instagram
  const extractPostCode = (post: any): string => {
    // Se o post já tem um código que não é numérico, usar esse código
    if (post.code && !/^\d+$/.test(post.code)) {
      return post.code;
    }
    
    // Se tem shortcode, usar o shortcode
    if (post.shortcode) {
      return post.shortcode;
    }
    
    // Se tem permalink ou link, extrair o código da URL
    if (post.permalink || post.link) {
      const url = post.permalink || post.link;
      const match = url.match(/instagram\.com\/p\/([^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Se nada funcionar, usar o ID
    return post.id;
  };

  // Função para obter URL da imagem através do proxy
  const getProxiedImageUrl = (url: string | undefined): string => {
    if (!url || url.includes('placeholder')) {
      return '/images/placeholder-reel.svg';
    }
    
    // Se a URL já estiver usando o proxy, retorná-la diretamente
    if (url.startsWith('/api/proxy-image') || url.startsWith('/api/proxy/image')) {
      return url;
    }
    
    // Usar o proxy de imagens para evitar problemas de CORS
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  useEffect(() => {
    async function loadReels() {
      if (!username) return;
      
      const MAX_RETRIES = 3;
      let retryCount = 0;

      const fetchWithRetry = async () => {
        try {
          setLoading(true);
          
          // Verificar se temos dados em cache
          const cachedData = sessionStorage.getItem(`reels_${username}`);
          if (cachedData) {
            console.log('Usando dados em cache para reels de:', username);
            const parsedData = JSON.parse(cachedData);
            setReels(parsedData);
            return;
          }
          
          console.log('Buscando reels para:', username);
          
          try {
            // Usar a API de posts com parâmetro type=reels para filtrar apenas reels
            const response = await fetch(`/api/instagram/posts/${username}?type=reels`);
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || `Erro ao buscar reels: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            
            console.log('Resposta da API de posts (filtrada para reels):', responseData);
            
            // Verificar se a resposta tem a estrutura esperada
            if (responseData && typeof responseData === 'object') {
              // Se não tem posts/reels
              if (responseData.hasPosts === false || responseData.hasReels === false) {
                console.log('Nenhum reel encontrado para o usuário:', responseData.message);
                toast.warning(responseData.message || 'Nenhum reel encontrado para este perfil.');
                setReels([]);
                return;
              }
              
              // Determinar onde estão os dados dos reels na resposta
              let reelsData: any[] = [];
              
              if (Array.isArray(responseData)) {
                // Se a resposta é um array direto
                console.log('Resposta é um array direto com', responseData.length, 'itens');
                reelsData = responseData;
              } else if (responseData.posts && Array.isArray(responseData.posts)) {
                // Se a resposta tem a propriedade posts (API de posts)
                console.log('Resposta tem a propriedade posts com', responseData.posts.length, 'itens');
                reelsData = responseData.posts;
              } else if (responseData.posts && responseData.posts.data && responseData.posts.data.items && Array.isArray(responseData.posts.data.items)) {
                // Se a resposta tem a estrutura posts.data.items
                console.log('Resposta tem a estrutura posts.data.items com', responseData.posts.data.items.length, 'itens');
                reelsData = responseData.posts.data.items;
              } else if (responseData.reels && Array.isArray(responseData.reels)) {
                // Se a resposta tem a propriedade reels (API de reels)
                console.log('Resposta tem a propriedade reels com', responseData.reels.length, 'itens');
                reelsData = responseData.reels;
              } else if (responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
                // Se a resposta tem a estrutura data.items (formato Apify direto)
                console.log('Resposta tem a estrutura data.items com', responseData.data.items.length, 'itens');
                reelsData = responseData.data.items;
              } else if (responseData.posts && responseData.posts.data && Array.isArray(responseData.posts.data)) {
                // Se a resposta tem a estrutura posts.data
                console.log('Resposta tem a estrutura posts.data com', responseData.posts.data.length, 'itens');
                reelsData = responseData.posts.data;
              } else {
                console.error('Formato de resposta inesperado:', responseData);
                toast.error('Formato de resposta inesperado. Por favor, tente novamente mais tarde.');
                setReels([]);
                return;
              }
              
              // Filtrar apenas reels
              const reelsOnly = reelsData.filter((post: any) => 
                post.is_reel || 
                post.product_type === 'clips' ||
                post.type === 'video' ||
                post.media_type === 2 ||
                (post.is_video && (post.video_url || post.videoUrl))
              );
              
              if (reelsOnly.length === 0) {
                console.log('Nenhum reel encontrado para o usuário');
                toast.warning('Nenhum reel encontrado para este perfil.');
                setReels([]);
                return;
              }
              
              console.log(`Encontrados ${reelsOnly.length} reels de ${reelsData.length} posts`);
              
              // Processar os reels para o formato esperado pelo componente
              const processedReels = reelsOnly.map((reel: any) => {
                // Verificar se já está no formato esperado
                if (reel.id && reel.thumbnail_url && reel.views_count !== undefined) {
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
                  '/images/placeholder-reel.svg';
                
                // Extrair contagens
                const viewsCount = 
                  reel.views_count || 
                  reel.videoViewCount || 
                  reel.videoPlayCount || 
                  reel.view_count || 
                  reel.play_count || 
                  0;
                  
                const likeCount = reel.like_count || reel.likesCount || 0;
                const commentCount = reel.comment_count || reel.commentsCount || 0;
                
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
                  views_count: viewsCount,
                  play_count: viewsCount,
                  is_reel: true,
                  video_url: reel.videoUrl || reel.video_url || ''
                };
              });

              console.log('Reels processados:', processedReels);

              // Salvar no cache
              sessionStorage.setItem(`reels_${username}`, JSON.stringify(processedReels));
              
              setReels(processedReels);
            } else {
              console.error('Formato de resposta inesperado:', responseData);
              setReels([]);
            }
          } catch (error) {
            console.error('Erro ao carregar reels:', error);
            
            if (retryCount < MAX_RETRIES) {
              const delay = Math.pow(2, retryCount) * 1000;
              retryCount++;
              
              console.warn(`Erro detectado. Retrying in ${delay/1000} seconds. Attempt ${retryCount}`);
              
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchWithRetry();
            }
            
            toast.error('Erro ao carregar reels. Tente novamente.');
            setReels([]);
          } finally {
            setLoading(false);
          }
        } catch (error) {
          console.error('Erro ao carregar reels:', error);
          toast.error('Erro ao carregar reels. Tente novamente.');
          setReels([]);
        }
      };

      fetchWithRetry();
    }

    loadReels();
  }, [username]);

  useEffect(() => {
    if (selectedReels.length === 0 && reels.length > 0 && initialSelectedReels.length > 0) {
      // Verificar se algum reel já está selecionado nas props iniciais
      const preSelectedReels = reels.filter(reel => 
        initialSelectedReels.some(selectedReel => selectedReel.id === reel.id)
      );
      
      if (preSelectedReels.length > 0) {
        console.log('Restaurando reels selecionados:', preSelectedReels.length);
        setSelectedReels(preSelectedReels);
      }
    }
  }, [reels, initialSelectedReels, selectedReels.length]);

  // Atualizar selectedReels quando as props mudarem
  useEffect(() => {
    if (initialSelectedReels && JSON.stringify(initialSelectedReels) !== JSON.stringify(selectedReels)) {
      setSelectedReels(initialSelectedReels);
    }
  }, [initialSelectedReels]);

  // Função para calcular visualizações por item (base)
  const calculateViewsPerItem = () => {
    const totalItems = selectedReels.length + (selectedPosts?.length || 0);
    if (totalItems === 0) return 0;
    
    // Quantidade a usar (do serviço se disponível, ou do totalViews de fallback)
    const totalQuantity = serviceTotalQuantity > 0 ? serviceTotalQuantity : totalViews;
    
    // Distribuição básica
    const baseQuantity = Math.floor(totalQuantity / totalItems);
    return baseQuantity;
  };
  
  // Função para calcular a distribuição detalhada com o resto
  const getItemDistribution = () => {
    const totalItems = selectedReels.length + (selectedPosts?.length || 0);
    if (totalItems === 0) return [];
    
    // Quantidade a usar (do serviço se disponível, ou do totalViews de fallback)
    const totalQuantity = serviceTotalQuantity > 0 ? serviceTotalQuantity : totalViews;
    
    const baseQuantity = Math.floor(totalQuantity / totalItems);
    const remainder = totalQuantity % totalItems;
    
    // Criar um array com a distribuição exata por item
    const distribution = Array(totalItems).fill(baseQuantity);
    
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
  
  // Função para obter a quantidade específica para um reel selecionado
  const getReelQuantity = (reelId: string) => {
    if (itemDistribution.length === 0) return 0;
    
    // Primeiro determinar a lista completa de itens selecionados
    const allSelectedItems = [...selectedPosts, ...selectedReels];
    
    // Encontrar o índice deste reel na lista de itens selecionados
    const reelIndex = allSelectedItems.findIndex(item => item.id === reelId);
    
    // Se o reel não estiver na lista, usar a quantidade base
    if (reelIndex === -1) return calculateViewsPerItem();
    
    // Retornar a quantidade específica deste reel
    return itemDistribution[reelIndex];
  };
  
  // Função para determinar o rótulo do serviço
  const getServiceLabel = () => {
    switch (serviceType) {
      case 'curtidas':
        return 'curtidas';
      case 'visualizacao':
        return 'visualizações';
      case 'comentarios':
        return 'comentários';
      default:
        return 'visualizações';
    }
  };

  // Função para alternar a seleção de um reel
  const toggleReelSelection = (reel: InstagramPost) => {
    // Verificar se o reel já está selecionado
    const isSelected = selectedReels.some(r => r.id === reel.id);
    
    if (isSelected) {
      // Remover o reel da seleção
      const updatedSelection = selectedReels.filter(r => r.id !== reel.id);
      setSelectedReels(updatedSelection);
      
      // Notificar o componente pai
      if (onSelectReels) {
        onSelectReels(updatedSelection);
      }
    } else {
      // Verificar se já atingimos o limite de seleção
      if (selectedReels.length >= maxReels) {
        toast.warning(`Você só pode selecionar até ${maxReels} reels.`);
        return;
      }
      
      // Adicionar o reel à seleção
      const updatedSelection = [...selectedReels, reel];
      setSelectedReels(updatedSelection);
      
      // Notificar o componente pai
      if (onSelectReels) {
        onSelectReels(updatedSelection);
      }
    }
  };

  // Renderizar o componente
  return (
    <div className="w-full">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {selectedReels.length > 0 && serviceTotalQuantity > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
              {!hasUnevenDistribution ? (
                <p className="font-medium">Distribuição: {calculateViewsPerItem()} {getServiceLabel()} por item selecionado</p>
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
          
          {reels.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {reels.map((reel) => {
                const isSelected = selectedReels.some(r => r.id === reel.id);
                
                return (
                  <div 
                    key={reel.id} 
                    className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleReelSelection(reel)}
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={getProxiedImageUrl(reel.image_url)}
                        alt={typeof reel.caption === 'object' ? reel.caption.text : reel.caption || 'Reel do Instagram'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Ícone de reel */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                          <path d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5Zm0 15a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75ZM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
                        </svg>
                      </div>
                      
                      {/* Mostrar quantidade por item quando selecionado */}
                      {isSelected && serviceTotalQuantity > 0 && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
                          +{getReelQuantity(reel.id)}
                        </div>
                      )}
                      
                      {/* Overlay de seleção */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-600 mr-1">
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">
                            {formatNumber(reel.views_count || 0)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-600 mr-1">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                          </svg>
                          <span className="text-xs font-medium">
                            {formatNumber(reel.like_count || 0)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 truncate">
                        {typeof reel.caption === 'object' ? reel.caption.text : reel.caption || ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum reel encontrado para este perfil.</p>
            </div>
          )}
          
          {selectedReels.length > 0 && !serviceTotalQuantity && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                {selectedReels.length} {selectedReels.length === 1 ? 'reel selecionado' : 'reels selecionados'}
              </h3>
              <p className="text-sm text-blue-600">
                Cada reel receberá aproximadamente {formatNumber(calculateViewsPerItem())} visualizações.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReelSelector;