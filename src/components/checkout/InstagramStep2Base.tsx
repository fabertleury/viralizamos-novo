'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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
  external_id?: string;
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
}

interface InstagramStep2BaseProps {
  serviceType: 'curtidas' | 'visualizacao' | 'comentarios' | 'seguidores' | 'reels';
  title: string;
  children: ReactNode;
  selectedItems: Post[];
  hasPosts?: boolean;
  hasReels?: boolean;
  loadingPosts?: boolean;
  loadingReels?: boolean;
  loadingMessage?: string;
  onSubmit: (formData: any) => Promise<void>;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  setFormData: (data: any) => void;
}

export function InstagramStep2Base({
  serviceType,
  title,
  children,
  selectedItems,
  hasPosts = true,
  hasReels = true,
  loadingPosts = false,
  loadingReels = false,
  loadingMessage = '',
  onSubmit,
  formData,
  setFormData
}: InstagramStep2BaseProps) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [paymentData, setPaymentData] = useState<{
    qrCodeText: string;
    paymentId: string;
    amount: number;
    qrCodeBase64?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Carregar dados do perfil e serviço do localStorage
    const loadCheckoutData = () => {
      try {
        const savedData = localStorage.getItem('checkoutProfileData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('Dados de checkout carregados:', parsedData);
          
          if (parsedData.profileData) {
            setProfileData(parsedData.profileData);
          }
          
          // Carregar dados do serviço
          if (parsedData.serviceId) {
            fetchService(parsedData.external_id || parsedData.serviceId, parsedData.quantity);
          }
        } else {
          console.error('Dados de checkout não encontrados no localStorage');
          toast.error('Dados de checkout não encontrados');
          router.push(`/checkout/instagram-v2/${serviceType}/step1`);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do checkout:', error);
        toast.error('Erro ao carregar dados do checkout');
      }
    };

    loadCheckoutData();
  }, [router, serviceType]);

  const fetchService = async (externalId: string, quantity?: number) => {
    console.log('Buscando serviço com ID:', externalId);
    
    try {
      const supabase = createClient();
      
      // Buscar serviço pelo ID externo
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('external_id', externalId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar serviço:', error);
        toast.error('Erro ao buscar detalhes do serviço');
        return;
      }
      
      if (!data) {
        console.error('Serviço não encontrado para o ID:', externalId);
        toast.error('Serviço não encontrado');
        return;
      }
      
      console.log('Serviço encontrado:', data);
      
      // Se temos uma quantidade específica, atualizar o preço
      if (quantity) {
        const variations = data.service_variations || data.metadata?.quantidade_preco || [];
        const selectedVariation = variations.find(
          (v: any) => v.quantidade === parseInt(quantity.toString())
        );
        
        if (selectedVariation) {
          data.preco = selectedVariation.preco;
          data.quantidade = selectedVariation.quantidade;
        }
      }
      
      setService(data);
      setFinalAmount(data.preco);
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      toast.error('Erro ao buscar detalhes do serviço');
    }
  };

  const handleApplyCoupon = async (couponCode: string) => {
    try {
      if (!service) {
        toast.error('Serviço não encontrado');
        return;
      }
      
      // Verificar se o cupom é válido
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode,
        serviceId: service.id
      });
      
      const { valid, discount, message } = response.data;
      
      if (valid) {
        const discountValue = (service.preco * discount) / 100;
        const newAmount = service.preco - discountValue;
        
        setAppliedCoupon(couponCode);
        setDiscountAmount(discountValue);
        setFinalAmount(newAmount);
        
        toast.success(`Cupom aplicado: ${discount}% de desconto`);
      } else {
        toast.error(message || 'Cupom inválido');
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      toast.error('Erro ao validar cupom');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData || !service) {
      toast.error('Dados incompletos para finalizar o pedido');
      return;
    }
    
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um item para continuar');
      return;
    }
    
    // Validar campos do formulário
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Preencha todos os campos do formulário');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }
    
    // Validar formato de telefone (pelo menos 10 dígitos)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Telefone inválido (mínimo 10 dígitos)');
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Calcular o número total de itens selecionados
  const selectedItemsCount = selectedItems.length;
  
  // Calcular curtidas por item
  const itemsPerItem = service?.quantidade && selectedItemsCount > 0 
    ? Math.floor(service.quantidade / selectedItemsCount) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>
          
          {/* Informações do perfil */}
          {profileData && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center">
              <img 
                src={profileData.profile_pic_url} 
                alt={profileData.username} 
                className="w-16 h-16 rounded-full mr-4 object-cover"
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = '/default-profile.png';
                }}
              />
              <div>
                <h2 className="text-xl font-semibold">{profileData.full_name || profileData.username}</h2>
                <p className="text-gray-600">@{profileData.username}</p>
                <div className="flex space-x-4 mt-1">
                  <span className="text-sm text-gray-500">{profileData.follower_count} seguidores</span>
                  <span className="text-sm text-gray-500">{profileData.following_count} seguindo</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Conteúdo específico do serviço */}
          <div className="mb-8">
            {children}
          </div>
          
          {/* Resumo do pedido */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Serviço:</span>
                <span className="font-semibold">{service?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Quantidade total:</span>
                <span className="font-semibold">{service?.quantidade}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Itens selecionados:</span>
                <span className="font-semibold">{selectedItemsCount}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Quantidade por item:</span>
                <span className="font-semibold">{itemsPerItem}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">R$ {service?.preco.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({appliedCoupon}):</span>
                    <span className="font-semibold">-R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total:</span>
                  <span>R$ {finalAmount?.toFixed(2) || (service?.preco || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Cupom de desconto */}
            <div className="mt-6">
              <CouponInput onApply={handleApplyCoupon} disabled={!!appliedCoupon} />
            </div>
          </div>
          
          {/* Formulário de dados do cliente */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Seus Dados</h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1">Nome completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block mb-1">Telefone (WhatsApp)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                disabled={loading || selectedItemsCount === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Finalizar Pedido'
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
      
      {/* Modal de pagamento */}
      {paymentData && (
        <PaymentPixModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentData={paymentData}
        />
      )}
    </div>
  );
}
