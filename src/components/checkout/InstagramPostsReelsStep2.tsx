'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import PostSelector from '@/components/instagram/PostSelector';
import ReelSelector from '@/components/instagram/ReelSelector';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { getProxiedImageUrl } from '@/app/checkout/instagram-v2/utils/proxy-image';
import PaymentPixModal from '@/components/payment/PaymentPixModal';
import { CouponInput } from '@/components/checkout/CouponInput';
import axios from 'axios';
import { FaCopy, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import { maskPhone } from '@/lib/utils/mask';
import Link from 'next/link';
import { createPixPayment } from '@/app/checkout/instagram/utils/payment-utils';
import { directRedirectToPaymentService } from '@/lib/payment/redirectToPaymentService';
import { processCheckoutAndRedirect } from '@/lib/payment/microservice-integration';

const API_KEY = process.env.SCRAPECREATORS_API_KEY;

interface ProfileData {
  username: string;
  full_name: string;
  profile_pic_url: string;
  follower_count: number;
  following_count: number;
  is_private: boolean;
}

interface Service {
  id: string;
  name: string;
  preco: number;
  quantidade: number;
  provider_id: string;
  service_variations?: Array<Record<string, unknown>>; // Adicionando a propriedade service_variations como opcional
}

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
  view_count?: number;
}

interface InstagramPostsReelsStep2Props {
  serviceType: 'curtidas' | 'visualizacao' | 'comentarios' | 'reels';
  title: string;
}

