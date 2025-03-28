import axios from 'axios';
import { toast } from 'sonner';
import { Post, ProfileData, Service, PaymentData } from '../types';

// Definições para o novo sistema de pagamento PIX
interface PixPaymentData {
  service: {
    id: string;
    name: string;
    price?: number;
    preco?: number;
    provider_id?: string;
  };
  profile: {
    username: string;
    full_name?: string;
    link?: string;
  };
  customer: {
    name?: string;
    email: string;
    phone?: string;
  };
  posts?: Array<{
    id?: string;
    code?: string;
    url?: string;
    caption?: string;
  }>;
  amount?: number;
}

export interface PixPaymentResponse {
  success: boolean;
  error?: string;
  transaction_id?: string;
  payment_id?: string;
  qr_code?: string;
  qr_code_base64?: string;
  is_duplicate?: boolean;
  status?: string;
  reused?: boolean;
  status_code?: number;
}

interface PaymentRequestData {
  service_id: string;
  amount: number;
  original_amount: number;
  discount_amount: number;
  coupon_code: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata: {
    profile: ProfileData;
    posts: Post[];
    reels: Post[];
    post_ids: string[];
    reel_ids: string[];
    post_codes: string[];
    reel_codes: string[];
    service_name: string;
    service_quantity: number;
  };
}

// Definição do tipo de dados da transação
interface TransactionData {
  user_id: string | null;
  order_id: string;
  type: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_id: string;
  metadata: {
    posts: Array<{
      postId: string;
      postCode: string;
      postLink: string;
      likes: number;
    }>;
    serviceDetails: Service;
    [key: string]: unknown;
  };
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  target_username: string;
  target_full_name: string;
  payment_qr_code: string | null;
  payment_external_reference: string;
  service_id: string;
  target_profile_link: string;
}

export const createPaymentRequest = async (
  paymentRequestData: PaymentRequestData
): Promise<PaymentData> => {
  const response = await fetch('/api/payment/pix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentRequestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar pagamento');
  }

  const paymentResponse = await response.json();
  
  // Garantir que temos todos os dados necessários
  if (!paymentResponse.id || !paymentResponse.qr_code) {
    throw new Error('Dados de pagamento incompletos');
  }

  return {
    qrCodeText: paymentResponse.qr_code,
    paymentId: paymentResponse.id,
    amount: paymentRequestData.amount,
    qrCodeBase64: paymentResponse.qr_code_base64
  };
};

export const prepareTransactionData = (
  service: Service,
  profileData: ProfileData,
  selectedPosts: Post[],
  selectedReels: Post[],
  formData: { name: string; email: string; phone: string },
  pixData: PaymentData
) => {
  // Calcular quantidade de likes por post
  const totalItems = selectedPosts.length + selectedReels.length;
  const totalLikes = service.quantidade;
  const likesPerItem = Math.floor(totalLikes / totalItems);
  const remainingLikes = totalLikes % totalItems;

  // Preparar metadados dos posts
  const postsMetadata = selectedPosts.map((post, index) => {
    // Usar o campo code correto para a URL do post
    const postCode = post.code || post.shortcode || post.id;
    return {
      postId: post.id,
      postCode: postCode,
      postLink: `https://instagram.com/p/${postCode}`,
      likes: index === 0 ? likesPerItem + remainingLikes : likesPerItem
    };
  });

  const reelsMetadata = selectedReels.map((reel) => {
    // Usar o campo code correto para a URL do reel
    const reelCode = reel.code || reel.shortcode || reel.id;
    return {
      postId: reel.id,
      postCode: reelCode,
      postLink: `https://instagram.com/p/${reelCode}`,
      likes: likesPerItem
    };
  });

  return {
    user_id: formData.name || null,
    order_id: pixData.paymentId,
    type: 'curtidas',
    amount: pixData.amount,
    status: 'pending',
    payment_method: 'pix',
    payment_id: pixData.paymentId,
    metadata: {
      posts: [...postsMetadata, ...reelsMetadata],
      serviceDetails: service
    },
    customer_name: formData.name || null,
    customer_email: formData.email || null,
    customer_phone: formData.phone || null,
    target_username: profileData.username,
    target_full_name: profileData.full_name,
    payment_qr_code: pixData.qrCodeText || null,
    payment_external_reference: pixData.paymentId,
    service_id: service.id,
    target_profile_link: `https://www.instagram.com/${profileData.username}/`
  };
};

