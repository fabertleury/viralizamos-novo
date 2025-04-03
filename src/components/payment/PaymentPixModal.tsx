'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState, useCallback } from 'react';
import { PaymentSuccessModal } from './PaymentSuccessModal';

interface PaymentPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
  targetProfileLink?: string;
  serviceName?: string;
  amount?: number;
  customerData?: {
    name: string;
    email: string;
    phone: string;
  };
  profileData?: {
    username: string;
    full_name?: string;
  };
  postsData?: Array<any>;
}

// Componente para mostrar o timer de expiração
function ExpireTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiresAt.getTime() - now.getTime();
      
      if (difference <= 0) {
        setExpired(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        return;
      }
      
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft({ minutes, seconds });
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  if (expired) {
    return (
      <div className="text-red-600 font-medium text-center my-2">
        O código PIX expirou! Por favor, gere um novo.
      </div>
    );
  }
  
  return (
    <div className="text-center my-2">
      <p className="text-sm text-gray-600 mb-1">Tempo para pagamento:</p>
      <p className="text-lg font-semibold">
        {timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
      </p>
      <p className="text-xs text-gray-500">O código PIX expira em 30 minutos</p>
    </div>
  );
}

export function PaymentPixModal({ 
  isOpen, 
  onClose, 
  serviceId,
  targetProfileLink,
  serviceName,
  amount,
  customerData,
  profileData,
  postsData
}: PaymentPixModalProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Criar uma data de expiração 30 minutos a partir de agora
  const [expiresAt] = useState(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    return date;
  });

  // Função para criar sessão de pagamento no microserviço
  const createPaymentSession = useCallback(async () => {
    if (!isOpen || !amount || !serviceId || !profileData?.username) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3001'}/api/payment/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // em centavos
          serviceId: serviceId,
          profileUsername: profileData.username,
          customer: customerData,
          posts: postsData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao iniciar sessão de pagamento');
      }

      const data = await response.json();
      setEmbedUrl(data.embedUrl);
      
    } catch (error) {
      console.error('Erro ao criar sessão de pagamento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao iniciar o pagamento');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, amount, serviceId, profileData, customerData, postsData]);

  // Chamar createPaymentSession quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      createPaymentSession();
    }
  }, [isOpen, createPaymentSession]);

  // Função para verificar status do pagamento periodicamente
  const startPaymentStatusCheck = useCallback((paymentId: string) => {
    // Limpar qualquer intervalo existente
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Criar novo intervalo para verificar o status a cada 15 segundos
    const newIntervalId = setInterval(async () => {
      if (isCheckingPayment) {
        console.log('Verificação já em andamento, aguardando...');
        return;
      }

      setIsCheckingPayment(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/api/payment/status/${paymentId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Status do pagamento:', data.status);
          
          setPaymentStatus(data.status);
          
          if (data.status === 'approved') {
            clearInterval(newIntervalId);
            setIntervalId(null);
            
            // Aguardar um pouco e abrir o modal de sucesso
            setTimeout(() => {
              onClose();
              setIsSuccessModalOpen(true);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      } finally {
        setIsCheckingPayment(false);
      }
    }, 15000);
    
    setIntervalId(newIntervalId);
    
    // Retornar função para limpar o intervalo quando necessário
    return () => {
      clearInterval(newIntervalId);
      setIntervalId(null);
    };
  }, [isCheckingPayment, onClose, intervalId]);

  // Receber mensagens do iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3001',
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('Mensagem recebida de origem não permitida:', event.origin);
        return;
      }
      
      if (event.data.type === 'PAYMENT_IFRAME_READY') {
        // Iframe está pronto para receber dados
        const iframe = document.getElementById('payment-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'PAYMENT_DATA',
            payload: {
              amount: amount,
              serviceId: serviceId,
              profileUsername: profileData?.username,
              customer: customerData,
              posts: postsData
            }
          }, '*');
        }
      } else if (event.data.type === 'PAYMENT_CREATED') {
        // Pagamento criado, iniciar verificação de status
        setPaymentId(event.data.paymentId);
        startPaymentStatusCheck(event.data.paymentId);
      } else if (event.data.type === 'PAYMENT_APPROVED') {
        // Fechar o modal de pagamento e abrir o modal de sucesso
        onClose();
        setIsSuccessModalOpen(true);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      // Limpar intervalo ao desmontar
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [amount, serviceId, profileData, customerData, postsData, onClose, startPaymentStatusCheck, intervalId]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 text-center"
                  >
                    Pagamento PIX
                  </Dialog.Title>

                  <div className="mt-4 flex flex-col items-center space-y-4">
                    {paymentStatus === 'approved' ? (
                      <div className="text-center space-y-2">
                        <p className="text-green-600 font-medium">Pagamento recebido com sucesso!</p>
                        <p className="text-sm text-gray-500">Você será redirecionado em instantes...</p>
                      </div>
                    ) : paymentStatus === 'failed' ? (
                      <div className="text-center space-y-2">
                        <p className="text-red-600 font-medium">Pagamento não aprovado</p>
                        <p className="text-sm text-gray-500">Por favor, tente novamente ou escolha outra forma de pagamento</p>
                      </div>
                    ) : (
                      <div className="w-full space-y-4">
                        {isLoading ? (
                          <div className="flex flex-col items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600 text-center">Gerando pagamento PIX...</p>
                          </div>
                        ) : error ? (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <strong className="font-bold">Erro: </strong>
                            <span className="block">{error}</span>
                            <button
                              className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none"
                              onClick={createPaymentSession}
                            >
                              Tentar novamente
                            </button>
                          </div>
                        ) : embedUrl ? (
                          <iframe
                            id="payment-iframe"
                            src={embedUrl}
                            className="w-full h-[380px] border-0"
                            allow="clipboard-write"
                          ></iframe>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-600">Preparando pagamento...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timer de expiração */}
                  <ExpireTimer expiresAt={expiresAt} />
                  
                  {/* Botão de fechamento */}
                  {paymentStatus !== 'approved' && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        onClick={onClose}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      <PaymentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderNumber={paymentId || ''}
        targetProfileLink={targetProfileLink || ''}
        serviceName={serviceName || ''}
      />
    </>
  );
}
