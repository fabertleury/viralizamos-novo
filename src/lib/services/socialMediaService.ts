import axios from 'axios';
import { createClient } from '@/lib/supabase/server';

interface OrderParams {
  service: string;
  link?: string;
  quantity?: number;
  username?: string;
  transaction_id?: string;
  provider_id?: string; // ID do provedor no banco de dados
  service_id?: string; // ID do serviço no banco de dados
}

interface Provider {
  id: string;
  name: string;
  api_key: string;
  api_url: string;
  status: boolean;
}

interface Service {
  id: string;
  name: string;
  provider_id: string;
  external_id: string;
}

export class SocialMediaService {
  private supabase = createClient();
  private defaultProvider: Provider | null = null;

  constructor(provider: Provider | null = null) {
    this.defaultProvider = provider;
  }

  /**
   * Extrai o código de um post do Instagram a partir de uma URL
   * @param url URL do post
   * @returns Código do post
   */
  extractPostCode(url: string): string {
    console.log('[SocialMediaService] Extraindo código do post de:', url);
    
    // Se a URL já é um código curto, retorná-lo diretamente
    if (!url.includes('/') && !url.includes('.')) {
      console.log('[SocialMediaService] URL já é um código:', url);
      return url;
    }
    
    try {
      // Tentar extrair o código da URL
      const regex = /instagram\.com\/(?:p|reel)\/([^\/\?]+)/i;
      const match = url.match(regex);
      
      if (match && match[1]) {
        const code = match[1];
        console.log('[SocialMediaService] Código extraído:', code);
        return code;
      }
      
      // Se não conseguiu extrair, tentar outro formato
      const altRegex = /\/([^\/\?]+)\/?$/;
      const altMatch = url.match(altRegex);
      
      if (altMatch && altMatch[1]) {
        const code = altMatch[1];
        console.log('[SocialMediaService] Código extraído (formato alternativo):', code);
        return code;
      }
      
      // Se não conseguiu extrair, retornar a URL original
      console.log('[SocialMediaService] Não foi possível extrair o código, retornando URL original');
      return url;
    } catch (error) {
      console.error('[SocialMediaService] Erro ao extrair código do post:', error);
      return url;
    }
  }

  /**
   * Formata uma URL de post do Instagram para o formato padrão
   * @param url URL ou código do post
   * @returns URL formatada
   */
  formatInstagramPostUrl(url: string): string {
    // Se a URL já está no formato correto, retorná-la
    if (url.match(/^https:\/\/instagram\.com\/p\/[^\/]+$/i)) {
      return url;
    }
    
    // Extrair o código do post
    const code = this.extractPostCode(url);
    
    // Formatar a URL
    return `https://instagram.com/p/${code}`;
  }

  // Buscar provedor no Supabase
  private async getProvider(providerId: string): Promise<Provider | null> {
    // Se já temos um provedor padrão e o ID corresponde, retornar ele diretamente
    if (this.defaultProvider && this.defaultProvider.id === providerId) {
      console.log(`✅ Usando provedor: ${this.defaultProvider.name}`);
      return this.defaultProvider;
    }
    
    try {
      console.log(`🔍 Buscando provedor com ID: ${providerId}`);
      
      // Verificar se o provider_id é um UUID válido
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(providerId);
      
      if (!isUUID) {
        console.error(`❌ Provider_id "${providerId}" não é um UUID válido.`);
        return null;
      }
      
      // Buscar o provedor pelo ID
      const { data: provider, error } = await this.supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (error) {
        console.error('❌ Erro ao buscar provedor:', error);
        return null;
      }
      
      if (!provider) {
        console.error(`❌ Provedor com ID ${providerId} não encontrado`);
        return null;
      }
      
      if (!provider.api_key || !provider.api_url) {
        console.error(`❌ Provedor ${provider.name} não tem API key ou URL configurada`);
        return null;
      }
      
      console.log(`✅ Provedor encontrado: ${provider.name}`);
      return provider;
    } catch (error) {
      console.error('❌ Erro ao buscar provedor:', error);
      return null;
    }
  }

