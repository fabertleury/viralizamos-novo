'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { CouponInput } from '@/components/checkout/CouponInput';
import ReelSelectServiceReel from '@/components/instagram/reels/ReelSelectServiceReel';
import axios from 'axios';
import { PaymentPixModal } from '@/components/payment/PaymentPixModal';
import { maskPhone } from '@/lib/utils/mask';

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
  view_count?: number;
  thumbnail_url?: string;
  display_url?: string;
  is_reel?: boolean;
}

interface InstagramReelsServiceStep2Props {
  title: string;
}

export function InstagramReelsServiceStep2({ title: pageTitle }: InstagramReelsServiceStep2Props) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [service, setService] = useState<Service | null>(null);
  const [selectedReels, setSelectedReels] = useState<Post[]>([]);
  const [paymentData, setPaymentData] = useState<{
    qrCodeText: string;
    paymentId: string;
    amount: number;
    qrCodeBase64?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReels, setLoadingReels] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [error, setError] = useState('');

  // Calcular o número total de itens selecionados
  const selectedItemsCount = selectedReels.length;
  const maxTotalItems = 5; // Máximo de 5 reels
  
  // Calcular visualizações por item
  const viewsPerItem = service?.quantidade && selectedItemsCount > 0
    ? Math.floor(service.quantidade / selectedItemsCount)
    : 0;

  // Função para lidar com a seleção de reels
  const handleReelSelect = useCallback((reels: Post[]) => {
    const totalSelected = reels.length;
    if (totalSelected > maxTotalItems) {
      toast.error(`Você só pode selecionar até ${maxTotalItems} reels no total`);
      return;
    }
    setSelectedReels(reels);
  }, [maxTotalItems]);
  
  const handleReelsLoaded = useCallback((reels: Post[]) => {
    console.log('Reels carregados:', reels.length);
    setLoadingReels(false);
  }, []);

  // Função para fechar o modal de pagamento
  const handleClosePaymentModal = () => {
    setPaymentData(null);
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

  useEffect(() => {
    try {
      // Recuperar dados do checkout do localStorage
      const checkoutData = localStorage.getItem('checkoutProfileData');
      
      if (checkoutData) {
        const parsedCheckoutData = JSON.parse(checkoutData);
        console.log('Dados do checkout recuperados:', parsedCheckoutData);
        
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
          
          // Recuperar dados do perfil
          const profileData = 
            parsedCheckoutData.profileData || 
            parsedCheckoutData.user;

          console.log('Perfil recuperado:', profileData);

          if (profileData) {
            setProfileData(profileData);
            // Atualizar formData com dados do perfil, se disponíveis
            setFormData({
              name: parsedCheckoutData.name || '',
              email: '',
              phone: parsedCheckoutData.phone || ''
            });
          } else {
            console.error('Dados do perfil não encontrados');
            toast.error('Dados do perfil não encontrados. Por favor, volte à etapa anterior.');
            return;
          }
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

          // Recuperar dados do perfil
          const profileData = 
            parsedCheckoutData.profileData || 
            parsedCheckoutData.user;

          console.log('Perfil recuperado:', profileData);

          if (profileData) {
            setProfileData(profileData);
            // Atualizar formData com dados do perfil, se disponíveis
            setFormData({
              name: parsedCheckoutData.name || '',
              email: '',
              phone: parsedCheckoutData.phone || ''
            });
          } else {
            console.error('Dados do perfil não encontrados');
            toast.error('Dados do perfil não encontrados. Por favor, volte à etapa anterior.');
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
            
            // Buscar apenas o serviço aqui
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
                
                // Finalizar a configuração do serviço
                console.log('Serviço encontrado e configurado:', serviceData);
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
      } else {
        console.error('Nenhum dado de checkout encontrado');
        toast.error('Nenhum dado de checkout encontrado. Por favor, volte à etapa anterior.');
      }
    } catch (error) {
      console.error('Erro ao processar dados de checkout:', error);
      toast.error('Erro ao processar dados. Por favor, tente novamente.');
    }
  }, []);

  const prepareTransactionData = () => {
    if (!service || !profileData || !formData || selectedReels.length === 0 || !paymentData) {
      toast.error('Dados incompletos para processamento da transação');
      return null;
    }

    // Calcular quantidade de visualizações por item
    const totalItems = selectedReels.length;
    const totalQuantity = service.quantidade;
    const quantityPerItem = Math.floor(totalQuantity / totalItems);
    const remainingQuantity = totalQuantity % totalItems;

    // Preparar metadados dos reels
    const reelsMetadata = selectedReels.map((reel, index) => {
      // Usar o campo code correto para a URL do reel
      const reelCode = reel.code || reel.shortcode || reel.id;
      return {
        postId: reel.id,
        postCode: reelCode,
        postLink: `https://instagram.com/reel/${reelCode}`,
        quantity: index === 0 ? quantityPerItem + remainingQuantity : quantityPerItem,
        type: 'reel', // Adicionar tipo explícito para reels
        imageUrl: reel.image_url || reel.thumbnail_url || reel.display_url || ''
      };
    });

    return {
      user_id: formData.name || null,
      order_id: paymentData.paymentId,
      type: 'reels',
      amount: finalAmount || service.preco,
      status: 'pending',
      payment_method: 'pix',
      payment_id: paymentData.paymentId,
      metadata: {
        posts: reelsMetadata,
        serviceDetails: service,
        quantityType: 'visualizações',
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
    if (!profileData || !service || selectedReels.length === 0) {
      toast.error('Selecione pelo menos um reel');
      return;
    }

    setLoading(true);

    try {
      // Log detalhado dos reels selecionados
      console.log('📊 Reels selecionados para pagamento:', selectedReels.map(reel => ({
        id: reel.id,
        code: reel.code,
        shortcode: reel.shortcode,
        url: `https://instagram.com/reel/${reel.code}`
      })));

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
        posts: selectedReels,
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

  const renderSelectionSummary = () => {
    return (
      <div className="my-4 space-y-2">
        <div className="p-3 bg-indigo-50 rounded-lg">
          <p className="text-sm font-medium text-indigo-700 flex items-center justify-between">
            <span>Total de itens selecionados (reels):</span>
            <span className="font-bold">{selectedItemsCount} / {maxTotalItems}</span>
          </p>
        </div>

        {service?.quantidade && selectedItemsCount > 0 && (
          <div className="p-3 bg-purple-50 rounded-lg text-purple-700 text-sm">
            <p className="font-medium">
              Distribuição: {viewsPerItem} visualizações por item selecionado
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
            <p className="text-gray-600">
              Selecione os reels que você deseja turbinar com visualizações. 
              Você pode selecionar até {maxTotalItems} reels.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    {profileData && (
                      <>
                        <img 
                          src={profileData.profile_pic_url} 
                          alt={profileData.username} 
                          className="w-12 h-12 rounded-full"
                          onError={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.src = 'https://i.imgur.com/6VBx3io.png';
                          }}
                        />
                        <div>
                          <h2 className="text-lg font-semibold">{profileData.username}</h2>
                          <p className="text-gray-500 text-sm">{profileData.full_name}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {renderSelectionSummary()}

                  <div className="mb-4">
                    <ReelSelectServiceReel
                      username={profileData?.username}
                      maxReels={maxTotalItems}
                      onSelectReels={handleReelSelect}
                      selectedReels={selectedReels}
                      onLoadReels={handleReelsLoaded}
                      loading={loadingReels}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white shadow rounded-lg p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
                <div className="space-y-4 mb-6">
                  {service ? (
                    <>
                      <div className="flex justify-between items-start text-sm">
                        <span>Serviço:</span>
                        <span className="font-medium text-right">{service.name}</span>
                      </div>
                      <div className="flex justify-between items-start text-sm">
                        <span>Quantidade:</span>
                        <span className="font-medium">{service.quantidade} visualizações</span>
                      </div>
                      {selectedItemsCount > 0 && (
                        <div className="flex justify-between items-start text-sm">
                          <span>Distribuição:</span>
                          <span className="font-medium">
                            {viewsPerItem} por item ({selectedItemsCount} {selectedItemsCount === 1 ? 'reel' : 'reels'})
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 my-2 pt-2"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm">Preço:</span>
                        <span className="font-semibold">
                          R$ {service.preco.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-2">
                      Carregando informações do serviço...
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-start text-sm text-green-600">
                      <span>Desconto:</span>
                      <span className="font-semibold">
                        - R$ {discountAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  {finalAmount !== null && (
                    <div className="flex justify-between items-start border-t border-gray-200 pt-2 mt-2">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="font-bold">
                        R$ {finalAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  {service && (
                    <CouponInput
                      serviceId={service.id}
                      originalAmount={service.preco}
                      onCouponApplied={(discountAmount, finalAmount, couponCode) => {
                        setAppliedCoupon(couponCode);
                        setDiscountAmount(discountAmount);
                        setFinalAmount(finalAmount);
                      }}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Informações de Contato</h3>
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
                      Nome
                    </label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">
                      Telefone (WhatsApp)
                    </label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedReels.length === 0}
                  className={`
                    w-full mt-6 py-2 px-4 border border-transparent rounded-md 
                    shadow-sm text-sm font-medium text-white focus:outline-none 
                    ${loading || selectedReels.length === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'}
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Processando...
                    </div>
                  ) : (
                    'Finalizar Pedido'
                  )}
                </button>

                {selectedReels.length === 0 && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    Selecione pelo menos um reel para continuar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {paymentData && (
        <PaymentPixModal
          qrCodeText={paymentData.qrCodeText}
          paymentId={paymentData.paymentId}
          onClose={handleClosePaymentModal}
          amount={paymentData.amount}
          qrCodeBase64={paymentData.qrCodeBase64}
          isOpen={!!paymentData}
          serviceId={service?.id}
          serviceName={service?.name}
        />
      )}
    </div>
  );
} 