export const sendTransactionToAdmin = async (
  transactionData: TransactionData
): Promise<boolean> => {
  try {
    // Adaptar os dados para o formato esperado pelo novo endpoint
    const adaptedData = {
      user_id: transactionData.user_id || '',
      service_id: transactionData.service_id,
      total_amount: transactionData.amount,
      payment_method: transactionData.payment_method,
      payment_id: transactionData.payment_id,
      status: transactionData.status || 'pending',
      target_username: transactionData.target_username,
      profile_username: transactionData.target_username,
      customer_name: transactionData.customer_name,
      customer_email: transactionData.customer_email,
      customer_phone: transactionData.customer_phone,
      service_name: transactionData.metadata.serviceDetails.name,
      service_type: transactionData.type,
      action: 'purchase',
      payment_data: {
        qr_code: transactionData.payment_qr_code,
        external_reference: transactionData.payment_external_reference
      },
      posts: transactionData.metadata.posts.map(post => ({
        id: post.postId,
        url: post.postLink,
        type: post.postLink.includes('/reel/') ? 'REEL' : 'POST',
        caption: '',
        media_type: post.postLink.includes('/reel/') ? 'VIDEO' : 'IMAGE'
      }))
    };
    
    // Usar o novo endpoint que salva explicitamente na tabela core_transactions_v2
    const response = await axios.post('/api/core/transactions', adaptedData);
    
    if (response.status === 200 || response.status === 201) {
      toast.success('Transação registrada com sucesso');
      return true;
    } else {
      toast.error('Erro ao registrar transação');
      return false;
    }
  } catch (error) {
    console.error('Erro ao enviar transação:', error);
    toast.error('Falha ao processar transação');
    return false;
  }
};

export async function createPixPayment(data: PixPaymentData): Promise<PixPaymentResponse> {
  try {
    console.log('Iniciando chamada para API de pagamento PIX', {
      serviceId: data.service.id,
      profile: data.profile.username,
      hasAmount: !!data.amount,
      postCount: data.posts?.length || 0
    });
    
    // Usar o novo endpoint para criar pagamentos PIX
    const response = await fetch('/api/core/payment/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Verificar se é um caso de pagamento duplicado
    if (response.status === 409) {
      const duplicateData = await response.json();
      console.log('Pagamento duplicado detectado:', duplicateData);
      return { 
        success: false, 
        error: duplicateData.message || 'Já existe um pagamento em andamento para este serviço e perfil', 
        is_duplicate: true,
        transaction_id: duplicateData.transaction_id,
        payment_id: duplicateData.payment_id,
        status: duplicateData.status,
        reused: duplicateData.reused
      };
    }

    // Erros gerais da API
    if (!response.ok) {
      let errorMessage = 'Erro ao criar pagamento PIX';
      let errorDetails = {};
      
      try {
        const errorData = await response.json();
        console.error('Erro detalhado ao criar pagamento PIX:', errorData);
        errorMessage = errorData.error || errorMessage;
        errorDetails = errorData;
      } catch (parseError) {
        console.error('Erro ao analisar resposta de erro:', parseError);
        // Se não conseguir analisar a resposta, use o texto da resposta
        try {
          const textResponse = await response.text();
          console.error('Resposta de texto bruto:', textResponse);
          errorMessage = textResponse || errorMessage;
        } catch (textError) {
          console.error('Não foi possível obter o texto da resposta:', textError);
        }
      }
      
      // Log mais detalhado para diagnóstico
      console.error(`Falha na API (${response.status}): ${errorMessage}`, {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails,
        url: '/api/core/payment/pix',
        requestData: { 
          service_id: data.service.id,
          profile_username: data.profile.username,
          amount: data.amount,
          customer_email_partial: data.customer.email ? data.customer.email.slice(0, 3) + '***' : 'N/A',
          posts_count: data.posts?.length || 0
        }
      });
      
      return { 
        success: false, 
        error: errorMessage,
        status_code: response.status
      };
    }

    try {
      const responseData = await response.json();
      console.log('Resposta da API de pagamento:', {
        transaction_id: responseData.transaction_id,
        payment_id: responseData.payment_id,
        has_qr_code: !!responseData.qr_code,
        has_qr_base64: !!responseData.qr_code_base64,
        reused: responseData.reused
      });
      
      return {
        success: true,
        transaction_id: responseData.transaction_id,
        payment_id: responseData.payment_id,
        qr_code: responseData.qr_code,
        qr_code_base64: responseData.qr_code_base64,
        reused: responseData.reused
      };
    } catch (jsonError) {
      console.error('Erro ao processar resposta JSON do pagamento:', jsonError);
      return {
        success: false,
        error: 'Erro ao processar resposta do servidor',
        status_code: 500
      };
    }
  } catch (error) {
    console.error('Exceção ao criar pagamento PIX:', error);
    const errorMessage = error instanceof Error ? 
      `Erro: ${error.message}` : 
      'Erro desconhecido ao processar pagamento';
    
    console.error('Detalhes da exceção:', {
      message: errorMessage,
      serviceId: data.service.id,
      profileUsername: data.profile.username
    });
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}
