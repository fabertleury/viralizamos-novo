import { createClient } from '@/lib/supabase/server';

/**
 * Gerencia o tratamento de erros durante o processamento de transações
 */
export class ErrorHandler {
  private supabase = createClient();

  /**
   * Registra um erro no processamento de uma transação
   * @param transactionId ID da transação
   * @param error Erro ocorrido
   */
  async handleTransactionError(transactionId: string, error: any): Promise<void> {
    console.error('[ErrorHandler] Erro no processamento da transação:', error);
    
    try {
      // Buscar os metadados atuais da transação
      const { data: transactionData } = await this.supabase
        .from('transactions')
        .select('metadata')
        .eq('id', transactionId)
        .single();
      
      // Atualizar a transação com o status de falha e o erro
      await this.supabase
        .from('transactions')
        .update({
          status: 'failed',
          metadata: {
            ...(transactionData?.metadata || {}),
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            error_stack: error instanceof Error ? error.stack : null,
            error_timestamp: new Date().toISOString()
          }
        })
        .eq('id', transactionId);
      
      console.log('[ErrorHandler] Transação marcada como falha:', transactionId);
    } catch (updateError) {
      console.error('[ErrorHandler] Erro ao atualizar transação com erro:', updateError);
    }
  }

  /**
   * Registra um erro no processamento de um pedido
   * @param orderId ID do pedido
   * @param error Erro ocorrido
   */
  async handleOrderError(orderId: string, error: any): Promise<void> {
    console.error('[ErrorHandler] Erro no processamento do pedido:', error);
    
    try {
      // Buscar os metadados atuais do pedido
      const { data: orderData } = await this.supabase
        .from('orders')
        .select('metadata')
        .eq('id', orderId)
        .single();
      
      // Atualizar o pedido com o status de falha e o erro
      await this.supabase
        .from('orders')
        .update({
          status: 'failed',
          metadata: {
            ...(orderData?.metadata || {}),
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            error_stack: error instanceof Error ? error.stack : null,
            error_timestamp: new Date().toISOString()
          }
        })
        .eq('id', orderId);
      
      console.log('[ErrorHandler] Pedido marcado como falha:', orderId);
    } catch (updateError) {
      console.error('[ErrorHandler] Erro ao atualizar pedido com erro:', updateError);
    }
  }
}
