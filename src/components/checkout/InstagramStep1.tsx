'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useInstagramAPI } from '@/hooks/useInstagramAPI';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faEye, 
  faComment, 
  faUsers, 
  faPlay 
} from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/client';
import { ProfileVerificationModal } from '@/components/modals/ProfileVerificationModal';
import { normalizeInstagramUsername } from '@/app/checkout/instagram-v2/utils/instagram-username';

interface ServiceDetail {
  title: string;
  emoji: string;
}

interface QuantidadePreco {
  quantidade: number;
  preco: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  preco: number;
  quantidade: number;
  service_variations?: QuantidadePreco[];
  service_details?: ServiceDetail[];
  metadata?: {
    quantidade_preco?: QuantidadePreco[];
    serviceDetails?: ServiceDetail[];
  };
  external_id?: string;
}

interface FormData {
  instagram_username: string;
  is_public_confirmed: boolean;
}

interface ProfileData {
  username: string;
  full_name?: string;
  profile_pic_url?: string;
  follower_count?: number;
  following_count?: number;
  media_count?: number;
  is_private: boolean;
}

interface InstagramStep1Props {
  serviceType: 'curtidas' | 'visualizacao' | 'comentarios' | 'seguidores' | 'reels';
  step1Title: string;
  step2Title: string;
  serviceIcon?: React.ReactNode;
  quantityLabel?: string;
}