  async createOrder(params: OrderParams): Promise<{ order: number, orderId?: string, status?: string }> {
    try {
      // Formatar a URL do Instagram corretamente
      const formattedLink = this.formatInstagramPostUrl(params.link);
      console.log('[SocialMediaService] Link formatado:', formattedLink);
      
      // Primeiro, verificar se temos um service_id e buscar o serviço completo do banco de dados
      let provider = null;
      let serviceData = null;
      
      if (params.service_id) {
        console.log('[SocialMediaService] Buscando serviço completo do banco de dados com ID:', params.service_id);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', params.service_id)
          .single();
          
        if (error) {
          console.error('[SocialMediaService] Erro ao buscar serviço:', error);
        } else if (data) {
          serviceData = data;
          console.log('[SocialMediaService] Serviço encontrado no banco de dados:', {
            id: serviceData.id,
            name: serviceData.name,
            provider_id: serviceData.provider_id,
            external_id: serviceData.external_id
          });
          
          // Se o serviço tem provider_id, buscar o provedor
          if (serviceData.provider_id) {
            provider = await this.getProvider(serviceData.provider_id);
            if (provider) {
              console.log('[SocialMediaService] Provedor encontrado pelo ID do serviço:', provider.name);
            }
          }
        }
      }
      
      // Se não conseguimos obter o provedor pelo service_id, tentar pelo provider_id dos parâmetros
      if (!provider && params.provider_id) {
        provider = await this.getProvider(params.provider_id);
        if (provider) {
          console.log('[SocialMediaService] Provedor encontrado pelo provider_id dos parâmetros:', provider.name);
        }
      }
      
      // Se ainda não temos um provedor, usar o provedor padrão (se disponível)
      if (!provider && this.defaultProvider) {
        provider = this.defaultProvider;
        console.log('[SocialMediaService] Usando provedor padrão:', provider.name);
      }
      
      if (!provider) {
        throw new Error('Provedor não encontrado. Verifique o cadastro do serviço ou configure um provedor padrão.');
      }
      
      console.log('[SocialMediaService] Usando provedor:', provider.name);
      
      // Determinar o ID do serviço a ser usado
      let serviceId = params.service;
      
      // Se temos o serviço do banco de dados e ele tem external_id, usar esse ID
      if (serviceData && serviceData.external_id) {
        serviceId = serviceData.external_id;
        console.log('[SocialMediaService] Usando external_id do serviço do banco de dados:', serviceId);
      }
      
      // Verificar se o serviço existe no provedor
      if (provider.services && Array.isArray(provider.services)) {
        const serviceExists = provider.services.some(s => s.id === serviceId);
        if (!serviceExists) {
          console.warn(`Serviço ${serviceId} não encontrado no provedor ${provider.name}. Verificando mapeamento...`);
          
          // Verificar se temos um mapeamento para este serviço
          if (provider.service_mapping && provider.service_mapping[serviceId]) {
            const mappedServiceId = provider.service_mapping[serviceId];
            console.log(`Usando serviço mapeado: ${serviceId} -> ${mappedServiceId}`);
            serviceId = mappedServiceId;
          } else {
            console.warn(`Nenhum mapeamento encontrado para o serviço ${serviceId} no provedor ${provider.name}`);
          }
        }
      }
      
      // Criar os parâmetros da requisição
      const requestParams = new URLSearchParams();
      requestParams.append('key', provider.api_key);
      requestParams.append('action', 'add');
      requestParams.append('service', serviceId);
      requestParams.append('link', formattedLink);
      
      if (params.quantity) {
        requestParams.append('quantity', params.quantity.toString());
      }
      
      if (params.username) {
        requestParams.append('username', params.username);
      }
      
      console.log('Enviando pedido para o provedor:', {
        url: provider.api_url,
        service: serviceId,
        link: formattedLink,
        quantity: params.quantity
      });
      
      // Fazer a requisição para a API do provedor
      const response = await axios.post(provider.api_url, requestParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Resposta do provedor:', response.data);
      
      // Verificar se a resposta foi bem-sucedida
      if (response.data.error) {
        throw new Error(`Erro do provedor: ${response.data.error}`);
      }
      
      // Normalizar a resposta
      let orderId = '';
      let status = 'processing';
      
      if (response.data.order) {
        orderId = response.data.order.toString();
      } else if (response.data.id) {
        orderId = response.data.id.toString();
      }
      
      if (response.data.status) {
        status = response.data.status.toLowerCase();
      }
      
      return {
        order: parseInt(orderId) || 0,
        orderId,
        status
      };
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      throw new Error(`Erro ao criar pedido: ${error.message}`);
    }
  }

  async checkOrderStatus(orderId: number, providerId: string) {
    try {
      // Buscar o provedor
      const provider = await this.getProvider(providerId);
      
      if (!provider) {
        throw new Error(`Provedor com ID ${providerId} não encontrado ou não configurado`);
      }
      
      // Criar os parâmetros da requisição usando URLSearchParams para garantir o formato correto
      const requestParams = new URLSearchParams();
      requestParams.append('key', provider.api_key);
      requestParams.append('action', 'status');
      requestParams.append('order', orderId.toString());

      console.log(`🔍 Verificando status do pedido ${orderId} no provedor ${provider.name}`);
      console.log('Parâmetros da requisição:', {
        url: provider.api_url,
        key: '[REDACTED]',
        action: 'status',
        order: orderId
      });
      
      // Fazer a requisição para a API do provedor com o formato correto
      const response = await axios.post(provider.api_url, requestParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Resposta do provedor para status do pedido:', response.data);
      
      // Verificar se a resposta contém um erro
      if (response.data.error) {
        throw new Error(`Erro do provedor: ${response.data.error}`);
      }
      
      // Normalizar a resposta para um formato padrão
      return {
        status: response.data.status?.toLowerCase() || 'unknown',
        start_count: response.data.start_count || '0',
        remains: response.data.remains || '0',
        charge: response.data.charge || '0',
        currency: response.data.currency || 'USD',
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
      throw error;
    }
  }
}
