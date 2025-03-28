import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Classe responsável pela manutenção periódica de locks de transação
 * Remove locks expirados para garantir bom funcionamento do sistema
 */
export class TransactionLockMaintenance {
  private supabase;
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private intervalMinutes = 15; // Executa a cada 15 minutos por padrão

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Inicia o serviço de manutenção em segundo plano
   * @param intervalMinutes Intervalo em minutos entre execuções (padrão: 15)
   */
  public start(intervalMinutes = 15): void {
    if (this.isRunning) {
      logger.warn('[TransactionLockMaintenance] Serviço já está em execução');
      return;
    }

    this.intervalMinutes = intervalMinutes;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Executa imediatamente ao iniciar
    this.clearExpiredLocks().catch(err => {
      logger.error('[TransactionLockMaintenance] Erro na limpeza inicial:', err);
    });

    // Configura execução periódica
    this.interval = setInterval(() => {
      this.clearExpiredLocks().catch(err => {
        logger.error('[TransactionLockMaintenance] Erro na limpeza periódica:', err);
      });
    }, intervalMs);

    this.isRunning = true;
    logger.info(`[TransactionLockMaintenance] Serviço iniciado - intervalo: ${intervalMinutes} minutos`);
  }

  /**
   * Para o serviço de manutenção
   */
  public stop(): void {
    if (!this.isRunning || !this.interval) {
      logger.warn('[TransactionLockMaintenance] Serviço não está em execução');
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
    this.isRunning = false;
    logger.info('[TransactionLockMaintenance] Serviço parado');
  }

  /**
   * Verifica se o serviço está em execução
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Limpa locks de transação expirados
   * @returns Número de locks removidos
   */
  public async clearExpiredLocks(): Promise<number> {
    try {
      // Verifica se a tabela transaction_locks existe
      const { data: tableExists, error: checkError } = await this.supabase.rpc('check_table_exists', { 
        table_name: 'transaction_locks' 
      });
      
      if (checkError || !tableExists) {
        logger.warn('[TransactionLockMaintenance] Tabela transaction_locks não existe');
        return 0;
      }

      // Executa função para limpar locks expirados
      const { data, error } = await this.supabase.rpc('clear_expired_transaction_locks');
      
      if (error) {
        logger.error('[TransactionLockMaintenance] Erro ao limpar locks expirados:', error);
        return 0;
      }

      const count = data as number;
      if (count > 0) {
        logger.info(`[TransactionLockMaintenance] ${count} locks expirados removidos`);
      }
      
      return count;
    } catch (error) {
      logger.error('[TransactionLockMaintenance] Erro na limpeza de locks:', error);
      return 0;
    }
  }

  /**
   * Executa relatório de status dos locks
   */
  public async getLocksStatus(): Promise<{
    total: number;
    active: number;
    expired: number;
  }> {
    try {
      // Verifica se a tabela transaction_locks existe
      const { data: tableExists, error: checkError } = await this.supabase.rpc('check_table_exists', { 
        table_name: 'transaction_locks' 
      });
      
      if (checkError || !tableExists) {
        return { total: 0, active: 0, expired: 0 };
      }

      // Busca todos os locks
      const { data: locks, error: listError } = await this.supabase
        .from('transaction_locks')
        .select('*');
      
      if (listError || !locks) {
        logger.error('[TransactionLockMaintenance] Erro ao listar locks:', listError);
        return { total: 0, active: 0, expired: 0 };
      }
      
      // Verifica locks expirados
      const now = new Date();
      const activeLocks = locks.filter(lock => new Date(lock.expires_at) > now);
      const expiredLocks = locks.filter(lock => new Date(lock.expires_at) <= now);
      
      return {
        total: locks.length,
        active: activeLocks.length,
        expired: expiredLocks.length
      };
    } catch (error) {
      logger.error('[TransactionLockMaintenance] Erro ao verificar status dos locks:', error);
      return { total: 0, active: 0, expired: 0 };
    }
  }
} 