export function InstagramStep1({
  serviceType,
  step1Title,
  step2Title,
  serviceIcon,
  quantityLabel = 'curtidas'
}: InstagramStep1Props) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublicConfirmed, setIsPublicConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'loading' | 'error' | 'done'>('loading');
  const [service, setService] = useState<Service | null>(null);
  const [loadingStageService, setLoadingStageService] = useState<'searching' | 'checking' | 'loading' | 'done' | 'error'>('searching');
  const [formError, setFormError] = useState<string | null>(null);

  const router = useRouter();
  const { fetchInstagramProfileInfo } = useInstagramAPI();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service_id');
  const quantity = searchParams.get('quantity');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      is_public_confirmed: false
    }
  });

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        toast.error('ID do serviço não encontrado');
        return;
      }

      try {
        setLoadingStageService('searching');
        console.log('Buscando serviço com ID:', serviceId);
        
        // Criar cliente do Supabase
        const supabase = createClient();
        
        // Buscar serviço pelo ID - Atualizado para usar o nome correto da tabela 'services'
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();
        
        if (error) {
          console.error('Erro ao buscar detalhes do serviço:', error);
          toast.error('Erro ao buscar detalhes do serviço');
          setLoadingStageService('error');
          return;
        }
        
        if (!data) {
          console.error('Serviço não encontrado para o ID:', serviceId);
          toast.error('Serviço não encontrado');
          setLoadingStageService('error');
          return;
        }
        
        console.log('Serviço encontrado:', data);

        // Definir o serviço com todos os dados
        setService(data);
        setLoadingStageService('done');

        // Verificar preço com base na quantidade escolhida
        const variations = data.service_variations || data.metadata?.quantidade_preco || [];
        console.log('Variações de preço disponíveis:', variations);
        console.log('Quantidade selecionada:', quantity);
        
        if (quantity) {
          // Se temos uma quantidade específica nos parâmetros da URL
          const quantityValue = parseInt(quantity);
          console.log('Quantidade convertida para número:', quantityValue);
          
          // Procurar uma variação de preço que corresponda à quantidade
          const selectedVariation = variations.find(
            (v: QuantidadePreco) => v.quantidade === quantityValue
          );
          
          if (selectedVariation) {
            console.log('Variação selecionada:', selectedVariation);
            // Atualizar tanto o preço quanto a quantidade
            setService(prevService => {
              if (prevService) {
                return { 
                  ...prevService, 
                  preco: selectedVariation.preco,
                  quantidade: selectedVariation.quantidade 
                };
              }
              return prevService;
            });
          } else {
            console.warn('Variação não encontrada para a quantidade específica:', quantityValue);
            // Mesmo sem encontrar uma variação exata, ajustar a quantidade
            setService(prevService => {
              if (prevService) {
                return { ...prevService, quantidade: quantityValue };
              }
              return prevService;
            });
          }
        } else if (variations.length > 0) {
          // Se não temos quantidade nos parâmetros, usar a primeira variação
          console.log('Nenhuma quantidade especificada. Usando a primeira variação disponível.');
          setService(prevService => {
            if (prevService) {
              return { 
                ...prevService, 
                preco: variations[0].preco, 
                quantidade: variations[0].quantidade 
              };
            }
            return prevService;
          });
        }
      } catch (error: any) {
        console.error('Erro ao buscar detalhes do serviço:', error);
        toast.error('Erro ao buscar detalhes do serviço');
        setLoadingStageService('error');
      }
    };

    fetchServiceData();
  }, [serviceId, quantity]);

  // Função para verificar o perfil do Instagram usando o sistema de rotação de APIs
  const checkProfile = async (usernameToCheck: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Verificando perfil: ${usernameToCheck}`);
      
      // Usar o graphql-check como verificador principal para aproveitar a rotação de APIs
      const response = await fetch(`/api/instagram/graphql-check?username=${usernameToCheck}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar perfil');
      }
      
      console.log('Resposta do graphql-check:', data);
      console.log('Status do perfil:', data.is_private ? 'Privado' : 'Público');
      console.log('API utilizada:', data.source || 'desconhecida');
      
      // Formatar os dados do perfil
      const profileInfo = {
        username: data.username,
        full_name: data.full_name,
        profile_pic_url: data.profile_pic_url,
        follower_count: data.follower_count || data.edge_followed_by?.count || 0,
        following_count: data.following_count || data.edge_follow?.count || 0,
        media_count: data.media_count || data.edge_owner_to_timeline_media?.count || 0,
        is_private: data.is_private,
        is_verified: data.is_verified,
        biography: data.biography || '',
        source: data.source
      };
      
      console.log('Dados do perfil formatados:', profileInfo);
      setProfileData(profileInfo);
      setShowModal(true);
      
      if (profileInfo.is_private) {
        console.log('Perfil privado detectado. Exibindo modal de erro.');
        return;
      }
      
      // Perfil está público, redirecionar para a próxima etapa
      console.log('Perfil público confirmado. Prosseguindo para a próxima etapa.');
      
      // Armazenar dados do perfil e do serviço no localStorage para a próxima etapa
      const checkoutData = {
        profileData: profileInfo,
        serviceId: serviceId,
        external_id: service?.external_id || serviceId, // Armazenar tanto o serviceId quanto o external_id
        quantidade: quantity || service?.quantidade, // Usar 'quantidade' como chave para manter consistência
        quantity: quantity || service?.quantidade, // Manter 'quantity' para compatibilidade
        // Adicionar mais informações do serviço para exibição na próxima etapa
        serviceName: service?.name,
        serviceDescription: service?.description,
        servicePrice: service?.preco,
        preco: service?.preco, // Adicionar preco para consistência
        serviceDetails: service?.service_details || service?.metadata?.serviceDetails,
        // Incluir o serviço completo para ter todos os dados
        service: service
      };
      console.log('Dados de checkout a serem armazenados:', checkoutData);
      localStorage.setItem('checkoutProfileData', JSON.stringify(checkoutData));
      
      // Ajustando a URL para incluir também o service_id como parâmetro
      const serviceParam = serviceId || service?.id || service?.external_id;
      const quantityParam = quantity || service?.quantidade;
      router.push(`/checkout/instagram-v2/${serviceType}/step2?username=${encodeURIComponent(usernameToCheck)}&service_id=${encodeURIComponent(serviceParam || '')}&quantity=${encodeURIComponent(quantityParam || '')}`);
    } catch (error: any) {
      console.error('Erro ao verificar perfil:', error);
      setError(error.message || 'Erro ao verificar o perfil');
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para tentar novamente após o usuário tornar o perfil público
  const handleRetryAfterPrivate = async () => {
    if (!profileData?.username) return;
    
    try {
      setIsLoading(true);
      
      // Caso estejamos em modo de desenvolvimento, podemos simular um perfil público
      if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
        // Simular perfil público em desenvolvimento
        toast.success('Simulação: Perfil marcado como público (modo desenvolvimento)');
        
        const updatedProfileData = {
          ...profileData,
          is_private: false
        };
        
        setProfileData(updatedProfileData);
        
        // Armazenar dados do perfil e do serviço no localStorage para a próxima etapa
        const checkoutData = {
          profileData: updatedProfileData,
          serviceId: serviceId,
          external_id: service?.external_id || serviceId,
          quantidade: quantity || service?.quantidade,
          quantity: quantity || service?.quantidade,
          serviceName: service?.name,
          serviceDescription: service?.description,
          servicePrice: service?.preco,
          preco: service?.preco,
          serviceDetails: service?.service_details || service?.metadata?.serviceDetails,
          service: service
        };
        
        localStorage.setItem('checkoutProfileData', JSON.stringify(checkoutData));
        
        // Ajustando a URL para incluir também o service_id como parâmetro
        const serviceParam = serviceId || service?.id || service?.external_id;
        const quantityParam = quantity || service?.quantidade;
        
        // Fechar o modal e redirecionar para o próximo passo
        setShowModal(false);
        router.push(`/checkout/instagram-v2/${serviceType}/step2?username=${encodeURIComponent(profileData.username)}&service_id=${encodeURIComponent(serviceParam || '')}&quantity=${encodeURIComponent(quantityParam || '')}`);
        return;
      }
      
      toast.info('Verificando se seu perfil já está público...');
      
      // Tentar múltiplas abordagens para verificar se o perfil está público
      
      // Abordagem 1: Verificação via scraper personalizado
      try {
        const scraperResponse = await fetch(`/api/instagram/scraper?username=${profileData.username}`);
        const scraperData = await scraperResponse.json();
        
        if (scraperResponse.ok && scraperData.isPublic === true) {
          // Perfil está público pelo scraper
          console.log('[PERFIL] Perfil verificado como público pelo scraper');
          await processPublicProfile({
            ...profileData,
            ...scraperData,
            is_private: false
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar perfil via scraper:', error);
        // Continuar para a próxima abordagem
      }
      
      // Abordagem 2: Verificação via GraphQL API
      try {
        const graphqlResponse = await fetch(`/api/instagram/graphql-check?username=${profileData.username}&quick_check=true`);
        const graphqlData = await graphqlResponse.json();
        
        if (graphqlResponse.ok && !graphqlData.is_private) {
          // Perfil está público pela API GraphQL
          console.log('[PERFIL] Perfil verificado como público pela API GraphQL');
          await processPublicProfile({
            ...profileData,
            ...graphqlData,
            is_private: false
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar perfil via GraphQL API:', error);
        // Continuar para a próxima abordagem
      }
      
      // Abordagem 3: Verificação via API do Instagram
      try {
        const instaResponse = await fetch(`/api/instagram/profile/${profileData.username}`);
        const instaData = await instaResponse.json();
        
        if (instaResponse.ok && !instaData.is_private) {
          // Perfil está público pela API do Instagram
          console.log('[PERFIL] Perfil verificado como público pela API do Instagram');
          await processPublicProfile({
            ...profileData,
            ...instaData,
            is_private: false
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar perfil via API do Instagram:', error);
        // Todas as abordagens falharam
      }
      
      // Se chegou aqui, todas as verificações falharam
      toast.error('O perfil ainda aparece como privado. Por favor, verifique as configurações no aplicativo Instagram e tente novamente.');
    } catch (error: any) {
      console.error('Erro ao verificar perfil:', error);
      toast.error(error.message || 'Erro ao verificar o perfil');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função auxiliar para processar perfil quando ele é detectado como público
  const processPublicProfile = async (updatedProfileData: any) => {
    toast.success('Perfil verificado com sucesso! Redirecionando...');
    
    setProfileData(updatedProfileData);
    
    // Armazenar dados do perfil e do serviço no localStorage para a próxima etapa
    const checkoutData = {
      profileData: updatedProfileData,
      serviceId: serviceId,
      external_id: service?.external_id || serviceId, 
      quantidade: quantity || service?.quantidade,
      quantity: quantity || service?.quantidade,
      serviceName: service?.name,
      serviceDescription: service?.description,
      servicePrice: service?.preco,
      preco: service?.preco,
      serviceDetails: service?.service_details || service?.metadata?.serviceDetails,
      service: service
    };
    
    localStorage.setItem('checkoutProfileData', JSON.stringify(checkoutData));
    
    // Ajustando a URL para incluir também o service_id como parâmetro
    const serviceParam = serviceId || service?.id || service?.external_id;
    const quantityParam = quantity || service?.quantidade;
    
    // Fechar o modal e redirecionar para o próximo passo
    setShowModal(false);
    router.push(`/checkout/instagram-v2/${serviceType}/step2?username=${encodeURIComponent(updatedProfileData.username)}&service_id=${encodeURIComponent(serviceParam || '')}&quantity=${encodeURIComponent(quantityParam || '')}`);
  };

  const onSubmit = async (formData: FormData) => {
    setFormError(null);
    if (!formData.is_public_confirmed) {
      toast.error('Confirme que seu perfil é público');
      return;
    }

    if (!formData.instagram_username || formData.instagram_username.trim() === '') {
      setFormError('Informe seu perfil do Instagram');
      return;
    }

    // Normaliza o nome de usuário
    const normalizedUsername = normalizeInstagramUsername(formData.instagram_username);
    if (normalizedUsername === 'post_link') {
      setFormError('Por favor, insira o link do perfil do Instagram e não o link de um post ou reel');
      return;
    }
    if (!normalizedUsername) {
      setFormError('Nome de usuário do Instagram inválido');
      return;
    }

    await checkProfile(normalizedUsername);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const normalizedUsername = normalizeInstagramUsername(e.target.value);
    if (normalizedUsername === 'post_link') {
      setFormError('Por favor, insira o link do perfil do Instagram e não o link de um post ou reel');
      return;
    }
    if (normalizedUsername) {
      setUsername(normalizedUsername);
    } else {
      setUsername(e.target.value);
    }
  };

  const handleAnalyze = async () => {
    if (!username) {
      toast.error('Por favor, insira um nome de usuário do Instagram', {
        position: 'bottom-center',
        duration: 5000
      });
      return;
    }

    // Verificar se é um link de post ou reel
    if (username.includes('/p/') || username.includes('/reel/')) {
      toast.error('Por favor, insira o link do perfil do Instagram, não de um post ou reel', {
        position: 'bottom-center',
        duration: 5000
      });
      return;
    }

    // Extrair o nome de usuário do link se for um link de perfil
    let usernameToCheck = username;
    if (username.includes('instagram.com/')) {
      usernameToCheck = username.split('instagram.com/')[1].split('/')[0].split('?')[0];
    }

    // Remover @ se presente
    usernameToCheck = usernameToCheck.replace('@', '');

    await checkProfile(usernameToCheck);
  };

  // Função para renderizar o ícone do serviço
  const renderServiceIcon = () => {
    if (serviceIcon) {
      return serviceIcon;
    }

    // Ícones padrão baseados no tipo de serviço
    switch (serviceType) {
      case 'curtidas':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-purple-600"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        );
      case 'visualizacao':
        return <FontAwesomeIcon icon={faEye} className="text-purple-600" />;
      case 'comentarios':
        return <FontAwesomeIcon icon={faComment} className="text-purple-600" />;
      case 'seguidores':
        return <FontAwesomeIcon icon={faUsers} className="text-purple-600" />;
      case 'reels':
        return <FontAwesomeIcon icon={faPlay} className="text-purple-600" />;
      default:
        return <FontAwesomeIcon icon={faHeart} className="text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* Layout para Desktop */}
          <div className="hidden sm:block">
            {/* Passos para Turbinar (Desktop) */}
            <div className="mb-8 bg-white shadow-md rounded-xl p-6">
              <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
                <span className="hidden sm:inline">Como turbinar seu Instagram com {service?.name} 🚀</span>
                <span className="sm:hidden">Turbinar {service?.name} 🚀</span>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-700 text-center">Verificar Perfil</h4>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Insira seu perfil do Instagram
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-700 text-center">{step2Title}</h4>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {serviceType === 'curtidas' && 'Selecione os posts para curtidas'}
                    {serviceType === 'visualizacao' && 'Selecione posts e reels para visualizações'}
                    {serviceType === 'comentarios' && 'Selecione posts e reels para comentários'}
                    {serviceType === 'seguidores' && 'Confirme os detalhes do perfil'}
                    {serviceType === 'reels' && 'Selecione os reels para engajamento'}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-700 text-center">Finalizar Compra</h4>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Pague e receba {serviceType === 'seguidores' ? 'seguidores' : serviceType}
                  </p>
                </div>
              </div>
            </div>

            {/* Card do Serviço (Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    {renderServiceIcon()}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{service?.name}</h2>
                </div>
                <p className="text-gray-600 mb-4">{service?.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">Quantidade</span>
                    <p className="text-lg font-semibold text-gray-800">{service?.quantidade} {quantityLabel}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Preço</span>
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {service?.preco?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes do Serviço</h3>
                  <p>{service?.description}</p>
                  <ul className="space-y-2 mt-2">
                    {service?.service_details ? (
                      service.service_details.map((detail, index) => {
                        return (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">{detail.emoji}</span>
                            <span className="font-semibold text-gray-800">{detail.title}</span>
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-gray-500">Nenhum detalhe disponível</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Layout para Mobile (reorganizado) */}
          <div className="sm:hidden">
            {/* 1. Card do Serviço - PRIMEIRO NO MOBILE */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  {serviceIcon || (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-purple-600"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-800">{service?.name}</h2>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500">Quantidade</span>
                  <p className="text-base font-semibold text-gray-800">{service?.quantidade} {quantityLabel}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Preço</span>
                  <p className="text-xl font-bold text-purple-600">
                    R$ {service?.preco?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Formulário de Verificação - SEGUNDO NO MOBILE */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Verificar Perfil
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="instagram_username_mobile" className="block mb-2">Perfil do Instagram</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">@</span>
                    </div>
                    <input 
                      type="text" 
                      id="instagram_username_mobile"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Digite seu @ do Instagram"
                      className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:border-[#C43582] focus:outline-none text-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="is_public_confirmed_mobile"
                    checked={isPublicConfirmed}
                    onChange={(e) => setIsPublicConfirmed(e.target.checked)}
                  />
                  <label 
                    htmlFor="is_public_confirmed_mobile" 
                    className="text-sm text-gray-700"
                  >
                    Confirmo que meu perfil é público
                  </label>
                </div>

                <button 
                  type="button" 
                  onClick={handleAnalyze}
                  className="w-full py-3 text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? 'Analisando...' : 'Analisar Perfil'}
                </button>
              </div>
            </div>

            {/* 3. Detalhes do Serviço - TERCEIRO NO MOBILE */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <h3 className="text-base font-semibold text-gray-800 mb-2">Detalhes do Serviço</h3>
              <ul className="space-y-2">
                {service?.service_details ? (
                  service.service_details.map((detail, index) => {
                    return (
                      <li key={index} className="flex items-center text-sm">
                        <span className="mr-2">{detail.emoji}</span>
                        <span className="font-medium text-gray-800">{detail.title}</span>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-gray-500 text-sm">Nenhum detalhe disponível</li>
                )}
              </ul>
            </div>

            {/* 4. Passos para Turbinar - QUARTO NO MOBILE */}
            <div className="bg-white shadow-md rounded-xl p-4 mb-6">
              <h3 className="text-lg font-bold text-center mb-4 text-gray-800">
                Turbinar {service?.name} 🚀
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Verificar Perfil</h4>
                    <p className="text-xs text-gray-500">
                      Insira seu perfil do Instagram
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">{step2Title}</h4>
                    <p className="text-xs text-gray-500">
                      {serviceType === 'curtidas' && 'Selecione os posts para curtidas'}
                      {serviceType === 'visualizacao' && 'Selecione posts e reels para visualizações'}
                      {serviceType === 'comentarios' && 'Selecione posts e reels para comentários'}
                      {serviceType === 'seguidores' && 'Confirme os detalhes do perfil'}
                      {serviceType === 'reels' && 'Selecione os reels para engajamento'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Finalizar Compra</h4>
                    <p className="text-xs text-gray-500">
                      Pague e receba {serviceType === 'seguidores' ? 'seguidores' : serviceType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Formulário de Verificação (Desktop) */}
          <div className="hidden sm:block">
            <div className="bg-white shadow-md rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Verificar Perfil do Instagram
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="instagram_username" className="block mb-2">Perfil do Instagram</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">@</span>
                    </div>
                    <input 
                      type="text" 
                      id="instagram_username"
                      placeholder="seuperfil" 
                      className={`pl-8 w-full py-3 border-2 ${formError ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-lg`}
                      {...register('instagram_username', {
                        onChange: handleUsernameChange
                      })}
                    />
                  </div>
                  {formError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>{formError}</span>
                    </p>
                  )}
                  {errors.instagram_username && !formError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>{errors.instagram_username.message}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="is_public_confirmed"
                    {...register('is_public_confirmed', {
                      required: 'Confirme que o perfil é público'
                    })}
                  />
                  <label 
                    htmlFor="is_public_confirmed" 
                    className="text-sm text-gray-700"
                  >
                    Confirmo que meu perfil é público
                  </label>
                </div>
                {errors.is_public_confirmed && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.is_public_confirmed.message}
                  </p>
                )}

                <button 
                  type="submit" 
                  className="w-full py-3 text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Verificar Perfil'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <ProfileVerificationModal
        profileData={profileData}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onContinue={handleRetryAfterPrivate}
        onRetryAfterPrivate={handleRetryAfterPrivate}
      />
    </div>
  );
}
