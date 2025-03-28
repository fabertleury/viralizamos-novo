import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FaCopy } from 'react-icons/fa';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PixPaymentProps {
  qrCodeBase64: string;
  copyPasteCode: string;
  orderId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export function PixPayment({ 
  qrCodeBase64, 
  copyPasteCode, 
  orderId,
  amount,
  onPaymentSuccess 
}: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);
  const [isManualCheckInProgress, setIsManualCheckInProgress] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const router = useRouter();

  // Função para verificar o status do pagamento
  const checkPaymentStatus = useCallback(async () => {
    // Evitar verificações muito frequentes (mínimo 3 segundos entre verificações)
    const now = Date.now();
    if (now - lastCheckTime < 3000) {
      console.log('Verificação muito frequente no PixPayment, ignorando');
      return;
    }
    
    if (isLoading || paymentApproved) return;
    
    try {
      setLastCheckTime(now);
      setIsLoading(true);
      const response = await fetch(`/api/payment/verify-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_id: orderId })
      });
      const data = await response.json();
      setIsLoading(false);

      console.log('Status do pagamento (PixPayment):', data);

      if (data.status === 'approved') {
        setPaymentApproved(true);
        onPaymentSuccess();
        
        // Mostrar mensagem de sucesso
        toast.success('Pagamento aprovado! Redirecionando...');
        
        // Obter transaction_id dos dados de resposta
        const transactionId = data.transaction_id || orderId;
        
        // Obter email dos metadados da transação
        const email = data.transaction?.metadata?.email || 
                     data.transaction?.metadata?.customer?.email || 
                     data.transaction?.metadata?.profile?.email || '';
        
        // Redirecionar para a página de agradecimento após 1 segundo
        setTimeout(() => {
          console.log('Redirecionando para página de agradecimento:', `/agradecimento?id=${transactionId}`);
          router.push(`/agradecimento?id=${transactionId}&email=${encodeURIComponent(email)}`);
        }, 1000);
      } else if (isManualCheckInProgress) {
        setIsManualCheckInProgress(false);
        toast.info('Pagamento ainda não confirmado. Aguarde ou tente novamente em alguns instantes.');
      }
    } catch (error) {
      setIsLoading(false);
      setIsManualCheckInProgress(false);
      console.error('Erro ao verificar status do pagamento:', error);
    }
  }, [orderId, onPaymentSuccess, router, isLoading, paymentApproved, isManualCheckInProgress, lastCheckTime]);

  useEffect(() => {
    if (!orderId || paymentApproved) return;

    // Verificar o status do pagamento a cada 8 segundos
    const intervalId = setInterval(checkPaymentStatus, 8000);

    // Verificar o status imediatamente
    checkPaymentStatus();

    return () => clearInterval(intervalId);
  }, [orderId, paymentApproved, checkPaymentStatus]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(copyPasteCode)
      .then(() => {
        setCopied(true);
        toast.success('Código PIX copiado!');
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Erro ao copiar código:', err);
        toast.error('Não foi possível copiar o código');
      });
  };

  const handleManualCheck = () => {
    if (isManualCheckInProgress) return;
    
    setIsManualCheckInProgress(true);
    toast.info('Verificando seu pagamento...');
    checkPaymentStatus().finally(() => {
      setTimeout(() => {
        setIsManualCheckInProgress(false);
      }, 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Pagamento via PIX</h2>
        <p className="text-gray-600 mb-4">
          Escaneie o QR Code ou copie o código PIX abaixo
        </p>
        
        {paymentApproved ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Pagamento Aprovado!</h3>
            <p className="text-gray-600">Redirecionando...</p>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 flex justify-center">
              {qrCodeBase64 ? (
                <img 
                  src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                  alt="QR Code PIX" 
                  className="w-48 h-48"
                  onError={(e) => {
                    // Em caso de erro ao carregar a imagem, não mostrar mensagem de erro
                    console.log('Erro ao carregar QR code, tentando usar formato alternativo');
                    const target = e.target as HTMLImageElement;
                    // Tentar formato alternativo se o atual falhar
                    if (!target.src.includes('data:image/png;base64,') && qrCodeBase64) {
                      target.src = `data:image/png;base64,${qrCodeBase64}`;
                    }
                  }}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <p className="text-gray-500">QR Code não disponível</p>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <p className="font-semibold mb-2">Valor a pagar:</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(amount)}</p>
            </div>
            
            <div className="relative">
              <p className="font-semibold mb-2">Código PIX:</p>
              <div className="flex">
                <input
                  type="text"
                  value={copyPasteCode}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                />
                <button
                  onClick={handleCopyCode}
                  className={`px-4 py-2 rounded-r-md flex items-center justify-center ${
                    copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {copied ? 'Copiado!' : <FaCopy />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Você também pode copiar o código e pagar pelo aplicativo do seu banco
              </p>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleManualCheck}
                disabled={isManualCheckInProgress || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center mx-auto disabled:opacity-50"
              >
                {isManualCheckInProgress || isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </>
                ) : (
                  'Verificar Pagamento'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Após realizar o pagamento, clique no botão acima para verificar o status
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
