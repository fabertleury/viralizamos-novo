'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useInstagramAPI } from '@/hooks/useInstagramAPI';
import { FaLock } from 'react-icons/fa';

interface ProfileAnalyzerProps {
  onAnalysisComplete?: (data: any) => void;
}

const ProfileAnalyzer = ({ onAnalysisComplete }: ProfileAnalyzerProps) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivateMessage, setShowPrivateMessage] = useState(false);
  const [timer, setTimer] = useState(30);
  const [showProfilePreviewModal, setShowProfilePreviewModal] = useState(false);
  const [profilePreviewData, setProfilePreviewData] = useState<any>(null);
  const router = useRouter();
  const { fetchInstagramProfileInfo } = useInstagramAPI();
  const supabase = createClient();

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

  // Função principal para verificar o perfil do Instagram
  const checkProfile = async (usernameToCheck: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[HomePage] Iniciando análise do perfil: ${usernameToCheck}`);
      
      // Usar o fetchInstagramProfileInfo do hook useInstagramAPI
      // Esta é a mesma abordagem usada na página analisar-perfil
      const profileInfo = await fetchInstagramProfileInfo(usernameToCheck);
      
      if (!profileInfo) {
        console.error('Perfil não encontrado');
        setError('Perfil não encontrado. Verifique o nome de usuário.');
        setIsLoading(false);
        return;
      }
      
      console.log('Dados do perfil recebidos:', profileInfo);
      
      // Verificar se o perfil é privado
      if (profileInfo.is_private) {
        // Mostrar o modal de perfil privado
        setProfilePreviewData(profileInfo);
        setShowProfilePreviewModal(true);
        setIsLoading(false);
        return;
      }
      
      // Se chegou até aqui, temos os dados do perfil
      // Podemos redirecionar para a página de análise ou mostrar os dados aqui
      setProfilePreviewData(profileInfo);
      setShowProfilePreviewModal(true);
      
      // Opcionalmente, salvar no banco de dados para cache
      try {
        const { error: saveError } = await supabase
          .from('instagram_profiles')
          .upsert({
            username: profileInfo.username,
            followers_count: profileInfo.followers || profileInfo.followers_count || 0,
            following_count: profileInfo.following || profileInfo.following_count || 0,
            posts_count: profileInfo.totalPosts || profileInfo.media_count || 0,
            profile_pic_url: profileInfo.profilePicture || profileInfo.profile_pic_url || '',
            is_private: profileInfo.is_private || false,
            is_verified: profileInfo.isVerified || profileInfo.is_verified || false,
            updated_at: new Date().toISOString()
          });

        if (saveError) {
          console.error('Erro ao salvar perfil no cache:', saveError);
        }
      } catch (cacheError) {
        console.error('Erro ao tentar salvar no cache:', cacheError);
        // Não interromper o fluxo se o cache falhar
      }
    } catch (err) {
      console.error('Erro ao verificar perfil:', err);
      
      // Tratamento de erros específicos
      if (err instanceof Error) {
        if (err.message.includes('privado')) {
          setError('Perfil privado. Por favor, torne o perfil público.');
        } else if (err.message.includes('não encontrado')) {
          setError('Perfil não encontrado. Verifique o nome de usuário.');
        } else {
          setError(`Erro ao verificar perfil: ${err.message}`);
        }
      } else {
        setError('Erro ao verificar perfil. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
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

  // Função para obter URL de imagem segura via proxy
  const getProfileImageUrl = () => {
    if (!profilePreviewData) return '/default-profile.png';
    
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

  // Modal de preview do perfil
  const renderProfilePreviewModal = () => {
    if (!profilePreviewData) return null;

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

  return (
    <>
      {renderProfilePreviewModal()}
      
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
      
      {error && (
        <div className="error-message mt-2 text-red-500">
          {error}
        </div>
      )}
      
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
    </>
  );
};

export default ProfileAnalyzer;
