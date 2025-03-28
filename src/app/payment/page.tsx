'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CardPayment } from '@/components/payment/CardPayment';
import { PixPayment } from '@/components/payment/PixPayment';

interface Post {
  id: string;
  code: string;
  display_url: string;
  thumbnail_url: string;
  is_video: boolean;
  caption: string;
  likes_count: number;
  comments_count: number;
  timestamp: number;
  type: string;
  link: string;
}

interface FormData {
  instagram_username: string;
  whatsapp: string;
  email: string;
  profile_data: any;
}

interface PaymentData {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [likesDistribution, setLikesDistribution] = useState<Record<string, number>>({});
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const serviceQuantity = 1000; // Quantidade de curtidas do serviço
  const maxPosts = 5; // Máximo de posts que podem ser selecionados
  const amount = 9.97; // Valor do serviço

  useEffect(() => {
    const loadFormData = () => {
      const data = localStorage.getItem('checkoutFormData');
      if (data) {
        setFormData(JSON.parse(data));
      }
    };

    loadFormData();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!formData?.instagram_username) return;

      try {
        const response = await fetch(
          `/api/instagram/posts?username=${formData.instagram_username.replace('@', '')}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch posts');
        }

        setPosts(data);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [formData?.instagram_username]);

  useEffect(() => {
    // Distribuir as curtidas igualmente entre os posts selecionados
    const distribution: Record<string, number> = {};
    if (selectedPosts.length > 0) {
      const likesPerPost = Math.floor(serviceQuantity / selectedPosts.length);
      selectedPosts.forEach(post => {
        distribution[post.id] = likesPerPost;
      });
    }
    setLikesDistribution(distribution);
  }, [selectedPosts, serviceQuantity]);

  const handlePostSelect = (post: Post) => {
    setSelectedPosts(prev => {
      if (prev.includes(post)) {
        return prev.filter(p => p.id !== post.id);
      }
      if (prev.length >= maxPosts) {
        toast.error(`Você pode selecionar no máximo ${maxPosts} posts`);
        return prev;
      }
      return [...prev, post];
    });
  };

  const getProxiedImageUrl = (originalUrl: string) => {
    return `/api/proxy/instagram-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const handlePostsSelect = (selectedPosts: any[]) => {
    console.log('Posts selecionados recebidos:', JSON.stringify(selectedPosts, null, 2));
    if (!Array.isArray(selectedPosts)) {
      console.error('Posts selecionados não é um array:', selectedPosts);
      return;
    }
    setSelectedPosts(selectedPosts);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (!selectedPosts || selectedPosts.length === 0) {
        toast.error('Por favor, selecione pelo menos um post');
        return;
      }

      setLoading(true);

      console.log('Dados do formulário:', JSON.stringify(formData, null, 2));
      console.log('Posts selecionados para envio:', JSON.stringify(selectedPosts, null, 2));

      // Criar pedido
      const orderData = {
        payment_id: paymentData?.id,
        payment_method: paymentMethod,
        amount,
        status: paymentData?.status || 'pending',
        target_username: formData.instagram_username,
        quantity: serviceQuantity,
        metadata: {
          posts: selectedPosts.map(post => {
            console.log('Processando post para envio:', JSON.stringify(post, null, 2));
            
            if (!post.code) {
              console.error('Post sem código:', post);
              toast.error('Erro: Post sem código detectado');
              throw new Error('Post sem código detectado');
            }

            return {
              id: post.id,
              code: post.code,
              link: `https://instagram.com/p/${post.code}`,
              caption: post.caption || '',
              image_url: post.image_url || null
            };
          }),
          profile_data: formData.profile_data,
          contact: {
            email: formData.email,
            whatsapp: formData.whatsapp
          },
          email: formData.email, // Adicionando email diretamente nos metadados para facilitar acesso
          target_username: formData.instagram_username // Adicionar username para facilitar acesso
        }
      };

      console.log('Dados do pedido:', JSON.stringify(orderData, null, 2));

      // Criar pedido
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error('Erro ao criar pedido');
      }

      const order = await orderResponse.json();
      console.log('Pedido criado:', JSON.stringify(order, null, 2));
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      setPaymentMethod(null); // Reset do estado em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method: 'pix' | 'credit_card') => {
    if (!formData?.email) {
      toast.error('Email é obrigatório para o pagamento');
      return;
    }

    setPaymentMethod(method);

    try {
      if (method === 'pix') {
        setIsLoading(true);
        // Criar pagamento PIX
        console.log('Enviando dados para criar pagamento PIX:', {
          amount,
          description: `${serviceQuantity} curtidas para ${selectedPosts.length} posts`,
          payer_email: formData.email
        });

        const pixResponse = await fetch('/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            description: `${serviceQuantity} curtidas para ${selectedPosts.length} posts`,
            payer_email: formData.email
          }),
        });

        if (!pixResponse.ok) {
          const errorData = await pixResponse.json();
          console.error('Erro na resposta do pagamento PIX:', errorData);
          throw new Error(`Erro ao gerar pagamento PIX: ${errorData.message}`);
        }

        const pixData = await pixResponse.json();
        console.log('Dados recebidos do pagamento PIX:', pixData);

        if (!pixData.id) {
          console.error('Dados do PIX inválidos:', pixData);
          throw new Error('ID do pagamento não retornado pelo Mercado Pago');
        }

        await handleSubmit(formData);
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      setPaymentMethod(null); // Reset do estado em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Pagamento confirmado com sucesso!');
    // Redirecionar para página de sucesso ou atualizar UI
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (paymentMethod === 'pix' && paymentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <PixPayment
            qrCodeUrl={paymentData.qr_code}
            qrCodeBase64={paymentData.qr_code_base64}
            copyPasteCode={paymentData.qr_code}
            orderId={paymentData.id}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Posts */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Selecione os posts (máx. {maxPosts})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map(post => (
              <div
                key={post.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                  selectedPosts.includes(post)
                    ? 'border-pink-500'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => handlePostSelect(post)}
              >
                <div className="relative aspect-square">
                  <Image
                    src={getProxiedImageUrl(post.thumbnail_url)}
                    alt={post.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                {selectedPosts.includes(post) && (
                  <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                    <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-pink-600">
                      {likesDistribution[post.id]} curtidas
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coluna de Detalhes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h3 className="text-xl font-bold mb-4">Detalhes do Pedido</h3>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Serviço</p>
                <p className="font-medium">{serviceQuantity} curtidas</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor</p>
                <p className="font-medium text-green-600">R$ {amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Posts selecionados</p>
                <p className="font-medium">{selectedPosts.length}/{maxPosts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Curtidas por post</p>
                <p className="font-medium">
                  {selectedPosts.length > 0
                    ? Math.floor(serviceQuantity / selectedPosts.length)
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
                className="w-full bg-gradient-to-r from-green-500 to-green-600"
                disabled={selectedPosts.length === 0 || isLoading}
              >
                Pagar com PIX
              </Button>
              <Button
                onClick={() => handlePayment('credit_card')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={selectedPosts.length === 0 || isLoading}
              >
                Pagar com Cartão
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
