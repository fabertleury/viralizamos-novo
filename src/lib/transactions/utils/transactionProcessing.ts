import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

/**
 * Tipos para o processamento de transações
 */
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface TransactionLock {
  transactionId: string
  lockKey: string
  lockedBy: string
}

/**
 * Serviço para gerenciar o processamento seguro de transações
 */
export class TransactionProcessingService {
  private supabase

  constructor() {
    this.supabase = createClient()
  }

  /**
   * Adquire um lock para processar uma transação
   * @param transactionId ID da transação
   * @param processId Identificador do processo (pode ser um ID de worker, thread, etc)
   * @param lockDurationSeconds Duração do lock em segundos
   * @returns Objeto com o lock ou null se não conseguir adquirir
   */
  async acquireLock(
    transactionId: string,
    processId: string,
    lockDurationSeconds = 300
  ): Promise<TransactionLock | null> {
    try {
      const { data, error } = await this.supabase.rpc('acquire_transaction_lock', {
        p_transaction_id: transactionId,
        p_locked_by: processId,
        p_lock_duration_seconds: lockDurationSeconds
      })

      if (error) {
        logger.error('Erro ao adquirir lock de transação', {
          error,
          transactionId,
          processId
        })
        return null
      }

      if (!data) {
        return null
      }

      // Se adquiriu o lock com sucesso, buscar a chave do lock
      const { data: lockData, error: lockError } = await this.supabase
        .from('transaction_processing')
        .select('lock_key')
        .eq('transaction_id', transactionId)
        .single()

      if (lockError || !lockData?.lock_key) {
        logger.error('Erro ao obter chave do lock após aquisição', {
          error: lockError,
          transactionId,
          processId
        })
        return null
      }

      return {
        transactionId,
        lockKey: lockData.lock_key,
        lockedBy: processId
      }
    } catch (error) {
      logger.error('Exceção ao adquirir lock de transação', {
        error,
        transactionId,
        processId
      })
      return null
    }
  }

  /**
   * Libera o lock de uma transação
   * @param lock Objeto com informações do lock
   * @param status Status final da transação
   * @param errorMessage Mensagem de erro caso tenha falhado
   * @returns Sucesso da operação
   */
  async releaseLock(
    lock: TransactionLock,
    status: TransactionStatus = 'completed',
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('release_transaction_lock', {
        p_transaction_id: lock.transactionId,
        p_lock_key: lock.lockKey,
        p_status: status,
        p_error: errorMessage
      })

      if (error) {
        logger.error('Erro ao liberar lock de transação', {
          error,
          lockInfo: lock,
          status
        })
        return false
      }

      return !!data
    } catch (error) {
      logger.error('Exceção ao liberar lock de transação', {
        error,
        lockInfo: lock,
        status
      })
      return false
    }
  }

  /**
   * Verifica se uma transação está bloqueada
   * @param transactionId ID da transação
   * @returns Se a transação está bloqueada
   */
  async isLocked(transactionId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('is_transaction_locked', {
        p_transaction_id: transactionId
      })

      if (error) {
        logger.error('Erro ao verificar lock de transação', {
          error,
          transactionId
        })
        return false
      }

      return !!data
    } catch (error) {
      logger.error('Exceção ao verificar lock de transação', {
        error,
        transactionId
      })
      return false
    }
  }

  /**
   * Processa uma transação com proteção de lock
   * @param transactionId ID da transação
   * @param processId Identificador do processo
   * @param processor Função que processa a transação
   * @returns Resultado do processamento
   */
  async processWithLock<T>(
    transactionId: string,
    processId: string,
    processor: () => Promise<T>
  ): Promise<{ success: boolean; result?: T; error?: Error }> {
    const lock = await this.acquireLock(transactionId, processId)
    
    if (!lock) {
      return {
        success: false,
        error: new Error('Não foi possível adquirir lock para a transação')
      }
    }

    try {
      const result = await processor()
      await this.releaseLock(lock)
      
      return {
        success: true,
        result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      await this.releaseLock(lock, 'failed', errorMessage)
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error(errorMessage)
      }
    }
  }

  /**
   * Obtém o status de processamento de uma transação
   * @param transactionId ID da transação
   * @returns Status do processamento ou null se não encontrado
   */
  async getProcessingStatus(transactionId: string): Promise<TransactionStatus | null> {
    try {
      const { data, error } = await this.supabase
        .from('transaction_processing')
        .select('status')
        .eq('transaction_id', transactionId)
        .single()

      if (error || !data) {
        return null
      }

      return data.status as TransactionStatus
    } catch (error) {
      logger.error('Erro ao obter status de processamento', {
        error,
        transactionId
      })
      return null
    }
  }
}

// Instância singleton para uso em toda a aplicação
export const transactionProcessing = new TransactionProcessingService() 