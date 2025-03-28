'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { InstagramPost } from '@/types/instagram';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { formatNumber } from '@/utils/formatNumber'; // Importar função de formatação

interface Service {
  id: string;
  name: string;
  preco: number;
  quantidade: number;
}

interface PostSelectorProps {
  username: string;
  onPostSelect?: (posts: InstagramPost[]) => void;
  maxPosts?: number;
  service?: Service;
  posts?: InstagramPost[];
  selectedReels?: InstagramPost[];
  totalLikes?: number; // Adicionado para distribuir curtidas
  loading?: boolean;
  loadingMessage?: string; // Adicionado para mostrar mensagens personalizadas
  selectedPosts?: InstagramPost[]; // Adicionado para manter seleções
}

export function PostSelector({ 
  username, 
  onPostSelect, 
  maxPosts = 5, 
  service,
  posts: initialPosts,
  selectedReels = [],
  totalLikes = 100, // Valor padrão se não for fornecido
  loading: initialLoading = false,
  loadingMessage = '', // Mensagem de carregamento personalizada
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
      setSelectedPosts(preSelectedPosts);
    }
  }, [posts, initialSelectedPosts]);

  useEffect(() => {
    if (!initialPosts) {
      fetchPosts();
    } else {
      setPosts(initialPosts);
    }
  }, [username, initialPosts]);
  
  useEffect(() => {
    // Filtrar posts para excluir reels já selecionados
    const reelIds = selectedReels.map(reel => reel.id);
    const filtered = posts.filter(post => 
      !post.is_reel && 
      !post.product_type?.includes('clips') && 
      !reelIds.includes(post.id)
    );
    setFilteredPosts(filtered);
  }, [posts, selectedReels]);

  const fetchPosts = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      setSelectedPosts([]);
      
      // Verificar se já temos os posts em cache
      const cachedPosts = sessionStorage.getItem(`posts_${username}`);
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        setPosts(parsedPosts);
        
        // Filtrar para excluir reels
        const filtered = parsedPosts.filter((post: InstagramPost) => 
          !post.is_reel && 
          !post.product_type?.includes('clips')
        );
        setFilteredPosts(filtered);
        setLoading(false);
        return;
      }
      
      // Buscar posts da API de visualização combinada
      const response = await fetch(`/api/instagram/visualizacao/${username}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar posts (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Extrair os posts dos dados combinados
        const allPosts = data.data?.posts || [];
        
        // Verificar se há posts disponíveis
        if (allPosts.length === 0) {
          console.log('Nenhum post encontrado para este usuário');
          // Não exibir erro, apenas informar que não há posts
          if (!data.hasPosts) {
            toast.info(data.message?.posts || 'Este perfil não possui posts disponíveis.');
          }
        }
        
        // Salvar em cache
        sessionStorage.setItem(`posts_${username}`, JSON.stringify(allPosts));
        
        setPosts(allPosts);
        
        // Filtrar para excluir reels
        const filtered = allPosts.filter((post: InstagramPost) => 
          !post.is_reel && 
          !post.product_type?.includes('clips')
        );
        setFilteredPosts(filtered);
      } else {
        throw new Error(data.message || 'Falha ao carregar posts');
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  // Função para selecionar/deselecionar um post
  const togglePostSelection = (post: InstagramPost) => {
    if (selectedPosts.some(p => p.id === post.id)) {
      // Se o post já está selecionado, remova-o
      const updatedSelection = selectedPosts.filter(p => p.id !== post.id);
      setSelectedPosts(updatedSelection);
      
      // Notificar o componente pai sobre a mudança na seleção
      if (onPostSelect) {
        onPostSelect(updatedSelection);
      }
    } else {
      // Verificar se já atingiu o limite máximo de posts selecionados
      if (selectedPosts.length + selectedReels.length >= maxPosts) {
        toast.warning(`Você já selecionou o máximo de ${maxPosts} itens (posts + reels).`);
        return;
      }
      
      // Adicionar o post à seleção
      const updatedSelection = [...selectedPosts, post];
      setSelectedPosts(updatedSelection);
      
      // Notificar o componente pai sobre a mudança na seleção
      if (onPostSelect) {
        onPostSelect(updatedSelection);
      }
    }
  };

  // Renderizar a imagem do post
  const renderPostImage = (post: InstagramPost) => {
    let imageUrl = post.image_url || post.thumbnail_url || '';
    
    // Tentar obter a melhor imagem disponível
    if (post.image_versions && Array.isArray(post.image_versions) && post.image_versions.length > 0) {
      // Usar a primeira imagem disponível
      imageUrl = post.image_versions[0]?.url || imageUrl;
    }
    
    return (
      <Image
        src={imageUrl}
        alt={typeof post.caption === 'string' ? post.caption : (post.caption?.text || 'Post do Instagram')}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 150px, 200px"
      />
    );
  };

  // Distribuir curtidas igualmente entre os posts selecionados
  const calculateLikesForPost = () => {
    if (selectedPosts.length === 0) return 0;
    return Math.floor(totalLikes / selectedPosts.length);
  };

  // Renderizar mensagem quando não há posts
  if (!loadingState && filteredPosts.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nenhum post encontrado para este usuário</p>
          <button 
            onClick={fetchPosts} 
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
      <h2 className="text-xl font-semibold mb-4">Selecione os posts para receber curtidas</h2>
      
      {loadingState ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">{loadingMessage || 'Carregando posts...'}</span>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {selectedPosts.length > 0 
                ? `${selectedPosts.length} de ${maxPosts} posts selecionados (${formatNumber(calculateLikesForPost())} curtidas por post)` 
                : `Selecione até ${maxPosts} posts para distribuir ${formatNumber(totalLikes)} curtidas`}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPosts.map((post) => {
              const isSelected = selectedPosts.some(p => p.id === post.id);
              
              return (
                <div 
                  key={post.id} 
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePostSelection(post)}
                >
                  <div className="relative pb-[100%]">
                    {renderPostImage(post)}
                    
                    {post.is_video && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        Vídeo
                      </div>
                    )}
                    
                    {post.media_type === 8 && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        Carrossel
                      </div>
                    )}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{formatNumber(post.like_count)}</span>
                      
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{formatNumber(post.comment_count)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredPosts.length > 0 && selectedPosts.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Selecione pelo menos um post para receber curtidas
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Exportação default para compatibilidade
export default PostSelector;