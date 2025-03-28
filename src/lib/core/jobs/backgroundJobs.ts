import { createClient } from '@/lib/supabase/server';
import { Logger } from '@/lib/core/utils/logger';
import { TransactionProcessor } from '@/lib/core/transaction/transactionProcessor';
import { OrderStatusService, OrdersStatusCheckResult } from '@/lib/core/services/orderStatusService';

type JobResult = {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  error?: Error | unknown;
};

type BatchResult = {
  transactions: JobResult;
  ordersStatus: JobResult;
  completedAt: string;
};

/**
 * Serviço para processar jobs em background
 */
export class BackgroundJobService {
  private logger: Logger;
  private transactionProcessor: TransactionProcessor;
  private orderStatusService: OrderStatusService;
  private isRunning: boolean = false;
  private lastRunTime: string | null = null;

  constructor() {
    this.logger = new Logger('BackgroundJobService');
    this.transactionProcessor = new TransactionProcessor();
    this.orderStatusService = new OrderStatusService();
  }

  /**
   * Processa transações pendentes
   * @param limit Número máximo de transações a processar
   * @returns Resultado do processamento
   */
  async processTransactions(limit = 10): Promise<JobResult> {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Já existe um job em execução',
      };
    }

    try {
      this.isRunning = true;
      this.logger.info(`Iniciando processamento de até ${limit} transações pendentes`);
      
      const supabase = createClient();
      
      // Buscar transações pendentes aprovadas
      const { data: transactions, error } = await supabase
        .from('core_transactions')
        .select('id')
        .eq('status', 'approved')
        .is('processed_at', null)
        .order('created_at', { ascending: true })
        .limit(limit);
      
      if (error) {
        this.logger.error(`Erro ao buscar transações pendentes: ${error.message}`);
        return {
          success: false,
          message: `Erro ao buscar transações: ${error.message}`,
          error,
        };
      }
      
      if (!transactions || transactions.length === 0) {
        this.logger.info('Nenhuma transação pendente encontrada para processamento');
        return {
          success: true,
          message: 'Nenhuma transação pendente encontrada',
        };
      }
      
      this.logger.info(`Processando ${transactions.length} transações pendentes`);
      
      const results = {
        totalProcessed: transactions.length,
        successCount: 0,
        failCount: 0,
        errors: [] as string[],
      };
      
      // Processar cada transação
      for (const transaction of transactions) {
        try {
          this.logger.info(`Processando transação ${transaction.id}`);
          const processResult = await this.transactionProcessor.processTransaction(transaction.id);
          
          if (processResult.success) {
            results.successCount++;
            this.logger.success(`Transação ${transaction.id} processada com sucesso`);
          } else {
            results.failCount++;
            const errorMessage = typeof processResult.error === 'object' && processResult.error instanceof Error
              ? processResult.error.message
              : processResult.error
                ? String(processResult.error)
                : 'Erro desconhecido';
            results.errors.push(`Transação ${transaction.id}: ${errorMessage}`);
            this.logger.error(`Erro ao processar transação ${transaction.id}: ${errorMessage}`);
          }
        } catch (error) {
          results.failCount++;
          const errorMessage = typeof error === 'object' && error instanceof Error 
            ? error.message 
            : String(error);
          results.errors.push(`Transação ${transaction.id}: ${errorMessage}`);
          this.logger.error(`Exceção ao processar transação ${transaction.id}:`, error);
        }
      }
      
      this.lastRunTime = new Date().toISOString();
      
      this.logger.info(`Processamento de transações concluído: ${results.successCount} sucesso, ${results.failCount} falhas`);
      
      return {
        success: true,
        message: `Processamento de transações concluído: ${results.successCount} sucesso, ${results.failCount} falhas`,
        details: results,
      };
    } catch (error) {
      this.logger.error('Erro durante o processamento em lote de transações:', error);
      return {
        success: false,
        message: 'Erro durante o processamento de transações',
        error,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Verifica o status de pedidos pendentes
   * @param limit Número máximo de pedidos a verificar
   * @returns Resultado da verificação
   */
  async checkOrdersStatus(limit = 50): Promise<JobResult> {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Já existe um job em execução',
      };
    }

    try {
      this.isRunning = true;
      this.logger.info(`Iniciando verificação de status para até ${limit} pedidos`);
      
      const result: OrdersStatusCheckResult = await this.orderStatusService.checkOrdersStatus(limit);
      
      this.lastRunTime = new Date().toISOString();
      
      if (result.totalProcessed === 0) {
        this.logger.info('Nenhum pedido pendente encontrado para verificação');
        return {
          success: true,
          message: 'Nenhum pedido pendente encontrado',
          details: result,
        };
      }
      
      this.logger.info(`Verificação de status concluída: ${result.successCount} sucesso, ${result.failCount} falhas, ${result.statusChangedCount} alterações de status`);
      
      return {
        success: true,
        message: `Verificação de status concluída: ${result.successCount} sucesso, ${result.failCount} falhas, ${result.statusChangedCount} alterações de status`,
        details: result,
      };
    } catch (error) {
      this.logger.error('Erro durante a verificação de status de pedidos:', error);
      return {
        success: false,
        message: 'Erro durante a verificação de status de pedidos',
        error,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Executa um batch completo de processamento de transações e verificação de status
   * @returns Resultado do batch
   */
  async runCompleteBatch(): Promise<BatchResult> {
    this.logger.info('Iniciando batch completo de processamento');
    
    const transactionsResult = await this.processTransactions();
    const ordersStatusResult = await this.checkOrdersStatus();
    
    this.logger.info('Batch completo finalizado');
    
    return {
      transactions: transactionsResult,
      ordersStatus: ordersStatusResult,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Retorna o status atual dos jobs
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
    };
  }
} 