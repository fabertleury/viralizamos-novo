import { Provider, ProviderRequestData, OrderResponse } from '../types';

/**
 * Serviço para comunicação com provedores externos
 */
export class ProviderService {
  /**
   * Envia um pedido para o provedor
   * @param provider Provedor a ser utilizado
   * @param requestData Dados da requisição
   * @returns Resposta do provedor
   */
  async sendOrderToProvider(provider: Provider, requestData: ProviderRequestData): Promise<OrderResponse> {
    try {
      if (!provider.api_url) {
        throw new Error('URL da API do provedor não configurada');
      }
      
      console.log(`[ProviderService] Enviando pedido para ${provider.name} (${provider.api_url})`);
      
      // Garantir que todos os campos estejam no formato correto
      const formattedRequestData = {
        ...requestData,
        service: String(requestData.service).trim(),
        quantity: Number(requestData.quantity),
        link: String(requestData.link).trim()
      };
      
      // Log dos dados formatados
      this.logRequestDetails(formattedRequestData);
      
      // Fazer a requisição para o provedor
      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedRequestData),
        // Adicionar timeout para a requisição
        signal: AbortSignal.timeout(15000) // 15 segundos de timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ProviderService] Erro ao enviar pedido para o provedor (${response.status}):`, errorText);
        throw new Error(`Erro ao enviar pedido para o provedor: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[ProviderService] Resposta do provedor:', data);
      
      return {
        order: data.order || data.orderId || null,
        orderId: data.order || data.orderId || null,
        status: data.status || 'pending'
      };
    } catch (error) {
      console.error('[ProviderService] Erro ao enviar pedido para o provedor:', error);
      
      // Verificar se é um erro de timeout ou conexão
      const isConnectionError = 
        error instanceof TypeError || 
        (error instanceof Error && 
          (error.message.includes('timeout') || 
           error.message.includes('network') ||
           error.message.includes('fetch failed') ||
           error.message.includes('connect')));
      
      if (isConnectionError) {
        console.log('[ProviderService] Erro de conexão detectado, retornando resposta para reprocessamento');
        // Retornar um objeto especial que indica que o pedido precisa ser reprocessado
        return {
          order: null,
          orderId: null,
          status: 'needs_retry',
          error: error.message,
          needs_retry: true,
          connection_error: true
        };
      }
      
      // Se não for um erro de conexão, propagar o erro
      throw error;
    }
  }

  /**
   * Registra detalhes da requisição para depuração
   * @param requestData Dados da requisição
   */
  logRequestDetails(requestData: ProviderRequestData): void {
    console.log('[ProviderService] Enviando para o provedor:');
    console.log(`service: ${requestData.service}`);
    console.log(`link: ${requestData.link}`);
    console.log(`quantity: ${requestData.quantity}`);
    console.log(`transaction_id: ${requestData.transaction_id}`);
    console.log(`target_username: ${requestData.target_username}`);
    console.log(`key: ${requestData.key}`);
    console.log(`action: ${requestData.action}`);
  }
}
