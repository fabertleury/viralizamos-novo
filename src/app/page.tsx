'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { FaInstagram, FaTiktok, FaYoutube, FaWhatsapp, FaTicketAlt, FaTimes, FaEdit, FaLock, FaSave, FaQuestionCircle, FaUser, FaCog, FaUnlock, FaQuoteLeft, FaQuoteRight, FaClock, FaShieldAlt, FaCreditCard, FaRocket, FaUsers, FaHandshake, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import './styles.css';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useInstagramAPI } from '@/hooks/useInstagramAPI';
import { useRouter } from 'next/navigation';
import CookieConsent from '@/components/CookieConsent';

// Interface para as redes sociais
interface SocialNetwork {
  id: string;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  url: string;
  icon_url?: string;
}

// Interface para Depoimentos
interface Depoimento {
  id: string;
  nome: string;
  texto: string;
  avatar?: string;
  estrelas: number;
}

// Interface para FAQs
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Componente de Depoimentos
const DepoimentosSection = () => {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchDepoimentos = async () => {
      const { data, error } = await supabase
        .from('depoimentos')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) setDepoimentos(data);
    };

    fetchDepoimentos();
  }, []);

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Depoimentos de Clientes</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {depoimentos.map((depoimento) => (
            <div 
              key={depoimento.id} 
              className="bg-white p-6 rounded-lg shadow-md relative"
            >
              <FaQuoteLeft className="absolute top-4 left-4 text-gray-200 text-3xl z-0" />
              <p className="text-gray-600 mb-4 italic relative z-10 pl-10">"{depoimento.texto}"</p>
              <div className="flex items-center">
                {depoimento.avatar ? (
                  <img 
                    src={depoimento.avatar} 
                    alt={depoimento.nome} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                    {depoimento.nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{depoimento.nome}</h3>
                  <div className="flex text-yellow-500">
                    {[...Array(depoimento.estrelas)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <FaQuoteRight className="absolute bottom-4 right-4 text-gray-200 text-3xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente de Serviços
const ServicosSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Serviços de qualidade, Sigilo total!</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaClock className="mx-auto text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Resultados rápidos</h3>
            <p className="text-gray-600">
              Geralmente iniciamos em minutos e finalizamos em poucas horas
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaWhatsapp className="mx-auto text-4xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Suporte via WhatsApp</h3>
            <p className="text-gray-600">
              Suporte Online das 8h as 23h todos os dias, para dúvidas e reclamações
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaRocket className="mx-auto text-4xl text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Barato e acessível</h3>
            <p className="text-gray-600">
              Orgulhamos de nossa alta qualidade, velocidade e preços
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaShieldAlt className="mx-auto text-4xl text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pagamentos seguros</h3>
            <p className="text-gray-600">
              Temos métodos populares como MERCADO PAGO para processar seus pedidos
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="/instagram"
            className="bg-[#C43582] text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-[#a62c6c] transition"
          >
            Clique aqui e Comece agora
          </a>
        </div>
      </div>
    </section>
  );
};

// Componente de FAQ
const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('active', true)
        .order('order_position', { ascending: true })
        .limit(5);

      if (data) setFaqs(data);
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className="border-b border-gray-200 mb-4 pb-4"
            >
              <button 
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left flex justify-between items-center"
              >
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <span>{openFaq === faq.id ? '−' : '+'}</span>
              </button>
              {openFaq === faq.id && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Componente de Redes Sociais
const RedesSociaisSection = () => {
  return (
    <section 
      className="py-16 text-white"
      style={{ backgroundColor: '#C43582' }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">O Poder das Redes Sociais</h2>
          <p className="text-xl">Como fortalecer sua presença digital?</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <FaUsers className="text-4xl" />
            <p className="text-lg">Aumente a autoridade e confiança em seu perfil.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <FaChartLine className="text-4xl" />
            <p className="text-lg">Ganhe um público maior e mais diversificado.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <FaHandshake className="text-4xl" />
            <p className="text-lg">Estabeleça melhores parcerias.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <FaMoneyBillWave className="text-4xl" />
            <p className="text-lg">Monetize suas redes sociais.</p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="/instagram"
            className="bg-white text-[#C43582] px-8 py-3 rounded-full text-xl font-bold hover:bg-gray-100 transition"
          >
            Comece agora
          </a>
        </div>
      </div>
    </section>
  );
};

export default function HomeV3() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateMessage, setShowPrivateMessage] = useState(false);
  const [timer, setTimer] = useState(30);
  const router = useRouter();
  const { fetchInstagramProfileInfo } = useInstagramAPI();

  const [showProfilePreviewModal, setShowProfilePreviewModal] = useState(false);
  const [profilePreviewData, setProfilePreviewData] = useState<any>(null);

  // Função para continuar análise após visualizar preview
  const handleContinueAnalysis = () => {
    if (profilePreviewData) {
      // Extrair username de forma mais flexível
      const cleanUsername = 
        profilePreviewData.username || 
        username.replace(/^@/, '').trim().toLowerCase();

      setShowProfilePreviewModal(false);
      setIsLoading(true);
      
      // Verificar novamente com a API Instagram-Scraper
      fetch('/api/instagram/instagram-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: cleanUsername })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Resposta da API Instagram-Scraper:', data);
        setIsLoading(false);
        // Redirecionar para a página de análise com o username
        router.push(`/analisar-perfil?username=${cleanUsername}`);
      })
      .catch(error => {
        console.error('Erro ao verificar com Instagram-Scraper:', error);
        setIsLoading(false);
        // Redirecionar mesmo em caso de erro
        router.push(`/analisar-perfil?username=${cleanUsername}`);
      });
    }
  };

  const handleTryAgain = () => {
    // Resetar estado
    setShowPrivateMessage(false);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Contador regressivo para o timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (profilePreviewData?.is_private && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [profilePreviewData?.is_private, timer]);

  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [whatsappConfig, setWhatsappConfig] = useState({
    numero: '',
    ativo: false
  });
  const [ticketConfig, setTicketConfig] = useState({
    link: '',
    ativo: false
  });
  const supabase = createClient();

  // Função para pegar o ícone correto baseado no nome
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      FaInstagram,
      FaTiktok,
      FaYoutube
    };
    return icons[iconName] || FaInstagram;
  };

  // Buscar redes sociais cadastradas
  useEffect(() => {
    const fetchSocialNetworks = async () => {
      try {
        const { data: socialsData, error } = await supabase
          .from('socials')
          .select('*')
          .eq('active', true)
          .order('order_position');

        if (error) {
          throw error;
        }

        if (socialsData) {
          setSocialNetworks(socialsData);
        }
      } catch (error) {
        console.error('Erro ao carregar redes sociais:', error);
        toast.error('Erro ao carregar redes sociais');
      }
    };

    fetchSocialNetworks();
  }, []);

  useEffect(() => {
    const fetchConfiguracoes = async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .single();

      if (data) {
        setWhatsappConfig({
          numero: data.whatsapp_numero || '',
          ativo: data.whatsapp_ativo || false
        });
        setTicketConfig({
          link: data.ticket_link || '',
          ativo: data.ticket_ativo || false
        });
      }
    };

    fetchConfiguracoes();
  }, []);

  const [configurations, setConfigurations] = useState<{[key: string]: string}>({
    whatsapp_numero: '+5562981287058',
    whatsapp_ativo: 'true',
    ticket_link: 'https://suporte.viralizamos.com',
    ticket_ativo: 'true'
  });

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const { data, error } = await supabase
          .from('configurations')
          .select('key, value')
          .in('key', [
            'whatsapp_numero', 
            'whatsapp_ativo', 
            'ticket_link', 
            'ticket_ativo'
          ]);

        if (error) throw error;

        const configMap = data.reduce((acc, config) => {
          acc[config.key] = config.value;
          return acc;
        }, {});

        setConfigurations(prev => ({
          ...prev,
          ...configMap
        }));
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
      }
    };

    fetchConfigurations();
  }, []);

  const renderFloatingButtons = () => {
    return (
      <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
        {configurations['whatsapp_ativo'] === 'true' && (
          <a 
            href={`https://wa.me/${configurations['whatsapp_numero']?.replace(/\D/g, '')}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition"
          >
            <FaWhatsapp size={24} />
          </a>
        )}
        
        {configurations['ticket_ativo'] === 'true' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href={configurations['ticket_link'] || '#'}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white p-4 rounded-full shadow-xl hover:bg-blue-600 transition"
                >
                  <FaTicketAlt size={24} />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Abrir Ticket</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  // Modal de preview do perfil
  const renderProfilePreviewModal = () => {
    if (!profilePreviewData) return null;

    // Função para obter URL de imagem segura via proxy
    const getProfileImageUrl = () => {
      const imageUrls = [
        profilePreviewData.profilePicture,
        profilePreviewData.profile_pic_url_hd,
        profilePreviewData.profile_pic_url
      ];

      // Encontrar a primeira URL que não seja undefined ou vazia
      const validUrl = imageUrls.find(url => url && url.trim() !== '');

      // Se nenhuma URL válida for encontrada, retornar uma imagem padrão
      if (!validUrl) return '/default-profile.png';

      // Usar proxy para URL da imagem
      return `/api/image-proxy?url=${encodeURIComponent(validUrl)}`;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <img 
              src={getProfileImageUrl()} 
              alt="Foto de Perfil" 
              className="w-32 h-32 rounded-full mb-4 object-cover"
              onError={(e) => {
                // Se a imagem falhar ao carregar, usar imagem padrão
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = '/default-profile.png';
              }}
            />
            <h2 className="text-2xl font-bold mb-2">
              {profilePreviewData.full_name || profilePreviewData.username}
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              @{profilePreviewData.username}
            </p>

            <div className="flex justify-between w-full mb-4">
              <div className="text-center">
                <strong>{profilePreviewData.totalPosts || profilePreviewData.media_count || 0}</strong>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <strong>{profilePreviewData.followers || profilePreviewData.follower_count || 0}</strong>
                <p className="text-sm text-gray-500">Seguidores</p>
              </div>
              <div className="text-center">
                <strong>{profilePreviewData.following || profilePreviewData.following_count || 0}</strong>
                <p className="text-sm text-gray-500">Seguindo</p>
              </div>
            </div>

            {profilePreviewData.biography && (
              <p className="text-center text-gray-700 mb-4 italic">
                "{profilePreviewData.biography}"
              </p>
            )}

            {profilePreviewData.is_private ? (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <FaLock className="text-red-500 mr-2 text-xl" />
                  <h3 className="font-bold text-red-700">Perfil Privado Detectado</h3>
                </div>
                
                <p className="text-gray-700 mb-3">
                  Para analisar seu perfil, precisamos que ele esteja público. Siga estas instruções:
                </p>
                
                <div className="bg-white rounded p-3 mb-3 border border-red-100">
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                    <li>Abra o Instagram no seu celular</li>
                    <li>Vá para o seu perfil (ícone de usuário)</li>
                    <li>Toque em "Editar perfil"</li>
                    <li>Role para baixo até "Privacidade da conta"</li>
                    <li>Desative a opção "Conta privada"</li>
                    <li>Confirme a alteração</li>
                  </ol>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
                    <div 
                      className="bg-[#C43582] h-4 rounded-full transition-all duration-1000 ease-linear" 
                      style={{ width: `${(timer / 30) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Aguarde {timer} segundos ou clique no botão quando seu perfil estiver público
                  </p>
                  
                  <button 
                    onClick={() => {
                      setProfilePreviewData(prevData => ({ ...prevData, is_private: false }));
                      handleContinueAnalysis();
                    }}
                    disabled={timer > 0}
                    className={`w-full py-2 rounded-full font-bold transition ${timer > 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#C43582] text-white hover:bg-[#a62c6c]'}`}
                  >
                    {timer > 0 ? `Aguarde ${timer}s` : 'Já coloquei meu perfil público'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleContinueAnalysis}
                className="bg-[#C43582] text-white px-6 py-2 rounded-full text-base font-bold hover:bg-[#a62c6c] transition"
              >
                Continuar Análise
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const checkProfile = async (usernameToCheck: string) => {
    setIsLoading(true);
    setShowPrivateMessage(false);
    setShowProfilePreviewModal(true);
    setTimer(30); // Reiniciar o timer para 30 segundos

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
      
      // Se o perfil for público, redirecionar para /analisar-perfil
      if (!data.is_private) {
        router.push(`/analisar-perfil?username=${usernameToCheck}`);
        return;
      }

      // Formatar os dados do perfil
      const profileInfo = {
        username: data.username,
        full_name: data.full_name,
        profile_pic_url: data.profile_pic_url,
        follower_count: data.follower_count,
        following_count: data.following_count,
        totalPosts: data.media_count || data.totalPosts || 0,
        is_private: data.is_private,
        is_verified: data.is_verified,
        biography: data.biography || '',
        followers: data.follower_count,
        following: data.following_count,
        source: data.source
      };
      
      console.log('Dados formatados do perfil:', profileInfo);

      // Atualizar o estado do modal com todos os dados
      setProfilePreviewData(profileInfo);

      if (profileInfo.is_private) {
        // Iniciar o timer para o botão de "Já coloquei público"
        setTimer(30);
        return;
      }

      // Se o perfil não for privado, continuar com a análise
      handleContinueAnalysis();
    } catch (error: any) {
      console.error('Erro ao verificar perfil:', error);
      toast.error('Erro ao verificar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    // Remover @ do início do username, se existir
    const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();

    if (!cleanUsername) {
      toast.error('Por favor, insira um nome de usuário válido');
      return;
    }

    setIsLoading(true);
    setShowPrivateMessage(false);

    try {
      // Chamar a função checkProfile para verificar o perfil
      await checkProfile(cleanUsername);
    } catch (error) {
      console.error('Erro ao validar perfil:', error);
      toast.error('Erro ao validar perfil. Tente novamente.');
      setShowPrivateMessage(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <CookieConsent />
      <main className="home-v3">
        <Header />
        
        {renderProfilePreviewModal()}

        <section className="home-banner">
          <div className="container boxed">
            <div className="row align-items-center">
              <div className="col-md-6 mb-4 mb-md-0">
                <div className="area-texto">
                  <h3>ANALISE SEU PERFIL COM NOSSA INTELIGÊNCIA ARTIFICIAL DE GRAÇA</h3>
                  <h2>Descubra como melhorar seu perfil no Instagram e bombar nas redes!</h2>
                  <div className="input-group mb-3">
                    <div className="input-wrapper">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Digite seu @usuario" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <button 
                      className="btn-analyze"
                      onClick={handleAnalyze}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Analisando...' : 'Analisar Agora'}
                    </button>
                  </div>
                  {showPrivateMessage && (
                    <div className="private-profile-message">
                      <div className="message-content">
                        <img src="/assets/hourglass.svg" alt="Timer" className="hourglass-icon" />
                        <p>
                          Seu perfil está privado! Para continuar a análise, siga estas instruções:
                        </p>
                        <ol className="text-left pl-6 list-decimal space-y-2 mb-4">
                          <li>Abra o Instagram no seu celular</li>
                          <li>Vá para o seu perfil</li>
                          <li>Toque em "Editar Perfil"</li>
                          <li>Desative a opção "Conta Privada"</li>
                          <li>Salve as alterações</li>
                        </ol>
                        <p>
                          Tente novamente em: <span className="timer">{formatTime(timer)}</span>
                        </p>
                        <button 
                          className="btn-try-again"
                          onClick={handleTryAgain}
                          disabled={timer > 0}
                        >
                          {timer > 0 ? `Aguarde ${formatTime(timer)}` : 'Tentar Novamente'}
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="subtitle">Análise completa e gratuita do seu perfil em segundos!</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="hero" id="hero-ig-animation">
                  <div className="_right_pic">
                    <iframe
                      src="https://lottie.host/embed/3aebbf3c-f428-4e4f-8a2a-910a06b6510e/LhWjsbo9xB.lottie"
                      style={{ width: '100%', height: '500px', border: 'none' }}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
            </g>
          </svg>
        </section>

        <section className="choose-social">
          <div className="container">
            <div className="section-header">
              <h2>Turbine seus seguidores, curtidas, comentários e muito mais...</h2>
              <p>Escolha a rede social que você deseja impulsionar</p>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
              {socialNetworks.map((social) => (
                <div key={social.id} className="col">
                  <div className={`social-card ${social.active ? 'active' : 'disabled'}`}>
                    <div className="icon">
                      {social.icon_url ? (
                        <img src={social.icon_url} alt={social.name} className="custom-icon" />
                      ) : (
                        <FaInstagram />
                      )}
                    </div>
                    <h3>{social.name}</h3>
                    <a 
                      href={social.active ? `/${social.url}` : '#'} 
                      className="btn-choose"
                    >
                      Turbine Agora
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServicosSection />
        <RedesSociaisSection />
        <DepoimentosSection />
      </main>

      {renderFloatingButtons()}
    </div>
  );
}