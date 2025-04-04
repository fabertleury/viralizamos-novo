/**
 * MICROSERVIÇO: Esta funcionalidade foi movida para o microserviço de pagamentos
 * 
 * Este arquivo é mantido apenas como um stub para manter compatibilidade com
 * código legado, mas todas as funcionalidades de verificação e processamento
 * de pagamentos foram transferidas para o microserviço dedicado.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/core/utils/logger';
import type { 
  TransactionType, 
  PaymentCheckerStartResult, 
  PendingPaymentsCheckResult, 
  PaymentStatusResult,
  TransactionProcessResult,
  ExpirationCheckResult,
  ExpiredCancellationResult
} from './types';

/**
 * Interface para definir a forma de uma transação (mantida para compatibilidade)
 */
export interface Transaction {
  id: string;
  status: string;
  payment_id?: string;
  order_created?: boolean;
  [key: string]: unknown;
}

/**
 * Classe stub que substitui o verificador de pagamentos
 * Todas as funcionalidades foram migradas para o microserviço de pagamentos
 */
export class PaymentChecker {
  private static instance: PaymentChecker;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('PaymentChecker');
    this.logger.info('AVISO: PaymentChecker está obsoleto - use o microserviço de pagamentos');
  }

  /**
   * Obtém a instância única do PaymentChecker (Singleton)
   */
  public static getInstance(): PaymentChecker {
    if (!PaymentChecker.instance) {
      PaymentChecker.instance = new PaymentChecker();
    }
    return PaymentChecker.instance;
  }

  /**
   * Stub para método de iniciar verificação
   */
  public async startChecking(): Promise<PaymentCheckerStartResult> {
    this.logger.info('AVISO: startChecking não executa mais - use o microserviço de pagamentos');
    return { status: 'success', checked: false, message: 'Função migrada para microserviço' };
  }

  /**
   * Stub para método de parar verificação
   */
  public stopChecking(): void {
    this.logger.info('AVISO: stopChecking não executa mais - use o microserviço de pagamentos');
  }

  /**
   * Stub para verificação de pagamentos pendentes
   */
  public async verifyExpiringTransactions(): Promise<ExpirationCheckResult> {
    this.logger.info('AVISO: verifyExpiringTransactions não executa mais - use o microserviço de pagamentos');
    return { status: 'success', verified: 0, message: 'Função migrada para microserviço' };
  }

  /**
   * Stub para cancelamento de transações expiradas
   */
  public async cancelExpiredTransactions(): Promise<ExpiredCancellationResult> {
    this.logger.info('AVISO: cancelExpiredTransactions não executa mais - use o microserviço de pagamentos');
    return { status: 'success', cancelled: 0, message: 'Função migrada para microserviço' };
  }

  /**
   * Stub para verificação de status de pagamento
   */
  public async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    this.logger.info(`AVISO: checkPaymentStatus para ${paymentId} não executa mais - use o microserviço de pagamentos`);
    return { status: 'unknown', transaction_id: '', message: 'Função migrada para microserviço' };
  }

  /**
   * Stub para processamento de transação
   */
  public async processTransaction(transaction: TransactionType): Promise<TransactionProcessResult | undefined> {
    this.logger.info(`AVISO: processTransaction para ${transaction.id} não executa mais - use o microserviço de pagamentos`);
    return { status: 'skipped', reason: 'Função migrada para microserviço' };
  }
} 