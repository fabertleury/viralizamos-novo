'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { CouponInput } from '@/components/checkout/CouponInput';
import { maskPhone } from '@/lib/utils/mask';
import { processCheckoutAndRedirect } from '@/lib/payment/microservice-integration';

interface InstagramSeguidoresStep2Props {
  title: string;
}

interface ProfileData {
  username: string;
  full_name?: string;
  profile_pic_url?: string;
  follower_count?: number;
  following_count?: number;
  media_count?: number;
  is_private: boolean;
  is_verified?: boolean;
  biography?: string;
  source?: string;
}

interface Service {
  nome: string;
  id: string | number;
  preco: number;
  quantidade: number;
  service_details?: Array<{ emoji?: string; title: string }>;
  metadata?: {
    service_details?: Array<{ emoji?: string; title: string }>;
    [key: string]: any;
  };
  [key: string]: string | number | boolean | undefined | any[] | Record<string, any>;
}

interface PaymentData {
  qrCodeText: string;
  qrCodeBase64: string;
  amount: number;
  paymentId: string;
}

// Função para converter URL de imagem para URL com proxy
function getProxiedImageUrl(originalUrl: string | undefined): string {
  if (!originalUrl) return 'https://placehold.co/400x400/purple/white?text=Sem+Foto';
  
  // Se a URL já for um placeholder, retorná-la diretamente
  if (originalUrl.includes('placehold.co')) return originalUrl;
  
  try {
    // Usar um proxy de imagem para evitar problemas de CORS
    // Opção 1: Serviço de proxy de imagem integrado ao Next.js (se disponível)
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    
    // Alternativa: Utilizar um serviço externo de proxy de imagem
    // return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}`;
  } catch (error) {
    console.error('Erro ao criar URL com proxy:', error);
    return 'https://placehold.co/400x400/purple/white?text=Sem+Foto';
  }
}

