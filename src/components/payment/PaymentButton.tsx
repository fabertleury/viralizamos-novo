'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { redirectToPaymentService, PaymentRedirectData } from '@/lib/payment/redirectToPaymentService';

interface PaymentButtonProps {
  // Dados necessários para o pagamento
  data: PaymentRedirectData;
  
  // Propriedades de UI
  label?: string;
  disabled?: boolean;
  className?: string;
  
  // Callbacks
  onBeforeRedirect?: () => Promise<boolean>;
  onRedirectSuccess?: () => void;
  onRedirectError?: (error: any) => void;
}

/**
 * Botão de pagamento simples que redireciona para o microserviço de pagamentos
 */
export default function PaymentButton({
  data,
  label = 'PAGAR COM PIX',
  disabled = false,
  className = '',
  onBeforeRedirect,
  onRedirectSuccess,
  onRedirectError
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  
  // Estilos para o botão
  const baseClasses = `
    px-6 py-3 
    rounded-full 
    font-bold 
    text-sm 
    uppercase 
    tracking-wider 
    transition-all 
    duration-300 
    ease-in-out 
    transform 
    w-full
  `;
  
  const enabledClasses = `
    bg-gradient-to-r 
    from-pink-500 
    to-rose-500 
    text-white 
    hover:scale-105 
    hover:shadow-lg
  `;
  
  const disabledClasses = `
    bg-gray-300 
    text-gray-500 
    cursor-not-allowed
  `;
  
  const buttonClasses = `
    ${baseClasses} 
    ${disabled || loading ? disabledClasses : enabledClasses} 
    ${className}
  `;
  
  const handleClick = async () => {
    // Não fazer nada se o botão estiver desabilitado
    if (disabled || loading) return;
    
    try {
      setLoading(true);
      
      // Executar ação antes do redirecionamento, se fornecida
      if (onBeforeRedirect) {
        const shouldProceed = await onBeforeRedirect();
        if (!shouldProceed) {
          console.log('[PaymentButton] Redirecionamento cancelado pelo callback onBeforeRedirect');
          setLoading(false);
          return;
        }
      }
      
      // Fazer o redirecionamento usando o utilitário independente
      const success = redirectToPaymentService(data);
      
      // Executar callback de sucesso, se fornecido
      if (success && onRedirectSuccess) {
        onRedirectSuccess();
      } 
      // Executar callback de erro, se fornecido e o redirecionamento falhou
      else if (!success && onRedirectError) {
        onRedirectError(new Error('Falha no redirecionamento'));
      }
      
      // Desabilitar o loading após um tempo, caso o redirecionamento falhe
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error('[PaymentButton] Erro ao redirecionar para pagamento:', error);
      
      // Executar callback de erro, se fornecido
      if (onRedirectError) {
        onRedirectError(error);
      }
      
      setLoading(false);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processando...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          {label}
        </span>
      )}
    </button>
  );
} 