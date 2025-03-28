'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { FaHeart, FaComment, FaQrcode, FaCreditCard } from 'react-icons/fa';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PixPayment } from '@/components/payment/PixPayment';
import { CardPayment } from '@/components/payment/CardPayment';

interface Post {
  id: string;
  shortcode: string;
  display_url: string;
  thumbnail_url: string;
  is_video: boolean;
  caption: string;
  likes_count: number;
  comments_count: number;
  timestamp: number;
  type: string;
}

interface FormData {
  instagram_username: string;
  whatsapp: string;
  email: string;
  profile_data: any;
}

interface Service {
  id: string;
  name: string;
  quantidade: number;
  preco: number;
  descricao: string;
}

export default function LikesPaymentPage() {
  const params = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [likesDistribution, setLikesDistribution] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'pix' | 'credit_card' | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const maxPosts = 5; // Máximo de posts que podem ser selecionados

  // Carregar dados do formulário do localStorage
  useEffect(() => {
    const loadFormData = () => {
      const data = localStorage.getItem('checkoutFormData');
      if (data) {
        setFormData(JSON.parse(data));
      }
    };

    loadFormData();
  }, []);

  // Carregar dados do serviço
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/services/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Serviço não encontrado');
          } else {
            toast.error('Erro ao carregar dados do serviço');
          }
          throw new Error('Failed to fetch service');
        }

        const data = await response.json();
        setService(data);
      } catch (error: any) {
        console.error('Error fetching service:', error);
        toast.error('Erro ao carregar dados do serviço');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  // Função para buscar os posts
  const fetchPosts = async (username: string) => {
    try {
      setLoading(true);
      console.log('Buscando posts para:', username);
      const response = await fetch(`/api/instagram/posts?username=${username.replace('@', '')}`);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erro ao buscar posts:', error);
        throw new Error(error);
      }

      const posts = await response.json();
      console.log('Posts encontrados:', posts);
      setPosts(posts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setError('Não foi possível carregar os posts. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os posts quando o formData estiver disponível
  useEffect(() => {
    if (formData?.instagram_username) {
      fetchPosts(formData.instagram_username);
    }
  }, [formData?.instagram_username]);

  // Distribuir curtidas entre os posts selecionados
  useEffect(() => {
    const distribution: Record<string, number> = {};
    if (selectedPosts.length > 0 && service) {
      const likesPerPost = Math.floor(service.quantidade / selectedPosts.length);
      selectedPosts.forEach(postId => {
        distribution[postId] = likesPerPost;
      });
    }
    setLikesDistribution(distribution);
  }, [selectedPosts, service]);

  const handlePostSelect = (postId: string) => {
    setSelectedPosts(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      }
      if (prev.length >= maxPosts) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Limite de posts atingido!</span>
            <span className="text-sm">Você pode selecionar no máximo {maxPosts} posts.</span>
          </div>,
          {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#FF00C4',
              color: '#fff',
              padding: '16px',
            },
          }
        );
        return prev;
      }
      return [...prev, postId];
    });
  };

  const getProxiedImageUrl = (originalUrl: string) => {
    return `/api/proxy/instagram-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const handlePayment = async (method: 'pix' | 'credit_card', cardData?: any) => {
    if (!service || !formData || selectedPosts.length === 0) {
      toast.error('Por favor, selecione pelo menos um post');
      return;
    }

    try {
      // Criar pedido
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: service.id,
          target_username: formData.instagram_username,
          quantity: service.quantidade,
          amount: service.preco,
          payment_method: method,
          metadata: {
            posts: selectedPosts.map(postId => ({
              id: postId,
              likes: likesDistribution[postId],
            })),
            profile_data: formData.profile_data,
            contact: {
              email: formData.email,
              whatsapp: formData.whatsapp,
            },
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Erro ao criar pedido');
      }

      // Iniciar pagamento com Mercado Pago
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderData.id,
          payment_method: method,
          amount: service.preco,
          payer: {
            email: formData.email,
            name: formData.instagram_username,
          },
          ...(cardData && { card_data: cardData }),
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Erro ao criar pagamento');
      }

      if (method === 'pix') {
        setPaymentData({
          ...paymentData,
          orderId: orderData.id,
        });
        setPaymentType('pix');
        setShowPaymentModal(true);
      } else {
        window.location.href = paymentData.redirect_url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar pagamento');
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Pagamento confirmado com sucesso!');
    setShowPaymentModal(false);
    // Redirecionar para página de sucesso ou atualizar status
    window.location.href = '/payment/success';
  };

  if (loading || !service) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna de Posts */}
          <div className="lg:col-span-2">
            {/* Card de Perfil */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 md:w-16 md:h-16">
                  <Image
                    src={getProxiedImageUrl(formData?.profile_data?.profile_pic_url || '')}
                    alt={formData?.instagram_username || ''}
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 768px) 48px, 64px"
                    priority
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">@{formData?.instagram_username}</h3>
                    {formData?.profile_data?.is_verified && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{formData?.profile_data?.followers_count} seguidores</span>
                    <span>•</span>
                    <span>{formData?.profile_data?.media_count} posts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Seleção de Posts */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Selecione os posts (máx. {maxPosts})</h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => formData?.instagram_username && fetchPosts(formData.instagram_username)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Nenhum post encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
                        selectedPosts.includes(post.id) ? 'ring-2 ring-[#FF00C4]' : ''
                      }`}
                      onClick={() => handlePostSelect(post.id)}
                    >
                      <Image
                        src={getProxiedImageUrl(post.display_url)}
                        alt={post.caption || 'Post do Instagram'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {/* Overlay com informações de curtidas e comentários */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1">
                            <FaHeart className="text-white" />
                            <span>{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaComment className="text-white" />
                            <span>{post.comments_count}</span>
                          </div>
                        </div>
                      </div>
                      {selectedPosts.includes(post.id) && (
                        <div className="absolute inset-0 bg-[#FF00C4] bg-opacity-30 flex items-center justify-center">
                          <div className="bg-white rounded-full p-2">
                            <FaHeart className="w-6 h-6 text-[#FF00C4]" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coluna de Detalhes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Detalhes do Pedido</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Serviço</p>
                  <p className="font-medium">{service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantidade Total de Curtidas</p>
                  <p className="font-medium">{service.quantidade.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-medium text-green-600">
                    R$ {service.preco.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Posts selecionados</p>
                  <p className="font-medium">{selectedPosts.length}/5</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Curtidas por post</p>
                  <p className="font-medium">
                    {selectedPosts.length > 0
                      ? Math.floor(service.quantidade / selectedPosts.length).toLocaleString('pt-BR')
                      : 0}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6 mb-6">
                <h4 className="font-bold mb-4">Informações do Comprador</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{formData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">@{formData?.instagram_username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="font-medium">{formData?.whatsapp}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handlePayment('pix')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center gap-2"
                  disabled={selectedPosts.length === 0}
                >
                  <FaQrcode className="w-5 h-5" />
                  Pagar com PIX
                </Button>
                <Button
                  onClick={() => {
                    setPaymentType('credit_card');
                    setShowPaymentModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center gap-2"
                  disabled={selectedPosts.length === 0}
                >
                  <FaCreditCard className="w-5 h-5" />
                  Pagar com Cartão
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[500px]">
          {paymentType === 'pix' && paymentData && (
            <PixPayment
              qrCodeUrl={paymentData.qr_code_url}
              qrCodeBase64={paymentData.qr_code_base64}
              copyPasteCode={paymentData.copy_paste_code}
              orderId={paymentData.orderId}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
          {paymentType === 'credit_card' && (
            <CardPayment
              onSubmit={(cardData) => handlePayment('credit_card', cardData)}
              amount={service?.preco || 0}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
