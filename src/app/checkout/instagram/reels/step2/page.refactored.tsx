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

// Importar tipos e funções do arquivo de utilitários
import { 
  ProfileData, 
  Service, 
  Post, 
  InstagramPost,
  fetchInstagramReels,
  fetchService,
  prepareTransactionData
} from '../utils/reelsUtils';

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

  // Função para carregar os reels do Instagram
  const loadInstagramReels = async (username: string) => {
    try {
      setLoadingReels(true);
      const reels = await fetchInstagramReels(username, reelsLoaded, instagramReels);
      setInstagramReels(reels);
      setReelsLoaded(true);
      setLoadingReels(false);
      return reels;
    } catch (error) {
      console.error('Erro ao carregar reels:', error);
      setLoadingReels(false);
      return [];
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

        if (profileData) {
          setProfileData(profileData);
          // Atualizar formData com dados do perfil, se disponíveis
          setFormData({
            name: parsedCheckoutData.name || '',
            email: parsedCheckoutData.email || '',
            phone: parsedCheckoutData.phone || ''
          });
        }

        if (externalId && profileData?.username) {
          console.log('Iniciando busca de serviço e reels para o usuário:', profileData.username);
          
          // Buscar serviço e reels em paralelo
          Promise.all([
            fetchService(externalId),
            loadInstagramReels(profileData.username)
          ]).then(([serviceData, reelsData]) => {
            if (serviceData) {
              // Definir o ID do provedor padrão se não estiver presente
              if (!serviceData.provider_id) {
                serviceData.provider_id = '1';
              }
              setService(serviceData);
            } else {
              console.error('Serviço não encontrado');
              toast.error('Serviço não encontrado. Por favor, tente novamente.');
            }
          }).catch(error => {
            console.error('Erro ao buscar dados:', error);
            toast.error('Erro ao carregar dados. Por favor, tente novamente.');
          });
        } else {
          console.error('Dados insuficientes para buscar serviço e reels');
          toast.error('Dados insuficientes. Por favor, volte à etapa anterior.');
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

  const sendTransactionToAdmin = async () => {
    try {
      setLoading(true);

      if (!service || !profileData || !formData || selectedReels.length === 0) {
        toast.error('Por favor, selecione pelo menos um reel e preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Verificar se já temos dados de pagamento
      if (!paymentData) {
        // Preparar dados para o pagamento
        const paymentData = {
          amount: finalAmount || service.preco,
          service_id: service.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          coupon_code: appliedCoupon || undefined
        };

        console.log('Enviando dados para criação de pagamento:', paymentData);

        // Criar pagamento
        const response = await axios.post('/api/payment/create', paymentData);
        console.log('Resposta da criação de pagamento:', response.data);

        if (response.data && response.data.qrCodeText) {
          setPaymentData(response.data);
          setLoading(false);
          return;
        } else {
          console.error('Resposta inválida da API de pagamento');
          toast.error('Erro ao gerar pagamento. Por favor, tente novamente.');
          setLoading(false);
          return;
        }
      }

      // Se já temos dados de pagamento, enviar a transação para o admin
      if (!service || !profileData || !formData || selectedReels.length === 0 || !paymentData) {
        toast.error('Dados incompletos para processamento da transação');
        setLoading(false);
        return;
      }

      // Preparar dados da transação usando a função utilitária
      const transactionData = prepareTransactionData(
        service,
        profileData,
        formData,
        selectedReels,
        paymentData
      );

      console.log('Enviando dados da transação para o admin:', transactionData);

      // Enviar dados para a API
      const transactionResponse = await axios.post('/api/transaction/create', transactionData);
      console.log('Resposta da criação de transação:', transactionResponse.data);

      if (transactionResponse.data && transactionResponse.data.success) {
        toast.success('Pedido enviado com sucesso!');
        
        // Redirecionar para a página de agradecimento
        router.push(`/agradecimento?id=${paymentData.paymentId}`);
      } else {
        console.error('Erro ao processar transação:', transactionResponse.data);
        toast.error('Erro ao processar pedido. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar transação:', error);
      toast.error('Erro ao processar pedido. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCouponApplied = (couponCode: string, discountValue: number, finalPrice: number) => {
    setAppliedCoupon(couponCode);
    setDiscountAmount(discountValue);
    setFinalAmount(finalPrice);
    toast.success(`Cupom ${couponCode} aplicado com sucesso!`);
  };

  const handleCouponError = (message: string) => {
    toast.error(message);
  };

  const handleCouponReset = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFinalAmount(null);
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
              
              {loadingReels ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Carregando reels...</span>
                </div>
              ) : (
                <ReelSelector 
                  posts={instagramReels} 
                  onSelect={handleReelSelect}
                  maxItems={maxTotalItems}
                  viewsPerItem={viewsPerItem}
                  totalViews={service?.quantidade || 0}
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
                        onClick={sendTransactionToAdmin}
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
                      originalPrice={service.preco}
                      onApplied={handleCouponApplied}
                      onError={handleCouponError}
                      onReset={handleCouponReset}
                      appliedCoupon={appliedCoupon}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {paymentData && (
        <PaymentPixModal
          isOpen={!!paymentData}
          onClose={() => {}}
          qrCodeText={paymentData.qrCodeText}
          qrCodeBase64={paymentData.qrCodeBase64}
          paymentId={paymentData.paymentId}
          amount={paymentData.amount}
          onPaymentConfirmed={() => router.push(`/agradecimento?id=${paymentData.paymentId}`)}
        />
      )}
    </div>
  );
}
