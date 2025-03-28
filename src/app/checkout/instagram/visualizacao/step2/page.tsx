'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { PostSelector } from '@/components/instagram/visualizacao/PostSelector';
import { ReelSelector } from '@/components/instagram/visualizacao/ReelSelector';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getProxiedImageUrl } from '../../utils/proxy-image';
import { PaymentPixModal } from '@/components/payment/PaymentPixModal';
import { CouponInput } from '@/components/checkout/CouponInput';
import axios from 'axios';

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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [service, setService] = useState<Service | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<InstagramPost[]>([]);
  const [selectedReels, setSelectedReels] = useState<InstagramPost[]>([]);
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

  const supabase = createClient();

  const maxTotalItems = 10; // Máximo de 10 itens no total entre posts e reels

  const handlePostSelect = useCallback((posts: InstagramPost[]) => {
    setSelectedPosts(posts);
  }, []);

  const handleReelSelect = useCallback((reels: InstagramPost[]) => {
    setSelectedReels(reels);
  }, []);

  // Função para buscar detalhes do serviço pelo ID
  const fetchService = async (serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) {
        console.error('Erro ao buscar serviço:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return null;
    }
  };

  // Função para buscar posts do Instagram
  const fetchInstagramPosts = async (username: string) => {
    try {
      setLoadingPosts(true);
      
      // Tentar buscar do cache primeiro
      const cachedPosts = localStorage.getItem(`posts_${username}`);
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        setInstagramPosts(parsedPosts);
        setPostsLoaded(true);
        setLoadingPosts(false);
        return parsedPosts;
      }
      
      // Se não tiver no cache, buscar da API
      const response = await fetch(`/api/instagram/posts/${username}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar posts');
      }
      
      const data = await response.json();
      const posts = data.data || data.posts || data || [];
      
      // Salvar no cache
      localStorage.setItem(`posts_${username}`, JSON.stringify(posts));
      
      // Atualizar o estado
      setInstagramPosts(posts);
      setPostsLoaded(true);
      setLoadingPosts(false);
      
      return posts;
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setLoadingPosts(false);
      return [];
    }
  };

  // Função para buscar reels do Instagram
  const fetchInstagramReels = async (username: string) => {
    try {
      setLoadingReels(true);
      
      // Tentar buscar do cache primeiro
      const cachedReels = localStorage.getItem(`reels_${username}`);
      if (cachedReels) {
        const parsedReels = JSON.parse(cachedReels);
        setInstagramReels(parsedReels);
        setReelsLoaded(true);
        setLoadingReels(false);
        return parsedReels;
      }
      
      // Se não tiver no cache, buscar da API
      const response = await fetch(`/api/instagram/reels/${username}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar reels');
      }
      
      const data = await response.json();
      const reels = data.data || data.reels || data || [];
      
      // Salvar no cache
      localStorage.setItem(`reels_${username}`, JSON.stringify(reels));
      
      // Atualizar o estado
      setInstagramReels(reels);
      setReelsLoaded(true);
      setLoadingReels(false);
      
      return reels;
    } catch (error) {
      console.error('Erro ao buscar reels:', error);
      setLoadingReels(false);
      return [];
    }
  };

  // Calcular o número total de itens selecionados
  const selectedItemsCount = selectedPosts.length + selectedReels.length;
  
  // Calcular visualizações por item
  const totalItems = selectedPosts.length + selectedReels.length;
  const visualizacoesPerItem = totalItems > 0 && service?.quantidade 
    ? Math.floor(service.quantidade / totalItems) 
    : 0;

  // Função para extrair o código correto de um post do Instagram
  const extractPostCode = (post: Post | InstagramPost): string => {
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
            window.location.href = '/checkout/instagram-v2/visualizacao/step1';
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
            window.location.href = '/checkout/instagram-v2/visualizacao/step1';
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
          window.location.href = '/checkout/instagram-v2/visualizacao/step1';
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao processar dados de checkout:', error);
      toast.error('Erro ao processar dados. Por favor, tente novamente.');
      
      // Redirecionar para a etapa anterior após um breve atraso
      setTimeout(() => {
        window.location.href = '/checkout/instagram-v2/visualizacao/step1';
      }, 2000);
    }
  }, [reelsLoaded]);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        if (profileData?.username && !reelsLoaded) {
          setLoadingReels(true);
          await fetchInstagramReels(profileData.username);
          setLoadingReels(false);
        }
      } catch (error) {
        console.error('Erro ao buscar reels:', error);
      }
    };

    fetchReels();
  }, [profileData, reelsLoaded]);

  useEffect(() => {
    if (activeTab === 'reels' && !reelsLoaded && profileData?.username) {
      fetchInstagramReels(profileData.username);
    }
  }, [activeTab, reelsLoaded, profileData]);

  const prepareTransactionData = () => {
    if (!service || !profileData || !formData || (selectedPosts.length + selectedReels.length) === 0 || !paymentData) {
      toast.error('Dados incompletos para processamento da transação');
      return null;
    }

    // Calcular quantidade de visualizações por post
    const totalItems = selectedPosts.length + selectedReels.length;
    const totalViews = service.quantidade;
    const viewsPerItem = Math.floor(totalViews / totalItems);
    const remainingViews = totalViews % totalItems;

    // Preparar metadados dos posts
    const postsMetadata = selectedPosts.map((post, index) => {
      // Usar o campo code correto para a URL do post
      const postCode = post.code || post.shortcode || post.id;
      return {
        postId: post.id,
        postCode: postCode,
        postLink: `https://instagram.com/p/${postCode}`,
        views: index === 0 ? viewsPerItem + remainingViews : viewsPerItem,
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
        views: viewsPerItem,
        type: 'reel' // Adicionar tipo explícito para reels
      };
    });

    return {
      user_id: formData.name || null,
      order_id: paymentData.paymentId,
      type: 'visualizacao',
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

      // Alterando o endpoint para o correto para salvar transações
      const response = await axios.post('/api/payment/create', transactionData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Transação registrada com sucesso');
        // Salvar o ID da transação no localStorage para consulta posterior
        localStorage.setItem('lastTransactionId', transactionData.payment_id);
        router.push('/pedidos');
      } else {
        toast.error('Erro ao registrar transação');
        console.error('Resposta do servidor:', response.data);
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

  if (!profileData || !service) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

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

              {activeTab === 'posts' ? (
                <PostSelector 
                  username={profileData.username}
                  onPostSelect={handlePostSelect}
                  selectedPosts={selectedPosts}
                  selectedReels={selectedReels}
                  maxPosts={maxTotalItems}
                  service={service}
                  posts={instagramPosts}
                  totalViews={service?.quantidade || 100}
                  loading={loadingPosts}
                />
              ) : (
                <ReelSelector 
                  username={profileData.username}
                  onSelectReels={handleReelSelect}
                  selectedReels={selectedReels}
                  selectedPosts={selectedPosts}
                  maxReels={maxTotalItems}
                  totalViews={service?.quantidade || 100}
                  loading={loadingReels}
                />
              )}
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
                      <span>Quantidade de visualizações:</span>
                      <span>{service.quantidade.toLocaleString()}</span>
                    </div>
                    {(selectedPosts.length + selectedReels.length) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Visualizações por item:</span>
                        <span>{visualizacoesPerItem.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Itens selecionados:</span>
                      <span>{selectedItemsCount} / {maxTotalItems}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-semibold mt-4 pt-2 border-t">
                    <span>Valor total:</span>
                    <span>R$ {(finalAmount || service.preco).toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Valor original:</span>
                      <span className="line-through">R$ {service.preco.toFixed(2)}</span>
                    </div>
                  )}

                  <CouponInput 
                    serviceId={service.id}
                    originalAmount={service.preco}
                    onCouponApplied={(discount, final, code) => {
                      setDiscountAmount(discount);
                      setFinalAmount(final);
                      setAppliedCoupon(code || null);
                    }}
                  />
                  
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mt-4"
                    disabled={loading || selectedPosts.length === 0 && selectedReels.length === 0 || !formData.email || !formData.name}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Pagar com PIX'
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Pagamento */}
      {paymentData && (
        <PaymentPixModal
          isOpen={!!paymentData}
          onClose={handleClosePaymentModal}
          qrCode={paymentData.qrCodeBase64}
          qrCodeText={paymentData.qrCodeText}
          amount={paymentData.amount}
          qrCodeBase64={paymentData.qrCodeBase64}
          onSuccess={() => {
            router.push('/checkout/instagram-v2/visualizacao/success');
          }}
        />
      )}
    </div>
  );
}
