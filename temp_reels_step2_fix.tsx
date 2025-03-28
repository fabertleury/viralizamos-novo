'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ReelSelector from '@/components/instagram/reels/ReelSelector';
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
  views_count?: number;
}

interface InstagramPost {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
  views_count?: number;
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
  const [selectedReels, setSelectedReels] = useState<Post[]>([]);
  const [instagramReels, setInstagramReels] = useState<Post[]>([]);
  const [paymentData, setPaymentData] = useState<{
    qrCodeText: string;
    paymentId: string;
    amount: number;
    qrCodeBase64?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reelsLoaded, setReelsLoaded] = useState(false);
  const [loadingReels, setLoadingReels] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const supabase = createClient();

  const handleReelSelect = useCallback((reels: InstagramPost[]) => {
    setSelectedReels(reels as Post[]);
  }, []);

  // Calcular o número total de itens selecionados
  const selectedItemsCount = selectedReels.length;
  const maxTotalItems = 5; // Máximo de 5 reels
  
  // Calcular visualizações por item
  const viewsPerItem = service?.quantidade && selectedItemsCount > 0 
    ? Math.floor(service.quantidade / selectedItemsCount) 
    : 0;

  // Função para extrair o código correto de um reel do Instagram
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

  const fetchInstagramReels = async (username: string) => {
    try {
      // Se já carregou os reels, não precisa buscar novamente
      if (reelsLoaded && instagramReels.length > 0) {
        console.log('Usando reels em cache:', instagramReels.length);
        return instagramReels;
      }

      setLoadingReels(true);
      
      const options = {
        method: 'GET',
        url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/reels',
        params: { username_or_id_or_url: username },
        headers: {
          'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        }
      };
      const response = await axios.request(options);
      console.log('Resposta da API de reels:', response.data);

      // Verificar se a resposta tem a estrutura esperada
      const reels = response.data.data?.items || response.data.items || [];
      console.log('Reels encontrados:', reels.length);

      // Mapear os reels para o formato esperado
      const formattedReels: Post[] = reels.map((reel: any) => {
        // Tentar diferentes caminhos para a imagem do reel
        const imageUrl = 
          reel.image_versions?.items?.[0]?.url || 
          reel.thumbnail_url || 
          reel.cover_frame_url || 
          reel.display_url;

        // Extrair o código correto do reel para a URL
        const reelCode = extractPostCode(reel);
        
        return {
          id: reel.id || '',
          code: reelCode,
          shortcode: reelCode,
          image_url: imageUrl,
          caption: reel.caption 
              ? (typeof reel.caption === 'object' 
                ? reel.caption.text || 'Sem legenda'
                : String(reel.caption)) 
              : 'Sem legenda',
          like_count: reel.like_count || reel.likes_count || 0,
          comment_count: reel.comment_count || reel.comments_count || 0,
          views_count: reel.play_count || reel.view_count || reel.views_count || 0,
          // Campos específicos para reels
          thumbnail_url: reel.thumbnail_url || '',
          display_url: reel.display_url || '',
          image_versions: reel.image_versions || null
        };
      }).filter(reel => reel.image_url || reel.thumbnail_url || reel.display_url); // Remover reels sem imagem

      console.log('Reels formatados:', formattedReels.length);
      setInstagramReels(formattedReels);
      setReelsLoaded(true);
      setLoadingReels(false);
      return formattedReels;
    } catch (error) {
      console.error('Erro ao buscar reels do Instagram:', error);
      setLoadingReels(false);
      return [];
    }
  };

  const fetchService = async (externalId: string) => {
    console.log('Buscando serviço com ID:', externalId);
    
    try {
      const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', externalId)
        .eq('type', 'reels')
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!service) {
        throw new Error('Serviço não encontrado');
      }
      
      console.log('Serviço encontrado:', service);
      setService(service);
      return service;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      toast.error('Erro ao buscar serviço. Por favor, tente novamente.');
      return null;
    }
  };

