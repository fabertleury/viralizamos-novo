'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInstagramAPI } from '@/hooks/useInstagramAPI';
import { toast } from 'sonner';
import { ProfileHeader } from '@/components/profile-analyzer/ProfileHeader';
import { ProfileInput } from '@/components/profile-analyzer/ProfileInput';
import { EngagementAnalysis } from '@/components/profile-analyzer/EngagementAnalysis';
import { EngagementProjectionChart } from '@/components/profile-analyzer/EngagementProjectionChart';
import { AdvancedMetrics } from '@/components/profile-analyzer/AdvancedMetrics';
import { PDFShareButton } from '@/components/profile-analyzer/PDFShareButton';
import { ShareReport } from '@/components/profile-analyzer/ShareReport';
import { FaSpinner, FaPlus, FaHeart, FaWhatsapp } from 'react-icons/fa';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface ProfileData {
  username?: string;
  full_name?: string;
  biography?: string;
  followers_count?: number;
  following_count?: number;
  media_count?: number;
  profile_pic_url?: string;
  is_verified?: boolean;
}

interface ContentData {
  id: string;
  type: string;
  caption: string;
  likes: number;
  comments: number;
  mediaUrl: string;
  timestamp: number;
  parentId?: string;
  views?: number;
}

// Função para avaliar o desempenho de um post
function evaluatePostPerformance(
  post: ContentData, 
  followerCount: number
): { 
  status: 'good' | 'average' | 'poor', 
  message: string 
} {
  const likePercentage = (post.likes / followerCount) * 100;

  // Avaliação de curtidas
  if (likePercentage < 3) {
    return {
      status: 'poor',
      message: 'Desempenho baixo. Considere melhorar o conteúdo.'
    };
  }

  if (likePercentage >= 3 && likePercentage < 5) {
    return {
      status: 'average',
      message: 'Desempenho razoável. Há espaço para melhorias.'
    };
  }

  return {
    status: 'good',
    message: 'Ótimo desempenho! Continue assim.'
  };
}

// Função para calcular projeção de engajamento
function calculateEngagementProjection(
  currentFollowers: number, 
  currentLikes: number, 
  currentComments: number,
  currentReelViews?: number
) {
  // Projeção conservadora com os serviços da Viralizamos
  return {
    followers: Math.round(currentFollowers * 1.5), // 50% de crescimento
    likes: Math.round(currentLikes * 2), // Dobrar curtidas
    comments: Math.round(currentComments * 2.5), // 150% de crescimento em comentários
    reelViews: currentReelViews ? Math.round(currentReelViews * 3) : undefined // Triplicar visualizações de Reels
  };
}

export default function ProfileAnalyzerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-700">Carregando análise de perfil...</h2>
          </div>
        </div>
      </div>
    }>
      <ProfileAnalyzerContent />
    </Suspense>
  );
}

