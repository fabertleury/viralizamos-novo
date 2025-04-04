/**
 * Módulo de integração com o sistema de pagamentos
 * Centraliza todos os fluxos de pagamento para serem usados em qualquer serviço
 */

import { toast } from 'sonner';
import axios from 'axios';
import { redirectToPaymentService } from './redirectToPaymentService';

// Tipos para os dados necessários

// Perfil do Instagram
export interface PaymentProfileData {
  username: string;
  full_name?: string;
  profile_pic_url?: string;
  follower_count?: number;
  following_count?: number;
  is_private?: boolean;
  [key: string]: any; // Para outros campos que podem estar presentes
}

// Serviço
export interface PaymentServiceData {
  id: string;
  name: string;
  preco: number;
  price?: number;
  quantidade: number;
  quantity?: number;
  provider_id?: string;
  [key: string]: any; // Para outros campos que podem estar presentes
}

// Cliente
export interface PaymentCustomerData {
  name: string;
  email: string;
  phone: string;
  [key: string]: any; // Para outros campos que podem estar presentes
}

// Item (post, reel, etc)
export interface PaymentItemData {
  id: string;
  code?: string;
  shortcode?: string;
  image_url?: string;
  url?: string;
  caption?: string;
  is_reel?: boolean;
  type?: string;
  [key: string]: any; // Para outros campos que podem estar presentes
}

// Resultado da criação do pagamento
export interface PaymentCreationResult {
  success: boolean;
  paymentId?: string;
  qrCodeText?: string;
  qrCodeBase64?: string;
  amount?: number;
  error?: string;
  transactionId?: string;
}

// Dados completos para criar pagamento
export interface CreatePaymentData {
  service: PaymentServiceData;
  profile: PaymentProfileData;
  customer: PaymentCustomerData;
  items: PaymentItemData[];
  type: 'curtidas' | 'visualizacao' | 'comentarios' | 'seguidores' | 'reels';
  amount?: number; // Valor customizado (com desconto, por exemplo)
  appliedCoupon?: string | null;
  metadata?: any; // Dados adicionais específicos de cada serviço
}

// Dados para registrar transação
export interface RegisterTransactionData {
  paymentId: string;
  qrCodeText: string;
  qrCodeBase64?: string;
  service: PaymentServiceData;
  profile: PaymentProfileData;
  customer: PaymentCustomerData;
  items: PaymentItemData[];
  type: string;
  amount: number;
  metadata?: any;
}

/**
 * Cria um pagamento via API
 * @param data Dados para criar o pagamento
 * @returns Resultado da criação do pagamento
 */
export async function createPayment(data: CreatePaymentData): Promise<PaymentCreationResult> {
  try {
    console.log('[PAGAMENTO] Criando pagamento com dados:', {
      serviceId: data.service.id,
      profileUsername: data.profile.username,
      amount: data.amount || data.service.preco || data.service.price,
      items: data.items.length
    });
    
    // Preparar os dados para a API de pagamento
    const apiData = {
      service: {
        id: data.service.id,
        name: data.service.name,
        price: data.amount || data.service.preco || data.service.price,
        preco: data.amount || data.service.preco || data.service.price,
        quantity: data.service.quantidade || data.service.quantity,
        quantidade: data.service.quantidade || data.service.quantity,
        provider_id: data.service.provider_id || '1'
      },
      profile: data.profile,
      customer: data.customer,
      posts: data.items, // A API espera "posts" mesmo para outros tipos de itens
      amount: data.amount || data.service.preco || data.service.price,
      coupon_code: data.appliedCoupon
    };
    
    console.log('[PAGAMENTO] Enviando dados para API:', apiData);
    
    // Fazer a requisição para a API
    const response = await fetch('/api/core/payment/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Erro ao criar pagamento');
    }
    
    const paymentResponse = await response.json();
    
    console.log('[PAGAMENTO] Resposta da API:', {
      id: paymentResponse.payment_id || paymentResponse.id,
      hasQrCode: !!paymentResponse.qr_code,
      hasBase64: !!paymentResponse.qr_code_base64
    });
    
    // Verificar se temos todos os dados necessários
    if (!paymentResponse.payment_id && !paymentResponse.id) {
      throw new Error('ID do pagamento não retornado pela API');
    }
    
    if (!paymentResponse.qr_code) {
      throw new Error('Código QR não retornado pela API');
    }
    
    return {
      success: true,
      paymentId: paymentResponse.payment_id || paymentResponse.id,
      qrCodeText: paymentResponse.qr_code,
      qrCodeBase64: paymentResponse.qr_code_base64,
      amount: apiData.amount
    };
  } catch (error) {
    console.error('[PAGAMENTO] Erro ao criar pagamento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar pagamento'
    };
  }
}

/**
 * Registra uma transação na API de admin
 * @param data Dados da transação
 * @returns Sucesso ou falha no registro
 */
