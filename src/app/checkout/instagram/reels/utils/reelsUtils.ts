import axios from 'axios';
import { createClient } from '@/lib/supabase/client';

export interface ProfileData {
  username: string;
  full_name: string;
  profile_pic_url: string;
  follower_count: number;
  following_count: number;
  is_private: boolean;
}

export interface Service {
  id: string;
  name: string;
  preco: number;
  quantidade: number;
  provider_id: string;
  service_variations?: any[];
}

export interface Post {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  thumbnail_url?: string;
  display_url?: string;
  image_versions?: any;
  display_name?: string;
  display_icon?: string;
}

export interface InstagramPost {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
}

export interface PaymentData {
  qrCodeText: string;
  paymentId: string;
  amount: number;
  qrCodeBase64?: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
}

// Função para extrair o código correto de um reel do Instagram
export const extractPostCode = (post: any): string => {
  if (post.code) {
    return post.code;
  }
  
  if (post.shortcode) {
    return post.shortcode;
  }
  
  if (post.link) {
    // Extrair o código do link
    const match = post.link.match(/\/reel\/([^\/\?]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  if (post.url) {
    // Extrair o código da URL
    const match = post.url.match(/\/reel\/([^\/\?]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return post.id?.toString() || '';
};

// Função para buscar reels do Instagram
export const fetchInstagramReels = async (
  username: string, 
  reelsLoaded: boolean, 
  instagramReels: Post[]
): Promise<Post[]> => {
  try {
    // Se já carregou os reels, não precisa buscar novamente
    if (reelsLoaded && instagramReels.length > 0) {
      console.log('Usando reels em cache:', instagramReels.length);
      return instagramReels;
    }

    console.log('Buscando reels para o usuário:', username);
    
    // Usar a API de posts com parâmetro type=reels para filtrar apenas reels
    const response = await fetch(`/api/instagram/posts/${username}?type=reels`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ao buscar reels: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('Resposta da API de posts (filtrada para reels):', responseData);
    
    // Verificar se a resposta tem a estrutura esperada
    if (responseData && typeof responseData === 'object') {
      // Se não tem posts (que neste caso são reels filtrados)
      if (responseData.hasPosts === false) {
        console.log('Nenhum reel encontrado para o usuário:', responseData.message);
        return [];
      }
      
      // Se a resposta é um array, usar diretamente
      if (Array.isArray(responseData)) {
        return responseData.filter(post => post.is_reel);
      }
      
      // Se a resposta tem a propriedade posts, usar ela
      if (Array.isArray(responseData.posts)) {
        return responseData.posts.filter(post => post.is_reel);
      }
    }
    
    // Se chegou aqui, a resposta não tem o formato esperado
    console.error('Formato de resposta inesperado:', responseData);
    return [];
  } catch (error) {
    console.error('Erro ao buscar reels do Instagram:', error);
    throw error;
  }
};

// Função para buscar serviço
export const fetchService = async (externalId: string): Promise<Service | null> => {
  console.log('Buscando serviço com ID:', externalId);
  
  try {
    const supabase = createClient();
    
    // Verificar se temos uma quantidade específica no localStorage
    const checkoutData = localStorage.getItem('checkoutProfileData');
    let quantity = null;
    
    if (checkoutData) {
      const parsedData = JSON.parse(checkoutData);
      quantity = parsedData.quantity;
      console.log('Quantidade encontrada no localStorage:', quantity);
    }

    // Limpar o externalId para garantir que não tenha aspas extras
    const cleanExternalId = externalId ? externalId.replace(/"/g, '') : '';
    console.log('External ID limpo:', cleanExternalId);
    
    // Buscar primeiro pelo external_id
    let { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('external_id', cleanExternalId);
    
    // Se não encontrar pelo external_id, tentar pelo id
    if (!data || data.length === 0) {
      console.log('Serviço não encontrado pelo external_id, tentando pelo id');
      const result = await supabase
        .from('services')
        .select('*')
        .eq('id', cleanExternalId);
        
      data = result.data;
      error = result.error;
    }
    
    // Verificar se encontramos o serviço
    if (error) {
      console.error('Erro ao buscar serviço:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('Nenhum serviço encontrado');
      return null;
    }
    
    // Pegar o primeiro serviço encontrado
    const serviceData = data[0];
    console.log('Serviço encontrado:', serviceData);
    
    // Se temos uma quantidade específica, atualizar o serviço
    if (quantity) {
      console.log('Atualizando quantidade do serviço para:', quantity);
      serviceData.quantidade = parseInt(quantity);
      
      // Atualizar o preço se houver variações de preço
      if (serviceData.service_variations && serviceData.service_variations.length > 0) {
        const selectedVariation = serviceData.service_variations.find(
          (v: any) => v.quantidade === parseInt(quantity)
        );
        
        if (selectedVariation) {
          console.log('Variação de preço encontrada:', selectedVariation);
          serviceData.preco = selectedVariation.preco;
        }
      }
    }
    
    return serviceData;
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return null;
  }
};

// Função para preparar os dados da transação
export const prepareTransactionData = (
  service: Service,
  profileData: ProfileData,
  formData: FormData,
  selectedReels: Post[],
  paymentData: PaymentData
) => {
  // Calcular quantidade de visualizações por reel
  const totalItems = selectedReels.length;
  const totalViews = service.quantidade;
  const viewsPerItem = Math.floor(totalViews / totalItems);
  const remainingViews = totalViews % totalItems;

  // Preparar metadados dos reels com os posts completos
  const reelsMetadata = selectedReels.map((reel, index) => {
    // Usar o campo code correto para a URL do reel
    const reelCode = reel.code || reel.shortcode || reel.id;
    return {
      postId: reel.id,
      postCode: reelCode,
      postLink: `https://instagram.com/reel/${reelCode}`,
      views: index === 0 ? viewsPerItem + remainingViews : viewsPerItem,
      type: 'reel',
      // Incluir o post completo para o provedor
      post: {
        id: reel.id,
        code: reelCode,
        shortcode: reelCode,
        image_url: reel.image_url,
        thumbnail_url: reel.thumbnail_url,
        display_url: reel.display_url,
        caption: typeof reel.caption === 'string' ? reel.caption : 'Sem legenda',
        like_count: reel.like_count || 0,
        comment_count: reel.comment_count || 0
      }
    };
  });

  // Determinar o link a ser enviado no campo target_profile_link
  // Se houver apenas um reel, enviar o link do reel
  // Se houver múltiplos reels, enviar o link do perfil
  let targetLink = `https://www.instagram.com/${profileData.username}/`;
  let specificReelLink = null;
  
  if (selectedReels.length === 1) {
    const reelCode = selectedReels[0].code || selectedReels[0].shortcode || selectedReels[0].id;
    specificReelLink = `https://instagram.com/reel/${reelCode}`;
    targetLink = specificReelLink;
    console.log(' Enviando link específico do reel para o provedor:', targetLink);
  } else {
    console.log(' Enviando link do perfil para o provedor (múltiplos reels):', targetLink);
  }

  // Adicionar os posts completos na raiz do objeto
  const posts = selectedReels.map(reel => {
    const reelCode = reel.code || reel.shortcode || reel.id;
    return {
      id: reel.id,
      code: reelCode,
      shortcode: reelCode,
      url: `https://instagram.com/reel/${reelCode}`,
      image_url: reel.image_url,
      thumbnail_url: reel.thumbnail_url,
      display_url: reel.display_url,
      caption: typeof reel.caption === 'string' ? reel.caption : 'Sem legenda',
      like_count: reel.like_count || 0,
      comment_count: reel.comment_count || 0,
      type: 'reel'
    };
  });

  console.log(' Enviando', posts.length, 'reels completos para o provedor');

  return {
    user_id: formData.name || null,
    order_id: paymentData.paymentId,
    type: 'reels',
    amount: service.preco,
    status: 'pending',
    payment_method: 'pix',
    payment_id: paymentData.paymentId,
    metadata: {
      reels: reelsMetadata,
      serviceDetails: service,
      posts: posts, // Incluir os posts completos na metadata
      specific_reel_link: specificReelLink // Adicionar link específico do reel nos metadados
    },
    customer_name: formData.name || null,
    customer_email: formData.email || null,
    customer_phone: formData.phone || null,
    target_username: profileData.username,
    target_full_name: profileData.full_name,
    payment_qr_code: paymentData.qrCodeText || null,
    payment_external_reference: paymentData.paymentId,
    service_id: service.id,
    provider_id: service.provider_id,
    target_profile_link: targetLink,
    specific_reel_link: specificReelLink, // Adicionar link específico do reel na raiz do objeto
    posts: posts // Incluir os posts completos também na raiz do objeto para compatibilidade
  };
};
