/**
 * MICROSERVIÇO: Esta funcionalidade foi movida para o microserviço de pagamentos
 * 
 * Este arquivo é mantido apenas como um stub para manter compatibilidade com
 * código legado, mas todas as funcionalidades de verificação e processamento
 * de pagamentos foram transferidas para o microserviço dedicado.
 */

import type { TransactionType } from './payment/types';

/**
 * Stub para manter compatibilidade com a API anterior
 * Todas as funcionalidades foram migradas para o microserviço de pagamentos
 */
export class BackgroundPaymentChecker {
  private static instance: BackgroundPaymentChecker;

  private constructor() {
    console.log('AVISO: BackgroundPaymentChecker está obsoleto - use o microserviço de pagamentos');
  }

  public static getInstance(): BackgroundPaymentChecker {
    if (!BackgroundPaymentChecker.instance) {
      console.log('AVISO: A verificação de pagamentos foi migrada para o microserviço');
      BackgroundPaymentChecker.instance = new BackgroundPaymentChecker();
    }
    return BackgroundPaymentChecker.instance;
  }

  public async startChecking() {
    console.log('AVISO: startChecking não executa mais - use o microserviço de pagamentos');
    return { status: 'success', checked: false, message: 'Função migrada para microserviço' };
  }

  public stopChecking() {
    console.log('AVISO: stopChecking não executa mais - use o microserviço de pagamentos');
  }

  public async checkPendingPayments() {
    console.log('AVISO: checkPendingPayments não executa mais - use o microserviço de pagamentos');
    return { status: 'success', processed: 0, message: 'Função migrada para microserviço' };
  }

  public async verifyExpiringTransactions() {
    console.log('AVISO: verifyExpiringTransactions não executa mais - use o microserviço de pagamentos');
    return { status: 'success', verified: 0, message: 'Função migrada para microserviço' };
  }

  public async checkPaymentStatus(paymentId: string) {
    console.log(`AVISO: checkPaymentStatus para ${paymentId} não executa mais - use o microserviço de pagamentos`);
    return { status: 'unknown', transaction_id: '', message: 'Função migrada para microserviço' };
  }

  public async checkPayment(transaction: TransactionType) {
    console.log(`AVISO: checkPayment para ${transaction.id} não executa mais - use o microserviço de pagamentos`);
    return { status: 'skipped', reason: 'Função migrada para microserviço' };
  }

  public async cancelExpiredTransactions() {
    console.log('AVISO: cancelExpiredTransactions não executa mais - use o microserviço de pagamentos');
    return { status: 'success', cancelled: 0, message: 'Função migrada para microserviço' };
  }
}

/**
 * Função stub para manter compatibilidade
 */
export async function processApprovedPayments(): Promise<{ success: boolean; message?: string }> {
  console.log('AVISO: processApprovedPayments não executa mais - use o microserviço de pagamentos');
  return { success: true, message: 'Função migrada para microserviço de pagamentos' };
} 