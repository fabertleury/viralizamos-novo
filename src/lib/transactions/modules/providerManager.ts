import { createClient } from '@/lib/supabase/server';
import { Transaction, Provider } from './types';

/**
 * Gerencia a obtenção e validação de provedores
 */
export class ProviderManager {
  private supabase = createClient();

  /**
   * Obtém o provedor correto para a transação
   * @param transaction Dados da transação
   * @returns Provedor encontrado ou null
   */
  async getProviderForTransaction(transaction: Transaction): Promise<Provider | null> {
    // VERIFICAÇÃO ADICIONAL: Verificar inconsistência entre service_id e metadata.service
    if (transaction.metadata?.service?.id && transaction.service_id) {
      if (transaction.metadata.service.id !== transaction.service_id) {
        console.warn(`[ProviderManager] Inconsistência detectada: service_id (${transaction.service_id}) difere do metadata.service.id (${transaction.metadata.service.id})`);
        
        // Se o metadata.service.id contém "Seguidores" e o service_id não
        const metadataServiceName = transaction.metadata.service.name || '';
        if (metadataServiceName.includes('Seguidores') && transaction.service_id) {
          console.log(`[ProviderManager] Priorizando serviço de seguidores dos metadados`);
          // Usar o provider_id dos metadados se disponível
          if (transaction.metadata.service.provider_id) {
            const providerId = transaction.metadata.service.provider_id;
            console.log(`[ProviderManager] Usando provider_id ${providerId} dos metadados`);
            return await this.getProviderById(providerId);
          }
        }
      }
    }
    
    // Primeiro, verificar se temos um service_id na transação
    // Se sim, buscar o serviço diretamente do banco de dados para garantir que temos o provider_id correto
    if (transaction.service_id) {
      console.log(`[ProviderManager] Buscando serviço diretamente do banco de dados com ID: ${transaction.service_id}`);
      const provider = await this.getProviderFromServiceId(transaction.service_id);
      if (provider) return provider;
    }
    
    // Se não conseguimos obter o provedor pelo service_id, tentar os métodos alternativos
    // Verificar se temos um provider_id na transação
    const providerId = this.getProviderId(transaction);
    
    if (!providerId) {
      console.log('[ProviderManager] Nenhum provider_id encontrado na transação');
      return null;
    }
    
    // Verificar se o provider_id é um UUID válido
    if (!this.isValidUUID(providerId)) {
      console.error(`[ProviderManager] Provider_id "${providerId}" não é um UUID válido.`);
      return null;
    }
    
    // Buscar o provedor pelo ID
    return await this.getProviderById(providerId);
  }

  /**
   * Obtém o provedor a partir do ID do serviço
   * @param serviceId ID do serviço
   * @returns Provedor encontrado ou null
   */
  private async getProviderFromServiceId(serviceId: string): Promise<Provider | null> {
    console.log('[ProviderManager] Buscando serviço diretamente do banco de dados com ID:', serviceId);
    
    const { data: serviceData, error: serviceError } = await this.supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
      
    if (serviceError) {
      console.error('[ProviderManager] Erro ao buscar serviço:', serviceError);
      return null;
    } 
    
    if (serviceData && serviceData.provider_id) {
      console.log('[ProviderManager] Serviço encontrado no banco de dados com provider_id:', serviceData.provider_id);
      
      // Verificar se o provider_id é um UUID válido
      if (!this.isValidUUID(serviceData.provider_id)) {
        console.error(`[ProviderManager] Provider_id "${serviceData.provider_id}" do banco de dados não é um UUID válido.`);
        return null;
      }
      
      // Buscar o provedor pelo ID
      return await this.getProviderById(serviceData.provider_id);
    } else {
      console.log('[ProviderManager] Serviço encontrado no banco de dados, mas sem provider_id');
      return null;
    }
  }

  /**
   * Obtém o provider_id de várias fontes possíveis na transação
   * @param transaction Dados da transação
   * @returns ID do provedor
   */
  private getProviderId(transaction: Transaction): string | null {
    if (transaction.service?.provider_id) {
      console.log('[ProviderManager] Usando provider_id do serviço:', transaction.service.provider_id);
      return transaction.service.provider_id;
    } else if (transaction.metadata?.service?.provider_id) {
      console.log('[ProviderManager] Usando provider_id do metadata do serviço:', transaction.metadata.service.provider_id);
      return transaction.metadata.service.provider_id;
    } else if (transaction.metadata?.provider_id) {
      console.log('[ProviderManager] Usando provider_id do metadata da transação:', transaction.metadata.provider_id);
      return transaction.metadata.provider_id;
    }
    
    return null;
  }

  /**
   * Verifica se uma string é um UUID válido
   * @param id String a ser verificada
   * @returns true se for um UUID válido
   */
  private isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  /**
   * Obtém o provedor pelo ID
   * @param providerId ID do provedor
   * @returns Provedor encontrado ou null
   */
  private async getProviderById(providerId: string): Promise<Provider | null> {
    // Buscar o provedor pelo ID
    const { data: provider, error } = await this.supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();
    
    if (error) {
      console.error('[ProviderManager] Erro ao buscar provedor pelo ID:', error);
      return null;
    }
    
    if (!provider) {
      console.error(`[ProviderManager] Provedor com ID ${providerId} não encontrado`);
      return null;
    }
    
    console.log('[ProviderManager] Provedor encontrado:', provider.name);
    return provider;
  }
}
