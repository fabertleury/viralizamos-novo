'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState, useCallback } from 'react';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { PixPayment } from './PixPayment';

interface PaymentPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode?: string;
  qrCodeText: string;
  paymentId: string;
  qrCodeBase64?: string;
  serviceId?: string;
  targetProfileLink?: string;
  serviceName?: string;
  amount?: number;
  reused?: boolean;
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
  qrCode, 
  qrCodeText, 
  paymentId, 
  qrCodeBase64: initialQrCodeBase64,
  serviceId,
  targetProfileLink,
  serviceName,
  amount,
  reused
}: PaymentPixModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [qrCodeBase64, setQrCodeBase64] = useState(initialQrCodeBase64);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [interval, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Criar uma data de expiração 30 minutos a partir de agora
  const [expiresAt] = useState(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    return date;
  });

  useEffect(() => {
    console.log('Initial props:', { 
      qrCode, 
      qrCodeText, 
      paymentId, 
      initialQrCodeBase64 
    });
    
    // Removido rastreamento do Facebook Pixel
  }, [qrCode, qrCodeText, paymentId, initialQrCodeBase64, amount, serviceName, serviceId]);

  // Função para garantir que o QR Code seja renderizável
  const getQRCodeSrc = useCallback(() => {
    console.log('Detalhes do QR Code (getQRCodeSrc):', { 
      qrCodeBase64, 
      length: qrCodeBase64?.length, 
      qrCode,
      initialQrCodeBase64
    });

    // Priorizar qrCodeBase64 recebido do backend
    if (qrCodeBase64) {
      console.log('QR Code base64:', qrCodeBase64);
      console.log('QR Code length:', qrCodeBase64.length);
      
      // Remover prefixo de dados se existir
      const base64 = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
      return `data:image/png;base64,${base64}`;
    }

    // Fallback para gerar QR Code via URL externa
    if (qrCodeText) {
      console.log('Gerando QR Code via URL:', 
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}`
      );
      
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}`;
    }

    // Se nenhuma fonte de QR Code estiver disponível
    return undefined;
  }, [qrCodeBase64, qrCodeText, initialQrCodeBase64]);

  useEffect(() => {
    console.log('Initial qrCode:', qrCode);
    console.log('Initial qrCodeBase64:', qrCodeBase64);
    
    // Se recebermos initialQrCodeBase64 mas qrCodeBase64 ainda não estiver definido, atualizá-lo
    if (initialQrCodeBase64 && !qrCodeBase64) {
      setQrCodeBase64(initialQrCodeBase64);
    }
  }, [qrCode, qrCodeBase64, initialQrCodeBase64]);

  useEffect(() => {
    if (isOpen) {
      // Iniciar o verificador de pagamentos em background
      const startBackgroundChecker = async () => {
        try {
          // Evitar múltiplas chamadas simultâneas
          if (isCheckingPayment) {
            console.log('Já existe uma verificação de pagamento em andamento');
            return;
          }
          
          setIsCheckingPayment(true);
          console.log('Iniciando verificador de pagamento para payment ID:', paymentId);
          
          // Verificar se temos o ID de pagamento
          if (!paymentId) {
            console.error('ID de pagamento não disponível, não é possível verificar status');
            setIsCheckingPayment(false);
            return;
          }
          
          // Chamada para a API que inicia o verificador em background
          const response = await fetch('/api/cron/check-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              paymentId: paymentId,
              transactionId: paymentId,
              checkImmediate: true
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao iniciar verificador de pagamentos:', errorData);
            setIsCheckingPayment(false);
            return;
          }
          
          console.log('Verificador de pagamentos iniciado com sucesso');
          setIsCheckingPayment(false);
          
          // Limpar qualquer intervalo existente antes de criar um novo
          if (interval) {
            clearInterval(interval);
            setIntervalId(null);
          }
          
          // Opcionalmente, podemos definir um interval para verificar o status do pagamento em caso de falha do background check
          const checkInterval = setInterval(async () => {
            // Evitar verificações simultâneas no intervalo
            if (isCheckingPayment) {
              console.log('Pulando verificação periódica - já existe uma verificação em andamento');
              return;
            }
            
            // Verificar status do pagamento a cada 15 segundos como fallback
            console.log('Verificando status do pagamento periodicamente...');
            setIsCheckingPayment(true);
            
            try {
              const statusResponse = await fetch(`/api/payment/check-status?id=${paymentId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log('Status do pagamento:', statusData);
                
                // Se o pagamento for aprovado, atualizar estado e redirecionar
                if (statusData.status === 'approved' || statusData.status === 'completed') {
                  console.log('Pagamento aprovado!');
                  clearInterval(checkInterval);
                  setIntervalId(null);
                  setPaymentStatus('approved');
                  
                  // Aguardar um pouco e redirecionar
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
          }, 15000); // a cada 15 segundos
          
          setIntervalId(checkInterval);
        } catch (error) {
          console.error('Erro ao iniciar verificador de pagamentos:', error);
          setIsCheckingPayment(false);
        }
      };

      startBackgroundChecker();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        setIntervalId(null);
      }
    };
  }, [isOpen, paymentId, interval, isCheckingPayment]);

  useEffect(() => {
    console.log('QR Code base64:', qrCodeBase64);
    console.log('QR Code length:', qrCodeBase64?.length);
  }, [qrCodeBase64]);

  return (
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
                      <PixPayment
                        qrCodeBase64={qrCodeBase64 || getQRCodeSrc() || ''}
                        copyPasteCode={qrCodeText}
                        orderId={paymentId}
                        amount={amount || 0}
                        onPaymentSuccess={() => {
                          setPaymentStatus('success');
                          // Aguardar um pouco antes de fechar o modal
                          setTimeout(() => {
                            onClose();
                          }, 2000);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Timer de expiração */}
                <ExpireTimer expiresAt={expiresAt} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      <PaymentSuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        serviceDetails={{
          targetProfileLink,
          serviceName
        }}
      />
    </Transition>
  );
}
