'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ReelSelector from '@/components/instagram/reels/ReelSelector';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getProxiedImageUrl } from '../../utils/proxy-image';
import { PaymentService } from '@/components/payment/PaymentPixModal';
import { CouponInput } from '@/components/checkout/CouponInput';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

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

function ReelsStep2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';
  
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
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const supabase = createClient();

  const handleReelSelect = useCallback((reels: InstagramPost[]) => {
    console.log('Reels selecionados:', reels);
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
        // Determinar o link correto a ser enviado
        let profileUrl = `https://instagram.com/${profileData.username}/`;
        
        // Se houver apenas um reel selecionado, usar o link do reel específico
        if (selectedReels.length === 1) {
          const reelCode = selectedReels[0].code || selectedReels[0].shortcode || selectedReels[0].id;
          if (reelCode) {
            profileUrl = `https://instagram.com/reel/${reelCode}`;
            console.log('🔗 Usando link específico do reel para pagamento:', profileUrl);
          }
        }
        
        const paymentData = {
          amount: finalAmount || service.preco,
          service_id: service.id,
          profile_username: profileData.username,  // Campo obrigatório para a API
          profile_url: profileUrl,  // Link específico do reel ou do perfil
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          service_provider_id: service.provider_id || '1',
          posts: selectedReels.map(reel => {
            const code = reel.code || reel.shortcode || extractCodeFromUrl(reel.url);
            return {
              id: reel.id,
              code: code,
              url: code ? `https://instagram.com/reel/${code}` : '',
              thumbnail_url: reel.image_url || reel.thumbnail_url || reel.image_versions?.[0]?.url,
              quantity: Math.floor(service.quantidade / selectedReels.length)
            };
          })
        };

        console.log('Enviando dados para processamento:', paymentData);

        // Enviar para API que lida com o pagamento
        const response = await fetch('/api/core/payment/pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: service,
            profile: profileData,
            customer: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            },
            posts: selectedReels,
            amount: finalAmount || service.preco
          }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Erro na resposta da API:', errorResponse);
          throw new Error(errorResponse.error || 'Erro ao criar o pagamento');
        }

        const responseData = await response.json();
        console.log('Resposta da API de pagamento:', responseData);
        
        // Atualizar o estado com os dados de pagamento
        setPaymentData({
          qrCodeText: responseData.qr_code,
          qrCodeBase64: responseData.qr_code_base64,
          paymentId: responseData.payment_id,
          amount: finalAmount || service.preco
        });
        
        // Criar a transação na tabela core_transactions_v2
        // Agora enviamos os dados completos, incluindo o profile_url que pode ser um link específico do reel
        const transactionData = prepareTransactionData();
        if (transactionData) {
          // Enviar a transação para o backend admin
          await axios.post('/api/core/transactions', transactionData);
          console.log('Transação criada com sucesso');
        } else {
          console.error('Não foi possível preparar os dados da transação');
        }
        
        // Salvar os reels selecionados no localStorage para o redirecionamento
        localStorage.setItem('selectedReels', JSON.stringify(selectedReels));
        
        // Após criar a transação, redirecionar para o microserviço de pagamento
        await directRedirectToPaymentService({
          serviceId: service.id,
          profileUsername: profileData.username,
          amount: finalAmount || service.preco,
          customerEmail: formData.email,
          customerName: formData.name,
          serviceName: service.name,
          returnUrl: "/agradecimento"
        });
      } else {
        // Se já temos dados de pagamento, apenas enviar a transação
        const transactionData = prepareTransactionData();
        if (transactionData) {
          await axios.post('/api/core/transactions', transactionData);
          console.log('Transação criada com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao enviar transação:', error);
      toast.error('Erro ao processar pagamento. Por favor, tente novamente.');
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

  // Redirecionamento para página de agradecimento com email
  const handleRedirectToThankYou = useCallback(() => {
    if (!paymentData) return;
    const email = userProfile?.email || metadata?.email || ''; 
    router.push(`/redirecionamento-pagamento?order_id=${paymentData.order_id}&email=${email}`);
  }, [paymentData, userProfile, metadata, router]);

  return (
    <div>
      {/* Renderização do componente ReelSelector */}
    </div>
  );
}

export default ReelsStep2Content;