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
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [paymentId, setPaymentId] = useState<string>('');
  const [pollCount, setPollCount] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [serviceUrl, setServiceUrl] = useState<string>(
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com'
  );
  const [diagnosticInfo, setDiagnosticInfo] = useState<{
    serviceUrl: string,
    connectionStatus: string,
    error: string | null
  }>({
    serviceUrl: '',
    connectionStatus: 'não testado',
    error: null
  });

  useEffect(() => {
    // Configurar tempo de expiração (30 minutos)
    if (isOpen && !expiresAt) {
      const expiration = new Date();
      expiration.setMinutes(expiration.getMinutes() + 30);
      setExpiresAt(expiration);
    }
  }, [isOpen, expiresAt]);

  // Verificar conexão com o microserviço quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      checkMicroserviceConnection();
    }
  }, [isOpen]);

  // Função para verificar a conexão com o microserviço
  const checkMicroserviceConnection = async () => {
    try {
      setDiagnosticInfo(prev => ({ ...prev, connectionStatus: 'testando...' }));
      
      const serviceUrlToUse = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 
                              'https://pagamentos.viralizamos.com';
      
      setDiagnosticInfo(prev => ({ ...prev, serviceUrl: serviceUrlToUse }));
      
      // Tentar acessar a rota de health check do microserviço
      const response = await fetch(`${serviceUrlToUse}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiagnosticInfo({
          serviceUrl: serviceUrlToUse,
          connectionStatus: 'conectado',
          error: null
        });
        console.log('Microserviço de pagamento está online:', data);
      } else {
        setDiagnosticInfo({
          serviceUrl: serviceUrlToUse,
          connectionStatus: 'erro',
          error: `Status: ${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('Erro ao verificar microserviço:', error);
      setDiagnosticInfo({
        serviceUrl: serviceUrl,
        connectionStatus: 'falha',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  // Função para criar sessão de pagamento no microserviço
  const createPaymentSession = useCallback(async () => {
    if (!isOpen || !amount || !serviceId || !profileData?.username) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Iniciando requisição de pagamento PIX:', {
        amount,
        serviceId,
        profile: profileData.username
      });

      const response = await fetch(`${serviceUrl}/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          description: `${serviceName} para @${profileData.username}`,
          payer: {
            name: customerData?.name,
            email: customerData?.email,
            phone: customerData?.phone
          },
          metadata: {
            service_id: serviceId,
            profile_username: profileData.username,
            posts: postsData,
            return_url: window.location.href
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('Erro na resposta do servidor:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `Erro ao iniciar pagamento: ${response.status}`);
      }

      const data = await response.json();
      console.log('Resposta do servidor - redirecionamento:', data);
      
      // Redirecionar o usuário para a página de pagamento
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('URL de pagamento não fornecida pelo servidor');
      }
      
    } catch (error) {
      console.error('Erro ao criar sessão de pagamento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar pagamento');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, amount, serviceId, profileData, customerData, postsData, serviceName, serviceUrl]);

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
            <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                  
                  <div className="mt-4">
                    {/* Informações de diagnóstico */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-md text-sm">
                      <h4 className="font-semibold mb-2">Diagnóstico de conexão:</h4>
                      <ul className="space-y-1">
                        <li>Microserviço: <span className="font-mono">{diagnosticInfo.serviceUrl}</span></li>
                        <li>Status: <span className={`font-semibold ${
                          diagnosticInfo.connectionStatus === 'conectado' ? 'text-green-600' : 
                          diagnosticInfo.connectionStatus === 'testando...' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>{diagnosticInfo.connectionStatus}</span></li>
                        {diagnosticInfo.error && (
                          <li className="text-red-600">Erro: {diagnosticInfo.error}</li>
                        )}
                      </ul>
                      <button
                        onClick={checkMicroserviceConnection}
                        className="mt-2 px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
                      >
                        Verificar novamente
                      </button>
                    </div>
                    
                    <div className="w-full space-y-4 bg-white p-4 rounded-lg">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-4 bg-white">
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
                      ) : pixData ? (
                        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg">
                          <img 
                            src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                            alt="QR Code PIX" 
                            className="w-48 h-48 mb-4"
                          />
                          <div className="w-full max-w-sm p-3 bg-gray-50 rounded-lg mb-4">
                            <p className="text-sm text-gray-600 mb-2">Código PIX para copiar:</p>
                            <div className="relative">
                              <input
                                type="text"
                                value={pixData.qrCode}
                                readOnly
                                className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md pr-20"
                              />
                              <button
                                onClick={() => navigator.clipboard.writeText(pixData.qrCode)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-600 mb-6">
                            Para continuar, você será redirecionado ao serviço de pagamentos
                          </p>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            onClick={createPaymentSession}
                            disabled={diagnosticInfo.connectionStatus !== 'conectado'}
                          >
                            {diagnosticInfo.connectionStatus !== 'conectado' ? 
                              'Aguarde a conexão...' : 
                              'Continuar para pagamento'}
                          </button>
                        </div>
                      )}
                    </div>
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
