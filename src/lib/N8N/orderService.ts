import { createClient } from '@/lib/supabase/server';
import { N8NIntegrationService } from './integrationService';
import { N8NOrder, N8NPostItem, OrderStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço para gerenciar pedidos com integração com N8N
 */
export class N8NOrderService {
  private n8nService: N8NIntegrationService;
  private logger: Console;
  
  constructor() {
    this.n8nService = new N8NIntegrationService();
    this.logger = console;
  }
  
  /**
   * Cria um novo pedido a partir de uma transação e envia para o N8N
   * @param transactionId ID da transação a ser processada
   * @param useTestEnvironment Define se deve usar o ambiente de teste
   */
  async createOrderFromTransaction(transactionId: string, useTestEnvironment = false): Promise<{
    success: boolean;
    order_id?: string;
    error?: string;
  }> {
    try {
      const supabase = createClient();
      
      // Buscar a transação
      const { data: transaction, error } = await supabase
        .from('core_transactions_v2')
        .select('*, core_transaction_posts_v2(*)')
        .eq('id', transactionId)
        .single();
      
      if (error || !transaction) {
        throw new Error(`Transação não encontrada: ${error?.message || 'Erro desconhecido'}`);
      }
      
      // Verificar se a transação já foi processada pelo N8N
      if (transaction.n8n_processed) {
        return {
          success: false,
          error: 'Transação já foi processada pelo N8N'
        };
      }
      
      // Verificar se o pagamento foi aprovado
      if (transaction.status !== 'approved' && transaction.status !== 'pending') {
        return {
          success: false,
          error: `Transação não está aprovada. Status atual: ${transaction.status}`
        };
      }
      
      // Buscar os detalhes do serviço
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', transaction.service_id)
        .single();
      
      if (serviceError || !service) {
        throw new Error(`Serviço não encontrado: ${serviceError?.message || 'Erro desconhecido'}`);
      }
      
      // Gerar o pedido para o N8N
      const order = this.generateOrder(transaction, service, transaction.core_transaction_posts_v2);
      
      // Enviar o pedido para o N8N
      const result = await this.n8nService.sendOrder(order, useTestEnvironment);
      
      if (result.success) {
        // Atualizar a transação como processada pelo N8N
        await supabase
          .from('core_transactions_v2')
          .update({
            n8n_processed: true,
            n8n_order_id: result.order_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao criar pedido a partir da transação ${transactionId}: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Gera um pedido para o N8N a partir dos dados da transação e do serviço
   */
  private generateOrder(
    transaction: Record<string, unknown>,
    service: Record<string, unknown>,
    posts: Record<string, unknown>[]
  ): N8NOrder {
    // Extrair metadata da transação
    const metadata = transaction.metadata as Record<string, unknown> || {};
    const metadataPosts = (metadata.posts || []) as Record<string, unknown>[];
    
    // Construir ítens de posts
    const postItems: N8NPostItem[] = (posts || []).map(post => {
      // Buscar o metadado correspondente ao post para obter informações adicionais
      const matchingMetadata = metadataPosts.find((mp: Record<string, unknown>) => 
        mp.postId === post.post_id || mp.postCode === post.post_code
      );
      
      return {
        id: post.id as string,
        code: post.post_code as string,
        url: post.post_url as string,
        type: post.post_type as 'post' | 'reel',
        quantity: post.quantity as number,
        username: post.username as string,
        service_type: metadata.quantityType as string || 'curtidas',
        selected: post.selected as boolean || true,
        metadata: {
          caption: post.post_caption,
          imageUrl: matchingMetadata?.imageUrl || null
        }
      };
    });
    
    // Construir o pedido
    return {
      order_id: transaction.payment_id as string || `order-${uuidv4()}`,
      transaction_id: transaction.id as string,
      service_id: service.id as string,
      provider_id: service.provider_id as string,
      external_service_id: service.external_id as string,
      quantity: transaction.metadata?.totalQuantity as number || 0,
      target_username: transaction.metadata?.username as string || metadata.username as string,
      metadata: {
        type: transaction.type || metadata.type,
        posts: postItems,
        customer_email: transaction.customer_email,
        customer_name: transaction.customer_name,
        customer_phone: transaction.customer_phone,
        service_name: service.name,
        service_type: service.type
      }
    };
  }
  
  /**
   * Processa o retorno de callbacks do N8N
   * @param callbackData Dados do callback
   */
  async processCallback(callbackData: Record<string, unknown>): Promise<boolean> {
    return this.n8nService.processCallback(callbackData);
  }
  
  /**
   * Verifica pedidos pendentes e os envia para o N8N
   */
  async processUnsentOrders(): Promise<{
    total: number;
    sent: number;
    errors: Record<string, string>;
  }> {
    try {
      const supabase = createClient();
      
      // Buscar transações aprovadas que ainda não foram enviadas ao N8N
      const { data: transactions, error } = await supabase
        .from('core_transactions_v2')
        .select('id')
        .eq('status', 'approved')
        .eq('n8n_processed', false)
        .order('created_at', { ascending: true })
        .limit(10);
      
      if (error) {
        throw new Error(`Erro ao buscar transações: ${error.message}`);
      }
      
      if (!transactions || transactions.length === 0) {
        return { total: 0, sent: 0, errors: {} };
      }
      
      // Processar cada transação
      const results = { total: transactions.length, sent: 0, errors: {} as Record<string, string> };
      
      for (const transaction of transactions) {
        try {
          const result = await this.createOrderFromTransaction(transaction.id);
          
          if (result.success) {
            results.sent++;
          } else {
            results.errors[transaction.id] = result.error || 'Erro desconhecido';
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          results.errors[transaction.id] = errorMessage;
        }
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao processar pedidos pendentes: ${errorMessage}`);
      
      return {
        total: 0,
        sent: 0,
        errors: { general: errorMessage }
      };
    }
  }
} 