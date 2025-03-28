import axios from 'axios';
import { rateLimiter } from '../rateLimit';
import { Provider, ProviderRequestData, OrderResponse } from '../types';
import { createClient } from '@/lib/supabase/server';

/**
 * Versão antiga do serviço para provedores
 * Mantida para compatibilidade enquanto migramos para a nova estrutura
 */
export class OldProviderService {
  private supabase = createClient();
  
  /**
   * Busca um provedor pelo ID do serviço
   * @param serviceId ID do serviço
   * @returns Provedor encontrado ou null
   */
  async getProviderByServiceId(serviceId: string): Promise<Provider | null> {
    console.log(`[OldProviderService] Buscando provedor para serviço: ${serviceId}`);
    
    try {
      const { data: service, error: serviceError } = await this.supabase
        .from('services')
        .select('provider_id')
        .eq('id', serviceId)
        .single();
        
      if (serviceError || !service || !service.provider_id) {
        console.warn(`[OldProviderService] Serviço ${serviceId} não encontrado ou não tem provider_id`);
        return null;
      }
      
      const { data: provider, error: providerError } = await this.supabase
        .from('providers')
        .select('*')
        .eq('id', service.provider_id)
        .single();
        
      if (providerError || !provider) {
        console.warn(`[OldProviderService] Provedor ${service.provider_id} não encontrado`);
        return null;
      }
      
      return provider as Provider;
    } catch (error) {
      console.error('[OldProviderService] Erro ao buscar provedor:', error);
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
    
    console.log(`[OldProviderService] Enviando pedido para ${provider.name} (${provider.api_url})`);
    
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
        
        console.log(`[OldProviderService] Resposta do provedor ${provider.name}:`, response.data);
        
        // Verificar se a resposta contém o ID do pedido
        if (!response.data.order && !response.data.orderId) {
          console.error('[OldProviderService] Resposta do provedor não contém ID do pedido:', response.data);
          
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
        console.error('[OldProviderService] Erro ao enviar pedido ao provedor:', error);
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
   * Verifica o status de um pedido no provedor
   * @param provider Provedor a ser consultado
   * @param orderId ID do pedido no provedor
   * @returns Status do pedido
   */
  async checkOrderStatus(provider: Provider, orderId: string | number): Promise<OrderResponse> {
    if (!provider.api_url) {
      throw new Error('URL da API do provedor não configurada');
    }
    
    console.log(`[OldProviderService] Verificando status do pedido ${orderId} no provedor ${provider.name}`);
    
    // Usar o rate limiter para evitar erros 429
    return rateLimiter.executeWithRateLimit(async () => {
      try {
        const response = await axios.post(provider.api_url!, {
          key: provider.api_key,
          action: 'status',
          order: orderId
        });
        
        console.log(`[OldProviderService] Status do pedido ${orderId}:`, response.data);
        
        // Padronizar o formato de retorno
        return {
          order: orderId,
          orderId: orderId,
          status: response.data.status || 'unknown',
          remains: response.data.remains,
          ...response.data
        };
      } catch (error) {
        console.error('[OldProviderService] Erro ao verificar status do pedido:', error);
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
} 