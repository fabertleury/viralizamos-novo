import { createClient } from '@/lib/supabase/server';
import { LinkFormatter } from '../utils/linkFormatter';
import { Logger } from '../utils/logger';

/**
 * Responsável pela comunicação com provedores de serviços
 */
export class ProviderService {
  private supabase;
  private linkFormatter;
  private logger;

  constructor() {
    this.supabase = createClient();
    this.linkFormatter = new LinkFormatter();
    this.logger = new Logger('ProviderService');
  }

  /**
   * Envia um pedido para o provedor de serviços
   * @param params Parâmetros do pedido
   * @returns Resultado do envio do pedido
   */
  async submitOrder(params: {
    transactionId: string;
    postId: string;
    serviceId: string;
    providerId: string;
    postCode: string;
    postUrl: string;
    username: string;
    quantity: number;
    serviceType: string;
  }) {
    try {
      const { transactionId, postId, serviceId, providerId, postCode, postUrl, username, quantity, serviceType } = params;
      
      this.logger.info(`Enviando pedido para post ${postCode} do usuário ${username}`);
      
      // Verificar se já existe um pedido para este post e serviço
      const { data: duplicateCheck, error: checkError } = await this.supabase.rpc(
        'check_duplicate_order',
        {
          p_transaction_id: transactionId,
          p_post_code: postCode,
          p_service_id: serviceId
        }
      );
      
      if (checkError) {
        this.logger.error(`Erro ao verificar duplicidade: ${checkError.message}`, checkError);
        // Continuar mesmo com erro na verificação
      } else if (duplicateCheck && duplicateCheck.has_duplicate) {
        this.logger.warn(`Pedido duplicado detectado: ${duplicateCheck.message}`, duplicateCheck);
        
        return {
          success: false,
          error: duplicateCheck.message || 'Pedido duplicado detectado',
          duplicate: true,
          existingOrder: {
            orderId: duplicateCheck.order_id,
            externalOrderId: duplicateCheck.external_order_id,
            status: duplicateCheck.status
          }
        };
      }
      
      // Consultar o provedor para obter detalhes necessários
      const { data: provider, error: providerError } = await this.supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();
        
      if (providerError || !provider) {
        this.logger.error(`Erro ao buscar provedor: ${providerError?.message || 'Provedor não encontrado'}`, providerError);
        
        return {
          success: false,
          error: `Provedor não encontrado: ${providerError?.message || 'Erro desconhecido'}`
        };
      }
      
      // Consultar o serviço para obter detalhes necessários
      const { data: service, error: serviceError } = await this.supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
        
      if (serviceError || !service) {
        this.logger.error(`Erro ao buscar serviço: ${serviceError?.message || 'Serviço não encontrado'}`, serviceError);
        
        return {
          success: false,
          error: `Serviço não encontrado: ${serviceError?.message || 'Erro desconhecido'}`
        };
      }
      
      // Formatar a URL do post para o provedor
      const formattedUrl = this.linkFormatter.formatInstagramLink(postUrl) || postUrl;
      
      // Verificar se o provedor está disponível
      if (!provider.is_active) {
        this.logger.error(`Provedor ${provider.name} não está ativo`);
        
        return {
          success: false,
          error: `Provedor ${provider.name} não está ativo`
        };
      }
      
      // Aqui seria implementada a lógica específica para enviar o pedido para o provedor
      // Isso pode variar dependendo da API do provedor
      
      // Para este exemplo, vamos simular um pedido bem-sucedido
      const externalOrderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Registrar o pedido no banco de dados
      const { data: order, error: orderError } = await this.supabase
        .from('core_orders')
        .insert({
          transaction_id: transactionId,
          post_id: postId,
          service_id: serviceId,
          provider_id: providerId,
          external_order_id: externalOrderId,
          provider_order_id: externalOrderId,
          status: 'pending',
          amount: service.price || 0,
          quantity: quantity,
          target_username: username,
          target_url: formattedUrl,
          metadata: {
            service_type: serviceType,
            provider_name: provider.name,
            service_name: service.name,
            post_code: postCode
          }
        })
        .select()
        .single();
        
      if (orderError) {
        this.logger.error(`Erro ao registrar pedido: ${orderError.message}`, orderError);
        
        return {
          success: false,
          error: `Erro ao registrar pedido: ${orderError.message}`
        };
      }
      
      this.logger.success(`Pedido registrado com sucesso: ${order.id}`);
      
      return {
        success: true,
        order,
        externalOrderId
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica o status de um pedido no provedor
   * @param orderId ID do pedido
   * @returns Status do pedido
   */
  async checkOrderStatus(orderId: string) {
    try {
      this.logger.info(`Verificando status do pedido ${orderId}`);
      
      // Buscar o pedido no banco de dados
      const { data: order, error } = await this.supabase
        .from('core_orders')
        .select('*, providers(*)')
        .eq('id', orderId)
        .single();
        
      if (error || !order) {
        this.logger.error(`Erro ao buscar pedido: ${error?.message || 'Pedido não encontrado'}`, error);
        
        return {
          success: false,
          error: `Pedido não encontrado: ${error?.message || 'Erro desconhecido'}`
        };
      }
      
      // Aqui seria implementada a lógica específica para verificar o status no provedor
      // Isso pode variar dependendo da API do provedor
      
      // Para este exemplo, vamos simular uma verificação bem-sucedida
      const status = 'processing'; // Poderia ser obtido da API do provedor
      
      // Atualizar o status no banco de dados
      await this.supabase
        .from('core_orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      this.logger.info(`Status do pedido ${orderId} atualizado para ${status}`);
      
      return {
        success: true,
        orderId,
        status
      };
    } catch (error) {
      this.logger.error(`Erro ao verificar status do pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 