export function InstagramSeguidoresStep2({ title }: InstagramSeguidoresStep2Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get('username');
  const serviceIdParam = searchParams.get('service_id');
  const quantityParam = searchParams.get('quantity');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  
  // Log inicial para verificar se o componente está sendo renderizado
  console.log('=> InstagramSeguidoresStep2 renderizado', { 
    usernameParam, 
    serviceIdParam,
    env: {
      apiKey: process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY ? 'Disponível' : 'Indisponível',
      apiKeyValue: process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY ? process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY.substring(0, 5) + '...' : 'Não definida'
    }
  });
  
  useEffect(() => {
    // Agora podemos acessar window com segurança
    console.log('=> URL atual:', window.location.href);
    
    console.log('=> useEffect executando com params:', { usernameParam, serviceIdParam });
    
    // Verificar parâmetros obrigatórios
    if (!usernameParam || !serviceIdParam) {
      console.error('Parâmetros obrigatórios ausentes:', { usernameParam, serviceIdParam });
      toast.error('Informações incompletas. Por favor, volte e tente novamente.');
      router.push('/checkout/instagram-v2/seguidores');
      return;
    }
    
    // Inicializar dados do formulário
    setFormData({
      name: usernameParam,
      email: '',
      phone: ''
    });
    
    // Buscar dados do perfil usando apenas a RocketAPI
    fetchProfileWithRocketAPI(usernameParam);
    
    // Buscar dados do serviço
    fetchServiceData(serviceIdParam);
    
  }, [router, usernameParam, serviceIdParam]);

  // Função para buscar dados do serviço
  const fetchServiceData = async (externalId: string) => {
    console.log('=> Buscando serviço com ID:', externalId);
    
    try {
      const supabase = createClient();
      
      // Limpar o externalId para garantir que não tenha aspas extras
      const cleanExternalId = externalId ? externalId.replace(/"/g, '') : '';
      console.log('=> External ID limpo:', cleanExternalId);
      
      // Buscar primeiro pelo external_id
      let { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('external_id', cleanExternalId);
      
      // Se não encontrar pelo external_id, tentar pelo id
      if (!data || data.length === 0) {
        console.log('=> Serviço não encontrado pelo external_id, tentando pelo id');
        const result = await supabase
          .from('services')
          .select('*')
          .eq('id', cleanExternalId);
          
        data = result.data;
        error = result.error;
      }
      
      // Verificar se encontramos o serviço
      if (error) {
        console.error('=> Erro ao buscar serviço:', error);
        toast.error('Erro ao buscar detalhes do serviço');
        return;
      }
      
      if (!data || data.length === 0) {
        console.error('=> Nenhum serviço encontrado');
        toast.error('Serviço não encontrado');
        return;
      }
      
      // Se encontramos o serviço, verificar a quantidade selecionada
      const serviceData = data[0];
      
      // Log detalhado para verificar se temos o external_id
      console.log('=> Serviço encontrado:', {
        id: String(serviceData.id),
        nome: String(serviceData.nome || ''),
        external_id: serviceData.external_id ? String(serviceData.external_id) : undefined,
        provider_id: serviceData.provider_id ? String(serviceData.provider_id) : undefined,
        quantidade: Number(serviceData.quantidade),
        preco: Number(serviceData.preco)
      });
      
      // Se temos um parâmetro de quantidade, ajustar o serviço com base nisso
      if (quantityParam) {
        const quantityValue = parseInt(quantityParam);
        if (!isNaN(quantityValue)) {
          console.log('=> Aplicando quantidade:', quantityValue);
          
          // Buscar a variação correspondente à quantidade
          const variations = serviceData.service_variations || serviceData.metadata?.quantidade_preco || [];
          console.log('=> Variações disponíveis:', variations);
          
          // Verificar se há variações disponíveis
          if (variations && variations.length > 0) {
            // Tentar encontrar a variação exata
            const selectedVariation = variations.find(
              (v: { quantidade: number }) => v.quantidade === quantityValue
            );
            
            if (selectedVariation) {
              console.log('=> Variação exata encontrada:', selectedVariation);
              // Atualizar a quantidade e preço com base na variação selecionada
              serviceData.quantidade = selectedVariation.quantidade;
              serviceData.preco = selectedVariation.preco;
              console.log('=> Serviço atualizado para quantidade:', selectedVariation.quantidade, 'e preço:', selectedVariation.preco);
            } else {
              console.log('=> Quantidade específica não encontrada. Buscando a mais próxima.');
              // Ordenar variações por quantidade
              const sortedVariations = [...variations].sort((a, b) => a.quantidade - b.quantidade);
              console.log('=> Variações ordenadas:', sortedVariations);
              
              // Encontrar a variação com quantidade mais próxima (menor ou igual)
              let closestVariation = sortedVariations[0];
              for (const v of sortedVariations) {
                if (v.quantidade <= quantityValue && v.quantidade > closestVariation.quantidade) {
                  closestVariation = v;
                }
              }
              
              console.log('=> Variação mais próxima encontrada:', closestVariation);
              serviceData.quantidade = closestVariation.quantidade;
              serviceData.preco = closestVariation.preco;
              console.log('=> Serviço atualizado para quantidade:', closestVariation.quantidade, 'e preço:', closestVariation.preco);
            }
          } else {
            // Se não há variações, pelo menos atualizar a quantidade
            console.log('=> Nenhuma variação disponível, mantendo apenas a quantidade selecionada:', quantityValue);
            serviceData.quantidade = quantityValue;
          }
        } else {
          console.error('=> Valor de quantidade inválido:', quantityParam);
        }
      } else {
        console.log('=> Nenhum parâmetro de quantidade fornecido, usando valores padrão.');
      }
      
      console.log('=> Dados finais do serviço:', {
        quantidade: serviceData.quantidade,
        preco: serviceData.preco
      });
      
      setService(serviceData);
      console.log('=> Serviço definido:', serviceData);
      setFinalAmount(serviceData.preco);
      
    } catch (error: unknown) {
      console.error('=> Erro ao buscar serviço:', error);
      toast.error('Erro ao buscar detalhes do serviço');
    }
  };

  // Função para buscar dados do perfil usando apenas a RocketAPI
  const fetchProfileWithRocketAPI = async (username: string) => {
    // Limpar o username para remover @ e espaços
    const cleanUsername = username.trim().replace('@', '');
    
    console.log(`Iniciando fetchProfileWithRocketAPI com username: ${cleanUsername}`);

    // Verificar se o username está vazio
    if (!cleanUsername) {
      console.error('Username não fornecido');
      setApiError('Username não fornecido');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Fazer requisição para a API interna que usa RocketAPI
      const response = await fetch(`/api/instagram/profile/${cleanUsername}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar perfil: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API RocketAPI:', data);
      
      // Modificado para verificar em ambos os formatos possíveis
      // Pode estar em data.profile ou diretamente em data
      const profileInfo = data.profile || data;
      
      if (!profileInfo || (!profileInfo.username && !profileInfo.followers_count && !profileInfo.followers)) {
        throw new Error('Dados do perfil não encontrados na resposta da API');
      }
      
      // Formatar os dados do perfil para o formato esperado - apenas os essenciais
      const updatedProfileData: ProfileData = {
        username: profileInfo.username || cleanUsername,
        full_name: profileInfo.full_name || '',
        profile_pic_url: profileInfo.profile_pic_url || profileInfo.profilePicture || '',
        follower_count: profileInfo.followers_count || profileInfo.followers || 0,
        is_private: profileInfo.is_private || false,
        is_verified: profileInfo.is_verified || false,
        source: 'rocketapi'
      };
      
      console.log('=> Perfil atualizado com dados da RocketAPI:', updatedProfileData);
      
      // Atualizar o estado com os dados novos do perfil
      setProfileData(updatedProfileData);
      
      // Também atualizar no localStorage para manter consistência
      try {
        const checkoutData = {
          profileData: updatedProfileData,
          serviceId: serviceIdParam,
          timestamp: new Date().getTime()
        };
        localStorage.setItem('checkoutProfileData', JSON.stringify(checkoutData));
        console.log('=> Dados de checkout salvos no localStorage');
      } catch (storageError) {
        console.error('=> Erro ao salvar dados no localStorage:', storageError);
      }
      
      toast.success('Perfil atualizado');
    } catch (error) {
      console.error('=> Erro ao buscar dados do perfil com RocketAPI:', error);
      setApiError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Criar um perfil básico com o username fornecido para permitir que o checkout continue
      const fallbackProfileData: ProfileData = {
        username: cleanUsername,
        full_name: '',
        profile_pic_url: '',
        follower_count: 0,
        is_private: false,
        is_verified: false,
        source: 'fallback'
      };
      
      setProfileData(fallbackProfileData);
      
      toast.error(`Não foi possível carregar informações do perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validar se temos os dados necessários
      if (!profileData || !service) {
        toast.error('Dados incompletos para finalizar o pedido');
        setIsSubmitting(false);
        return;
      }
      
      // Validar campos do formulário
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Preencha todos os campos do formulário');
        setIsSubmitting(false);
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Email inválido');
        setIsSubmitting(false);
        return;
      }
      
      // Validar formato de telefone (pelo menos 10 dígitos)
      const phoneRegex = /^\d{10,}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        toast.error('Telefone inválido (mínimo 10 dígitos)');
        setIsSubmitting(false);
        return;
      }
      
      // Calcular valor final
      const finalPrice = finalAmount || service.preco;
      
      // Log detalhado do serviço para fins de depuração
      console.log('Dados do serviço para checkout:', {
        id: service.id,
        name: service.nome,
        provider_id: service.provider_id,
        external_id: service.external_id
      });
      
      // Usar a nova função de integração com o microserviço
      const success = await processCheckoutAndRedirect({
        amount: finalPrice,
        serviceData: {
          id: service.id,
          name: service.nome || 'Seguidores Instagram',
          price: finalPrice,
          quantity: service.quantidade,
          provider_id: service.provider_id,
          external_id: service.external_id
        },
        profileUsername: profileData.username,
        selectedPosts: [],
        customerData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        serviceType: 'seguidores',
        returnUrl: "/agradecimento"
      });
      
      if (!success) {
        toast.error('Ocorreu um erro ao processar o pagamento. Tente novamente.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Coluna da esquerda - Informações do perfil */}
            <div className="w-full md:w-1/2 space-y-6">
              {profileData && (
                <Card className="p-6 bg-white shadow-md rounded-xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 relative">
                      <img 
                        src={getProxiedImageUrl(profileData.profile_pic_url)}
                        alt={profileData.username} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                        onError={(e) => {
                          console.log('=> Erro ao carregar imagem do perfil');
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = 'https://placehold.co/400x400/purple/white?text=Sem+Foto';
                        }}
                      />
                      {profileData.is_verified && (
                        <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white h-5 w-5" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1">{profileData.full_name || profileData.username}</h3>
                    <p className="text-gray-600 mb-4">@{profileData.username}</p>
                    
                    {/* Informações de seguidores */}
                    {service && (
                      <div className="flex items-center justify-between w-full mt-2 mb-2 px-4">
                        <div>
                          <div className="text-sm text-gray-600">Seguidores atuais:</div>
                          <div className="font-bold text-lg">{profileData && typeof profileData.follower_count === 'number' && profileData.follower_count > 0 
                            ? profileData.follower_count.toLocaleString() 
                            : '0'}</div>
                        </div>
                        <div className="text-center">
                          <FontAwesomeIcon icon={faUsers} className="text-purple-600 h-4 w-4" />
                          <div className="text-xs text-purple-600">+{service.quantidade.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Após a compra:</div>
                          <div className="font-bold text-lg text-purple-600">
                            {profileData && typeof profileData.follower_count === 'number'
                              ? (profileData.follower_count + Number(service.quantidade)).toLocaleString() 
                              : Number(service.quantidade).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {apiError && (
                      <div className="bg-red-50 p-3 rounded-lg mb-4 w-full max-w-md">
                        <p className="text-red-600 text-sm">Erro ao buscar dados: {apiError}</p>
                        <button 
                          className="bg-red-600 text-white text-xs px-3 py-1 rounded mt-2 hover:bg-red-700"
                          onClick={() => {
                            console.log("=> Tentando novamente com API key:", 
                              process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY ? 
                              "disponível ("+process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY.substring(0,5)+"...)" : 
                              "indisponível");
                            fetchProfileWithRocketAPI(profileData.username);
                          }}
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
              
              {service && (
                <Card className="p-6 bg-white shadow-md rounded-xl">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Detalhes do Serviço</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Serviço:</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantidade:</span>
                      <span className="font-medium">{service.quantidade.toLocaleString()} seguidores</span>
                    </div>
                    
                    {/* Exibir service_details se disponível */}
                    {service.service_details?.map((detail, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {detail.emoji ? (
                          <span className="mr-2">{detail.emoji}</span>
                        ) : (
                          <span className="text-green-500 mr-2">✓</span>
                        )}
                        <span className="text-gray-600">{detail.title}</span>
                      </div>
                    ))}
                    
                    {/* Exibir detalhes do serviço do metadata.service_details se disponível e for array */}
                    {Array.isArray(service.metadata?.service_details) && service.metadata.service_details.length > 0 && (
                      service.metadata.service_details.map((detail, index) => (
                        <div key={index} className="flex items-center text-sm">
                          {detail.emoji ? (
                            <span className="mr-2">{detail.emoji}</span>
                          ) : (
                            <span className="text-green-500 mr-2">✓</span>
                          )}
                          <span className="text-gray-600">{detail.title}</span>
                        </div>
                      ))
                    )}
                    
                    {/* Detalhes padrão se nenhum dos acima estiver disponível */}
                    {(!service.service_details && 
                      (!service.metadata?.service_details || 
                       !Array.isArray(service.metadata.service_details) || 
                       service.metadata.service_details.length === 0)) && (
                      <>
                        <div className="flex items-center text-sm">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600">Seguidores de alta qualidade</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600">Entrega gradual e natural</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600">Suporte 24/7</span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Importante</h3>
                <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                  <li><strong>ATENÇÃO:</strong> Manter o perfil público é obrigatório! Perfis privados causam falhas e não têm direito a reenvio ou reembolso</li>
                  <li><strong>NÃO ALTERE</strong> o nome de usuário durante ou após o processo, ou você perderá a garantia de reposição</li>
                  <li>O prazo de entrega é de até 24 horas após a confirmação do pagamento</li>
                  <li>Todos os seguidores têm foto de perfil e publicações, garantindo alta qualidade</li>
                </ul>
              </div>
            </div>
            
            {/* Coluna da direita - Formulário */}
            <div className="w-full md:w-1/2">
              <Card className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Seus Dados</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <Input
                      id="phone"
                      value={maskPhone(formData.phone)}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D+/g, '')})}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex justify-between text-lg font-semibold mt-2 pt-2 border-t">
                    <span>Valor total:</span>
                    <span>R$ {(finalAmount || (service?.preco || 0)).toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Valor original:</span>
                      <span className="line-through">R$ {service?.preco.toFixed(2)}</span>
                    </div>
                  )}

                  {service && (
                    <CouponInput 
                      serviceId={String(service.id)}
                      originalAmount={service.preco}
                      onCouponApplied={(discount: number, final: number, code: string | null) => {
                        setDiscountAmount(discount);
                        setFinalAmount(final);
                        setAppliedCoupon(code || null);
                      }}
                    />
                  )}
                  
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    disabled={isSubmitting || !profileData || !service}
                  >
                    {isSubmitting ? (
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
        </div>
      </main>
    </div>
  );
}