export function InstagramPostsReelsStep2({ serviceType, title }: InstagramPostsReelsStep2Props) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>(serviceType === 'reels' ? 'reels' : 'posts');
  const [service, setService] = useState<Service | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [selectedReels, setSelectedReels] = useState<Post[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<Post[]>([]);
  const [instagramReels, setInstagramReels] = useState<Post[]>([]);
  const [paymentData, setPaymentData] = useState<{
    qrCodeText: string;
    paymentId: string;
    amount: number;
    qrCodeBase64?: string;
    reused?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [reelsLoaded, setReelsLoaded] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingReels, setLoadingReels] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [error, setError] = useState('');
  const [nextMaxIdPosts, setNextMaxIdPosts] = useState<string | null>(null);
  const [nextMaxIdReels, setNextMaxIdReels] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [hasMoreReels, setHasMoreReels] = useState<boolean>(true);
  const [totalSelectedItems, setTotalSelectedItems] = useState(0);
  // Estado para controlar se estamos em mobile
  const [isMobile, setIsMobile] = useState(false);
  // Referência para rolar para a seção de pagamento
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  console.log('⚙️ Iniciando componente InstagramPostsReelsStep2 com serviceType:', serviceType);

  // Efeito para atualizar o valor sempre que o serviço for alterado
  useEffect(() => {
    if (service) {
      console.log('💰 Serviço atualizado - Verificando preço:', {
        id: service.id,
        name: service.name,
        preco: service.preco,
        quantidade: service.quantidade,
        service_variations: service.service_variations 
          ? `${service.service_variations.length} variações disponíveis` 
          : 'Nenhuma variação'
      });
      
      // Verificar se há variações de serviço e definir o preço baseado na quantidade
      if (service.service_variations && service.service_variations.length > 0) {
        // Encontrar a variação que corresponde à quantidade desejada
        const variacao = service.service_variations.find(
          (v: any) => v.quantidade === service.quantidade
        );
        
        if (variacao) {
          console.log('Encontrada variação de preço:', variacao);
          // Usar o preço da variação se disponível
          setFinalAmount(variacao.preco);
        } else {
          // Se não encontrar variação específica, usar o preço padrão
          setFinalAmount(service.preco);
        }
      } else {
        // Se não houver variações, usar o preço padrão do serviço
        setFinalAmount(service.preco);
      }
    }
  }, [service]);

  // Detectar se estamos em mobile ao carregar no cliente
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calcular o número total de itens selecionados
  const selectedItemsCount = selectedPosts.length + selectedReels.length;
  const maxTotalItems = 5; // Máximo de 5 itens no total entre posts e reels
  
  // Usar useEffect para manter o totalSelectedItems atualizado sempre que selectedPosts ou selectedReels mudar
  useEffect(() => {
    const newTotalSelected = selectedPosts.length + selectedReels.length;
    setTotalSelectedItems(newTotalSelected);
  }, [selectedPosts, selectedReels]);
  
  const supabase = createClient();

  // Calcular a distribuição precisa de curtidas/visualizações/comentários por item
  const getItemDistribution = () => {
    if (!service?.quantidade || selectedItemsCount === 0) return [];
    
    const baseQuantity = Math.floor(service.quantidade / selectedItemsCount);
    const remainder = service.quantidade % selectedItemsCount;
    
    // Criar um array com a distribuição exata por item
    const distribution = Array(selectedItemsCount).fill(baseQuantity);
    
    // Distribuir o resto entre os primeiros itens
    for (let i = 0; i < remainder; i++) {
      distribution[i]++;
    }
    
    return distribution;
  };
  
  // Obter a distribuição de quantidades
  const itemDistribution = getItemDistribution();
  
  // Verificar se a distribuição é desigual (com resto)
  const hasUnevenDistribution = 
    itemDistribution.length >= 2 && 
    itemDistribution[0] !== itemDistribution[itemDistribution.length - 1];
  
  // Calcular a quantidade básica e o resto para texto explicativo
  const baseQuantityPerItem = service?.quantidade && selectedItemsCount > 0
    ? Math.floor(service.quantidade / selectedItemsCount)
    : 0;
  
  const remainderQuantity = service?.quantidade && selectedItemsCount > 0
    ? service.quantidade % selectedItemsCount
    : 0;

  // Calcular comentários por item
  const commentsPerItem = service?.quantidade && selectedItemsCount > 0
    ? Math.floor(service.quantidade / selectedItemsCount)
    : 0;

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
    
    // Se nada funcionar, usar o ID (não ideal, mas é o que temos)
    return post.id;
  };

  // Função para buscar serviço pelo ID
  const fetchService = async (serviceId: string) => {
    try {
      const supabase = createClient();
      
      // Limpar o serviceId para garantir que não tenha aspas extras
      const cleanServiceId = serviceId ? serviceId.replace(/"/g, '') : '';
      console.log('Service ID limpo:', cleanServiceId);
      
      // Verificar se o ID é válido
      if (!cleanServiceId) {
        console.error('ID de serviço inválido ou vazio');
        return null;
      }
      
      console.log('Buscando serviço pelo external_id:', cleanServiceId);
      
      // Buscar primeiro pelo external_id
      let { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('external_id', cleanServiceId);
      
      console.log('Resultado da busca por external_id:', { 
        encontrado: data && data.length > 0, 
        quantidade: data?.length || 0,
        erro: error ? error.message : null 
      });
      
      // Se não encontrar pelo external_id, tentar pelo id
      if (!data || data.length === 0) {
        console.log('Serviço não encontrado pelo external_id, tentando pelo id');
        const result = await supabase
          .from('services')
          .select('*')
          .eq('id', cleanServiceId);
          
        data = result.data;
        error = result.error;
        
        console.log('Resultado da busca por id:', { 
          encontrado: data && data.length > 0, 
          quantidade: data?.length || 0,
          erro: error ? error.message : null 
        });
      }
      
      // Verificar se encontramos o serviço
      if (error) {
        console.error('Erro ao buscar serviço:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('Nenhum serviço encontrado para o ID:', cleanServiceId);
        
        // Tentar uma busca mais ampla para depuração
        console.log('Realizando busca ampla para depuração...');
        const { data: allServices, error: allError } = await supabase
          .from('services')
          .select('id, external_id, name')
          .limit(5);
          
        if (allError) {
          console.error('Erro ao buscar serviços para depuração:', allError);
        } else {
          console.log('Amostra de serviços disponíveis:', allServices);
        }
        
        return null;
      }
      
      // Pegar o primeiro serviço encontrado
      const serviceData = data[0];
      console.log('Serviço encontrado:', serviceData);
      
      return serviceData;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return null;
    }
  };

  // Função para buscar posts e reels do Instagram em uma única chamada
  const fetchInstagramData = async (type: 'posts' | 'reels', nextMaxId: string = '') => {
    if (!profileData?.username) {
      console.error(`fetchInstagramData (${type}): profileData ou username não definido`, profileData);
      return;
    }
    
    console.log(`Iniciando fetchInstagramData para ${type} do usuário ${profileData.username}${nextMaxId ? ` com next_max_id: ${nextMaxId}` : ''}`);
    
    try {
      if (type === 'posts') {
        setLoadingPosts(true);
        
        // Usar a mesma abordagem que está funcionando para reels
        const apiUrl = `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${profileData.username}${nextMaxId ? `&next_max_id=${nextMaxId}` : ''}&limit=50`;
        
        console.log('Buscando posts do Instagram:', apiUrl);
        console.log('Usando next_max_id para paginação:', nextMaxId || 'nenhum');
        
        const response = await axios.get(apiUrl, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY }
        });
        
        // Log detalhado da resposta
        console.log('Resposta da API para posts:');
        console.log('Status:', response.status);
        console.log('Estrutura da resposta:', Object.keys(response.data));
        console.log('Quantidade de itens:', response.data.items?.length || 0);
        console.log('Próxima página:', response.data.next_max_id || 'Nenhuma');
        
        if (response.data && response.data.items) {
          console.log(`Recebidos ${response.data.items.length} posts do Instagram`);
          
          // Filtrar somente posts (media_type != 2 e não são reels)
          const filteredPosts = response.data.items.filter((item: any) => 
            item.media_type !== 2 && 
            item.product_type !== "clips" && 
            !item.is_reel
          );
          
          console.log(`Filtrados ${filteredPosts.length} posts do Instagram de ${response.data.items.length} itens totais`);
          
          // Verificar e normalizar os dados recebidos
          const normalizedPosts = filteredPosts.map((post: any) => {
            // Buscar URL de imagem em todos os lugares possíveis
            let imageUrl = '';
            
            // Tentar display_url, thumbnail_url, ou image_url diretamente
            if (post.display_url) imageUrl = post.display_url;
            else if (post.thumbnail_url) imageUrl = post.thumbnail_url;
            else if (post.image_url) imageUrl = post.image_url;
            
            // Se ainda não encontrou, verificar image_versions2
            if (!imageUrl && post.image_versions2 && post.image_versions2.candidates && post.image_versions2.candidates.length > 0) {
              imageUrl = post.image_versions2.candidates[0].url;
            }
            
            // Se ainda não encontrou e for um carousel, verificar primeiro item
            if (!imageUrl && post.carousel_media && post.carousel_media.length > 0) {
              const firstMedia = post.carousel_media[0];
              if (firstMedia.image_versions2 && firstMedia.image_versions2.candidates && firstMedia.image_versions2.candidates.length > 0) {
                imageUrl = firstMedia.image_versions2.candidates[0].url;
              } else if (firstMedia.display_url) {
                imageUrl = firstMedia.display_url;
              } else if (firstMedia.thumbnail_url) {
                imageUrl = firstMedia.thumbnail_url;
              }
            }

            // Buscar contagem de curtidas e comentários
            const likeCount = 
              post.like_count || 
              post.likes || 
              (post.like === 0 ? 0 : post.like) ||
              0;
              
            const commentCount = 
              post.comment_count || 
              post.comments || 
              (post.comment === 0 ? 0 : post.comment) ||
              0;
            
            // Log para cada post
            console.log(`Processando post ${post.id || post.pk}:`, {
              id: post.id || post.pk,
              code: post.code || post.shortcode,
              image_url: imageUrl
            });
            
            return {
              id: post.id || post.pk || '',
              code: post.code || post.shortcode || '',
              shortcode: post.shortcode || post.code || '',
              image_url: imageUrl || '',
              caption: post.caption?.text || (typeof post.caption === 'string' ? post.caption : ''),
              like_count: likeCount,
              comment_count: commentCount,
              thumbnail_url: imageUrl || '',
              display_url: imageUrl || '',
              is_reel: false
            };
          });
          
          // Filtrar apenas posts que têm imagem
          const postsWithImages = normalizedPosts.filter(post => post.image_url);
          console.log(`${postsWithImages.length} de ${normalizedPosts.length} posts têm imagens`);
          
          console.log('Posts normalizados:', postsWithImages.slice(0, 2));
          
          // Atualizar o estado com os novos posts (concatenar se for carregamento de mais posts)
          setInstagramPosts(prev => nextMaxId ? [...prev, ...postsWithImages] : postsWithImages);
          
          // Atualizar next_max_id para posts
          if (response.data.next_max_id) {
            console.log('Atualizando next_max_id para posts:', response.data.next_max_id);
            setNextMaxIdPosts(response.data.next_max_id);
            setHasMorePosts(true);
          } else {
            console.log('Não há mais posts para carregar (next_max_id não encontrado)');
            setNextMaxIdPosts(null);
            setHasMorePosts(false);
          }
        } else {
          console.error('Formato de resposta inválido para posts:', response.data);
          if (response.data && response.data.error) {
            console.error('Erro retornado pela API:', response.data.error);
          }
          if (!nextMaxId) setInstagramPosts([]); // Só limpar se for a primeira chamada
          setHasMorePosts(false);
        }
      } else if (type === 'reels') {
        setLoadingReels(true);
        
        // Usar endpoint específico para reels com um limite maior para garantir que encontremos reels
        // mesmo se estiverem mais atrás no feed
        const apiUrl = `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${profileData.username}${nextMaxId ? `&next_max_id=${nextMaxId}` : ''}&limit=24`;
        console.log('Buscando reels do Instagram com limite maior:', apiUrl);
        
        const reelsResponse = await axios.get(apiUrl, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY }
        });
        
        // Log detalhado da resposta
        console.log('Resposta da API para reels:', reelsResponse.data);
        console.log('Status:', reelsResponse.status);
        console.log('Estrutura da resposta:', Object.keys(reelsResponse.data));
        console.log('Quantidade de itens:', reelsResponse.data.items?.length || 0);
        console.log('Próxima página:', reelsResponse.data.next_max_id || 'Nenhuma');
        
        if (reelsResponse.data && reelsResponse.data.items && reelsResponse.data.items.length > 0) {
          console.log(`Recebidos ${reelsResponse.data.items.length} itens do Instagram`);
          
          // Filtrar somente reels (media_type = 2 ou produto_type = "clips" são reels)
          const filteredReels = reelsResponse.data.items.filter((item: any) => 
            item.media_type === 2 || item.product_type === "clips" || item.is_reel
          );
          
          console.log(`Filtrados ${filteredReels.length} reels do Instagram de ${reelsResponse.data.items.length} itens totais`);
          
          // Se não encontramos reels mas temos next_max_id, buscar mais automaticamente
          if (filteredReels.length === 0 && reelsResponse.data.next_max_id && !nextMaxId) {
            console.log('Nenhum reel encontrado na primeira página, buscando próxima página automaticamente');
            setLoadingReels(false);
            
            // Chamar recursivamente para buscar mais reels
            fetchInstagramData('reels', reelsResponse.data.next_max_id);
            return;
          }
          
          // Usar a função normalizeReels para processar os reels
          const normalizedReels = normalizeReels(filteredReels);
          console.log('Reels normalizados:', normalizedReels.slice(0, 2));
          
          // Atualizar o estado com os novos reels (concatenar se for carregamento de mais reels)
          setInstagramReels(prev => nextMaxId ? [...prev, ...normalizedReels] : normalizedReels);
          
          // Atualizar next_max_id para reels
          setNextMaxIdReels(reelsResponse.data.next_max_id || null);
          setHasMoreReels(!!reelsResponse.data.next_max_id);
        } else {
          console.error('Formato de resposta inválido para reels:', reelsResponse.data);
          console.error('Verifique se o campo items está presente e contém dados.');
          if (!nextMaxId) setInstagramReels([]); // Só limpar se for a primeira chamada
          setHasMoreReels(false);
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar ${type} do Instagram:`, error);
      
      // Log detalhado do erro
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro Axios:');
        console.error('Status:', error.response?.status);
        console.error('Dados:', error.response?.data);
        console.error('Configuração:', error.config);
      }
      
      if (type === 'posts') {
        if (!nextMaxId) setInstagramPosts([]); // Só limpar se for a primeira chamada
        setHasMorePosts(false);
      } else {
        if (!nextMaxId) setInstagramReels([]); // Só limpar se for a primeira chamada
        setHasMoreReels(false);
      }
    } finally {
      if (type === 'posts') {
        setLoadingPosts(false);
        setPostsLoaded(true);
      } else {
        setLoadingReels(false);
        setReelsLoaded(true);
      }
    }
  };

  // Função para buscar posts usando a mesma API de reels
  const fetchPostsUsingReelsAPI = async () => {
    try {
      setLoadingPosts(true);
      
      if (!profileData?.username) {
        console.error('Nome de usuário não fornecido');
        toast.error('Nome de usuário não encontrado');
        setLoadingPosts(false);
        return;
      }
      
      console.log('Buscando posts usando API de reels para:', profileData.username);
      
      // Buscar apenas posts, limitando a 50 itens
      const apiUrl = `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${profileData.username}&limit=50`;
      console.log('URL da API para posts:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY }
      });
      
      console.log('Resposta da API para posts:', response.data);
      console.log('Status:', response.status);
      console.log('Estrutura da resposta:', Object.keys(response.data));
      
      // Verificar se temos dados válidos
      if (!response.data || (!response.data.items && !response.data.data)) {
        console.error('Formato de resposta da API inválido. Dados não encontrados.');
        setInstagramPosts([]);
        setLoadingPosts(false);
        return;
      }
      
      // Buscar posts - eles são itens que NÃO são reels (media_type !== 2)
      let posts = [];
      
      // Verificar o formato da resposta
      if (response.data.items) {
        // Formato padrão: response.data.items
        posts = response.data.items.filter((item: any) => 
          item.media_type !== 2 && 
          item.product_type !== "clips" && 
          !item.is_reel
        );
      } else if (response.data.data && response.data.data.posts) {
        // Formato alternativo: response.data.data.posts
        posts = response.data.data.posts;
      } else {
        console.error('Nenhum formato de resposta reconhecido para posts');
        setInstagramPosts([]);
        setLoadingPosts(false);
        return;
      }
      
      console.log(`Encontrados ${posts.length} posts para processar`);
      
      // Log detalhado dos primeiros posts para debug
      posts.forEach((post: any, index: number) => {
        if (index < 3) { // Limitar log aos primeiros 3 posts
          console.log(`Post ${index + 1} - ID: ${post.id || '?'}`);
          console.log(`Post ${index + 1} - Campos de imagem:`, {
            display_url: post.display_url || 'não disponível',
            thumbnail_url: post.thumbnail_url || 'não disponível',
            image_url: post.image_url || 'não disponível',
            image_versions2: post.image_versions2 ? 'disponível' : 'não disponível',
            carousel_media: post.carousel_media ? `${post.carousel_media.length} itens` : 'não disponível'
          });

          // Log de campos de contagem para posts
          console.log(`Post ${index + 1} - Campos de contagem:`, {
            like_count: post.like_count,
            likes: post.likes,
            like: post.like,
            comment_count: post.comment_count,
            comments: post.comments,
            comment: post.comment
          });
        }
      });
      
      // Normalizar os posts para o formato esperado pelo componente
      const normalizedPosts = posts.map((post: any) => {
        // Buscar URL de imagem em todos os lugares possíveis
        let imageUrl = '';
        
        // Tentar display_url, thumbnail_url, ou image_url diretamente
        if (post.display_url) imageUrl = post.display_url;
        else if (post.thumbnail_url) imageUrl = post.thumbnail_url;
        else if (post.image_url) imageUrl = post.image_url;
        
        // Se ainda não encontrou, verificar image_versions2
        if (!imageUrl && post.image_versions2 && post.image_versions2.candidates && post.image_versions2.candidates.length > 0) {
          imageUrl = post.image_versions2.candidates[0].url;
        }
        
        // Se ainda não encontrou e for um carousel, verificar primeiro item
        if (!imageUrl && post.carousel_media && post.carousel_media.length > 0) {
          const firstMedia = post.carousel_media[0];
          if (firstMedia.image_versions2 && firstMedia.image_versions2.candidates && firstMedia.image_versions2.candidates.length > 0) {
            imageUrl = firstMedia.image_versions2.candidates[0].url;
          } else if (firstMedia.display_url) {
            imageUrl = firstMedia.display_url;
          } else if (firstMedia.thumbnail_url) {
            imageUrl = firstMedia.thumbnail_url;
          }
        }

        // Buscar contagem de curtidas - verificar todos os campos possíveis
        const likeCount = 
          post.like_count || 
          post.likes || 
          (post.like === 0 ? 0 : post.like) ||
          0;
          
        // Buscar contagem de comentários - verificar todos os campos possíveis
        const commentCount = 
          post.comment_count || 
          post.comments || 
          (post.comment === 0 ? 0 : post.comment) ||
          0;
        
        console.log(`Post ID ${post.id}: URL de imagem encontrada:`, imageUrl || 'NENHUMA IMAGEM ENCONTRADA');
        console.log(`Post ID ${post.id}: Contagens:`, { likes: likeCount, comments: commentCount });
        
        return {
          id: post.id || '',
          code: post.code || post.shortcode || '',
          shortcode: post.shortcode || post.code || '',
          image_url: imageUrl, 
          thumbnail_url: imageUrl,
          display_url: imageUrl,
          is_reel: false, // Marcar explicitamente como não sendo um reel
          caption: post.caption?.text || (typeof post.caption === 'string' ? post.caption : ''),
          like_count: likeCount,
          comment_count: commentCount
        };
      });
      
      console.log('Posts normalizados:', normalizedPosts.slice(0, 2));
      
      // Filtrar apenas posts que têm imagem
      const postsWithImages = normalizedPosts.filter((post) => post.image_url);
      console.log(`${postsWithImages.length} de ${normalizedPosts.length} posts têm imagens`);
      
      // Limitar a 12 posts no máximo
      const limitedPosts = postsWithImages.length > 0 
        ? postsWithImages.slice(0, 12) 
        : normalizedPosts.slice(0, 12);
        
      setInstagramPosts(limitedPosts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setInstagramPosts([]);
    } finally {
      setLoadingPosts(false);
      setPostsLoaded(true);
    }
  };

  useEffect(() => {
    try {
      // Recuperar dados do checkout do localStorage
      const checkoutData = localStorage.getItem('checkoutProfileData');
      
      if (checkoutData) {
        const parsedCheckoutData = JSON.parse(checkoutData);
        console.log('Dados do checkout recuperados:', parsedCheckoutData);
        
        // Se o tipo de serviço é reels, definir a aba ativa como reels
        if (parsedCheckoutData.serviceType === 'reels' || serviceType === 'reels') {
          setActiveTab('reels');
        }
        
        // Verificar se o serviço completo já está disponível no localStorage
        if (parsedCheckoutData.service) {
          console.log('Serviço completo encontrado no localStorage:', parsedCheckoutData.service);
          let serviceData = parsedCheckoutData.service;
          
          // Definir o ID do provedor padrão se não estiver presente
          if (!serviceData.provider_id) {
            serviceData.provider_id = '1';
          }
          
          // Verificar se temos quantidade ou preço personalizados
          if (parsedCheckoutData.quantidade && typeof parsedCheckoutData.quantidade === 'number') {
            console.log(`Usando quantidade personalizada: ${parsedCheckoutData.quantidade}`);
            serviceData.quantidade = parsedCheckoutData.quantidade;
          }
          
          // Verificar se o serviço possui variações de preço
          if (serviceData.service_variations && Array.isArray(serviceData.service_variations) && serviceData.service_variations.length > 0) {
            console.log('Serviço possui variações de preço:', serviceData.service_variations);
            
            // Buscar a variação que corresponde à quantidade selecionada
            const selectedVariation = serviceData.service_variations.find(
              (variation: any) => variation.quantidade === serviceData.quantidade
            );
            
            if (selectedVariation) {
              console.log('Variação encontrada para a quantidade selecionada:', selectedVariation);
              // Atualizar o preço do serviço com o preço da variação
              serviceData.preco = selectedVariation.preco;
              console.log(`Preço atualizado para ${serviceData.preco} com base na variação de quantidade ${serviceData.quantidade}`);
            } else {
              console.log('Não foi encontrada variação exata para a quantidade:', serviceData.quantidade);
              // Se não encontrar uma variação exata, podemos buscar a mais próxima
              if (serviceData.service_variations.length > 0) {
                // Ordenar por quantidade para encontrar a variação mais próxima
                const sortedVariations = [...serviceData.service_variations].sort(
                  (a: any, b: any) => Math.abs(a.quantidade - serviceData.quantidade) - Math.abs(b.quantidade - serviceData.quantidade)
                );
                
                // Usar a variação mais próxima
                const closestVariation = sortedVariations[0];
                console.log('Usando a variação mais próxima:', closestVariation);
                serviceData.preco = closestVariation.preco;
                serviceData.quantidade = closestVariation.quantidade;
                console.log(`Preço e quantidade ajustados para a variação mais próxima: ${serviceData.preco} / ${serviceData.quantidade}`);
              }
            }
          } else {
            console.log('Serviço não possui variações de preço definidas, usando o preço padrão:', serviceData.preco);
          }
          
          // Especificamente verificar o preço do serviço em várias posições
          let precoServico = null;
          
          // Primeiro usar o preço que já foi definido pela variação
          if (serviceData.preco !== undefined && serviceData.preco !== null) {
            precoServico = serviceData.preco;
            console.log(`Usando preço do objeto service: ${precoServico}`);
          } 
          // Se não, verificar o preço nos dados de checkout
          else if (parsedCheckoutData.preco !== undefined && parsedCheckoutData.preco !== null) {
            precoServico = parsedCheckoutData.preco;
            console.log(`Usando preço dos dados de checkout (preco): ${precoServico}`);
          } 
          // Se não, verificar o servicePrice
          else if (parsedCheckoutData.servicePrice !== undefined && parsedCheckoutData.servicePrice !== null) {
            precoServico = parsedCheckoutData.servicePrice;
            console.log(`Usando preço dos dados de checkout (servicePrice): ${precoServico}`);
          }
          
          // Garantir que o preço seja atualizado no objeto de serviço
          if (precoServico !== null) {
            serviceData.preco = precoServico;
            console.log(`Preço final do serviço definido: ${serviceData.preco}`);
          }
          
          console.log('Serviço configurado com preço:', serviceData.preco, 'e quantidade:', serviceData.quantidade);
          setService(serviceData);
          
          // Inicializar o valor final com o preço do serviço
          if (typeof serviceData.preco === 'number') {
            setFinalAmount(serviceData.preco);
            console.log(`Valor final inicializado com: ${serviceData.preco}`);
          }
          
          // Continuar com a recuperação dos dados do perfil
        } else {
          // Se não temos o serviço completo, buscar pelo ID
          
          // Verificar se temos um external_id válido
          let externalId = parsedCheckoutData.external_id;
          if (!externalId) {
            // Tentar buscar de outros campos possíveis
            externalId = parsedCheckoutData.serviceId || parsedCheckoutData.service_id;
            console.log('External ID alternativo encontrado:', externalId);
          }
          
          if (!externalId) {
            console.error('External ID não encontrado nos dados de checkout');
            toast.error('ID do serviço não encontrado. Por favor, volte à etapa anterior.');
            return;
          }
          
          // Verificar se temos uma quantidade personalizada no checkout
          const customQuantity = parsedCheckoutData.quantidade;
          console.log('Quantidade personalizada:', customQuantity);
          
          // Verificar se temos um preço personalizado em várias posições possíveis
          let customPrice = null;
          if (parsedCheckoutData.preco !== undefined && parsedCheckoutData.preco !== null) {
            customPrice = parsedCheckoutData.preco;
            console.log(`Usando preço personalizado de checkout.preco: ${customPrice}`);
          } else if (parsedCheckoutData.servicePrice !== undefined && parsedCheckoutData.servicePrice !== null) {
            customPrice = parsedCheckoutData.servicePrice;
            console.log(`Usando preço personalizado de checkout.servicePrice: ${customPrice}`);
          }
          console.log('Preço personalizado encontrado:', customPrice);

          if (externalId) {
            console.log('Iniciando busca de serviço para o ID:', externalId);
            
            // Buscar apenas o serviço aqui, posts e reels serão buscados no outro useEffect
            fetchService(externalId).then(serviceData => {
              if (serviceData) {
                // Definir o ID do provedor padrão se não estiver presente
                if (!serviceData.provider_id) {
                  serviceData.provider_id = '1';
                }
                
                // Se temos uma quantidade personalizada, substituir a do serviço
                if (customQuantity && typeof customQuantity === 'number') {
                  console.log(`Substituindo quantidade do serviço (${serviceData.quantidade}) pela quantidade personalizada (${customQuantity})`);
                  serviceData.quantidade = customQuantity;
                }
                
                // Verificar se o serviço possui variações de preço
                if (serviceData.service_variations && Array.isArray(serviceData.service_variations) && serviceData.service_variations.length > 0) {
                  console.log('Serviço possui variações de preço:', serviceData.service_variations);
                  
                  // Buscar a variação que corresponde à quantidade selecionada
                  const selectedVariation = serviceData.service_variations.find(
                    (variation: any) => variation.quantidade === serviceData.quantidade
                  );
                  
                  if (selectedVariation) {
                    console.log('Variação encontrada para a quantidade selecionada:', selectedVariation);
                    // Atualizar o preço do serviço com o preço da variação
                    serviceData.preco = selectedVariation.preco;
                    console.log(`Preço atualizado para ${serviceData.preco} com base na variação de quantidade ${serviceData.quantidade}`);
                  } else {
                    console.log('Não foi encontrada variação exata para a quantidade:', serviceData.quantidade);
                    // Se não encontrar uma variação exata, podemos buscar a mais próxima
                    if (serviceData.service_variations.length > 0) {
                      // Ordenar por quantidade para encontrar a variação mais próxima
                      const sortedVariations = [...serviceData.service_variations].sort(
                        (a: any, b: any) => Math.abs(a.quantidade - serviceData.quantidade) - Math.abs(b.quantidade - serviceData.quantidade)
                      );
                      
                      // Usar a variação mais próxima
                      const closestVariation = sortedVariations[0];
                      console.log('Usando a variação mais próxima:', closestVariation);
                      serviceData.preco = closestVariation.preco;
                      serviceData.quantidade = closestVariation.quantidade;
                      console.log(`Preço e quantidade ajustados para a variação mais próxima: ${serviceData.preco} / ${serviceData.quantidade}`);
                    }
                  }
                } else {
                  console.log('Serviço não possui variações de preço definidas, usando o preço padrão:', serviceData.preco);
                }
                
                // Se temos um preço personalizado, substituir o do serviço
                if (customPrice !== null) {
                  console.log(`Substituindo preço do serviço (${serviceData.preco}) pelo preço personalizado (${customPrice})`);
                  serviceData.preco = customPrice;
                }
                
                console.log('Serviço configurado com quantidade:', serviceData.quantidade, 'e preço:', serviceData.preco);
                
                // Atualizar o serviço
                setService(serviceData);
                
                // Inicializar o valor final com o preço do serviço
                if (typeof serviceData.preco === 'number') {
                  setFinalAmount(serviceData.preco);
                  console.log(`Valor final inicializado com: ${serviceData.preco}`);
                }
              } else {
                console.error('Serviço não encontrado para o ID:', externalId);
                toast.error('Serviço não encontrado. Por favor, tente novamente.');
              }
            }).catch(error => {
              console.error('Erro ao buscar serviço:', error);
              toast.error('Erro ao carregar dados do serviço. Por favor, tente novamente.');
            });
          } else {
            console.error('Dados insuficientes para buscar serviço');
            toast.error('Dados insuficientes. Por favor, volte à etapa anterior.');
          }
        }
        
        // Recuperar dados do perfil
        const profileData = 
          parsedCheckoutData.profileData || 
          parsedCheckoutData.user;

        console.log('Perfil recuperado:', profileData);

        if (profileData) {
          // Garantir que o perfil tenha todos os campos necessários
          const completeProfile: ProfileData = {
            username: profileData.username || '',
            full_name: profileData.full_name || profileData.username || '',
            profile_pic_url: profileData.profile_pic_url || 'https://i.imgur.com/6VBx3io.png',
            follower_count: profileData.follower_count || 0,
            following_count: profileData.following_count || 0,
            is_private: profileData.is_private || false
          };
          
          console.log('Perfil processado com campos completos:', completeProfile);
          
          setProfileData(completeProfile);
          // Atualizar formData com dados do perfil, se disponíveis
          setFormData({
            name: parsedCheckoutData.name || profileData.full_name || profileData.username || '',
            email: '',
            phone: parsedCheckoutData.phone || ''
          });
        } else {
          console.error('Dados do perfil não encontrados');
          toast.error('Dados do perfil não encontrados. Por favor, volte à etapa anterior.');
          return;
        }
        
      } else {
        console.error('Nenhum dado de checkout encontrado');
        toast.error('Nenhum dado de checkout encontrado. Por favor, volte à etapa anterior.');
      }
    } catch (error) {
      console.error('Erro ao processar dados de checkout:', error);
      toast.error('Erro ao processar dados. Por favor, tente novamente.');
    }
  }, []);

  // Efeito para buscar reels e posts quando profileData for definido
  useEffect(() => {
    if (profileData?.username) {
      console.log('profileData foi definido, buscando reels e posts para:', profileData.username);
      
      // Buscar reels
      fetchInstagramData('reels');
      
      // Buscar posts usando a mesma API, mas filtrando para posts
      fetchPostsUsingReelsAPI();
    }
  }, [profileData]);

  const prepareTransactionData = () => {
    if (!service || !profileData || !formData || (selectedPosts.length + selectedReels.length) === 0 || !paymentData) {
      toast.error('Dados incompletos para processamento da transação');
      return null;
    }

    // Calcular quantidade de curtidas/visualizações/comentários por item
    const totalItems = selectedPosts.length + selectedReels.length;
    const totalQuantity = service.quantidade;
    
    // Melhor distribuição dos itens quando a quantidade não é divisível igualmente
    const quantityPerItem = Math.floor(totalQuantity / totalItems);
    const remainingQuantity = totalQuantity % totalItems;
    
    // Aqui criamos um array de quantidades para distribuir melhor
    const quantidades = Array(totalItems).fill(quantityPerItem);
    
    // Distribuir o resto de forma equilibrada
    for (let i = 0; i < remainingQuantity; i++) {
      quantidades[i]++;
    }
    
    console.log(`Distribuição das quantidades para ${totalItems} itens:`, quantidades);

    // Preparar metadados dos posts
    const postsMetadata = selectedPosts.map((post, index) => {
      // Usar o campo code correto para a URL do post
      const postCode = post.code || post.shortcode || post.id;
      return {
        postId: post.id,
        postCode: postCode,
        postLink: `https://instagram.com/p/${postCode}`,
        quantity: quantidades[index], // Usar a quantidade correta do array de quantidades
        type: 'post', // Adicionar tipo explícito para posts
        imageUrl: post.image_url || post.thumbnail_url || post.display_url || '',
        selected: true // Adicionar explicitamente o campo selected como true
      };
    });

    const reelsMetadata = selectedReels.map((reel, index) => {
      // Usar o campo code correto para a URL do reel
      const reelCode = reel.code || reel.shortcode || reel.id;
      return {
        postId: reel.id,
        postCode: reelCode,
        postLink: `https://instagram.com/reel/${reelCode}`,
        quantity: quantidades[selectedPosts.length + index], // Usar a quantidade correta, considerando o offset dos posts
        type: 'reel', // Adicionar tipo explícito para reels
        imageUrl: reel.image_url || reel.thumbnail_url || reel.display_url || '',
        selected: true // Adicionar explicitamente o campo selected como true
      };
    });

    // Determinar o tipo de quantidade com base no serviço
    let quantityType = 'curtidas';
    if (serviceType === 'visualizacao') {
      quantityType = 'visualizações';
    } else if (serviceType === 'comentarios') {
      quantityType = 'comentários';
    } else if (serviceType === 'reels') {
      quantityType = 'visualizações';
    }
    
    // Criar cópia dos posts para backup
    const postsData = [...selectedPosts, ...selectedReels].map(post => ({
      id: post.id,
      code: post.code || post.shortcode || '',
      shortcode: post.shortcode || post.code || '',
      image_url: post.image_url || '',
      thumbnail_url: post.thumbnail_url || post.image_url || '', 
      display_url: post.display_url || post.image_url || '',
      is_reel: !!post.is_reel,
      caption: post.caption || '',
      like_count: post.like_count || 0,
      comment_count: post.comment_count || 0,
      view_count: post.view_count || 0,
      type: post.is_reel ? 'reel' : 'post',
      postLink: post.is_reel 
        ? `https://instagram.com/reel/${post.code || post.shortcode || post.id}`
        : `https://instagram.com/p/${post.code || post.shortcode || post.id}`
    }));

    return {
      user_id: formData.name || null,
      order_id: paymentData.paymentId,
      type: serviceType,
      amount: finalAmount || service.preco,
      status: 'pending',
      payment_method: 'pix',
      payment_id: paymentData.paymentId,
      metadata: {
        posts: [...postsMetadata, ...reelsMetadata],
        postsData: postsData, // Cópia completa dos posts para servir de backup
        selectedPostsCount: totalItems, // Contagem de posts selecionados
        serviceDetails: service,
        quantityType: quantityType,
        totalQuantity: totalQuantity,
        username: profileData.username
      },
      customer_name: formData.name || null,
      customer_email: formData.email || null,
      customer_phone: formData.phone || null,
      discount: discountAmount || 0,
      coupon: appliedCoupon || null
    };
  };

  const sendTransactionToAdmin = async () => {
    try {
      setLoading(true);
      const transactionData = prepareTransactionData();
      
      if (!transactionData) {
        toast.error('Não foi possível preparar os dados da transação');
        return;
      }
      
      // Usar o novo endpoint que insere na tabela core_transactions_v2
      const response = await axios.post('/api/core/transactions', transactionData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Transação registrada com sucesso');
        router.push('/pedidos');
      } else {
        toast.error('Erro ao registrar transação');
      }
    } catch (error) {
      console.error('Erro ao enviar transação:', error);
      toast.error('Falha ao processar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!formData.name || !formData.email) {
      toast.error('Por favor, preencha seu nome e email para continuar');
      return;
    }

    if (selectedPosts.length + selectedReels.length === 0) {
      toast.error(`Por favor, selecione pelo menos 1 item para continuar`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Iniciando processo de pagamento...');
      // Preparar dados para o pagamento
      const profileToUse = profileData || { username: '', full_name: '' };
      
      // Verificar se todos os dados necessários estão presentes
      if (!service?.id) {
        throw new Error('ID do serviço não encontrado');
      }
      
      if (!finalAmount && !service?.preco) {
        throw new Error('Valor do serviço não encontrado');
      }

      // Verificar se o profile tem username
      if (!profileToUse.username) {
        throw new Error('Nome de usuário do Instagram não encontrado');
      }
      
      const paymentData = {
        service: {
          id: service.id,
          name: service.name || '',
          price: service.preco || 0,
          preco: service.preco || 0
        },
        profile: {
          username: profileToUse.username,
          full_name: profileToUse.full_name || ''
        },
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || ''
        },
        posts: [...selectedPosts, ...selectedReels].map((post, index) => {
          // Get the calculated quantity for this post from itemDistribution
          const quantity = itemDistribution && itemDistribution[index] ? itemDistribution[index] : undefined;
          
          return {
            id: post.id,
            code: post.code || post.shortcode || '',
            url: post.shortcode ? `https://instagram.com/p/${post.shortcode}` : undefined,
            caption: post.caption || '',
            quantity: quantity // Add the calculated quantity
          };
        }),
        amount: finalAmount || service.preco || 0
      };
      
      console.log('Dados do pagamento:', JSON.stringify({
        service_id: paymentData.service.id,
        profile_username: paymentData.profile.username,
        amount: paymentData.amount,
        customer_email_partial: paymentData.customer.email.slice(0, 3) + '***',
        posts_count: paymentData.posts.length,
        posts_with_quantities: paymentData.posts.map(p => ({ 
          code: p.code,
          quantity: p.quantity 
        }))
      }));
      
      // Usar a nova função de pagamento
      const paymentResult = await createPixPayment(paymentData);

      console.log('Resultado do pagamento:', JSON.stringify({
        success: paymentResult.success,
        is_duplicate: paymentResult.is_duplicate,
        status_code: paymentResult.status_code,
        transaction_id: paymentResult.transaction_id,
        reused: paymentResult.reused
      }));
      
      if (!paymentResult.success) {
        if (paymentResult.is_duplicate) {
          toast.info('Pagamento duplicado: ' + paymentResult.error);
          
          // Se temos informações do pagamento duplicado, usá-las
          if (paymentResult.transaction_id && paymentResult.payment_id) {
            setPaymentData({
              qrCodeText: paymentResult.qr_code || '',
              paymentId: paymentResult.payment_id,
              amount: finalAmount || service.preco || 0,
              qrCodeBase64: paymentResult.qr_code_base64,
              reused: true
            });
          }
          
          setLoading(false);
          return;
        }
        
        throw new Error(paymentResult.error || 'Erro desconhecido ao criar pagamento');
      }
      
      // Se chegamos aqui, o pagamento foi criado com sucesso
      setPaymentData({
        qrCodeText: paymentResult.qr_code || '',
        paymentId: paymentResult.payment_id || '',
        amount: finalAmount || service.preco || 0,
        qrCodeBase64: paymentResult.qr_code_base64,
        reused: paymentResult.reused
      });
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
      
      // Mostrar toast com o erro
      toast.error(`Falha ao criar pagamento: ${errorMessage}`);
      
      // Definir o erro no estado
      setError(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePaymentModal = () => {
    setPaymentData(null);
  };

  // Função para atualizar o estado de seleção quando o usuário troca entre as abas
  const updateSelectionState = (activeTab: 'posts' | 'reels') => {
    console.log('updateSelectionState chamado com activeTab:', activeTab);
    setActiveTab(activeTab);
  };

  // Função para verificar se um item pode ser selecionado com base no limite total
  const canSelectMoreItems = (currentTab: 'posts' | 'reels') => {
    const totalSelected = selectedPosts.length + selectedReels.length;
    return totalSelected < maxTotalItems;
  };

  // Função para lidar com a mudança no total de itens selecionados
  const handleTotalSelectedChange = (newTotal: number) => {
    setTotalSelectedItems(newTotal);
  };

  // Função para lidar com a seleção de posts
  const handlePostSelect = useCallback((posts: Post[]) => {
    const newSelectedPostsLength = posts.length;
    const totalSelected = newSelectedPostsLength + selectedReels.length;
    
    if (totalSelected > maxTotalItems) {
      toast.error(`Você só pode selecionar até ${maxTotalItems} itens no total (posts + reels)`);
      return;
    }
    
    setSelectedPosts(posts);
    setTotalSelectedItems(totalSelected);
  }, [selectedReels.length, maxTotalItems]);

  // Função para lidar com a seleção de reels
  const handleReelSelect = useCallback((reels: Post[]) => {
    const newSelectedReelsLength = reels.length;
    const totalSelected = selectedPosts.length + newSelectedReelsLength;
    
    if (totalSelected > maxTotalItems) {
      toast.error(`Você só pode selecionar até ${maxTotalItems} itens no total (posts + reels)`);
      return;
    }
    
    setSelectedReels(reels);
    setTotalSelectedItems(totalSelected);
  }, [selectedPosts.length, maxTotalItems]);

  // Função para carregar mais posts
  const handleLoadMorePosts = () => {
    if (loadingPosts) {
      console.log('Já existe um carregamento de posts em andamento, ignorando clique.');
      return;
    }
    
    if (!nextMaxIdPosts) {
      console.log('Não há mais posts para carregar (nextMaxIdPosts está vazio).');
      setHasMorePosts(false);
      return;
    }
    
    console.log('Carregando mais posts a partir do nextMaxIdPosts:', nextMaxIdPosts);
    
    // Chamar a API de busca de posts e reels usando o next_max_id
    try {
      setLoadingPosts(true);
      
      if (!profileData?.username) {
        console.error('Nome de usuário não fornecido');
        toast.error('Nome de usuário não encontrado');
        setLoadingPosts(false);
        return;
      }
      
      console.log('Buscando mais posts para:', profileData.username, 'com next_max_id:', nextMaxIdPosts);
      
      // Buscar apenas posts, aumentando o limite para 50 itens
      const apiUrl = `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${profileData.username}&next_max_id=${nextMaxIdPosts}&limit=50`;
      console.log('URL da API para carregar mais posts:', apiUrl);
      
      axios.get(apiUrl, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY }
      }).then(response => {
        console.log('Resposta da API para mais posts:', response.data);
        console.log('Status:', response.status);
        console.log('Estrutura da resposta:', Object.keys(response.data));
        
        // Verificar se temos dados válidos
        if (!response.data || (!response.data.items && !response.data.data)) {
          console.error('Formato de resposta da API inválido. Dados não encontrados.');
          setHasMorePosts(false);
          return;
        }
        
        // Buscar posts - eles são itens que NÃO são reels (media_type !== 2)
        let posts = [];
        
        // Verificar o formato da resposta
        if (response.data.items) {
          // Formato padrão: response.data.items
          posts = response.data.items.filter((item) => 
            item.media_type !== 2 && 
            item.product_type !== "clips" && 
            !item.is_reel
          );
        } else if (response.data.data && response.data.data.posts) {
          // Formato alternativo: response.data.data.posts
          posts = response.data.data.posts;
        } else {
          console.error('Nenhum formato de resposta reconhecido para posts');
          setHasMorePosts(false);
          return;
        }
        
        console.log(`Encontrados ${posts.length} posts adicionais para processar`);
        
        // Normalizar os posts para o formato esperado pelo componente
        const normalizedPosts = posts.map((post) => {
          // Buscar URL de imagem em todos os lugares possíveis
          let imageUrl = '';
          
          // Tentar display_url, thumbnail_url, ou image_url diretamente
          if (post.display_url) imageUrl = post.display_url;
          else if (post.thumbnail_url) imageUrl = post.thumbnail_url;
          else if (post.image_url) imageUrl = post.image_url;
          
          // Se ainda não encontrou, verificar image_versions2
          if (!imageUrl && post.image_versions2 && post.image_versions2.candidates && post.image_versions2.candidates.length > 0) {
            imageUrl = post.image_versions2.candidates[0].url;
          }
          
          // Se ainda não encontrou e for um carousel, verificar primeiro item
          if (!imageUrl && post.carousel_media && post.carousel_media.length > 0) {
            const firstMedia = post.carousel_media[0];
            if (firstMedia.image_versions2 && firstMedia.image_versions2.candidates && firstMedia.image_versions2.candidates.length > 0) {
              imageUrl = firstMedia.image_versions2.candidates[0].url;
            } else if (firstMedia.display_url) {
              imageUrl = firstMedia.display_url;
            } else if (firstMedia.thumbnail_url) {
              imageUrl = firstMedia.thumbnail_url;
            }
          }

          // Buscar contagem de curtidas - verificar todos os campos possíveis
          const likeCount = 
            post.like_count || 
            post.likes || 
            (post.like === 0 ? 0 : post.like) ||
            0;
            
          // Buscar contagem de comentários - verificar todos os campos possíveis
          const commentCount = 
            post.comment_count || 
            post.comments || 
            (post.comment === 0 ? 0 : post.comment) ||
            0;
          
          return {
            id: post.id || '',
            code: post.code || post.shortcode || '',
            shortcode: post.shortcode || post.code || '',
            image_url: imageUrl, 
            thumbnail_url: imageUrl,
            display_url: imageUrl,
            is_reel: false, // Marcar explicitamente como não sendo um reel
            caption: post.caption?.text || (typeof post.caption === 'string' ? post.caption : ''),
            like_count: likeCount,
            comment_count: commentCount
          };
        });
        
        // Filtrar apenas posts que têm imagem
        const postsWithImages = normalizedPosts.filter((post) => post.image_url);
        console.log(`${postsWithImages.length} de ${normalizedPosts.length} novos posts têm imagens`);
        
        // Adicionar os novos posts aos existentes
        setInstagramPosts(prev => [...prev, ...postsWithImages]);
        
        // Verificar se há mais posts para carregar
        if (response.data.next_max_id) {
          console.log('Atualizado next_max_id para posts:', response.data.next_max_id);
          setNextMaxIdPosts(response.data.next_max_id);
          setHasMorePosts(true);
        } else {
          console.log('Não há mais posts para carregar');
          setNextMaxIdPosts(null);
          setHasMorePosts(false);
        }
      }).catch(error => {
        console.error('Erro ao buscar mais posts:', error);
        if (axios.isAxiosError(error)) {
          console.error('Detalhes do erro Axios:');
          console.error('Status:', error.response?.status);
          console.error('Dados:', error.response?.data);
        }
        setHasMorePosts(false);
      }).finally(() => {
        setLoadingPosts(false);
      });
      
    } catch (error) {
      console.error('Erro ao processar carregamento de mais posts:', error);
      setLoadingPosts(false);
      setHasMorePosts(false);
    }
  };

  // Função para carregar mais reels
  const handleLoadMoreReels = () => {
    if (loadingReels) {
      console.log('Já existe um carregamento de reels em andamento, ignorando clique.');
      return;
    }
    
    if (!nextMaxIdReels) {
      console.log('Não há mais reels para carregar (nextMaxIdReels está vazio).');
      setHasMoreReels(false);
      return;
    }
    
    console.log('Carregando mais reels a partir do nextMaxIdReels:', nextMaxIdReels);
    fetchInstagramData('reels', nextMaxIdReels);
  };

  // Função para renderizar o conteúdo baseado na aba ativa e service type
  const renderContent = () => {
    if (activeTab === 'posts') {
      if (serviceType === 'reels') {
        // Se o tipo de serviço é reels, sugerir mudar para a aba reels
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 font-medium">Este serviço é para visualizações em reels.</p>
            <p className="text-yellow-600 mt-2">Por favor, selecione a aba Reels acima.</p>
            <button
              onClick={() => setActiveTab('reels')}
              className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
            >
              Ir para Reels
            </button>
          </div>
        );
      }
      
      return (
        <PostSelector
          posts={instagramPosts}
          loading={loadingPosts}
          loadingMessage="Carregando posts do Instagram..."
          maxSelectable={maxTotalItems}
          onSelect={handlePostSelect}
          selectedPosts={selectedPosts}
          serviceType={serviceType}
          totalSelectedItems={totalSelectedItems}
          onTotalSelectedChange={handleTotalSelectedChange}
          serviceTotalQuantity={service?.quantidade || 0}
        />
      );
    } else {
      // Aba de reels
      return (
        <ReelSelector
          reels={instagramReels}
          loading={loadingReels}
          loadingMessage="Carregando reels do Instagram..."
          maxSelectable={maxTotalItems}
          onSelect={handleReelSelect}
          selectedReels={selectedReels}
          serviceType={serviceType === 'reels' ? 'visualizacao' : serviceType}
          totalSelectedItems={totalSelectedItems}
          onTotalSelectedChange={handleTotalSelectedChange}
          serviceTotalQuantity={service?.quantidade || 0}
        />
      );
    }
  };

  // Função para normalizar reels recebidos da API
  const normalizeReels = (reels: any[]): Post[] => {
    return reels.map(reel => {
      // Buscar contagem de visualizações - verificar todos os campos possíveis
      const viewCount = 
        reel.view_count || 
        reel.play_count || 
        reel.video_view_count || 
        (reel.play === 0 ? 0 : reel.play) ||
        (reel.views === 0 ? 0 : reel.views) ||
        (reel.video_views === 0 ? 0 : reel.video_views) || 
        0;
      
      // Buscar contagem de curtidas - verificar todos os campos possíveis
      const likeCount = 
        reel.like_count || 
        reel.likes || 
        (reel.like === 0 ? 0 : reel.like) ||
        0;
        
      // Buscar contagem de comentários - verificar todos os campos possíveis
      const commentCount = 
        reel.comment_count || 
        reel.comments || 
        (reel.comment === 0 ? 0 : reel.comment) ||
        0;
      
      console.log(`Reel ${reel.id} - Contagens encontradas:`, {
        views: viewCount,
        likes: likeCount,
        comments: commentCount
      });
      
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
        caption: reel.caption?.text || (typeof reel.caption === 'string' ? reel.caption : ''),
        like_count: likeCount,
        view_count: viewCount,
        comment_count: commentCount
      };
    });
  };

  const OrderInfoCard = () => {
    const valorFormatado = (finalAmount !== null ? finalAmount : (service?.preco || 0)).toFixed(2).replace('.', ',');
    const valorOriginalFormatado = service?.preco ? service.preco.toFixed(2).replace('.', ',') : '0,00';

  return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-base mb-3">Informações do Pedido</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Serviço:</span>
            <span className="font-medium">{service?.name || 'Carregando...'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quantidade:</span>
            <span className="font-medium">{service?.quantidade ? service.quantidade.toLocaleString() : '0'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Valor:</span>
    <div>
              {finalAmount !== null && finalAmount < (service?.preco || 0) ? (
                <div className="flex flex-col items-end">
                  <span className="font-medium text-green-600">R$ {valorFormatado}</span>
                  <span className="text-xs text-gray-500 line-through">R$ {valorOriginalFormatado}</span>
                </div>
              ) : (
                <span className="font-medium">R$ {valorFormatado}</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Itens selecionados:</span>
            <span className="font-medium">{selectedItemsCount} de {maxTotalItems}</span>
          </div>
        </div>
      </div>
    );
  };

  // Função para renderizar as informações de pagamento
  const PaymentInfo = () => {
    if (!paymentData || !service) return null;
    
    return (
      <PaymentPixModal
        qrCodeText={paymentData.qrCodeText}
        qrCodeBase64={paymentData.qrCodeBase64}
        amount={paymentData.amount}
        paymentId={paymentData.paymentId}
        onClose={handleClosePaymentModal}
        isOpen={!!paymentData}
        serviceId={service.id}
        serviceName={service.name}
        reused={paymentData.reused}
      />
    );
  };

  const renderProfileSection = () => {
    console.log('Renderizando seção de perfil com dados:', profileData);
    if (!profileData) {
      console.log('Dados de perfil não disponíveis');
      return null;
    }
    
    // Função segura para obter URL de imagem
    const getProfileImageUrl = (url: string) => {
      try {
        console.log('URL de perfil original:', url);
        const proxiedUrl = getProxiedImageUrl(url);
        console.log('URL de perfil processada:', proxiedUrl);
        return proxiedUrl;
      } catch (error) {
        console.error('Erro ao processar URL da imagem:', error);
        return url || 'https://i.imgur.com/6VBx3io.png';
      }
    };
    
    // Verificando se temos contagem de seguidores
    const followersCount = profileData.follower_count 
      ? profileData.follower_count.toLocaleString() 
      : '0';
    console.log('Contagem de seguidores para exibição:', followersCount);
    
    return (
              <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                  <img 
            src={getProfileImageUrl(profileData.profile_pic_url)}
                    alt={profileData.username}
                    className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Erro ao carregar imagem de perfil, usando imagem padrão');
              // Se a imagem falhar, usar uma imagem padrão
              e.currentTarget.src = 'https://i.imgur.com/6VBx3io.png';
            }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{profileData.username}</h3>
          <p className="text-sm text-gray-500">{followersCount} seguidores</p>
                </div>
              </div>
    );
  };

  const handleCheckout = async () => {
    try {
      // Validar seleção de posts ou reels
      if (selectedItemsCount === 0) {
        toast.error('Selecione pelo menos um post ou reel para continuar');
        return;
      }
      
      // Validar quantidade de itens selecionados
      if (selectedItemsCount > maxTotalItems) {
        toast.error(`Você pode selecionar no máximo ${maxTotalItems} itens no total`);
        return;
      }
      
      // Validar formulário de contato
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Preencha todos os campos do formulário de contato');
        return;
      }
      
      // Validar email
      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        toast.error('Email inválido');
        return;
      }
      
      // Verificar se tem serviço selecionado
      if (!service) {
        toast.error('Serviço não encontrado');
        return;
      }
      
      setLoading(true);
      
      // Preparando os posts selecionados para envio
      const allSelectedPosts = [
        ...selectedPosts.map(post => ({
          id: post.id,
          code: post.code || post.shortcode || post.id,
          image_url: post.image_url || post.thumbnail_url || post.display_url,
          is_reel: false
        })),
        ...selectedReels.map(reel => ({
          id: reel.id,
          code: reel.code || reel.shortcode || reel.id,
          image_url: reel.image_url || reel.thumbnail_url || reel.display_url,
          is_reel: true
        }))
      ];
      
      // Salvar os dados selecionados no localStorage para uso posterior
      if (selectedPosts.length > 0) {
        localStorage.setItem('selectedPosts', JSON.stringify(selectedPosts));
      }
      
      if (selectedReels.length > 0) {
        localStorage.setItem('selectedReels', JSON.stringify(selectedReels));
      }
      
      // Calcular valor final do serviço
      const finalPrice = finalAmount || service.preco || 0;
      
      // Utilizando nossa nova função de integração para enviar os dados e redirecionar
      const success = await processCheckoutAndRedirect({
        amount: finalPrice,
        serviceData: {
          id: service.id,
          name: service.name || '',
          price: finalPrice,
          quantity: service.quantidade || 1,
          provider_id: service.provider_id
        },
        profileUsername: profileData?.username || '',
        selectedPosts: allSelectedPosts,
        customerData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        serviceType,
        returnUrl: "/agradecimento"
      });
      
      if (!success) {
        toast.error('Ocorreu um erro ao processar o pagamento. Tente novamente.');
        setLoading(false);
      }
      
      // Não precisamos definir setLoading(false) aqui se o redirecionamento for bem-sucedido
      // pois o usuário será redirecionado para outra página
    } catch (error) {
      console.error('Erro ao processar checkout:', error);
      toast.error('Ocorreu um erro ao processar o checkout. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {profileData && service && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna 1: Seleção de Posts e Reels */}
              <Card className="p-6 order-1 md:order-none">
                {renderProfileSection()}
              
              {/* Título da seção de Posts e Reels */}
              {serviceType === 'reels' ? (
                // Para reels, mostrar apenas o título sem abas
                <div className="flex items-center justify-center mb-6">
                  <div className="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                    bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg">
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">🎬</span>
                      Reels ({instagramReels?.length || 0})
                    </span>
                  </div>
                </div>
              ) : (
                // Para outros tipos, manter as abas
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <button
                    className={`px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                      transition-all duration-300 ease-in-out transform
                      ${activeTab === 'posts' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white scale-105 shadow-lg' 
                        : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveTab('posts')}
                  >
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">📷</span>
                      Posts ({instagramPosts?.length || 0})
                    </span>
                  </button>
                  
                  <button
                    className={`px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                      transition-all duration-300 ease-in-out transform
                      ${activeTab === 'reels' 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white scale-105 shadow-lg' 
                        : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setActiveTab('reels')}
                  >
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">🎬</span>
                      Reels ({instagramReels?.length || 0})
                    </span>
                  </button>
                </div>
              )}

              {/* Conteúdo da aba ativa */}
              {serviceType === 'reels' ? (
                // Para reels, renderizar diretamente o conteúdo de reels
                <>
                  <ReelSelector
                    reels={instagramReels}
                    loading={loadingReels}
                    loadingMessage="Carregando reels do Instagram..."
                    maxSelectable={maxTotalItems}
                    onSelect={handleReelSelect}
                    selectedReels={selectedReels}
                    serviceType="visualizacao"
                    totalSelectedItems={totalSelectedItems}
                    onTotalSelectedChange={handleTotalSelectedChange}
                    serviceTotalQuantity={service?.quantidade || 0}
                  />
                </>
              ) : (
                // Para outros tipos, usar a função renderContent
                renderContent()
              )}
              
              {/* Botões de "Carregar mais" para posts e reels */}
              {serviceType !== 'reels' && (
                <>
                  {activeTab === 'posts' && hasMorePosts && !loadingPosts && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleLoadMorePosts}
                        className="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                          bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        <span className="flex items-center">
                          <span className="mr-2 text-xl">📷</span>
                          Carregar mais posts
                        </span>
                      </button>
                    </div>
                  )}
                  
                  {activeTab === 'posts' && loadingPosts && (
                    <div className="mt-4 flex justify-center">
                      <span className="flex items-center text-indigo-600 px-6 py-3 rounded-full font-bold text-sm">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando mais posts...
                      </span>
                    </div>
                  )}
                  
                  {activeTab === 'reels' && hasMoreReels && !loadingReels && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleLoadMoreReels}
                        className="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                          bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        <span className="flex items-center">
                          <span className="mr-2 text-xl">🎬</span>
                          Carregar mais reels
                        </span>
                      </button>
                    </div>
                  )}
                  
                  {activeTab === 'reels' && loadingReels && (
                    <div className="mt-4 flex justify-center">
                      <span className="flex items-center text-rose-600 px-6 py-3 rounded-full font-bold text-sm">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando mais reels...
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {/* Botão para carregar mais reels quando serviceType é reels */}
              {serviceType === 'reels' && hasMoreReels && !loadingReels && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleLoadMoreReels}
                    className="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                      bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">🎬</span>
                      Carregar mais reels
                    </span>
                  </button>
                </div>
              )}
              
              {/* Indicador de carregamento para reels quando serviceType é reels */}
              {serviceType === 'reels' && loadingReels && (
                <div className="mt-4 flex justify-center">
                  <span className="flex items-center text-rose-600 px-6 py-3 rounded-full font-bold text-sm">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando mais reels...
                  </span>
                </div>
              )}
            </Card>

              {/* Coluna 2: Informações do Pedido */}
              <div className="space-y-6 order-2 md:order-none" ref={paymentSectionRef}>
                {/* Indicador de rolagem no mobile quando há itens selecionados */}
                {selectedItemsCount > 0 && selectedItemsCount < maxTotalItems && isMobile && (
                  <div className="fixed bottom-4 right-4 z-50 md:hidden animate-bounce bg-pink-500 text-white p-3 rounded-full shadow-lg"
                    onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}

                {/* Verificando dados do serviço pelo console */}
                {console.log('Renderizando Card de Informações do Pedido com serviço:', service, 'e valor final:', finalAmount)}

              <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Informações do Pedido</h3>
                  
                <div className="space-y-4">
                  <Input
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    placeholder="Telefone"
                    value={maskPhone(formData.phone)}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D+/g, '') })}
                  />
                  </div>
                  
                  <div className="pt-4 mt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quantidade de {serviceType === 'curtidas' ? 'curtidas' : serviceType === 'visualizacao' ? 'visualizações' : 'comentários'}:</span>
                      <span>{service?.quantidade ? service.quantidade.toLocaleString() : '0'}</span>
                    </div>
                    
                    {selectedItemsCount > 0 && (
                      <>
                        {!hasUnevenDistribution ? (
                          // Divisão exata
                          <div className="flex justify-between text-sm">
                            <span>{serviceType === 'curtidas' ? 'Curtidas' : serviceType === 'visualizacao' ? 'Visualizações' : 'Comentários'} por item:</span>
                            <span>{baseQuantityPerItem.toLocaleString()}</span>
                          </div>
                        ) : (
                          // Divisão com resto
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{serviceType === 'curtidas' ? 'Curtidas' : serviceType === 'visualizacao' ? 'Visualizações' : 'Comentários'} por item:</span>
                              <span className="font-semibold">Distribuição detalhada</span>
                            </div>
                            {itemDistribution.map((quantity, index) => (
                              <div key={index} className="flex justify-between text-xs pl-4">
                                <span>Item {index + 1}:</span>
                                <span>{quantity.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>Itens selecionados:</span>
                      <span>{selectedItemsCount} / {maxTotalItems}</span>
                    </div>

                    {/* Miniaturas dos itens selecionados */}
                    {selectedItemsCount > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-1">Itens selecionados:</p>
                        <div className="flex flex-wrap gap-0">
                          {selectedPosts.map((post) => (
                            <div key={`post-${post.id}`} className="relative w-12 h-12 rounded-sm overflow-hidden border border-pink-300 group m-0.5">
                              <img 
                                src={getProxiedImageUrl(post.image_url)} 
                                alt="Post selecionado" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes('placeholder-post.svg')) {
                                    target.src = '/images/placeholder-post.svg';
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute bottom-0 left-0 right-0 text-white text-[8px] bg-pink-500 text-center">
                                Post
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedPosts = selectedPosts.filter(p => p.id !== post.id);
                                  setSelectedPosts(updatedPosts);
                                  handlePostSelect(updatedPosts);
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] 
                                  shadow-md hover:bg-red-600"
                                aria-label="Remover post"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {selectedReels.map((reel) => (
                            <div key={`reel-${reel.id}`} className="relative w-12 h-12 rounded-sm overflow-hidden border border-pink-300 group m-0.5">
                              <img 
                                src={getProxiedImageUrl(reel.image_url)} 
                                alt="Reel selecionado" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes('placeholder-reel.svg')) {
                                    target.src = '/images/placeholder-reel.svg';
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute bottom-0 left-0 right-0 text-white text-[8px] bg-purple-500 text-center">
                                Reel
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedReels = selectedReels.filter(r => r.id !== reel.id);
                                  setSelectedReels(updatedReels);
                                  handleReelSelect(updatedReels);
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] 
                                  shadow-md hover:bg-red-600"
                                aria-label="Remover reel"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mensagem explicativa sobre curtidas/visualizações */}
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                      {selectedItemsCount === 0 ? (
                        <p>Selecione entre 1 e 5 posts/reels para distribuir o total de {serviceType === 'curtidas' ? 'curtidas' : serviceType === 'visualizacao' ? 'visualizações' : 'comentários'}.</p>
                      ) : selectedItemsCount === 1 ? (
                        <p>Todas as {service?.quantidade ? service.quantidade.toLocaleString() : '0'} {serviceType === 'curtidas' ? 'curtidas' : serviceType === 'visualizacao' ? 'visualizações' : 'comentários'} serão aplicadas no item selecionado.</p>
                      ) : hasUnevenDistribution ? (
                        <p>O total de {service?.quantidade ? service.quantidade.toLocaleString() : '0'} {serviceType === 'curtidas' ? 'curtidas' : serviceType === 'visualizacao' ? 'visualizações' : 'comentários'} será distribuído entre os {selectedItemsCount} itens ({baseQuantityPerItem} por item + {remainderQuantity} extra{remainderQuantity > 1 ? 's' : ''} para o{remainderQuantity > 1 ? 's' : ''} primeiro{remainderQuantity > 1 ? 's' : ''}).</p>
                      ) : (
                        <p>O total de {service?.quantidade ? service.quantidade.toLocaleString() : '0'} {serviceType === 'curtidas' ? 'curtidas' : serviceType === 'visualizacao' ? 'visualizações' : 'comentários'} será dividido igualmente ({baseQuantityPerItem} por item) entre os {selectedItemsCount} itens selecionados.</p>
                      )}
                    </div>
                  </div>

                  {/* Parte de Valores/Preços */}
                  <div className="mt-6 pt-4 border-t space-y-4">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Valor do serviço:</span>
                      <span className="text-blue-600">R$ {service?.preco ? service.preco.toFixed(2).replace('.', ',') : '0,00'}</span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Valor total:</span>
                      <span className="text-green-600">R$ {(finalAmount !== null ? finalAmount : (service?.preco || 0)).toFixed(2).replace('.', ',')}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Valor original:</span>
                        <span className="line-through">R$ {(service?.preco || 0).toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </div>

                  {/* Cupom e Botão de Pagamento */}
                  <div className="space-y-4 pt-4 mt-4">
                    <CouponInput 
                      serviceId={service.id}
                      originalAmount={service.preco}
                      onCouponApplied={(discount, final, code) => {
                        setDiscountAmount(discount);
                        setFinalAmount(final);
                        setAppliedCoupon(code || null);
                      }}
                    />
                    
                    <div className="flex items-center justify-center mt-4">
                      <button 
                        onClick={handleCheckout}
                        disabled={loading || selectedItemsCount === 0 || !formData.name || !formData.email || !formData.phone}
                        className={`
                          px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider 
                          transition-all duration-300 ease-in-out transform w-full
                          ${loading || selectedItemsCount === 0 || !formData.name || !formData.email || !formData.phone
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:scale-105 hover:shadow-lg'}
                        `}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processando...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            PAGAR COM PIX
                          </span>
                        )}
                      </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          </>
        )}
      </main>

      {(loadingPosts || loadingReels) && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-center text-lg font-medium text-gray-700">Buscando dados do Instagram</p>
            <p className="text-center text-sm text-gray-500 mt-2">Isso pode levar até 60 segundos. Por favor, aguarde...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-red-100 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-center text-lg font-medium text-red-700">{error}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {!error && postsLoaded && reelsLoaded && instagramPosts.length === 0 && instagramReels.length === 0 && profileData?.username && (
        <div className="mt-6 text-center">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex flex-col items-center justify-center">
              <div className="text-yellow-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Não encontramos posts ou reels públicos para @{profileData.username}. Verifique se o nome de usuário está correto e se o perfil é público.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
