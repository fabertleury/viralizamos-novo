/**
 * Módulo de redirecionamento para o microserviço de pagamentos
 * Independente do React e de qualquer outro componente
 */

import { ServicePaymentProps } from '@/types/payment';
import { PaymentData } from '@/interfaces/payment';

// Tipos para os dados de pagamento
export interface PaymentRedirectData {
  // Dados do serviço
  serviceId: string;
  serviceName?: string;
  
  // Dados do perfil
  profileUsername: string;
  
  // Dados financeiros
  amount: number;
  
  // Dados do cliente
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  
  // Configurações
  returnUrl?: string;
}

/**
 * Redireciona para o serviço de pagamento
 * Esta função centraliza a lógica de redirecionamento para microserviço de pagamentos
 */
export async function redirectToPaymentService(paymentData: PaymentData): Promise<boolean> {
  try {
    console.log('[PaymentRedirect] Preparando redirecionamento para pagamento:', paymentData);

    // URL do microserviço de pagamento
    let paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL;
    if (!paymentServiceUrl) {
      console.warn('[PaymentRedirect] URL do serviço de pagamento não configurada em variáveis de ambiente. Usando URL padrão.');
      paymentServiceUrl = 'https://pagamentos.viralizamos.com';
    }

    // Dados para enviar ao microserviço
    const requestData = {
      amount: paymentData.amount,
      service_id: paymentData.serviceId,
      profile_username: paymentData.profileUsername,
      customer_email: paymentData.customerEmail || 'cliente@viralizamos.com',
      customer_name: paymentData.customerName || 'Cliente',
      service_name: paymentData.serviceName || 'Serviço Viralizamos',
      return_url: paymentData.returnUrl || window.location.href,
      additional_data: {
        posts: paymentData.posts || [],
        quantity: paymentData.quantity || 1
      }
    };

    console.log('[PaymentRedirect] Enviando dados para API de solicitação de pagamento:', requestData);

    try {
      // Tentar usar o novo método baseado em banco de dados
      const response = await fetch(`${paymentServiceUrl}/api/payment-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Falha na criação da solicitação de pagamento: ${response.status}`);
      }

      const data = await response.json();
      console.log('[PaymentRedirect] Solicitação de pagamento criada com sucesso:', data);

      // Redirecionar para a URL de pagamento
      if (data.payment_url) {
        console.log('[PaymentRedirect] Redirecionando para:', data.payment_url);
        window.location.href = data.payment_url;
        return true;
      } else {
        throw new Error('URL de pagamento não retornada pela API');
      }
    } catch (apiError) {
      console.error('[PaymentRedirect] Erro ao criar solicitação via API, usando fallback:', apiError);
      
      // Fallback: usar método antigo baseado em localStorage
      const timestamp = Date.now().toString(36);
      const orderId = `${timestamp}-${paymentData.serviceId.substring(0, 8).replace(/[^a-zA-Z0-9]/g, '')}`;
      const storageKey = `payment_data_${orderId}`;
      
      localStorage.setItem(storageKey, JSON.stringify({
        amount: paymentData.amount,
        service_id: paymentData.serviceId,
        profile_username: paymentData.profileUsername,
        customer_email: paymentData.customerEmail || 'cliente@viralizamos.com',
        customer_name: paymentData.customerName || 'Cliente',
        service_name: paymentData.serviceName || 'Serviço Viralizamos',
        return_url: paymentData.returnUrl || window.location.href
      }));
      
      const fallbackUrl = `${paymentServiceUrl}/pagamento/pix?oid=${orderId}`;
      console.log('[PaymentRedirect] Usando método antigo, redirecionando para:', fallbackUrl);
      window.location.href = fallbackUrl;
      return true;
    }
  } catch (error) {
    console.error('[PaymentRedirect] Erro crítico no redirecionamento para pagamento:', error);
    return false;
  }
}

/**
 * Redireciona o usuário diretamente para a página de pagamento
 * Esta abordagem evita erros relacionados ao ciclo de vida do React
 */
export function directRedirectToPaymentService(data: ServicePaymentProps) {
  // Salvar dados de perfil no localStorage para serem recuperados
  // pela página intermediária de pagamento
  localStorage.setItem('checkoutProfileData', JSON.stringify(data));
  
  // Extrair apenas os dados necessários para a URL
  const { serviceId, amount } = data;
  
  // Criar URL simplificada
  const queryParams = new URLSearchParams();
  queryParams.set('sid', serviceId); // Somente o ID do serviço, sem nome
  queryParams.set('a', amount.toString());
  
  // Redirecionar para a página intermediária com parâmetros mínimos
  window.location.href = `/pagamento-direto?${queryParams.toString()}`;
} 