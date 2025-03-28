/**
 * Serviço para gerenciar transações
 */
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { OrderProcessor } from '@/lib/transactions/modules/orderProcessor';

interface TransactionData {
  id: string;
  [key: string]: any;
}

export class TransactionService {
  private supabase = createClient();
  private orderProcessor = new OrderProcessor();

  /**
   * Busca uma transação por ID
   */
  async getTransactionById(transactionId: string) {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select('*, service:service_id(*)')
        .eq('id', transactionId)
        .maybeSingle();

      if (error) {
        logger.error(`Erro ao buscar transação por ID: ${transactionId}`, { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Erro inesperado ao buscar transação: ${transactionId}`, { error });
      throw error;
    }
  }

  /**
   * Busca transações por usuário
   */
  async getTransactionsByUser(userId: string, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select('*, service:service_id(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Erro ao buscar transações por usuário: ${userId}`, { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Erro inesperado ao buscar transações por usuário: ${userId}`, { error });
      throw error;
    }
  }

  /**
   * Atualiza o status de uma transação
   */
  async updateTransactionStatus(transactionId: string, status: string, metadata?: any) {
    try {
      const updateData: any = { status };
      
      if (metadata) {
        // Mesclar o metadata existente com o novo
        const { data: existingTransaction } = await this.supabase
          .from('transactions')
          .select('metadata')
          .eq('id', transactionId)
          .maybeSingle();
          
        if (existingTransaction && existingTransaction.metadata) {
          updateData.metadata = {
            ...existingTransaction.metadata,
            ...metadata
          };
        } else {
          updateData.metadata = metadata;
        }
      }
      
      const { data, error } = await this.supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .select()
        .maybeSingle();

      if (error) {
        logger.error(`Erro ao atualizar status da transação: ${transactionId}`, { error });
        throw error;
      }

      // Registrar o log de atualização
      await this.supabase
        .from('transaction_logs')
        .insert({
          transaction_id: transactionId,
          level: 'info',
          message: `Status atualizado para: ${status}`,
          metadata: { 
            previousStatus: existingTransaction?.metadata?.status || 'unknown',
            newStatus: status,
            updatedMetadata: metadata 
          }
        });

      // Se a transação foi aprovada, iniciar processamento de pedidos
      if (status === 'approved') {
        this.processApprovedTransaction(transactionId);
      }

      return data;
    } catch (error) {
      logger.error(`Erro inesperado ao atualizar status da transação: ${transactionId}`, { error });
      throw error;
    }
  }

  /**
   * Iniciar processamento de pedidos para uma transação aprovada
   */
  async processApprovedTransaction(transactionId: string) {
    try {
      logger.info(`Iniciando processamento de pedidos para transação: ${transactionId}`);
      
      // Chamar o processador de pedidos em background
      // Utilizamos o setTimeout para não bloquear a resposta atual
      setTimeout(async () => {
        try {
          await this.orderProcessor.processTransaction(transactionId);
        } catch (error) {
          logger.error(`Erro ao processar transação em background: ${transactionId}`, { error });
        }
      }, 100);
      
    } catch (error) {
      logger.error(`Erro ao iniciar processamento de transação: ${transactionId}`, { error });
    }
  }

  /**
   * Obter logs de uma transação
   */
  async getTransactionLogs(transactionId: string) {
    try {
      const { data, error } = await this.supabase
        .from('transaction_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existir, retornamos um array vazio
        if (error.code === '42P01') {
          return [];
        }
        logger.error(`Erro ao buscar logs da transação: ${transactionId}`, { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Erro inesperado ao buscar logs da transação: ${transactionId}`, { error });
      throw error;
    }
  }
} 