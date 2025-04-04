'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Página dedicada para redirecionamento para o microserviço de pagamentos
 * Esta abordagem evita completamente conflitos com o ciclo de vida do React
 * em outros componentes, eliminando o Error #130
 */
export default function RedirecionamentoPagamento() {
  const searchParams = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);
  const [redirecionando, setRedirecionando] = useState(true);

  useEffect(() => {
    // Recuperar parâmetros da URL
    const serviceId = searchParams.get('service_id');
    const profileUsername = searchParams.get('username');
    const amount = searchParams.get('amount');
    const serviceName = searchParams.get('service_name');
    const customerName = searchParams.get('customer_name');
    const customerEmail = searchParams.get('customer_email');
    const customerPhone = searchParams.get('customer_phone');
    const returnUrl = searchParams.get('return_url');

    try {
      // Validar parâmetros obrigatórios
      if (!serviceId) {
        throw new Error('ID do serviço não informado');
      }

      if (!profileUsername) {
        throw new Error('Nome de usuário não informado');
      }

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error('Valor inválido ou não informado');
      }

      // Preparar dados para envio ao microserviço
      const paymentData = {
        service_id: serviceId,
        service_name: serviceName || 'Serviço Viralizamos',
        profile_username: profileUsername,
        amount: parseFloat(amount),
        customer_name: customerName || 'Cliente',
        customer_email: customerEmail || 'cliente@viralizamos.com',
        customer_phone: customerPhone || '',
        return_url: returnUrl || window.location.origin
      };

      // Converter para JSON e codificar
      const jsonData = JSON.stringify(paymentData);
      console.log('Dados de pagamento:', jsonData);

      // Codificar em base64
      const base64Data = btoa(encodeURIComponent(jsonData));
      
      // URL do microserviço
      const microserviceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
      
      // URL final para redirecionamento
      const redirectUrl = `${microserviceUrl}/pagamento/pix#${base64Data}`;
      
      console.log('Redirecionando para:', redirectUrl);
      
      // IMPLEMENTAÇÃO PRINCIPAL:
      // Redirecionamento simples usando setTimeout para garantir que o React 
      // não tentará manipular o DOM durante o ciclo de renderização
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
      
    } catch (error) {
      console.error('Erro no redirecionamento:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
      setRedirecionando(false);
    }
  }, [searchParams]);

  // Renderizar uma página simples de redirecionamento
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full shadow-lg border border-white/20">
        {redirecionando && !erro ? (
          <>
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin mb-4 text-white" />
              <h1 className="text-xl font-bold mb-2 text-center">Redirecionando para pagamento</h1>
              <p className="text-center text-white/80">
                Você será redirecionado para a página de pagamento em instantes...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-xl font-bold mb-2 text-center">Erro no redirecionamento</h1>
              <p className="text-center text-white/80">
                {erro || 'Ocorreu um erro ao tentar redirecionar para a página de pagamento.'}
              </p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-white text-purple-600 rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                Voltar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 