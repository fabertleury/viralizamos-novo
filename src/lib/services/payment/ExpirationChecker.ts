import { createClient } from '@/lib/supabase/server';
import { TransactionProcessor } from './TransactionProcessor';
import { ExpirationCheckResult, ExpiredCancellationResult } from './types';

/**
 * Classe responsável por verificar transações que estão próximas de expirar
 */
export class ExpirationChecker {
  private transactionProcessor: TransactionProcessor;
  
  constructor() {
    this.transactionProcessor = new TransactionProcessor();
  }
  
  /**
   * Verifica transações que estão próximas de expirar (entre 25-30 minutos após criação)
   */
  public async checkExpiringTransactions(): Promise<ExpirationCheckResult> {
    try {
      console.log('Verificando transações prestes a expirar...');
      const supabase = createClient();

      // Calcular intervalo para transações que estão quase expirando (30 minutos após criação)
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() - 30); // 30 minutos atrás
      const expirationTimeStr = expirationTime.toISOString();

      // Dar uma margem de 5 minutos para capturar transações entre 25-30 minutos
      const marginTime = new Date();
      marginTime.setMinutes(marginTime.getMinutes() - 25); // 25 minutos atrás
      const marginTimeStr = marginTime.toISOString();

      // Buscar transações pendentes que estão no período de quase expiração
      const { data: expiringTransactions, error } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .eq('status', 'pending')
        .is('order_created', false)
        .lt('created_at', marginTimeStr)
        .gt('created_at', expirationTimeStr)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar transações quase expirando:', error);
        return { error: 'fetch_error', message: error.message };
      }

      if (!expiringTransactions || expiringTransactions.length === 0) {
        console.log('Nenhuma transação quase expirando encontrada');
        return { status: 'no_expiring_transactions' };
      }

      console.log(`Verificando ${expiringTransactions.length} transações prestes a expirar`);
      const results = [];

      for (const transaction of expiringTransactions) {
        console.log(`Verificando transação quase expirando ${transaction.id}`);
        
        try {
          const result = await this.transactionProcessor.processTransaction(transaction);
          results.push({
            transaction_id: transaction.id,
            ...result
          });
        } catch (error) {
          console.error(`Erro ao verificar transação quase expirando ${transaction.id}:`, error);
          results.push({
            transaction_id: transaction.id,
            status: 'error',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      return { status: 'success', results };
    } catch (error) {
      console.error('Erro ao verificar transações quase expirando:', error);
      return { 
        error: 'check_error', 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Cancela transações expiradas que não foram pagas após o tempo limite
   */
  public async cancelExpiredTransactions(): Promise<ExpiredCancellationResult> {
    try {
      console.log('Cancelando transações expiradas...');
      const supabase = createClient();
      
      // Buscar transações pendentes que ultrapassaram o tempo limite (30 min)
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() - 30);
      const expirationTimeStr = expirationTime.toISOString();
      
      const { data: expiredTransactions, error } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', expirationTimeStr)
        .order('created_at', { ascending: true })
        .limit(50);
        
      if (error) {
        console.error('Erro ao buscar transações expiradas:', error);
        return { error: 'fetch_error', message: error.message };
      }
      
      if (!expiredTransactions || expiredTransactions.length === 0) {
        console.log('Nenhuma transação expirada encontrada');
        return { status: 'no_expired_transactions' };
      }
      
      console.log(`Cancelando ${expiredTransactions.length} transações expiradas`);
      const results = [];
      
      for (const transaction of expiredTransactions) {
        try {
          console.log(`Cancelando transação expirada ${transaction.id}`);
          
          // Atualizar status da transação para cancelada
          const { error: updateError } = await supabase
            .from('core_transactions_v2')
            .update({
              status: 'cancelled',
              payment_status: 'cancelled',
              updated_at: new Date().toISOString(),
              metadata: {
                ...(transaction.metadata || {}),
                cancelled_at: new Date().toISOString(),
                cancellation_reason: 'Expirada após 30 minutos'
              }
            })
            .eq('id', transaction.id);
            
          if (updateError) {
            console.error(`Erro ao cancelar transação ${transaction.id}:`, updateError);
            results.push({
              transaction_id: transaction.id,
              status: 'error',
              error: updateError.message
            });
            continue;
          }
          
          // Registrar log de cancelamento
          await supabase.from('core_processing_logs').insert({
            transaction_id: transaction.id,
            level: 'info',
            message: 'Transação cancelada automaticamente por expiração',
            metadata: {
              cancelled_at: new Date().toISOString(),
              expiration_time: expirationTimeStr,
              transaction_created_at: transaction.created_at
            }
          });
          
          results.push({
            transaction_id: transaction.id,
            status: 'cancelled'
          });
        } catch (error) {
          console.error(`Erro ao cancelar transação ${transaction.id}:`, error);
          results.push({
            transaction_id: transaction.id,
            status: 'error',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
      
      return { status: 'success', cancelled_count: results.length, results };
    } catch (error) {
      console.error('Erro ao cancelar transações expiradas:', error);
      return { 
        error: 'cancel_error', 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 