export async function registerTransaction(data: RegisterTransactionData): Promise<{ success: boolean, transactionId?: string, error?: string }> {
  try {
    console.log('[PAGAMENTO] Registrando transação para pagamento:', data.paymentId);
    
    // Calcular quantidade de itens por post
    const totalItems = data.items.length;
    const totalQuantity = data.service.quantidade || data.service.quantity || 0;
    const itemsPerPost = Math.floor(totalQuantity / totalItems);
    const remainingItems = totalQuantity % totalItems;
    
    // Preparar metadados dos itens
    const itemsMetadata = data.items.map((item, index) => {
      // Determinar o tipo do item
      const itemType = item.is_reel || item.type === 'reel' ? 'reel' : 'post';
      
      // Usar o código correto para a URL
      const itemCode = item.code || item.shortcode || item.id;
      
      // URL para o item
      const itemLink = itemType === 'reel' 
        ? `https://instagram.com/reel/${itemCode}`
        : `https://instagram.com/p/${itemCode}`;
      
      return {
        postId: item.id,
        postCode: itemCode,
        postLink: itemLink,
        // Adicionar items extras ao primeiro item
        [data.type]: index === 0 ? itemsPerPost + remainingItems : itemsPerPost,
        type: itemType
      };
    });
    
    // Dados completos da transação
    const transactionData = {
      user_id: data.customer.name || null,
      order_id: data.paymentId,
      type: data.type,
      amount: data.amount,
      status: 'pending',
      payment_method: 'pix',
      payment_id: data.paymentId,
      metadata: {
        posts: itemsMetadata,
        serviceDetails: data.service,
        ...data.metadata
      },
      customer_name: data.customer.name || null,
      customer_email: data.customer.email || null,
      customer_phone: data.customer.phone || null,
      target_username: data.profile.username,
      target_full_name: data.profile.full_name,
      payment_qr_code: data.qrCodeText || null,
      payment_external_reference: data.paymentId,
      service_id: data.service.id,
      provider_id: data.service.provider_id || '1',
      target_profile_link: `https://www.instagram.com/${data.profile.username}/`
    };
    
    console.log('[PAGAMENTO] Enviando dados da transação:', {
      paymentId: data.paymentId,
      type: data.type,
      amount: data.amount
    });
    
    // Enviar a transação para o backend admin
    const response = await axios.post('/api/core/transactions', transactionData);
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Erro ao registrar transação: ${response.status}`);
    }
    
    console.log('[PAGAMENTO] Transação registrada com sucesso');
    
    return { 
      success: true,
      transactionId: response.data.id
    };
  } catch (error) {
    console.error('[PAGAMENTO] Erro ao registrar transação:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao registrar transação'
    };
  }
}

/**
 * Fluxo completo de pagamento: criar pagamento, registrar transação e redirecionar
 * @param data Dados completos para o fluxo de pagamento
 * @returns Resultado do fluxo
 */
export async function processFullPayment(data: CreatePaymentData): Promise<{ success: boolean, error?: string }> {
  try {
    console.log('[PAGAMENTO] Iniciando fluxo completo de pagamento');
    
    // Criar o pagamento
    const paymentResult = await createPayment(data);
    
    if (!paymentResult.success || !paymentResult.paymentId) {
      throw new Error(paymentResult.error || 'Falha ao criar pagamento');
    }
    
    // Registrar a transação
    const transactionResult = await registerTransaction({
      paymentId: paymentResult.paymentId,
      qrCodeText: paymentResult.qrCodeText || '',
      qrCodeBase64: paymentResult.qrCodeBase64,
      service: data.service,
      profile: data.profile,
      customer: data.customer,
      items: data.items,
      type: data.type,
      amount: paymentResult.amount || data.amount || data.service.preco,
      metadata: data.metadata
    });
    
    if (!transactionResult.success) {
      console.warn('[PAGAMENTO] Falha ao registrar transação, mas continuando com redirecionamento:', transactionResult.error);
      // Não impedir o redirecionamento se a transação falhar
    }
    
    // Valor final a ser pago
    const finalAmount = paymentResult.amount || data.amount || data.service.preco;
    
    // Redirecionar para o microserviço de pagamento
    const redirectResult = redirectToPaymentService({
      serviceId: data.service.id,
      serviceName: data.service.name,
      profileUsername: data.profile.username,
      amount: finalAmount,
      customerName: data.customer.name,
      customerEmail: data.customer.email,
      customerPhone: data.customer.phone,
      returnUrl: '/agradecimento'
    });
    
    if (!redirectResult) {
      throw new Error('Falha ao redirecionar para o microserviço de pagamento');
    }
    
    return { success: true };
  } catch (error) {
    console.error('[PAGAMENTO] Erro no fluxo completo de pagamento:', error);
    
    // Mostrar mensagem de erro
    toast.error(error instanceof Error ? error.message : 'Erro desconhecido ao processar pagamento');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar pagamento'
    };
  }
} 