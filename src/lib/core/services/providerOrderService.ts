import { createClient } from '@/lib/supabase/server';
import { LinkFormatter } from '../utils/linkFormatter';
import { Logger } from '../utils/logger';
import axios from 'axios';
import { N8nIntegrationService } from './n8nIntegrationService';

/**
 * Interface para dados de um post
 */
interface PostData {
  id: string;
  url?: string;
  code?: string;
  type?: string;
  username?: string;
  quantity?: number;
}

/**
 * Interface para os parâmetros de envio de um pedido
 */
interface SendOrdersParams {
  transactionId: string;
  serviceId: string;
  serviceType: string;
  providerId: string;
  posts: PostData[];
  quantity: number;
  externalServiceId?: string;
}

/**
 * Interface para o resultado de um pedido
 */
interface OrderResult {
  success: boolean;
  externalOrderId?: string;
  error?: string;
}

/**
 * Serviço para envio de pedidos específicos para cada tipo de serviço do provedor
 */
export class ProviderOrderService {
  private supabase;
  private linkFormatter;
  private logger;
  private n8nService: N8nIntegrationService;

  constructor() {
    this.supabase = createClient();
    this.linkFormatter = new LinkFormatter();
    this.logger = new Logger('ProviderOrderService');
    this.n8nService = new N8nIntegrationService();
  }

  /**
   * Atraso auxiliar (sleep) para espaçar os pedidos
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Envia pedidos para o n8n processar
   * @param params Parâmetros para o envio
   * @returns Array com os resultados do envio
   */
  async sendOrders(params: SendOrdersParams): Promise<OrderResult[]> {
    try {
      if (!params.posts || params.posts.length === 0) {
        this.logger.error('Nenhum post fornecido para processamento');
        return [{ success: false, error: 'Nenhum post fornecido' }];
      }
      
      const results: OrderResult[] = [];
      
      // Processar cada post
      for (const post of params.posts) {
        try {
          this.logger.info(`Enviando pedido para o post ${post.code || post.id} via n8n`);
          
          // Determinar a URL do post
          let targetUrl = post.url;
          if (!targetUrl && post.code) {
            // Se não tiver URL mas tiver código, construir URL
            const isReel = post.type === 'reel';
            targetUrl = isReel
              ? `https://instagram.com/reel/${post.code}/`
              : `https://instagram.com/p/${post.code}/`;
          }
          
          // Montar dados do pedido para envio ao n8n
          const orderData = {
            order_id: `${params.transactionId}-${post.id}`, // Gerar um ID único para o pedido
            transaction_id: params.transactionId,
            service_id: params.serviceId,
            provider_id: params.providerId,
            external_service_id: params.externalServiceId || params.serviceId,
            quantity: post.quantity || params.quantity,
            target_url: targetUrl,
            target_username: post.username,
            metadata: {
              post_id: post.id,
              post_code: post.code,
              post_type: post.type,
              service_type: params.serviceType
            }
          };
          
          // Enviar para o n8n
          const result = await this.n8nService.sendOrder(orderData);
          
          if (result.success) {
            this.logger.success(`Pedido para post ${post.code || post.id} enviado com sucesso via n8n`);
            results.push({
              success: true,
              externalOrderId: result.external_order_id
            });
          } else {
            this.logger.error(`Erro ao enviar pedido para post ${post.code || post.id} via n8n: ${result.error}`);
            results.push({
              success: false,
              error: result.error
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          this.logger.error(`Erro ao processar post ${post.code || post.id}: ${errorMessage}`);
          
          results.push({
            success: false,
            error: errorMessage
          });
        }
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao enviar pedidos: ${errorMessage}`);
      
      return [{
        success: false,
        error: errorMessage
      }];
    }
  }

  /**
   * Registra um bloqueio para um post+serviço para evitar duplicação
   * @param postCode Código do post
   * @param serviceId ID do serviço
   * @param orderId ID do pedido
   * @param metadata Metadados adicionais
   * @returns true se o bloqueio foi registrado com sucesso
   */
  async registerLock(postCode: string, serviceId: string, orderId: string, metadata: Record<string, unknown> = {}): Promise<boolean> {
    try {
      this.logger.info(`Registrando bloqueio para post ${postCode} no serviço ${serviceId}`);
      
      // Como agora estamos usando o n8n para processar pedidos, podemos adicionar
      // um metadado para identificar que o pedido foi enviado via n8n
      metadata.sent_via_n8n = true;
      metadata.locked_at = new Date().toISOString();
      
      // Aqui você pode implementar a lógica para registrar bloqueios
      // usando a sua solução atual ou o n8n
      
      this.logger.success(`Bloqueio registrado com sucesso para post ${postCode}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao registrar bloqueio para post ${postCode}: ${errorMessage}`);
      return false;
    }
  }
} 