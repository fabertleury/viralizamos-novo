/**
 * Exporta o novo sistema de pagamento refatorado
 * 
 * Este arquivo serve como uma camada de compatibilidade para a migração
 * do BackgroundPaymentChecker para o novo sistema modular.
 * 
 * NOTA: A maioria das funcionalidades foi migrada para microserviços dedicados.
 * Este wrapper permanece para compatibilidade com código legado.
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
      // Log removido - funcionalidade migrada para microserviço
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
    // Log reduzido - funcionalidade migrada para microserviço
    
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
      return { success: true, message: 'Nenhuma transação pendente' };
    }
    
    // Verificar posts selecionados por transação para análise prévia
    const transactionPostsDetails = [];
    
    for (const transaction of transactions) {
      try {
        // Buscar posts da transação na tabela core_transaction_posts_v2
        const { data: posts } = await supabase
          .from('core_transaction_posts_v2')
          .select('*')
          .eq('transaction_id', transaction.id);
          
        if (posts && posts.length > 0) {
          // Todos os posts são considerados selecionados por padrão
          transactionPostsDetails.push({
            transactionId: transaction.id,
            totalPosts: posts.length,
            selectedPosts: posts.length,  // Todos os posts são considerados selecionados
            hasSelectedPosts: true  // Se houver posts, eles são considerados selecionados
          });
        } else {
          transactionPostsDetails.push({
            transactionId: transaction.id,
            totalPosts: 0,
            selectedPosts: 0,
            hasSelectedPosts: false
          });
        }
      } catch (err) {
        console.error(`Erro ao verificar posts da transação ${transaction.id}:`, err);
      }
    }
    
    // Abordagem alternativa para verificar transações que já têm ordens
    const transactionsWithOrders = new Set();
    
    // Verificar uma a uma para evitar o uso do group
    for (const transactionId of transactions.map(t => t.id)) {
      const { count, error: countError } = await supabase
        .from('core_orders')
        .select('*', { count: 'exact', head: true })
        .eq('transaction_id', transactionId)
        .neq('status', 'error');
        
      if (!countError && count && count > 0) {
        transactionsWithOrders.add(transactionId);
      }
    }
    
    // Processar cada transação
    const transactionProcessor = new TransactionProcessor(supabase);
    const orderProcessor = new OrderProcessor(supabase);
    
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const transaction of transactions) {
      try {
        // Verificar se a transação já tem ordens
        if (transactionsWithOrders.has(transaction.id)) {
          // Atualizar o status order_created para true
          await supabase
            .from('core_transactions_v2')
            .update({
              order_created: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id);
            
          skippedCount++;
          continue;
        }
        
        // Verificar se tem posts para essa transação
        const postsDetail = transactionPostsDetails.find(p => p.transactionId === transaction.id);
        
        if (postsDetail && postsDetail.totalPosts === 0) {
          console.warn(`⚠️ ATENÇÃO: Transação ${transaction.id} não tem posts associados!`);
        }
        
        const result = await transactionProcessor.processTransaction(transaction);
        
        if (result && result.status === 'processed') {
          processedCount++;
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
    
    // Processar pedidos pendentes para envio ao provedor apenas uma vez após todas as transações
    if (processedCount > 0) {
      const processingResult = await orderProcessor.processPendingOrders();
    }
    
    return { 
      success: true, 
      message: `Processamento concluído: ${processedCount} transações processadas, ${skippedCount} puladas, ${errorCount} com erro.` 
    };
  } catch (error) {
    console.error('Erro ao processar pagamentos aprovados:', error);
    return { success: false, error: String(error) };
  }
} 