  useEffect(() => {
    // Verificar diferentes possíveis nomes de chaves no localStorage
    const checkoutData = localStorage.getItem('checkoutData') || 
                        localStorage.getItem('checkoutProfileData') || 
                        localStorage.getItem('reelsCheckoutData') || 
                        localStorage.getItem('instagramCheckoutData');
    
    if (checkoutData) {
      try {
        const parsedCheckoutData = JSON.parse(checkoutData);
        console.log('Dados de checkout recuperados:', parsedCheckoutData);
        
        // Recuperar o username
        const username = 
          parsedCheckoutData.username || 
          parsedCheckoutData.profileData?.username || 
          parsedCheckoutData.profile?.username || 
          parsedCheckoutData.user?.username;
        
        console.log('Username recuperado:', username);
        
        if (!username) {
          toast.error('Nome de usuário não encontrado. Por favor, tente novamente.');
          router.push('/dashboard');
          return;
        }

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
        
        if (profileData) {
          setProfileData(profileData);
          
          // Buscar reels do usuário
          fetchInstagramReels(username);
        } else {
          toast.error('Perfil não encontrado. Por favor, tente novamente.');
          router.push('/dashboard');
          return;
        }
        
        if (externalId) {
          fetchService(externalId);
        } else {
          toast.error('ID do serviço não encontrado. Por favor, tente novamente.');
          router.push('/dashboard');
          return;
        }
        
      } catch (error) {
        console.error('Erro ao processar dados de checkout:', error);
        toast.error('Erro ao processar dados. Por favor, tente novamente.');
        router.push('/dashboard');
      }
    } else {
      console.error('Dados de checkout não encontrados');
      
      // Em modo de desenvolvimento, criar dados de teste
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Modo de desenvolvimento: criando dados de teste para checkout');
        
        // Dados de teste para desenvolvimento
        const testData = {
          username: 'usuarioteste',
          profileData: {
            username: 'usuarioteste',
            full_name: 'Usuário Teste',
            profile_pic_url: 'https://via.placeholder.com/150',
            follower_count: 1000,
            following_count: 500,
            is_private: false
          },
          external_id: '1', // ID de um serviço de teste
          serviceId: '1'
        };
        
        // Salvar dados de teste no localStorage
        localStorage.setItem('checkoutData', JSON.stringify(testData));
        
        // Recarregar a página para usar os dados de teste
        window.location.reload();
        return;
      }
      
      toast.error('Dados não encontrados. Por favor, tente novamente.');
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!service) {
      toast.error('Serviço não encontrado. Por favor, tente novamente.');
      return;
    }
    
    if (selectedReels.length === 0) {
      toast.error('Por favor, selecione pelo menos um reel.');
      return;
    }
    
    if (!formData.name || !formData.email) {
      toast.error('Por favor, preencha seu nome e e-mail.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar metadados dos reels selecionados
      const reelsMetadata = selectedReels.map((reel, index) => {
        return {
          id: reel.id,
          code: reel.code || reel.shortcode,
          views_per_reel: viewsPerItem,
          total_views: service.quantidade
        };
      });
      
      // Criar transação no Supabase
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          service_id: service.id,
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone,
          amount: finalAmount || service.preco,
          original_amount: service.preco,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon,
          status: 'pending',
          instagram_username: profileData?.username,
          metadata: {
            reels: reelsMetadata,
            service_type: 'reels',
            total_views: service.quantidade,
            views_per_reel: viewsPerItem
          }
        })
        .select()
        .single();
      
      if (transactionError) {
        throw transactionError;
      }
      
      console.log('Transação criada:', transaction);
      
      // Log detalhado dos reels selecionados
      console.log('📊 Reels selecionados para pagamento:', selectedReels.map(reel => ({
        id: reel.id,
        code: reel.code,
        views: viewsPerItem
      })));
      
      // Preparar dados para a API de pagamento
      const reelIds = selectedReels.map(reel => reel.id);
      const reelCodes = selectedReels.map(reel => extractPostCode(reel));
      
      // Enviar dados para a API de pagamento
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transaction.id,
          amount: finalAmount || service.preco,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_id: service.id,
          service_name: service.name,
          instagram_username: profileData?.username,
          reels: reelIds,
          reel_codes: reelCodes,
          views_per_reel: viewsPerItem,
          total_views: service.quantidade
        }),
      }).then(res => res.json());
      
      console.log('Resposta da API de pagamento:', paymentResponse);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Erro ao criar pagamento');
      }
      
      // Função para enviar notificação ao admin
      const sendTransactionToAdmin = async () => {
        try {
          await fetch('/api/admin/notify-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transaction_id: transaction.id,
              service_name: service.name,
              user_name: formData.name,
              user_email: formData.email,
              amount: finalAmount || service.preco,
              instagram_username: profileData?.username,
              reels_count: selectedReels.length,
              views_per_reel: viewsPerItem,
              total_views: service.quantidade
            }),
          });
          console.log('Notificação enviada ao admin');
        } catch (error) {
          console.error('Erro ao enviar notificação ao admin:', error);
          // Não bloquear o fluxo principal se a notificação falhar
        }
      };
      
      setPaymentData({
        qrCodeText: paymentResponse.qr_code,
        paymentId: paymentResponse.id,
        amount: finalAmount || service.preco,
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

  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {profileData && service && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Seleção de Reels */}
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
              
              {/* Título da seção de reels */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div 
                  className="px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider 
                  bg-gradient-to-r from-pink-500 to-rose-500 text-white scale-105 shadow-lg"
                >
                  <span className="flex items-center">
                    Reels ({instagramReels?.length || 0})
                  </span>
                </div>
              </div>

              <ReelSelector 
                username={profileData.username}
                onSelectReels={handleReelSelect}
                selectedReels={selectedReels}
                selectedPosts={[]}
                maxReels={maxTotalItems}
                totalViews={service?.quantidade || 100}
                loading={loadingReels}
              />
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
                    {selectedReels.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Visualizações por reel:</span>
                        <span>{viewsPerItem.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Reels selecionados:</span>
                      <span>{selectedItemsCount} / {maxTotalItems}</span>
                    </div>

                    {/* Miniaturas dos reels selecionados */}
                    {selectedItemsCount > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-1">Reels selecionados:</p>
                        <div className="flex flex-wrap gap-0">
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
                    disabled={loading || selectedReels.length === 0 || !formData.email || !formData.name}
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
            router.push('/checkout/instagram/reels/success');
          }}
        />
      )}
    </div>
  );
}
