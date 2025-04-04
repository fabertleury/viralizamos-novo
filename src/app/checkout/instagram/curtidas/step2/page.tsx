'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import PostSelector from '@/components/instagram/curtidas/PostSelector';
import ReelSelector from '@/components/instagram/curtidas/ReelSelector';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getProxiedImageUrl } from '../../utils/proxy-image';
import { PaymentPixModal } from '@/components/payment/PaymentPixModal';
import { CouponInput } from '@/components/checkout/CouponInput';
import axios from 'axios';
import { useInstagramAPI } from '@/hooks/useInstagramAPI';

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
  image_versions?: any;
}

interface InstagramPost {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
}

export default function Step2Page() {
  const router = useRouter();
  const { fetchInstagramPosts: fetchPostsFromAPI, fetchInstagramReels: fetchReelsFromAPI } = useInstagramAPI();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [service, setService] = useState<Service | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<InstagramPost[]>([]);
  const [selectedReels, setSelectedReels] = useState<Post[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<Post[]>([]);
  const [instagramReels, setInstagramReels] = useState<Post[]>([]);
  const [paymentData, setPaymentData] = useState<{
    qrCodeText: string;
    paymentId: string;
    amount: number;
    qrCodeBase64?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [reelsLoaded, setReelsLoaded] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingReels, setLoadingReels] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [reelsLoadingMessage, setReelsLoadingMessage] = useState<string>('');

  const supabase = createClient();

  const handlePostSelect = useCallback((posts: InstagramPost[]) => {
    setSelectedPosts(posts);
  }, []);

  const handleReelSelect = useCallback((reels: InstagramPost[]) => {
    setSelectedReels(reels);
  }, []);

  // Calcular o número total de itens selecionados
  const selectedItemsCount = selectedPosts.length + selectedReels.length;
  const maxTotalItems = 5; // Máximo de 5 itens no total entre posts e reels
  
  // Calcular curtidas por item
  const likesPerItem = service?.quantidade && selectedItemsCount > 0 
    ? Math.floor(service.quantidade / selectedItemsCount) 
    : 0;

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

  const fetchInstagramPosts = async (username: string) => {
    try {
      // Se já carregou os posts, não precisa buscar novamente
      if (postsLoaded && instagramPosts.length > 0) {
        console.log('Usando posts em cache:', instagramPosts.length);
        return instagramPosts;
      }

      console.log('Buscando posts do Instagram para:', username);
      setLoadingPosts(true);
      setLoadingMessage('Buscando posts...');
      
      // Usar o hook useInstagramAPI para buscar posts com a cascata de APIs
      const posts = await fetchPostsFromAPI(username);
      console.log('Posts encontrados com o hook useInstagramAPI:', posts.length);

      // Filtrar para remover reels e vídeos
      const filteredPosts = posts.filter((post: any) => {
        // Log para depuração
        console.log('Analisando post:', {
          id: post.id,
          code: post.code,
          type: post.type,
          media_type: post.media_type,
          is_video: post.is_video
        });
        
        // Filtrar apenas posts de imagem (não reels, não vídeos)
        const isNotVideo = post.type !== 'video' && !post.is_video;
        const isImageOrCarousel = post.type === 'image' || post.type === 'carousel';
        
        const shouldInclude = isNotVideo && isImageOrCarousel;
        
        if (!shouldInclude) {
          console.log(`Excluindo post ${post.id}: ${!isNotVideo ? 'É um vídeo' : !isImageOrCarousel ? 'Não é imagem/carrossel' : 'Outro motivo'}`);
        }
        
        return shouldInclude;
      });
      
      console.log('Posts filtrados (sem reels):', filteredPosts.length);

      // Mapear os posts para o formato esperado
      const formattedPosts: Post[] = filteredPosts.map((post: any) => {
        // Extrair o código correto do post para a URL
        const postCode = post.code || extractPostCode(post);
        
        return {
          id: post.id || '',
          code: postCode,
          shortcode: postCode,
          image_url: post.media_url || post.thumbnail_url || '',
          caption: post.caption 
              ? (typeof post.caption === 'object' 
                ? post.caption.text || 'Sem legenda'
                : String(post.caption)) 
              : 'Sem legenda',
          like_count: post.likes_count || post.like_count || 0,
          comment_count: post.comments_count || post.comment_count || 0,
          thumbnail_url: post.thumbnail_url || post.media_url || '',
          display_url: post.media_url || post.thumbnail_url || '',
          image_versions: null
        };
      }).filter(post => post.image_url); // Remover posts sem imagem

      console.log('Posts formatados:', formattedPosts.length);
      setInstagramPosts(formattedPosts);
      setPostsLoaded(true);
      setLoadingPosts(false);
      setLoadingMessage('');
      
      return formattedPosts;
    } catch (error) {
      console.error('Erro ao buscar posts do Instagram:', error);
      setLoadingPosts(false);
      setLoadingMessage('');
      return [];
    } finally {
      setLoadingPosts(false);
      setLoadingMessage('');
    }
  };

  const fetchInstagramReels = async (username: string) => {
    try {
      // Se já carregou os reels, não precisa buscar novamente
      if (reelsLoaded && instagramReels.length > 0) {
        console.log('Usando reels em cache:', instagramReels.length);
        return instagramReels;
      }

      setLoadingReels(true);
      setReelsLoadingMessage('Buscando reels...');
      
      // Usar a API de visualização combinada para buscar reels
      console.log('Buscando reels com a API de visualização combinada...');
      const response = await fetch(`/api/instagram/visualizacao/${username}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro ao buscar reels (${response.status}):`, errorText);
        throw new Error(`Erro ao buscar reels: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API de visualização combinada:', data);
      
      // Verificar se o usuário tem reels
      if (!data.hasReels) {
        console.log('Usuário não possui reels:', data.message);
        toast.warning(data.message || 'Este perfil não possui reels disponíveis.');
        setInstagramReels([]);
        setReelsLoaded(true);
        return [];
      }
      
      // Obter os reels da resposta
      let reelsData = [];
      if (data.reels && Array.isArray(data.reels)) {
        reelsData = data.reels;
        console.log(`Encontrados ${reelsData.length} reels na API de visualização`);
      } else {
        console.log('Formato inesperado na resposta da API de visualização');
        toast.warning('Não foi possível carregar os reels. Formato de resposta inesperado.');
        setInstagramReels([]);
        setReelsLoaded(true);
        return [];
      }
      
      // Mapear os reels para o formato esperado
      const formattedReels = reelsData.map((reel: any) => {
        // Extrair o código correto do reel para a URL
        const reelCode = reel.code || reel.shortcode || '';
        
        return {
          id: reel.id || '',
          code: reelCode,
          shortcode: reelCode,
          image_url: reel.thumbnail_url || reel.media_url || '',
          caption: reel.caption 
              ? (typeof reel.caption === 'object' 
                ? reel.caption.text || 'Sem legenda'
                : String(reel.caption)) 
              : 'Sem legenda',
          like_count: reel.likes_count || reel.like_count || 0,
          comment_count: reel.comments_count || reel.comment_count || 0,
          thumbnail_url: reel.thumbnail_url || reel.media_url || '',
          display_url: reel.media_url || reel.thumbnail_url || '',
          image_versions: null,
          is_video: true,
          is_reel: true,
          video_url: reel.video_url || '',
          view_count: reel.views_count || reel.view_count || 0
        };
      }).filter(reel => reel.image_url); // Remover reels sem imagem
      
      console.log('Reels formatados:', formattedReels.length);
      setInstagramReels(formattedReels);
      setReelsLoaded(true);
      setLoadingReels(false);
      setReelsLoadingMessage('');
      
      return formattedReels;
    } catch (error) {
      console.error('Erro ao buscar reels do Instagram:', error);
      toast.error(`Erro ao buscar reels: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setLoadingReels(false);
      setReelsLoadingMessage('');
      return [];
    } finally {
      setLoadingReels(false);
      setReelsLoadingMessage('');
    }
  };
  
  // Função auxiliar para processar dados de reels
  const processReelsData = (reels: Record<string, any>[], username: string): Post[] => {
    return reels.map(reel => {
      // Extrair ID do reel
      const id = reel.id || reel.pk || '';
      
      // Extrair código/shortcode
      const code = reel.code || reel.shortcode || extractCodeFromUrl(reel.permalink || reel.link) || id;
      
      // Extrair contagem de visualizações
      const viewsCount = 
        reel.play_count || 
        reel.view_count || 
        reel.views_count || 
        reel.video_play_count || 
        0;
      
      // Extrair contagem de curtidas
      const likeCount = 
        reel.like_count || 
        reel.likes_count || 
        0;
      
      // Extrair contagem de comentários
      const commentCount = 
        reel.comment_count || 
        reel.comments_count || 
        0;
      
      // Extrair legenda
      const caption = 
        reel.caption?.text || 
        (typeof reel.caption === 'string' ? reel.caption : '') || 
        '';
      
      // Extrair URL da imagem
      const imageUrl = 
        reel.image_versions?.items?.[0]?.url || 
        reel.thumbnail_url || 
        reel.display_url || 
        reel.cover_frame_url || 
        '';
      
      // Extrair URL do vídeo
      const videoUrl = reel.video_url || '';
      
      return {
        id,
        code,
        shortcode: code,
        is_reel: true,
        product_type: 'clips',
        media_type: 'video',
        views_count: viewsCount,
        like_count: likeCount,
        comment_count: commentCount,
        caption: { text: caption },
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        display_url: imageUrl,
        video_url: videoUrl,
        username: reel.user?.username || username
      } as Post;
    });
  };
  
  // Função auxiliar para extrair código de URL
  const extractCodeFromUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    
    // Tentar extrair código de URL de post
    const postMatch = url.match(/instagram\.com\/p\/([^\/]+)/);
    if (postMatch && postMatch[1]) return postMatch[1];
    
    // Tentar extrair código de URL de reel
    const reelMatch = url.match(/instagram\.com\/reel\/([^\/]+)/);
    if (reelMatch && reelMatch[1]) return reelMatch[1];
    
    return null;
  };

  const fetchService = async (externalId: string) => {
    console.log('Buscando serviço com ID:', externalId);
    
    try {
      const supabase = createClient();
      
      // Verificar se temos uma quantidade específica no localStorage
      const checkoutData = localStorage.getItem('checkoutProfileData');
      let quantity = null;
      
      if (checkoutData) {
        const parsedData = JSON.parse(checkoutData);
        quantity = parsedData.quantity;
        console.log('Quantidade encontrada no localStorage:', quantity);
      }

      // Limpar o externalId para garantir que não tenha aspas extras
      const cleanExternalId = externalId ? externalId.replace(/"/g, '') : '';
      console.log('External ID limpo:', cleanExternalId);
      
      // Buscar primeiro pelo external_id
      let { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('external_id', cleanExternalId);
      
      // Se não encontrar pelo external_id, tentar pelo id
      if (!data || data.length === 0) {
        console.log('Serviço não encontrado pelo external_id, tentando pelo id');
        const result = await supabase
          .from('services')
          .select('*')
          .eq('id', cleanExternalId);
          
        data = result.data;
        error = result.error;
      }
      
      // Verificar se encontramos o serviço
      if (error) {
        console.error('Erro ao buscar serviço:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('Nenhum serviço encontrado');
        return null;
      }
      
      // Pegar o primeiro serviço encontrado
      const serviceData = data[0];
      console.log('Serviço encontrado:', serviceData);
      
      // Se temos uma quantidade específica, atualizar o serviço
      if (quantity) {
        console.log('Atualizando quantidade do serviço para:', quantity);
        serviceData.quantidade = parseInt(quantity);
        
        // Atualizar o preço se houver variações de preço
        if (serviceData.service_variations && serviceData.service_variations.length > 0) {
          const selectedVariation = serviceData.service_variations.find(
            (v: any) => v.quantidade === parseInt(quantity)
          );
          
          if (selectedVariation) {
            console.log('Variação de preço encontrada:', selectedVariation);
            serviceData.preco = selectedVariation.preco;
          }
        }
      }
      
      return serviceData;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkoutData = localStorage.getItem('checkoutProfileData');
    console.log('Dados de checkout brutos:', checkoutData);

    try {
      if (checkoutData) {
        const parsedCheckoutData = JSON.parse(checkoutData);
        console.log('Dados de checkout parseados:', parsedCheckoutData);

        // Recuperar o external_id com mais flexibilidade
        const externalId = 
          parsedCheckoutData.external_id || 
          parsedCheckoutData.serviceId || 
          localStorage.getItem('serviceId') || 
          localStorage.getItem('external_id');
        
        // Recuperar a quantidade, se disponível
        const quantity = parsedCheckoutData.quantity;
        
        console.log('External ID recuperado:', externalId);
        console.log('Quantidade recuperada:', quantity);

        // Recuperar o perfil do usuário
        const profileData = 
          parsedCheckoutData.profileData || 
          parsedCheckoutData.profile || 
          parsedCheckoutData.user;

        console.log('Perfil recuperado:', profileData);

        // Verificar se temos dados suficientes para prosseguir
        if (!profileData || !profileData.username) {
          console.error('Dados de perfil ausentes ou incompletos');
          toast.error('Dados de perfil incompletos. Por favor, volte à etapa anterior.');
          
          // Redirecionar para a etapa anterior após um breve atraso
          setTimeout(() => {
            window.location.href = '/checkout/instagram-v2/curtidas/step1';
          }, 2000);
          
          return;
        }

        // Definir os dados do perfil
        setProfileData(profileData);
        
        // Atualizar formData com dados do perfil, se disponíveis
        setFormData({
          name: parsedCheckoutData.name || '',
          email: parsedCheckoutData.email || '',
          phone: parsedCheckoutData.phone || ''
        });

        // Verificar se temos o ID do serviço
        if (!externalId) {
          console.error('ID do serviço ausente');
          toast.error('ID do serviço não encontrado. Por favor, volte à etapa anterior.');
          
          // Redirecionar para a etapa anterior após um breve atraso
          setTimeout(() => {
            window.location.href = '/checkout/instagram-v2/curtidas/step1';
          }, 2000);
          
          return;
        }

        // Verificar se temos informações diretas do serviço no localStorage
        if (parsedCheckoutData.serviceName && parsedCheckoutData.servicePrice) {
          console.log('Usando informações do serviço do localStorage');
          
          // Criar um objeto de serviço com as informações disponíveis
          const serviceFromCheckout = {
            id: externalId,
            name: parsedCheckoutData.serviceName,
            description: parsedCheckoutData.serviceDescription || '',
            preco: parsedCheckoutData.servicePrice,
            quantidade: quantity,
            service_details: parsedCheckoutData.serviceDetails || [],
            provider_id: '1' // Valor padrão
          };
          
          setService(serviceFromCheckout);
          
          // Ainda buscar o serviço completo, mas já temos uma versão básica para exibir
          console.log('Serviço pré-carregado do localStorage:', serviceFromCheckout);
        }

        console.log('Iniciando busca de serviço e posts para o usuário:', profileData.username);
        
        // Buscar serviço e posts em paralelo
        Promise.all([
          fetchService(externalId),
          fetchInstagramPosts(profileData.username)
        ]).then(([serviceData, postsData]) => {
          if (serviceData) {
            // Definir o ID do provedor padrão se não estiver presente
            if (!serviceData.provider_id) {
              serviceData.provider_id = '1';
            }
            setService(serviceData);
            
            // Iniciar busca de reels após obter o serviço
            if (profileData.username && !reelsLoaded) {
              fetchInstagramReels(profileData.username)
                .then(reelsData => {
                  console.log(`Reels carregados: ${reelsData.length}`);
                })
                .catch(error => {
                  console.error('Erro ao carregar reels:', error);
                  // Não exibir erro para o usuário, pois é aceitável não ter reels
                });
            }
          } else {
            console.error('Serviço não encontrado');
            toast.error('Serviço não encontrado. Por favor, tente novamente.');
          }
        }).catch(error => {
          console.error('Erro ao buscar dados:', error);
          toast.error('Erro ao carregar dados. Por favor, tente novamente.');
        });
      } else {
        console.error('Nenhum dado de checkout encontrado');
        toast.error('Nenhum dado de checkout encontrado. Por favor, volte à etapa anterior.');
        
        // Redirecionar para a etapa anterior após um breve atraso
        setTimeout(() => {
          window.location.href = '/checkout/instagram-v2/curtidas/step1';
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao processar dados de checkout:', error);
      toast.error('Erro ao processar dados. Por favor, tente novamente.');
      
      // Redirecionar para a etapa anterior após um breve atraso
      setTimeout(() => {
        window.location.href = '/checkout/instagram-v2/curtidas/step1';
      }, 2000);
    }
  }, [reelsLoaded]);

  useEffect(() => {
    if (activeTab === 'reels' && !reelsLoaded && profileData?.username) {
      console.log('Mudança para aba de reels detectada, carregando reels...');
      setLoadingReels(true);
      setReelsLoadingMessage('Buscando reels...');
      
      fetchInstagramReels(profileData.username)
        .then(reelsData => {
          console.log(`Reels carregados na mudança de aba: ${reelsData.length}`);
          setLoadingReels(false);
          setReelsLoadingMessage('');
          
          // Se não houver reels, exibir mensagem informativa
          if (reelsData.length === 0) {
            toast.info('Este perfil não possui reels disponíveis.');
          }
        })
        .catch(error => {
          console.error('Erro ao carregar reels na mudança de aba:', error);
          setLoadingReels(false);
          setReelsLoadingMessage('');
          
          // Exibir mensagem de erro apenas se for um erro inesperado
          // Não exibir erro para casos em que o usuário simplesmente não tem reels
          if (error.message && !error.message.includes('não possui reels')) {
            toast.error(`Erro ao carregar reels: ${error.message}`);
          }
        });
    }
  }, [activeTab, reelsLoaded, profileData]);

  const prepareTransactionData = () => {
    if (!service || !profileData || !formData || (selectedPosts.length + selectedReels.length) === 0 || !paymentData) {
      toast.error('Dados incompletos para processamento da transação');
      return null;
    }

    // Calcular quantidade de likes por post
    const totalItems = selectedPosts.length + selectedReels.length;
    const totalLikes = service.quantidade;
    const likesPerItem = Math.floor(totalLikes / totalItems);
    const remainingLikes = totalLikes % totalItems;

    // Preparar metadados dos posts
    const postsMetadata = selectedPosts.map((post, index) => {
      // Usar o campo code correto para a URL do post
      const postCode = post.code || post.shortcode || post.id;
      return {
        postId: post.id,
        postCode: postCode,
        postLink: `https://instagram.com/p/${postCode}`,
        likes: index === 0 ? likesPerItem + remainingLikes : likesPerItem,
        type: 'post' // Adicionar tipo explícito para posts
      };
    });

    const reelsMetadata = selectedReels.map((reel, index) => {
      // Usar o campo code correto para a URL do reel
      const reelCode = reel.code || reel.shortcode || reel.id;
      return {
        postId: reel.id,
        postCode: reelCode,
        postLink: `https://instagram.com/reel/${reelCode}`,
        likes: likesPerItem,
        type: 'reel' // Adicionar tipo explícito para reels
      };
    });

    return {
      user_id: formData.name || null,
      order_id: paymentData.paymentId,
      type: 'curtidas',
      amount: service.preco,
      status: 'pending',
      payment_method: 'pix',
      payment_id: paymentData.paymentId,
      metadata: {
        posts: [...postsMetadata, ...reelsMetadata],
        serviceDetails: service
      },
      customer_name: formData.name || null,
      customer_email: formData.email || null,
      customer_phone: formData.phone || null,
      target_username: profileData.username,
      target_full_name: profileData.full_name,
      payment_qr_code: paymentData.qrCodeText || null,
      payment_external_reference: paymentData.paymentId,
      service_id: service.id,
      provider_id: service.provider_id,
      target_profile_link: `https://www.instagram.com/${profileData.username}/`
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

      const response = await axios.post('/admin/transacoes', transactionData);
      
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
    if (!profileData || !service || (selectedPosts.length + selectedReels.length) === 0) {
      toast.error('Selecione pelo menos um post ou reel');
      return;
    }

    setLoading(true);

    try {
      // Log detalhado dos posts e reels selecionados
      console.log('📊 Posts selecionados para pagamento:', selectedPosts.map(post => ({
        id: post.id,
        code: post.code,
        shortcode: post.shortcode,
        url: `https://instagram.com/p/${post.code}`
      })));
      
      console.log('📊 Reels selecionados para pagamento:', selectedReels.map(reel => ({
        id: reel.id,
        code: reel.code,
        shortcode: reel.shortcode,
        url: `https://instagram.com/reel/${reel.code}`
      })));

      // Preparar os dados para o pagamento
      const postIds = selectedPosts.map(post => post.id);
      const reelIds = selectedReels.map(reel => reel.id);
      const postCodes = selectedPosts.map(post => extractPostCode(post));
      const reelCodes = selectedReels.map(reel => extractPostCode(reel));

      // Estruturar os dados conforme esperado pela API
      const paymentData = {
        service: {
          id: service.id,
          name: service.name,
          price: finalAmount || service.preco,
          preco: finalAmount || service.preco,
          quantity: service.quantidade,
          quantidade: service.quantidade,
          provider_id: service.provider_id
        },
        profile: profileData,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        posts: [...selectedPosts, ...selectedReels],
        amount: finalAmount || service.preco
      };

      console.log('Enviando dados para API de pagamento:', paymentData);

      // Criar pagamento via Pix
      const response = await fetch('/api/core/payment/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar pagamento');
      }

      const paymentResponse = await response.json();
      
      console.log('Dados completos do pagamento:', {
        paymentId: paymentResponse.id,
        paymentIdType: typeof paymentResponse.id,
        paymentIdLength: paymentResponse.id?.length,
        paymentData: JSON.stringify(paymentResponse, null, 2)
      });

      // Garantir que temos todos os dados necessários
      if (!paymentResponse.id || !paymentResponse.qr_code) {
        throw new Error('Dados de pagamento incompletos');
      }

      setPaymentData({
        qrCodeText: paymentResponse.qr_code,
        paymentId: paymentResponse.id,
        amount: service.preco,
        qrCodeBase64: paymentResponse.qr_code_base64
      });

      await sendTransactionToAdmin();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Erro ao criar pagamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePaymentModal = () => {
    setPaymentData(null);
  };

  const renderContentSelector = () => {
    if (activeTab === 'posts') {
      return (
        <div className="mt-4">
          {loadingPosts ? (
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">{loadingMessage || 'Carregando posts...'}</span>
              </div>
            </div>
          ) : instagramPosts.length === 0 ? (
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-center py-8">
                <p className="text-yellow-600 mb-4">Nenhum post encontrado para este perfil.</p>
                <button 
                  onClick={() => fetchInstagramPosts(profileData?.username || '')} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : (
            <PostSelector 
              username={profileData?.username || ''}
              onSelectPosts={handlePostSelect}
              maxPosts={maxTotalItems - selectedReels.length}
              totalLikes={service?.quantidade || 0}
              loading={loadingPosts}
              loadingMessage={loadingMessage}
              selectedReels={selectedReels}
              selectedPosts={selectedPosts}
            />
          )}
        </div>
      );
    } else {
      return (
        <div className="mt-4">
          {loadingReels ? (
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">{reelsLoadingMessage || 'Carregando reels...'}</span>
              </div>
            </div>
          ) : instagramReels.length === 0 ? (
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-center py-8">
                <p className="text-yellow-600 mb-4">Este perfil não possui reels disponíveis.</p>
                <button 
                  onClick={() => fetchInstagramReels(profileData?.username || '')} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : (
            <ReelSelector
              username={profileData?.username || ''}
              onSelectReels={handleReelSelect}
              maxReels={maxTotalItems - selectedPosts.length}
              totalViews={service?.quantidade || 0}
              loading={loadingReels}
              loadingMessage={reelsLoadingMessage}
              selectedPosts={selectedPosts}
              selectedReels={selectedReels}
              showReelsOnly={true}
            />
          )}
        </div>
      );
    }
  };

  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {profileData && service && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Seleção de Posts e Reels */}
            <Card className="p-6 order-1 md:order-none">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={getProxiedImageUrl(profileData.profile_pic_url)} 
                    alt={profileData.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{profileData.username}</h3>
                  <p className="text-sm text-gray-500">{profileData.follower_count.toLocaleString()} seguidores</p>
                </div>
              </div>
              
              {/* Tabs de navegação */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button 
                  onClick={() => {
                    setActiveTab('posts');
                    // Garantir que os posts estejam carregados
                    if (!postsLoaded && profileData?.username) {
                      fetchInstagramPosts(profileData.username);
                    }
                  }}
                  className={`
                    px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider 
                    transition-all duration-300 ease-in-out transform 
                    ${activeTab === 'posts' 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white scale-105 shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}
                  `}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Posts ({instagramPosts?.length || 0})
                  </span>
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('reels');
                    // Carregar reels se ainda não foram carregados
                    if (!reelsLoaded && profileData?.username) {
                      fetchInstagramReels(profileData.username);
                    }
                  }}
                  className={`
                    px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider 
                    transition-all duration-300 ease-in-out transform 
                    ${activeTab === 'reels' 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white scale-105 shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}
                  `}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Reels ({instagramReels?.length || 0})
                  </span>
                </button>
              </div>

              {renderContentSelector()}
            </Card>

            {/* Informações do Pedido */}
            <div className="space-y-6 order-2 md:order-none">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-1">Informações do Pedido</h3>
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quantidade de curtidas:</span>
                      <span>{service.quantidade.toLocaleString()}</span>
                    </div>
                    {(selectedPosts.length + selectedReels.length) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Curtidas por item:</span>
                        <span>{likesPerItem.toLocaleString()}</span>
                      </div>
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
                              {/* Botão X para remover */}
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
                              {/* Botão X para remover */}
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

                    <div className="flex justify-between text-lg font-semibold mt-2 pt-2 border-t">
                      <span>Valor total:</span>
                      <span>R$ {(finalAmount || service.preco).toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Valor original:</span>
                        <span className="line-through">R$ {service.preco.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Botão de pagamento PIX */}
                    <div className="flex items-center justify-center my-4">
                      <button 
                        onClick={() => handleSubmit()}
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

                    <CouponInput 
                      serviceId={service.id}
                      originalAmount={service.preco}
                      onCouponApplied={(discount, final, code) => {
                        setDiscountAmount(discount);
                        setFinalAmount(final);
                        setAppliedCoupon(code || null);
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {paymentData ? (
        <div className="mt-6">
          <PaymentPixModal
            isOpen={!!paymentData}
            onClose={() => setPaymentData(null)}
            serviceId={service?.id || ''}
            profileData={{ username: profileData?.username || '' }}
            amount={paymentData.amount}
            customerEmail={formData.email}
            customerName={formData.name}
            serviceName={service?.name || 'Serviço Viralizamos'}
            returnUrl="/agradecimento"
          />
        </div>
      ) : null}
    </div>
  );
}