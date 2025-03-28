'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getProxiedImageUrl } from '../utils/proxy-image';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { checkInstagramProfilePublic } from '@/lib/instagram/profileScraper';

interface LoadingProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingStage: 'searching' | 'checking' | 'loading' | 'done' | 'error';
  error?: string;
  profileData?: any;
  serviceId?: string;
  checkoutSlug?: string;
  onRetryAfterPrivate?: () => void;
  handleContinue?: () => void;
}

export function LoadingProfileModal({
  open,
  onOpenChange,
  loadingStage,
  error,
  profileData,
  serviceId,
  checkoutSlug,
  onRetryAfterPrivate,
  handleContinue: externalHandleContinue
}: LoadingProfileModalProps) {
  const router = useRouter();

  const [canRetry, setCanRetry] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // Chave para forçar reinício do timer
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    // Resetar o timer quando o modal for aberto
    if (open && profileData?.is_private) {
      setCanRetry(false);
      setTimerKey(prev => prev + 1);
    }
  }, [open, profileData]);

  console.log('LoadingProfileModal - Dados recebidos:', {
    open,
    loadingStage,
    error,
    profileData,
    serviceId,
    checkoutSlug
  });

  const messages = {
    searching: 'Estamos buscando o seu perfil...',
    checking: 'Estamos verificando se perfil é público...',
    loading: 'Estamos carregando seus dados...',
    done: 'Perfil encontrado!',
    error: error || 'Ocorreu um erro ao buscar o perfil'
  };

  const handleContinue = () => {
    // Se uma função externa de continuação foi fornecida, use-a
    if (externalHandleContinue) {
      console.log('Usando função de continuação externa');
      externalHandleContinue();
      return;
    }

    console.log('Tentando continuar com dados:', {
      profileData,
      serviceId,
      checkoutSlug,
      isPrivate: profileData?.is_private
    });

    if (profileData && serviceId && checkoutSlug) {
      // Verificar se o perfil é privado
      if (profileData.is_private === true) {
        toast.error('Seu perfil precisa ser público para continuar. Por favor, altere as configurações do Instagram.');
        onOpenChange(true); // Garantir que o modal permaneça aberto
        return;
      }

      // Obter a quantidade da URL
      const urlParams = new URLSearchParams(window.location.search);
      const quantity = urlParams.get('quantity');

      // Salvar dados no localStorage
      localStorage.setItem('checkoutProfileData', JSON.stringify({
        profileData,
        serviceId,
        quantity: quantity || undefined,
        timestamp: new Date().getTime()
      }));
      
      router.push(`/checkout/instagram/${checkoutSlug}/step2`);
    } else {
      console.error('Dados insuficientes para continuar', {
        profileData,
        serviceId,
        checkoutSlug
      });
      toast.error('Erro ao processar dados do perfil. Tente novamente.');
    }
  };

  const handleVerifyProfileAgain = async () => {
    if (!profileData?.username) return;
    
    setIsVerifying(true);
    setVerificationMessage('Verificando novamente...');
    
    // Tentar múltiplas abordagens para verificar se o perfil está público
    
    // Abordagem 1: Scraper personalizado
    try {
      // Usar nosso scraper próprio para verificar se o perfil já está público
      const result = await checkInstagramProfilePublic(profileData.username);
      
      if (result.isPublic) {
        setVerificationMessage('Perfil detectado como público! Redirecionando...');
        // Esperar 1.5 segundos antes de chamar o callback para dar tempo de ler a mensagem
        setTimeout(() => {
          if (onRetryAfterPrivate) {
            onRetryAfterPrivate();
          }
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar perfil via scraper personalizado:', error);
      // Continuar para a próxima abordagem
    }
    
    // Abordagem 2: API GraphQL
    try {
      const graphqlResponse = await fetch(`/api/instagram/graphql-check?username=${profileData.username}&quick_check=true`);
      const graphqlData = await graphqlResponse.json();
      
      if (graphqlResponse.ok && !graphqlData.is_private) {
        setVerificationMessage('Perfil detectado como público via GraphQL! Redirecionando...');
        setTimeout(() => {
          if (onRetryAfterPrivate) {
            onRetryAfterPrivate();
          }
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar perfil via GraphQL:', error);
      // Continuar para a próxima abordagem
    }
    
    // Abordagem 3: RapidAPI
    try {
      const rapidApiResponse = await fetch(`/api/instagram/profile/${profileData.username}`);
      const rapidApiData = await rapidApiResponse.json();
      
      if (rapidApiResponse.ok && !rapidApiData.is_private) {
        setVerificationMessage('Perfil detectado como público via API externa! Redirecionando...');
        setTimeout(() => {
          if (onRetryAfterPrivate) {
            onRetryAfterPrivate();
          }
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar perfil via RapidAPI:', error);
    }
    
    // Todas as abordagens falharam
    setVerificationMessage('O perfil ainda parece estar privado. Por favor, verifique as configurações e tente novamente.');
    
    // Desativar estado de verificação após alguns segundos, para permitir nova tentativa
    setTimeout(() => {
      setIsVerifying(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-0">
        <DialogTitle className="sr-only">Status do Perfil</DialogTitle>
        
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          {console.log('Modal Rendering Details:', {
            open,
            loadingStage,
            profileData,
            isPrivate: profileData?.is_private,
            error
          })}

          {loadingStage !== 'error' && loadingStage !== 'done' && (
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          )}
          
          {profileData?.is_private === true && (
            <div className="flex flex-col items-center space-y-4 text-center">
              {console.log('Renderizando modal de perfil privado', { 
                loadingStage, 
                isPrivate: profileData?.is_private,
                profileData 
              })}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={getProxiedImageUrl(profileData.profile_pic_url)}
                  alt={profileData.username}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center text-gray-900 space-y-2">
                <h3 className="text-lg font-semibold">{profileData.username}</h3>
                <div className="flex items-center justify-center text-yellow-600 gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Perfil Privado</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 w-full">
                <p className="font-bold mb-2">Atenção: Perfil Privado Detectado</p>
                <p className="mb-3">Seu perfil do Instagram precisa estar público para continuar com a compra de curtidas. Siga os passos abaixo:</p>
                <ol className="list-decimal list-inside space-y-2 mb-3">
                  <li>Abra o aplicativo do Instagram</li>
                  <li>Vá para seu perfil</li>
                  <li>Toque em "Configurações"</li>
                  <li>Selecione "Privacidade"</li>
                  <li>Desative a opção "Conta Privada"</li>
                </ol>
                <p className="text-xs text-gray-600 mb-4">Após alterar, pode levar alguns instantes para o Instagram atualizar suas configurações.</p>
                
                {verificationMessage && (
                  <div className={`p-2 rounded mb-3 text-center ${verificationMessage.includes('público') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {verificationMessage}
                  </div>
                )}
                
                <div className="flex justify-center">
                  <Button 
                    onClick={handleVerifyProfileAgain}
                    disabled={isVerifying}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {verificationMessage ? 'Tentar verificar novamente' : 'Já tornei meu perfil público'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(loadingStage === 'done' && profileData && !profileData.is_private) && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={getProxiedImageUrl(profileData.profile_pic_url)}
                  alt={profileData.username}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center text-gray-900 space-y-2">
                <h3 className="text-lg font-semibold">{profileData.username}</h3>
                <p className="text-sm text-gray-600">{profileData.full_name}</p>
                
                <div className="flex justify-center gap-8 mt-4">
                  <div className="text-center">
                    <div className="font-semibold">{profileData.media_count || profileData.edge_owner_to_timeline_media?.count || 0}</div>
                    <div className="text-sm text-gray-600">publicações</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {profileData.follower_count 
                        ? profileData.follower_count.toLocaleString() 
                        : profileData.edge_followed_by?.count 
                          ? profileData.edge_followed_by.count.toLocaleString()
                          : '0'}
                    </div>
                    <div className="text-sm text-gray-600">seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {profileData.following_count 
                        ? profileData.following_count.toLocaleString() 
                        : profileData.edge_follow?.count 
                          ? profileData.edge_follow.count.toLocaleString()
                          : '0'}
                    </div>
                    <div className="text-sm text-gray-600">seguindo</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                Continuar
              </Button>
            </div>
          )}

          {(loadingStage === 'error' && profileData?.is_private !== true) && (
            <div className="text-center text-red-500">
              <p>{messages[loadingStage]}</p>
            </div>
          )}

          {loadingStage !== 'done' && loadingStage !== 'error' && (
            <p className="text-center text-gray-600">{messages[loadingStage]}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
