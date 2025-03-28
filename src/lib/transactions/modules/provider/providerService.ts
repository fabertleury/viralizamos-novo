import axios from 'axios';
import { rateLimiter } from '../rateLimit';
import { Provider, ProviderRequestData, OrderResponse } from '../types';
import { createClient } from '@/lib/supabase/server';

/**
 * Serviço para interagir com provedores externos
 */
export class ProviderService {
  private supabase = createClient();
  
  /**
   * Construtor do serviço de provedores
   * @param databaseService Instância opcional do serviço de banco de dados
   */
  constructor(private databaseService?: any) {
    // Se não for fornecido, deixar como undefined
  }
  
  /**
   * Busca um provedor pelo ID do serviço
   * @param serviceId ID do serviço
   * @returns Provedor encontrado ou null
   */
  async getProviderByServiceId(serviceId: string): Promise<Provider | null> {
    console.log(`[ProviderService] Buscando provedor para serviço: ${serviceId}`);
    
    try {
      const { data: service, error: serviceError } = await this.supabase
        .from('services')
        .select('provider_id')
        .eq('id', serviceId)
        .single();
        
      if (serviceError || !service || !service.provider_id) {
        console.warn(`[ProviderService] Serviço ${serviceId} não encontrado ou não tem provider_id`);
        return null;
      }
      
      const { data: provider, error: providerError } = await this.supabase
        .from('providers')
        .select('*')
        .eq('id', service.provider_id)
        .single();
        
      if (providerError || !provider) {
        console.warn(`[ProviderService] Provedor ${service.provider_id} não encontrado`);
        return null;
      }
      
      return provider as Provider;
    } catch (error) {
      console.error('[ProviderService] Erro ao buscar provedor:', error);
      return null;
    }
  }
  
  /**
   * Envia um pedido para o provedor
   * @param provider Provedor para enviar o pedido
   * @param data Dados do pedido
   * @returns Resposta do provedor
   */
  async createOrder(provider: Provider, data: ProviderRequestData): Promise<OrderResponse> {
    if (!provider.api_url) {
      throw new Error('URL da API do provedor não configurada');
    }
    
    console.log(`[ProviderService] Enviando pedido para ${provider.name} (${provider.api_url})`);
    console.log(`[ProviderService] Dados para envio:`, data);
    
    // Validar que estamos usando o external_id e não o service_id
    if (data.service) {
      // Tenta buscar o serviço para verificar se o ID enviado é o external_id correto
      try {
        const { data: serviceData } = await this.supabase
          .from('services')
          .select('id, name, external_id')
          .eq('id', data.service)
          .maybeSingle();
          
        if (serviceData && serviceData.external_id) {
          // Se o ID enviado é na verdade o service_id interno, use o external_id
          console.log(`[ProviderService] CORREÇÃO IMPORTANTE: Usando external_id (${serviceData.external_id}) em vez do service_id (${data.service})`);
          console.log(`[ProviderService] Serviço: ${serviceData.name}`);
          
          // Substituir o ID do serviço pelo external_id
          data.service = serviceData.external_id.toString();
        }
      } catch (error) {
        console.log(`[ProviderService] Erro ao verificar service_id. Continuando com o ID fornecido:`, data.service);
      }
    }
    
    // Usar o rate limiter para evitar erros 429
    return rateLimiter.executeWithRateLimit(async () => {
      try {
        const response = await axios.post(provider.api_url!, {
          key: data.key || provider.api_key,
          action: data.action || 'add',
          service: data.service,
          link: data.link,
          quantity: data.quantity
        });
        
        console.log(`[ProviderService] Resposta do provedor ${provider.name}:`, response.data);
        
        // Verificar se a resposta contém o ID do pedido
        if (!response.data.order && !response.data.orderId) {
          console.error('[ProviderService] Resposta do provedor não contém ID do pedido:', response.data);
          
          // Em vez de lançar erro, retornar uma resposta com error
          return {
            error: 'Provedor não retornou ID do pedido',
            status: 'error',
            order: null,
            orderId: null
          };
        }
        
        // Padronizar o formato de retorno
        return {
          order: response.data.order || response.data.orderId,
          orderId: response.data.order || response.data.orderId,
          status: response.data.status || 'pending',
          ...response.data
        };
      } catch (error) {
        console.error('[ProviderService] Erro ao enviar pedido ao provedor:', error);
        return {
          error: error instanceof Error ? error.message : 'Erro na comunicação com o provedor',
          status: 'error',
          order: null,
          orderId: null,
          connection_error: true,
          needs_retry: true
        };
      }
    }, 'provider');
  }
  
  /**
   * Envia um pedido para o provedor - método alternativo para compatibilidade
   * @param provider Provedor para enviar o pedido
   * @param data Dados do pedido
   * @returns Resposta do provedor
   */
  async sendOrderToProvider(provider: Provider, data: ProviderRequestData): Promise<OrderResponse> {
    return this.createOrder(provider, data);
  }
  
  /**
   * Verifica o status de um pedido no provedor
   * @param provider Provedor a ser consultado
   * @param orderId ID do pedido no provedor
   * @returns Status do pedido
   */
  async checkOrderStatus(provider: Provider, orderId: string | number): Promise<OrderResponse> {
    if (!provider.api_url) {
      throw new Error('URL da API do provedor não configurada');
    }
    
    console.log(`[ProviderService] Verificando status do pedido ${orderId} no provedor ${provider.name}`);
    
    // Usar o rate limiter para evitar erros 429
    return rateLimiter.executeWithRateLimit(async () => {
      try {
        const response = await axios.post(provider.api_url!, {
          key: provider.api_key,
          action: 'status',
          order: orderId
        });
        
        console.log(`[ProviderService] Status do pedido ${orderId}:`, response.data);
        
        // Padronizar o formato de retorno
        return {
          order: orderId,
          orderId: orderId,
          status: response.data.status || 'unknown',
          remains: response.data.remains,
          ...response.data
        };
      } catch (error) {
        console.error('[ProviderService] Erro ao verificar status do pedido:', error);
        return {
          error: error instanceof Error ? error.message : 'Erro na comunicação com o provedor',
          status: 'error',
          order: orderId,
          orderId: orderId,
          connection_error: true
        };
      }
    }, 'provider');
  }
  
  /**
   * Registra detalhes da requisição para logging
   * @param data Dados da requisição
   */
  logRequestDetails(data: ProviderRequestData): void {
    console.log('[ProviderService] Detalhes da requisição:');
    console.log(`Service: ${data.service}`);
    console.log(`Link: ${data.link}`);
    console.log(`Quantidade: ${data.quantity}`);
    console.log(`Transaction ID: ${data.transaction_id}`);
    if (data.target_username) {
      console.log(`Username: ${data.target_username}`);
    }
  }
} 