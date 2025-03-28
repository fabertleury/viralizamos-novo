/**
 * Exporta o novo sistema de pagamento refatorado
 * 
 * Este arquivo serve como uma camada de compatibilidade para a migração
 * do BackgroundPaymentChecker para o novo sistema modular.
 */

import { PaymentChecker } from './payment/PaymentChecker';
import type { TransactionType, PaymentStatusResult, TransactionProcessResult, PendingPaymentsCheckResult } from './payment/types';
import { createClient } from '@/lib/supabase/server';
import { TransactionProcessor } from './payment/TransactionProcessor';
import { OrderProcessor } from './order/OrderProcessor';

/**
 * Wrapper para manter compatibilidade com a API anterior
 */
export class BackgroundPaymentChecker {
  private static instance: BackgroundPaymentChecker;
  private paymentChecker: PaymentChecker;

  private constructor() {
    this.paymentChecker = PaymentChecker.getInstance();
  }

  public static getInstance(): BackgroundPaymentChecker {
    if (!BackgroundPaymentChecker.instance) {
      console.log('Criando nova instância do BackgroundPaymentChecker (V2)');
      BackgroundPaymentChecker.instance = new BackgroundPaymentChecker();
    }
    return BackgroundPaymentChecker.instance;
  }

  public async startChecking(forceCheck = false) {
    return this.paymentChecker.startChecking(forceCheck);
  }

  public stopChecking() {
    this.paymentChecker.stopChecking();
  }

  public async checkPendingPayments(): Promise<PendingPaymentsCheckResult> {
    // Método privado no novo PaymentChecker, mas exposto publicamente aqui
    // para compatibilidade com o código anterior
    return (this.paymentChecker as unknown as { 
      checkPendingPayments: () => Promise<PendingPaymentsCheckResult> 
    }).checkPendingPayments();
  }

  public async verifyExpiringTransactions() {
    return this.paymentChecker.verifyExpiringTransactions();
  }

  public async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    return this.paymentChecker.checkPaymentStatus(paymentId);
  }

  public async checkPayment(transaction: TransactionType): Promise<TransactionProcessResult | undefined> {
    return this.paymentChecker.processTransaction(transaction);
  }

  public async cancelExpiredTransactions() {
    return this.paymentChecker.cancelExpiredTransactions();
  }
}

// Também exportar a implementação modular para uso direto se necessário
export { PaymentChecker };
export { PaymentStatusManager } from './payment/PaymentStatusManager';
export { TransactionProcessor } from './payment/TransactionProcessor';
export { ExpirationChecker } from './payment/ExpirationChecker';

// Exportar os tipos
export type { 
  TransactionType, 
  PaymentStatusResult, 
  TransactionProcessResult,
  ExpirationCheckResult,
  ExpiredCancellationResult,
  PaymentCheckerStartResult,
  PendingPaymentsCheckResult,
  PaymentStatus
} from './payment/types';

/**
 * Inicia o processamento de pagamentos pendentes
 * @returns Resultado do processamento
 */
export async function processApprovedPayments(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    console.log('Iniciando processamento de pagamentos aprovados manualmente...');
    
    const supabase = createClient();
    
    // Buscar transações aprovadas que ainda não têm ordem criada
    const { data: transactions, error } = await supabase
      .from('core_transactions_v2')
      .select('*')
      .eq('status', 'approved')
      .is('order_created', false)
      .limit(10);
      
    if (error) {
      console.error('Erro ao buscar transações aprovadas:', error);
      return { success: false, error: error.message };
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('Nenhuma transação aprovada pendente de processamento.');
      return { success: true, message: 'Nenhuma transação pendente' };
    }
    
    console.log(`Encontradas ${transactions.length} transações aprovadas para processamento.`);
    
    // Processar cada transação
    const transactionProcessor = new TransactionProcessor(supabase);
    const orderProcessor = new OrderProcessor(supabase);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const transaction of transactions) {
      try {
        console.log(`Processando transação ${transaction.id}...`);
        
        const result = await transactionProcessor.processTransaction(transaction);
        
        if (result && result.status === 'processed') {
          console.log(`Transação ${transaction.id} processada com sucesso!`);
          processedCount++;
          
          // Processar pedidos pendentes para envio ao provedor
          console.log('Processando pedidos pendentes...');
          await orderProcessor.processPendingOrders();
        } else {
          console.warn(`Transação ${transaction.id} não foi processada: ${result?.reason || 'Razão desconhecida'}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Erro ao processar transação ${transaction.id}:`, error);
        errorCount++;
      }
      
      // Pequena pausa para não sobrecarregar o banco de dados
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return { 
      success: true, 
      message: `Processamento concluído: ${processedCount} transações processadas, ${errorCount} com erro.` 
    };
  } catch (error) {
    console.error('Erro ao processar pagamentos aprovados:', error);
    return { success: false, error: String(error) };
  }
} 