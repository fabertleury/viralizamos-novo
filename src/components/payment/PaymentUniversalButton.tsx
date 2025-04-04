'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  processFullPayment, 
  PaymentServiceData, 
  PaymentProfileData,
  PaymentCustomerData,
  PaymentItemData,
  CreatePaymentData
} from '@/lib/payment/paymentIntegration';

interface PaymentUniversalButtonProps {
  // Dados necessários para o pagamento
  service: PaymentServiceData;
  profile: PaymentProfileData;
  customer: PaymentCustomerData;
  items: PaymentItemData[];
  type: 'curtidas' | 'visualizacao' | 'comentarios' | 'seguidores' | 'reels';
  
  // Opcional
  amount?: number;
  appliedCoupon?: string | null;
  metadata?: any;
  
  // Propriedades de UI
  label?: string;
  disabled?: boolean;
  className?: string;
  
  // Callbacks
  onBeforePayment?: () => Promise<boolean>;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
}

/**
 * Botão universal de pagamento para qualquer serviço
 * Encapsula todo o fluxo de pagamento: criar pagamento, registrar transação, redirecionar
 */
export default function PaymentUniversalButton({
  service,
  profile,
  customer,
  items,
  type,
  amount,
  appliedCoupon,
  metadata,
  label = 'PAGAR COM PIX',
  disabled = false,
  className = '',
  onBeforePayment,
  onPaymentSuccess,
  onPaymentError
}: PaymentUniversalButtonProps) {
  const [loading, setLoading] = useState(false);
  
  // Validar dados mínimos
  const isDataValid = 
    service && 
    service.id && 
    profile && 
    profile.username && 
    customer &&
    customer.name &&
    customer.email &&
    items && 
    items.length > 0;
  
  // Classes para o botão
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
    ${(disabled || loading || !isDataValid) ? disabledClasses : enabledClasses} 
    ${className}
  `;
  
  // Manipulador de clique
  const handleClick = async () => {
    // Não fazer nada se o botão estiver desabilitado
    if (disabled || loading || !isDataValid) return;
    
    try {
      setLoading(true);
      
      // Executar ação antes do pagamento, se fornecida
      if (onBeforePayment) {
        const shouldProceed = await onBeforePayment();
        if (!shouldProceed) {
          console.log('[PaymentButton] Pagamento cancelado pelo callback onBeforePayment');
          setLoading(false);
          return;
        }
      }
      
      // Preparar dados completos para o pagamento
      const paymentData: CreatePaymentData = {
        service,
        profile,
        customer,
        items,
        type,
        amount,
        appliedCoupon,
        metadata
      };
      
      // Processar o pagamento (criar pagamento, registrar transação, redirecionar)
      const result = await processFullPayment(paymentData);
      
      // Verificar resultado
      if (result.success) {
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }
      
      // Desabilitar o loading após um tempo, caso o redirecionamento falhe
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error('[PaymentButton] Erro ao processar pagamento:', error);
      
      // Mostrar mensagem de erro
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido ao processar pagamento');
      
      // Executar callback de erro, se fornecido
      if (onPaymentError) {
        onPaymentError(error);
      }
      
      setLoading(false);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading || !isDataValid}
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