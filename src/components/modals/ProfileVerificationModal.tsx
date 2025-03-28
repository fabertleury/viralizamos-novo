'use client';

import { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';

interface ProfileData {
  username: string;
  full_name?: string;
  profile_pic_url?: string;
  profile_pic_url_hd?: string;
  profilePicture?: string;
  follower_count?: number;
  following_count?: number;
  followers?: number;
  following?: number;
  media_count?: number;
  totalPosts?: number;
  is_private: boolean;
  is_verified?: boolean;
  biography?: string;
  source?: string;
}

interface ProfileVerificationModalProps {
  profileData: ProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onRetryAfterPrivate: () => void;
}

export function ProfileVerificationModal({
  profileData,
  isOpen,
  // onClose mantido na interface mas não utilizado diretamente
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose,
  onContinue,
  onRetryAfterPrivate
}: ProfileVerificationModalProps) {
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen && profileData?.is_private && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, profileData?.is_private, timer]);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimer(30);
      setIsVerifying(false);
      setVerificationAttempts(0);
    }
  }, [isOpen]);

  if (!isOpen || !profileData) return null;

  // Função para obter URL de imagem segura via proxy
  const getProfileImageUrl = () => {
    const imageUrls = [
      profileData.profilePicture,
      profileData.profile_pic_url_hd,
      profileData.profile_pic_url
    ];

    // Encontrar a primeira URL que não seja undefined ou vazia
    const validUrl = imageUrls.find(url => url && url.trim() !== '');

    // Se nenhuma URL válida for encontrada, retornar uma imagem padrão
    if (!validUrl) return '/default-profile.png';

    // Usar proxy para URL da imagem
    return `/api/image-proxy?url=${encodeURIComponent(validUrl)}`;
  };

  const handleMakeProfilePublic = () => {
    // Mostrar estado de carregamento
    setIsVerifying(true);
    
    // Incrementar o contador de tentativas
    setVerificationAttempts(prev => prev + 1);
    
    // Chamar onRetryAfterPrivate que contém a lógica de verificação e rotação de APIs
    onRetryAfterPrivate();
    
    // Apenas mostrar o estado de verificação por um curto período
    // para permitir que o usuário clique novamente se necessário
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
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
            {profileData.full_name || profileData.username}
          </h2>
          <p className="text-gray-600 mb-4 text-center">
            @{profileData.username}
          </p>

          <div className="flex justify-between w-full mb-4">
            <div className="text-center">
              <strong>{profileData.totalPosts || profileData.media_count || 0}</strong>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <strong>{profileData.followers || profileData.follower_count || 0}</strong>
              <p className="text-sm text-gray-500">Seguidores</p>
            </div>
            <div className="text-center">
              <strong>{profileData.following || profileData.following_count || 0}</strong>
              <p className="text-sm text-gray-500">Seguindo</p>
            </div>
          </div>

          {profileData.biography && (
            <p className="text-center text-gray-700 mb-4 italic">
              &ldquo;{profileData.biography}&rdquo;
            </p>
          )}

          {profileData.is_private ? (
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
                  <li>Toque em &ldquo;Editar perfil&rdquo;</li>
                  <li>Role para baixo até &ldquo;Privacidade da conta&rdquo;</li>
                  <li>Desative a opção &ldquo;Conta privada&rdquo;</li>
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
                  onClick={handleMakeProfilePublic}
                  disabled={timer > 0 || isVerifying}
                  className={`w-full py-2 rounded-full font-bold transition ${timer > 0 || isVerifying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#C43582] text-white hover:bg-[#a62c6c]'}`}
                >
                  {isVerifying 
                    ? 'Verificando...' 
                    : timer > 0 
                      ? `Aguarde ${timer}s` 
                      : verificationAttempts > 0 
                        ? 'Tentar verificar novamente' 
                        : 'Já coloquei meu perfil público'
                  }
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onContinue}
              className="bg-[#C43582] text-white px-6 py-2 rounded-full text-base font-bold hover:bg-[#a62c6c] transition"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
