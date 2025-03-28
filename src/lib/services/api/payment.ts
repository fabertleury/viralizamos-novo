import { createClient } from '@/lib/supabase/server';
import { TransactionProcessor } from '../payment/TransactionProcessor';
import { OrderProcessor } from '../order/OrderProcessor';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('PaymentAPI');

/**
 * Processa uma transação aprovada, cria ordem e envia para o provedor
 * @param transactionId ID da transação a ser processada
 * @returns Resultado do processamento
 */
export async function processApprovedPayment(transactionId: string) {
  try {
    logger.info(`Iniciando processamento da transação ${transactionId}`);
    
    const supabase = createClient();
    
    // Buscar a transação pelo ID
    const { data: transaction, error } = await supabase
      .from('core_transactions_v2')
      .select('*')
      .eq('id', transactionId)
      .single();
      
    if (error || !transaction) {
      logger.error(`Transação ${transactionId} não encontrada: ${error?.message || 'Não existe'}`);
      return {
        success: false,
        error: `Transação não encontrada: ${error?.message || 'Não existe'}`
      };
    }
    
    // Verificar se a transação já foi processada
    if (transaction.order_created === true) {
      logger.info(`Transação ${transactionId} já foi processada anteriormente.`);
      
      // Buscar ordens existentes
      const { data: orders } = await supabase
        .from('core_orders')
        .select('id, status')
        .eq('transaction_id', transactionId);
        
      return {
        success: true,
        message: 'Transação já processada anteriormente',
        alreadyProcessed: true,
        orders: orders || []
      };
    }
    
    // Verificar se a transação está aprovada
    if (transaction.status !== 'approved') {
      logger.warn(`Transação ${transactionId} não está aprovada (status: ${transaction.status})`);
      return {
        success: false,
        error: `Transação não está aprovada (status: ${transaction.status})`
      };
    }
    
    // Processar a transação
    logger.info(`Processando transação ${transactionId} aprovada...`);
    const transactionProcessor = new TransactionProcessor(supabase);
    
    const result = await transactionProcessor.processTransaction(transaction);
    
    // Se o processamento foi bem-sucedido, processar os pedidos pendentes
    if (result && result.status === 'processed') {
      logger.success(`Transação ${transactionId} processada com sucesso.`);
      
      // Processar pedidos pendentes
      logger.info('Processando pedidos pendentes...');
      const orderProcessor = new OrderProcessor(supabase);
      const processingResult = await orderProcessor.processPendingOrders();
      
      if (processingResult.success) {
        logger.success(`Pedidos processados com sucesso: ${processingResult.success_count} de ${processingResult.processed}`);
        
        // Buscar as ordens criadas
        const { data: orders } = await supabase
          .from('core_orders')
          .select('id, status, provider_order_id, external_order_id, created_at')
          .eq('transaction_id', transactionId);
          
        return {
          success: true,
          message: `Transação processada e ${processingResult.success_count} pedidos enviados com sucesso`,
          transactionProcessed: true,
          ordersProcessed: processingResult.success_count,
          orders: orders || []
        };
      } else {
        logger.error(`Erro ao processar pedidos: ${processingResult.error}`);
        return {
          success: false,
          error: `Erro ao processar pedidos: ${processingResult.error}`,
          transactionProcessed: true,
          ordersProcessed: false
        };
      }
    } else {
      logger.error(`Erro ao processar transação: ${result?.error || result?.reason || 'Motivo desconhecido'}`);
      return {
        success: false,
        error: `Erro ao processar transação: ${result?.error || result?.reason || 'Motivo desconhecido'}`
      };
    }
  } catch (error) {
    logger.error(`Erro não tratado ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return {
      success: false,
      error: `Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

/**
 * Busca informações sobre uma transação
 * @param transactionId ID da transação
 */
export async function getTransactionInfo(transactionId: string) {
  try {
    logger.info(`Buscando informações da transação ${transactionId}`);
    
    const supabase = createClient();
    
    // Buscar a transação pelo ID
    const { data: transaction, error } = await supabase
      .from('core_transactions_v2')
      .select(`
        *,
        service:service_id (name, type, price),
        provider:provider_id (name, is_active)
      `)
      .eq('id', transactionId)
      .single();
      
    if (error || !transaction) {
      logger.error(`Transação ${transactionId} não encontrada: ${error?.message || 'Não existe'}`);
      return {
        success: false,
        error: `Transação não encontrada: ${error?.message || 'Não existe'}`
      };
    }
    
    // Buscar ordens associadas à transação
    const { data: orders, error: ordersError } = await supabase
      .from('core_orders')
      .select('*')
      .eq('transaction_id', transactionId);
      
    if (ordersError) {
      logger.error(`Erro ao buscar ordens da transação ${transactionId}: ${ordersError.message}`);
    }
    
    // Buscar posts associados à transação (se houver)
    const { data: posts, error: postsError } = await supabase
      .from('core_transaction_posts_v2')
      .select('*')
      .eq('transaction_id', transactionId);
      
    if (postsError) {
      logger.error(`Erro ao buscar posts da transação ${transactionId}: ${postsError.message}`);
    }
    
    return {
      success: true,
      transaction,
      orders: orders || [],
      posts: posts || []
    };
  } catch (error) {
    logger.error(`Erro ao buscar informações da transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return {
      success: false,
      error: `Erro ao buscar informações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

/**
 * Busca informações sobre uma ordem
 * @param orderId ID da ordem
 */
export async function getOrderInfo(orderId: string) {
  try {
    logger.info(`Buscando informações da ordem ${orderId}`);
    
    const supabase = createClient();
    
    // Buscar a ordem pelo ID
    const { data: order, error } = await supabase
      .from('core_orders')
      .select(`
        *,
        service:service_id (name, type, price),
        provider:provider_id (name, is_active)
      `)
      .eq('id', orderId)
      .single();
      
    if (error || !order) {
      logger.error(`Ordem ${orderId} não encontrada: ${error?.message || 'Não existe'}`);
      return {
        success: false,
        error: `Ordem não encontrada: ${error?.message || 'Não existe'}`
      };
    }
    
    return {
      success: true,
      order
    };
  } catch (error) {
    logger.error(`Erro ao buscar informações da ordem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return {
      success: false,
      error: `Erro ao buscar informações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
} 