function ProfileAnalyzerContent() {
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [contentData, setContentData] = useState<ContentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeContentTab, setActiveContentTab] = useState<'posts' | 'reels'>('posts');
  const { fetchInstagramProfileInfo, fetchContent, fetchUserStories, getBaseUrl } = useInstagramAPI();
  const searchParams = useSearchParams();

  // Estado para controlar o modal de confirmação
  const [showProfilePreviewModal, setShowProfilePreviewModal] = useState(false);
  
  // Interface para os dados de preview do perfil
  interface ProfilePreviewData {
    username: string;
    full_name: string;
    biography?: string;
    followers_count: number;
    following_count: number;
    media_count: number;
    profile_pic_url: string;
    is_verified?: boolean;
    is_private: boolean;
    source?: string;
  }
  
  // Interface para storiesData
  interface StoryMention {
    username: string;
    full_name: string;
    profile_pic_url: string;
  }

  interface StoryItem {
    id: string;
    taken_at: number;
    media_type: number;
    code: string;
    caption?: string | null;
    image_url: string;
    video_url?: string;
    mentions: StoryMention[];
    expiring_at: number;
  }

  interface StoriesData {
    items: StoryItem[];
    user: {
      pk: string | number;
      username: string;
      full_name: string;
      profile_pic_url: string;
    };
  }
  
  const [profilePreviewData, setProfilePreviewData] = useState<ProfilePreviewData | null>(null);
  const [storiesData, setStoriesData] = useState<StoriesData | null>(null);
  const [loadingStories, setLoadingStories] = useState(false);

  // Efeito para iniciar análise ou mostrar modal de confirmação
  useEffect(() => {
    const initializeAnalysis = async () => {
      const username = searchParams.get('username');
      const isPreview = searchParams.get('preview') === 'true';

      if (!username) return;

      try {
        // Buscar informações do perfil
        const profileInfo = await fetchInstagramProfileInfo(username);
        
        if (isPreview) {
          // Mostrar modal de confirmação
          setProfilePreviewData(profileInfo as ProfilePreviewData);
          setShowProfilePreviewModal(true);
        } else {
          // Iniciar análise diretamente
          await startProfileAnalysis(username);
        }
      } catch (error) {
        console.error('Erro ao buscar informações do perfil:', error);
        toast.error('Erro ao buscar informações do perfil');
      }
    };

    initializeAnalysis();
  }, [searchParams]);

  // Função para continuar análise após visualizar preview
  const handleContinueAnalysis = async () => {
    if (profilePreviewData) {
      // Extrair username de forma mais flexível
      const cleanUsername = 
        profilePreviewData.username || 
        searchParams.get('username') || '';
      
      setShowProfilePreviewModal(false);
      setLoading(true);
      
      // Se o perfil era privado, verificar novamente com a API Instagram-Scraper
      if (profilePreviewData.is_private) {
        try {
          // Verificar novamente com a API Instagram-Scraper
          const response = await fetch('/api/instagram/instagram-scraper', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: cleanUsername })
          });
          
          const data = await response.json();
          console.log('Resposta da API Instagram-Scraper:', data);
          
          // Continuar com a análise independentemente do resultado
          await startProfileAnalysis(cleanUsername);
        } catch (error) {
          console.error('Erro ao verificar com Instagram-Scraper:', error);
          // Continuar com a análise mesmo em caso de erro
          await startProfileAnalysis(cleanUsername);
        }
      } else {
        // Se o perfil já era público, continuar normalmente
        await startProfileAnalysis(cleanUsername);
      }
    }
  };

  // Modal de preview do perfil
  const renderProfilePreviewModal = () => {
    if (!profilePreviewData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <img 
              src={profilePreviewData.profile_pic_url} 
              alt="Foto de Perfil" 
              className="w-32 h-32 rounded-full mb-4 object-cover"
            />
            <h2 className="text-2xl font-bold mb-2">
              {profilePreviewData.full_name || profilePreviewData.username}
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              @{profilePreviewData.username}
            </p>

            <div className="flex justify-between w-full mb-4">
              <div className="text-center">
                <strong>{profilePreviewData.media_count || 0}</strong>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <strong>{profilePreviewData.followers_count || 0}</strong>
                <p className="text-sm text-gray-500">Seguidores</p>
              </div>
              <div className="text-center">
                <strong>{profilePreviewData.following_count || 0}</strong>
                <p className="text-sm text-gray-500">Seguindo</p>
              </div>
            </div>

            {profilePreviewData.biography && (
              <p className="text-center text-gray-700 mb-4 italic">
                "{profilePreviewData.biography}"
              </p>
            )}

            {profilePreviewData.is_private ? (
              <div className="w-full">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                  <p className="font-bold">Perfil Privado</p>
                  <p>Para continuar a análise, é necessário tornar o perfil público.</p>
                </div>
                
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
                      setProfilePreviewData((prevData: ProfilePreviewData | null) => prevData ? ({ ...prevData, is_private: false }) : null);
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
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowProfilePreviewModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleContinueAnalysis}
                  className="bg-[#C43582] text-white px-4 py-2 rounded-md hover:bg-[#a62c6c]"
                >
                  Continuar Análise
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleAnalyzeProfile = async (username: string) => {
    setUsername(username);
    setLoading(true);
    setError(null);

    try {
      const profileInfo = await fetchInstagramProfileInfo(username);
      console.log('Dados do perfil recebidos:', profileInfo);

      if (!profileInfo) {
        toast.error('Não foi possível buscar informações do perfil');
        setError('Falha na busca de informações');
        setLoading(false);
        return;
      }

      // Verificar se o perfil é privado
      if (profileInfo.is_private) {
        setError('Perfil privado. Por favor, torne o perfil público.');
        setLoading(false);
        return;
      }

      // Mapear dados do perfil com verificações adicionais
      const mappedProfileData = {
        username: profileInfo.username || username,
        full_name: profileInfo.full_name || profileInfo.username,
        biography: profileInfo.biography || 'Sem biografia',
        followers_count: profileInfo.followers || 0,
        following_count: profileInfo.following || 0,
        media_count: profileInfo.totalPosts || 0,
        profile_pic_url: profileInfo.profilePicture || '',
        is_verified: profileInfo.isVerified || false
      };

      console.log('Dados do perfil mapeados:', mappedProfileData);
      setProfileData(mappedProfileData);

      try {
        const content = await fetchContent(username, 'profile_analysis');
        console.log('Conteúdo do perfil:', content);
        
        // Se não houver conteúdo, definir um aviso
        if (content.length === 0) {
          toast.warning('Nenhum conteúdo encontrado para este perfil');
        }

        setContentData(content);
      } catch (contentError: any) {
        // Tratamento específico para erros de conteúdo
        if (contentError.message.includes('privado')) {
          setError('Perfil privado. Por favor, torne o perfil público.');
        } else {
          setError('Não foi possível buscar o conteúdo do perfil');
          toast.error(contentError.message);
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar dados do perfil:', err);
      
      // Tratamento de erros específicos
      if (err.message.includes('privado')) {
        setError('Perfil privado. Por favor, torne o perfil público.');
      } else if (err.message.includes('não encontrado')) {
        setError('Perfil não encontrado. Verifique o nome de usuário.');
      } else {
        setError('Erro ao buscar dados do perfil');
      }
      
      toast.error(err.message);
      setLoading(false);
    }
  };

  // Remover análise automática
  useEffect(() => {
    // Limpar qualquer estado inicial
    setUsername('');
    setProfileData(null);
    setContentData([]);
    setLoading(false);
    setError(null);
  }, []);

  // Calcular métricas agregadas
  const calculateAggregateMetrics = (data: ContentData[]) => {
    const totalLikes = data.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = data.reduce((sum, item) => sum + item.comments, 0);
    const totalReelViews = data
      .filter(item => item.type === 'video')
      .reduce((sum, item) => sum + (item.views || 0), 0);

    return {
      totalLikes,
      averageLikes: totalLikes / data.length,
      totalComments,
      averageComments: totalComments / data.length,
      totalReelViews,
      averageReelViews: totalReelViews / data.filter(item => item.type === 'video').length
    };
  };

  // Calcular métricas agregadas
  const metrics = calculateAggregateMetrics(contentData);

  // Calcular projeção de engajamento
  const engagementProjection = profileData?.followers_count
    ? calculateEngagementProjection(
        profileData.followers_count, 
        metrics.totalLikes, 
        metrics.totalComments,
        metrics.totalReelViews
      )
    : null;

  // Função para criar URL de proxy segura
  const proxyImageUrl = (originalUrl: string) => {
    if (!originalUrl) return '/default-avatar.png';
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  // Renderizar conteúdo (posts ou reels)
  const renderContentGrid = (contentType: 'posts' | 'reels') => {
    const filteredContent = contentData
      .filter(item => 
        contentType === 'posts' 
          ? item.type === 'image' || item.type === 'carousel'
          : item.type === 'video'
      )
      // Limitar para 10 posts/reels
      .slice(0, 10);

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filteredContent.map((post) => {
          const postPerformance = profileData?.followers_count 
            ? evaluatePostPerformance(post, profileData.followers_count) 
            : null;

          return (
            <div 
              key={post.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 relative"
            >
              <img 
                src={proxyImageUrl(post.mediaUrl)} 
                alt={post.caption || 'Conteúdo do Instagram'} 
                className="w-full h-48 object-cover"
              />

              <div className="p-3">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>

                {postPerformance && (
                  <div 
                    className={`text-xs font-semibold mb-2 p-1 rounded text-center ${
                      postPerformance.status === 'good' 
                        ? 'bg-green-100 text-green-800' 
                        : postPerformance.status === 'average' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {postPerformance.message}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Estado para controlar o timer para perfis privados
  const [timer, setTimer] = useState(30);

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

  // Função para formatar o tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para iniciar análise do perfil
  const startProfileAnalysis = async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      setTimer(30); // Reiniciar o timer para 30 segundos

      // Verificar o perfil usando a API Rocket
      console.log('Verificando perfil do Instagram com RocketAPI:', username);
      
      // Usar o rocket-check como verificador principal
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/instagram/rocket-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar perfil');
      }

      console.log('Resposta da RocketAPI:', data);
      
      // Formatar os dados do perfil
      const profileInfo = {
        username: data.username,
        full_name: data.full_name || '',
        biography: data.biography || '',
        followers_count: data.follower_count || data.followers || 0,
        following_count: data.following_count || data.following || 0,
        media_count: data.media_count || data.totalPosts || 0,
        profile_pic_url: data.profile_pic_url || '',
        is_verified: data.is_verified || false,
        is_private: data.is_private || false
      };

      // Se o perfil for privado, mostrar o modal
      if (profileInfo.is_private) {
        toast.error('Este perfil é privado. A análise não pode ser realizada.');
        setProfilePreviewData(profileInfo);
        setShowProfilePreviewModal(true);
        setLoading(false);
        return;
      }

      // Atualizar estado com dados do perfil
      setProfileData({
        username: profileInfo.username,
        full_name: profileInfo.full_name,
        biography: profileInfo.biography,
        followers_count: profileInfo.followers_count,
        following_count: profileInfo.following_count,
        media_count: profileInfo.media_count,
        profile_pic_url: profileInfo.profile_pic_url,
        is_verified: profileInfo.is_verified
      });

      // Buscar posts e stories exclusivamente com RocketAPI
      toast.info('Buscando conteúdo do Instagram com RocketAPI...');
      
      // Buscar posts/reels
      try {
        console.log('Buscando conteúdo (posts/reels) com RocketAPI');
        const contentResult = await fetchContent(username, 'profile_analysis');
        
        if (contentResult.length === 0) {
          console.warn('RocketAPI não retornou conteúdo');
          toast.warning('Não foi possível obter posts ou reels deste perfil. A análise pode ser limitada.');
        } else {
          console.log(`RocketAPI retornou ${contentResult.length} itens de conteúdo`);
          
          // Contar tipos de conteúdo
          const postsCount = contentResult.filter(item => 
            item.type === 'image' || item.type === 'carousel'
          ).length;
          
          const reelsCount = contentResult.filter(item => 
            item.type === 'video'
          ).length;
          
          toast.success(`Encontrados ${contentResult.length} itens: ${postsCount} posts e ${reelsCount} reels`);
          setContentData(contentResult);
        }
      } catch (contentError) {
        console.error('Erro ao buscar conteúdo com RocketAPI:', contentError);
        toast.error('Erro ao buscar posts e reels. Tente novamente mais tarde.');
      }
      
      // Buscar stories
      try {
        setLoadingStories(true);
        console.log('Buscando stories com RocketAPI');
        
        const stories = await fetchUserStories(username);
        
        if (stories && stories.items && stories.items.length > 0) {
          console.log(`RocketAPI retornou ${stories.items.length} stories`);
          setStoriesData(stories);
          toast.success(`Encontrados ${stories.items.length} stories`);
        } else {
          console.log('RocketAPI não encontrou stories para este usuário');
          setStoriesData(null);
          toast.info('Não há stories ativos para este perfil no momento.');
        }
      } catch (storiesError) {
        console.error('Erro ao buscar stories com RocketAPI:', storiesError);
        setStoriesData(null);
      } finally {
        setLoadingStories(false);
      }
      
      // Análise concluída
      setLoading(false);
      toast.success('Análise de perfil concluída com RocketAPI!');
      
    } catch (error) {
      console.error('Erro na análise do perfil:', error);
      setError('Não foi possível analisar o perfil. Tente novamente.');
      setLoading(false);
      
      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          toast.error('Perfil não encontrado. Verifique se o nome de usuário está correto.');
        } else if (error.message.includes('privado')) {
          toast.error('Este perfil é privado. A análise não pode ser realizada.');
        } else {
          toast.error(`Erro na análise do perfil: ${error.message}`);
        }
      } else {
        toast.error('Erro na análise do perfil');
      }
    }
  };

  return (
    <>
      <Header />
      {renderProfilePreviewModal()}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <ProfileInput 
            onAnalyze={handleAnalyzeProfile} 
            isLoading={loading}
            initialUsername={username}
          />

          {loading && (
            <div className="flex justify-center items-center my-8">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {profileData && (
            <div className="w-full">
              <ProfileHeader profileData={profileData} />

              {/* Posts e Reels */}
              {contentData.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                  <div className="flex mb-4 border-b">
                    <button 
                      className={`px-4 py-2 ${activeContentTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveContentTab('posts')}
                    >
                      Posts
                    </button>
                    <button 
                      className={`px-4 py-2 ${activeContentTab === 'reels' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveContentTab('reels')}
                    >
                      Reels
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold mb-6 text-center">
                    Últimos {activeContentTab === 'posts' ? 'Posts' : 'Reels'}
                  </h3>

                  {renderContentGrid(activeContentTab)}

                  {/* Botões de Ação */}
                  {profileData && (
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
                      <Link 
                        href="/instagram/seguidores" 
                        className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        <FaPlus className="mr-2" /> Adicionar Seguidores
                      </Link>
                      <Link 
                        href="/instagram/curtidas" 
                        className="flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        <FaHeart className="mr-2" /> Adicionar Curtidas
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Métricas Avançadas */}
              {profileData && contentData.length > 0 && (
                <AdvancedMetrics 
                  profileData={profileData}
                  contentData={contentData}
                />
              )}

              {/* Análise de Engajamento */}
              {profileData.followers_count && contentData.length > 0 && (
                <EngagementAnalysis 
                  followers={profileData.followers_count}
                  likes={metrics.totalLikes}
                  comments={metrics.totalComments}
                  reelViews={metrics.totalReelViews}
                />
              )}

              {/* Projeção de Engajamento */}
              {engagementProjection && (
                <EngagementProjectionChart 
                  currentData={{
                    followers: profileData.followers_count || 0,
                    likes: metrics.totalLikes,
                    comments: metrics.totalComments,
                    reelViews: metrics.totalReelViews
                  }}
                  projectedData={engagementProjection}
                />
              )}

              {/* Botão de Compartilhar no WhatsApp */}
              {profileData && contentData.length > 0 && (
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
                  <h3 className="text-xl font-bold mb-4">Compartilhar Análise</h3>
                  <a
                    href={`https://wa.me/?text=Confira%20a%20an%C3%A1lise%20do%20perfil%20${profileData.username}%20no%20Instagram%20com%20${profileData.followers_count?.toLocaleString()}%20seguidores%20-%20https%3A%2F%2Fviralizai.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp className="mr-2 text-xl" /> Compartilhar no WhatsApp
                  </a>
                </div>
              )}

              {/* Compartilhamento de PDF */}
              {profileData && contentData.length > 0 && (
                <PDFShareButton 
                  profileData={profileData}
                  contentData={contentData}
                  metrics={metrics}
                  engagementProjection={engagementProjection}
                />
              )}

              {/* Relatório de Compartilhamento */}
              {profileData && contentData.length > 0 && (
                <ShareReport 
                  username={profileData.username || ''} 
                  profileData={profileData}
                  contentData={contentData}
                  metrics={metrics}
                  reportRef={null}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
