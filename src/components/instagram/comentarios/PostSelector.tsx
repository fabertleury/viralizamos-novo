'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { InstagramPost } from '@/types/instagram';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { formatNumber } from '@/utils/formatNumber';

interface Service {
  id: string;
  name: string;
  preco: number;
  quantidade: number;
}

interface PostSelectorProps {
  username: string;
  onSelectPosts?: (posts: InstagramPost[]) => void;
  onPostSelect?: (posts: InstagramPost[]) => void;
  maxPosts?: number;
  service?: Service;
  posts?: InstagramPost[];
  selectedReels?: InstagramPost[];
  totalComments?: number; // Alterado para comentários
  loading?: boolean;
  selectedPosts?: InstagramPost[]; // Adicionado para manter seleções
}

export function PostSelector({ 
  username, 
  onPostSelect, 
  maxPosts = 5, 
  service,
  posts: initialPosts,
  selectedReels = [],
  totalComments = 100, // Valor padrão se não for fornecido (alterado para comentários)
  loading: initialLoading = false,
  selectedPosts: initialSelectedPosts = [] // Inicializar com valor padrão
}: PostSelectorProps) {
  const [loadingState, setLoading] = useState(initialLoading);
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts || []);
  const [selectedPosts, setSelectedPosts] = useState<InstagramPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<InstagramPost[]>([]);
  
  // Inicializar selectedPosts com os valores recebidos via props
  useEffect(() => {
    if (selectedPosts.length === 0 && posts.length > 0 && initialSelectedPosts.length > 0) {
      // Verificar se algum post já está selecionado nas props iniciais
      const preSelectedPosts = posts.filter(post => 
        initialSelectedPosts.some(selectedPost => selectedPost.id === post.id)
      );
      
      if (preSelectedPosts.length > 0) {
        console.log('Restaurando posts selecionados:', preSelectedPosts.length);
        setSelectedPosts(preSelectedPosts);
      }
    }
  }, [posts, initialSelectedPosts, selectedPosts.length]);

  // Atualizar selectedPosts quando as props mudarem
  useEffect(() => {
    if (initialSelectedPosts && JSON.stringify(initialSelectedPosts) !== JSON.stringify(selectedPosts)) {
      setSelectedPosts(initialSelectedPosts);
    }
  }, [initialSelectedPosts]);

  // Função para selecionar a melhor URL de imagem disponível
  const selectBestImageUrl = (post: any): string => {
    // Se for um carrossel, usar a imagem principal ou a primeira do carrossel
    if (post.is_carousel && post.image_versions?.items?.[0]?.url) {
      return post.image_versions.items[0].url;
    }
    
    // Tentar obter a URL da imagem de várias propriedades possíveis
    if (post.image_url) return post.image_url;
    if (post.display_url) return post.display_url;
    if (post.thumbnail_url) return post.thumbnail_url;
    
    // Verificar se temos image_versions
    if (post.image_versions?.items?.[0]?.url) {
      return post.image_versions.items[0].url;
    }
    
    // Se nada funcionar, usar um placeholder
    return '/images/placeholder-post.svg';
  };

  // Função para obter URL da imagem através do proxy
  const getProxiedImageUrl = (url: string | undefined): string => {
    if (!url) {
      return '/images/placeholder-post.svg';
    }
    
    // Se a URL já estiver usando o proxy, retorná-la diretamente
    if (url.startsWith('/api/proxy-image') || url.startsWith('/api/proxy/image')) {
      return url;
    }
    
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  // Função para extrair o código correto de um post do Instagram
  const extractPostCode = (post: any): string => {
    // Se o post já tem um código que não é numérico, usar esse código
    if (post.code && !/^\d+$/.test(post.code)) {
      console.log('✅ Usando código existente:', post.code);
      return post.code;
    }
    
    // Se tem shortcode, usar o shortcode
    if (post.shortcode) {
      console.log('✅ Usando shortcode:', post.shortcode);
      return post.shortcode;
    }
    
    // Se tem permalink ou link, extrair o código da URL
    if (post.permalink || post.link) {
      const url = post.permalink || post.link;
      const match = url.match(/instagram\.com\/p\/([^\/]+)/);
      if (match && match[1]) {
        console.log('✅ Código extraído da URL:', match[1]);
        return match[1];
      }
    }
    
    // Se nada funcionar, usar o ID (não ideal, mas é o que temos)
    console.warn('⚠️ Não foi possível extrair um código curto válido, usando ID:', post.id);
    return post.id;
  };

  // Função para calcular comentários por item
  const calculateCommentsPerItem = () => {
    const totalSelectedItems = selectedPosts.length + selectedReels.length;
    if (!totalSelectedItems) return 0;
    return Math.floor(totalComments / totalSelectedItems);
  };

  const handleSelectPost = (post: InstagramPost) => {
    const totalSelectedItems = selectedPosts.length + selectedReels.length;
    const isAlreadySelected = selectedPosts.some(selectedPost => selectedPost.id === post.id);

    // Log detalhado do post selecionado
    console.log('🔍 Post selecionado - dados completos:', {
      id: post.id,
      code: post.code,
      shortcode: post.shortcode,
      image_url: post.image_url,
      caption: post.caption
    });
    
    // Extrair o código correto
    const postCode = extractPostCode(post);
    console.log('🔍 Código extraído para o post:', postCode);

    if (isAlreadySelected) {
      // Se já selecionado, remover
      const updatedSelectedPosts = selectedPosts.filter(selectedPost => selectedPost.id !== post.id);
      setSelectedPosts(updatedSelectedPosts);
      
      // Atualizar callbacks
      if (onPostSelect) onPostSelect(updatedSelectedPosts);
      return;
    }

    if (totalSelectedItems >= maxPosts) {
      toast.warning(`Você pode selecionar no máximo ${maxPosts} itens entre posts e reels`);
      return;
    }

    // Adicionar post com emoji de comentário e código correto
    const selectedPost = {
      ...post,
      code: postCode, // Usar o código extraído
      shortcode: postCode,
      selected: true,
      displayName: `💬 ${post.caption || 'Post sem legenda'}`
    };

    console.log('✅ Post adicionado à seleção:', {
      id: selectedPost.id,
      code: selectedPost.code,
      url: `https://instagram.com/p/${selectedPost.code}`
    });

    const updatedSelectedPosts = [...selectedPosts, selectedPost];
    setSelectedPosts(updatedSelectedPosts);
    
    // Atualizar callbacks
    if (onPostSelect) onPostSelect(updatedSelectedPosts);
  };

  useEffect(() => {
    async function loadPosts() {
      if (!username) return;
      
      const MAX_RETRIES = 3;
      let retryCount = 0;

      const fetchWithRetry = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/instagram/posts/${username}`, {
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Erro ao buscar posts: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(`📊 Recebidos ${data.length} posts para ${username}`);
          
          // Processar os posts para garantir que tenham todas as propriedades necessárias
          const processedPosts = data.map((post: any) => {
            // Extrair o código correto
            const postCode = extractPostCode(post);
            
            // Selecionar a melhor URL de imagem
            const imageUrl = selectBestImageUrl(post);
            
            return {
              ...post,
              code: postCode,
              shortcode: postCode,
              image_url: imageUrl,
              display_url: imageUrl,
              thumbnail_url: imageUrl,
              // Garantir que temos as contagens
              like_count: post.like_count || post.likes_count || 0,
              comment_count: post.comment_count || post.comments_count || 0,
              // Adicionar URL formatada para o Instagram
              instagram_url: `https://instagram.com/p/${postCode}`
            };
          });
          
          // Filtrar para remover reels da lista de posts
          const onlyPosts = processedPosts.filter((post: InstagramPost) => {
            // Verificar se não é um reel
            const isReel = post.is_reel || 
                          post.product_type === 'clips' || 
                          post.product_type === 'reels';
            
            if (isReel) {
              console.log('Excluindo reel da lista de posts:', post.id);
            }
            
            return !isReel;
          });
          
          console.log(`Filtrados ${processedPosts.length - onlyPosts.length} reels da lista de posts`);
          setPosts(onlyPosts);
          setFilteredPosts(onlyPosts);
          setLoading(false);
        } catch (error) {
          console.error('Erro ao buscar posts:', error);
          
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Tentando novamente (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(fetchWithRetry, 2000); // Esperar 2 segundos antes de tentar novamente
          } else {
            setError('Não foi possível carregar os posts. Por favor, tente novamente mais tarde.');
            setLoading(false);
          }
        }
      };
      
      fetchWithRetry();
    }
    
    // Só carregar posts se não tivermos posts iniciais
    if (!initialPosts || initialPosts.length === 0) {
      loadPosts();
    } else {
      console.log('Usando posts iniciais fornecidos via props:', initialPosts.length);
      
      // Filtrar para remover reels da lista de posts
      const onlyPosts = initialPosts.filter((post: InstagramPost) => {
        // Verificar se não é um reel
        const isReel = post.is_reel || 
                      post.product_type === 'clips' || 
                      post.product_type === 'reels';
        
        if (isReel) {
          console.log('Excluindo reel da lista de posts:', post.id);
        }
        
        return !isReel;
      });
      
      console.log(`Filtrados ${initialPosts.length - onlyPosts.length} reels da lista de posts`);
      setPosts(onlyPosts);
      setFilteredPosts(onlyPosts);
    }
  }, [username, initialPosts]);

  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
        <p className="font-medium">Erro</p>
        <p>{error}</p>
        <button 
          onClick={() => setError(null)} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Selecione os posts para receber comentários</h3>
        <p className="text-sm text-gray-600 mb-2">
          Você pode selecionar até {maxPosts} itens (posts + reels)
        </p>
        {selectedPosts.length > 0 && (
          <p className="text-sm font-medium text-green-600">
            Cada item receberá aproximadamente {formatNumber(calculateCommentsPerItem())} comentários
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
                        alt={typeof post.caption === 'object' 
                          ? (post.caption.text || 'Sem legenda') 
                          : (post.caption || 'Sem legenda')}
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
                      <p className="text-xs truncate">
                        {typeof post.caption === 'object' 
                          ? (post.caption.text || 'Sem legenda') 
                          : (post.caption || 'Sem legenda')}
                      </p>
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

// Exportação default para compatibilidade
export default PostSelector;
