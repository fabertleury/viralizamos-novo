/**
 * NOTA: A maioria das funcionalidades de verificação de pagamentos foi migrada 
 * para o microserviço viralizamos_pagamentos. Este arquivo permanece para 
 * compatibilidade com código legado.
 */

import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { PaymentStatusManager } from './PaymentStatusManager';
import { TransactionProcessor } from './TransactionProcessor';
import { ExpirationChecker } from './ExpirationChecker';
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
 * Interface para definir a forma de uma transação
 */
export interface Transaction {
  id: string;
  status: string;
  payment_id?: string;
  order_created?: boolean;
  [key: string]: unknown;
}

/**
 * Classe principal que gerencia o processo de verificação de pagamentos
 */
export class PaymentChecker {
  private static instance: PaymentChecker;
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private static isInitialized = false;
  
  private statusManager: PaymentStatusManager;
  private transactionProcessor: TransactionProcessor;
  private expirationChecker: ExpirationChecker;
  private supabase: SupabaseClient;
  private logger: Logger;

  private constructor() {
    this.supabase = createClient();
    this.logger = new Logger('PaymentChecker');
    this.statusManager = new PaymentStatusManager();
    this.transactionProcessor = new TransactionProcessor();
    this.expirationChecker = new ExpirationChecker();
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
   * Inicia o processo de verificação de pagamentos
   */
  public async startChecking(forceCheck = false): Promise<PaymentCheckerStartResult> {
    // Verificar se já está inicializado
    if (PaymentChecker.isInitialized && !forceCheck) {
      this.logger.info('PaymentChecker já foi inicializado anteriormente');
      return { status: 'already_initialized', checked: false };
    }
    
    // Verificar se já está em execução
    if (this.isRunning && !forceCheck) {
      this.logger.info('PaymentChecker já está em execução');
      return { status: 'already_running', checked: false };
    }
    
    this.logger.info('Iniciando PaymentChecker');
    this.isRunning = true;
    PaymentChecker.isInitialized = true;

    // Verificar a cada 20 segundos
    if (!this.checkInterval) {
      this.checkInterval = setInterval(async () => {
        try {
          await this.checkPendingPayments();
        } catch (error) {
          this.logger.error('Erro durante verificação programada de pagamentos:', error);
        }
      }, 20000);
    }

    // Verificar imediatamente ao iniciar ou se for forçado
    try {
      const result = await this.checkPendingPayments();
      return { 
        status: 'success', 
        checked: true, 
        result: result as unknown as Record<string, unknown> 
      };
    } catch (error) {
      this.logger.error('Erro ao verificar pagamentos durante inicialização:', error);
      return { status: 'error', checked: false, error: String(error) };
    }
  }

  /**
   * Para o processo de verificação de pagamentos
   */
  public stopChecking(): void {
    if (this.checkInterval) {
      this.logger.info('Parando PaymentChecker');
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Verifica pagamentos pendentes
   */
  private async checkPendingPayments(): Promise<PendingPaymentsCheckResult> {
    try {
      this.logger.info('Verificando pagamentos pendentes');
      
      // Inicialização do cliente Supabase
      const supabase = createClient();
      
      // Array para rastrear transações já processadas nesta execução
      const processedTransactions = new Set<string>();
      
      // Buscar transações com pagamento pendente na nova tabela core_transactions_v2
      const { data: transactions, error } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .is('order_created', false) // Transações sem pedidos criados
        .limit(10);
      
      if (error) {
        this.logger.error('Erro ao buscar transações pendentes:', error.message);
        
        // Tentar buscar na tabela antiga como fallback
        this.logger.info('Tentando buscar transações na tabela antiga como fallback');
        const { data: oldTransactions, error: oldError } = await supabase
          .from('core_transactions')
          .select('*')
          .is('order_created', false)
          .limit(10);
          
        if (oldError) {
          this.logger.error('Erro ao buscar transações antigas pendentes:', oldError.message);
          return { status: 'error', error: oldError.message };
        }
        
        if (oldTransactions && oldTransactions.length > 0) {
          this.logger.info(`Encontradas ${oldTransactions.length} transações pendentes na tabela antiga`);
          
          // Processar transações da tabela antiga
          for (const transaction of oldTransactions) {
            // Verificar se já processamos esta transação nesta execução
            if (processedTransactions.has(transaction.id)) {
              continue;
            }
            
            // Verificar se é transação já aprovada mas que excedeu tentativas
            if (transaction.status === 'approved') {
              const attemptCount = this.transactionProcessor.getAttemptCount(transaction.id);
              if (this.transactionProcessor.hasExceededMaxAttempts(transaction.id)) {
                this.logger.warn(`Transação ${transaction.id} já foi verificada ${attemptCount} vezes e está aprovada`);
                
                // Registrar um log indicando que a transação está aprovada mas não foi processada
                await supabase.from('core_processing_logs').insert({
                  transaction_id: transaction.id,
                  level: 'warning',
                  message: 'Transação aprovada mas sem pedido criado após múltiplas verificações',
                  metadata: {
                    payment_id: transaction.payment_id,
                    attempt_count: attemptCount,
                    timestamp: new Date().toISOString()
                  }
                });
                
                continue;
              }
            }
            
            // Incrementar contagem de tentativas
            this.transactionProcessor.incrementAttemptCount(transaction.id);
            
            // Adicionar à lista de processados nesta execução
            processedTransactions.add(transaction.id);
            
            // Processar a transação
            await this.transactionProcessor.processTransaction(transaction as TransactionType);
          }
          
          return { status: 'success', processed: oldTransactions.length };
        }
        
        return { status: 'error', error: error.message };
      }
      
      this.logger.info(`Encontradas ${transactions?.length || 0} transações pendentes`);
      
      // Processar cada transação
      for (const transaction of transactions || []) {
        try {
          // Verificar se já processamos esta transação nesta execução
          if (processedTransactions.has(transaction.id)) {
            continue;
          }
          
          // Verificar se é transação já aprovada mas que excedeu tentativas
          if (transaction.status === 'approved') {
            const attemptCount = this.transactionProcessor.getAttemptCount(transaction.id);
            if (this.transactionProcessor.hasExceededMaxAttempts(transaction.id)) {
              this.logger.warn(`Transação ${transaction.id} já foi verificada ${attemptCount} vezes e está aprovada`);
              
              // Registrar um log indicando que a transação está aprovada mas não foi processada
              await supabase.from('core_processing_logs').insert({
                transaction_id: transaction.id,
                level: 'warning',
                message: 'Transação aprovada mas sem pedido criado após múltiplas verificações',
                metadata: {
                  payment_id: transaction.payment_id,
                  attempt_count: attemptCount,
                  timestamp: new Date().toISOString()
                }
              });
              
              continue;
            }
          }
          
          // Incrementar contagem de tentativas
          this.transactionProcessor.incrementAttemptCount(transaction.id);
          
          // Adicionar à lista de processados nesta execução
          processedTransactions.add(transaction.id);
          
          // Processar a transação
          await this.transactionProcessor.processTransaction(transaction as TransactionType);
        } catch (transactionError) {
          this.logger.error(`Erro ao processar transação:`, transactionError);
        }
      }
      
      return { status: 'success', processed: transactions?.length || 0 };
    } catch (error) {
      this.logger.error('Erro ao verificar pagamentos pendentes:', error);
      return { status: 'error', error: String(error) };
    }
  }

  /**
   * Verifica transações que estão prestes a expirar
   */
  public async verifyExpiringTransactions(): Promise<ExpirationCheckResult> {
    return this.expirationChecker.checkExpiringTransactions();
  }

  /**
   * Cancela transações que já expiraram
   */
  public async cancelExpiredTransactions(): Promise<ExpiredCancellationResult> {
    return this.expirationChecker.cancelExpiredTransactions();
  }

  /**
   * Verifica o status de um pagamento específico
   */
  public async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    return this.statusManager.checkPaymentStatus(paymentId);
  }

  /**
   * Processa uma transação específica
   */
  public async processTransaction(transaction: TransactionType): Promise<TransactionProcessResult | undefined> {
    return this.transactionProcessor.processTransaction(transaction);
  }

  /**
   * Processa transações com pagamentos aprovados
   * Cria ordens e as envia aos provedores
   */
  private async processApprovedTransactions(transactions: TransactionType[], paymentStatusResults: Record<string, PaymentStatusResult>): Promise<Array<TransactionProcessResult>> {
    try {
      this.logger.info(`Processando ${transactions.length} transações aprovadas...`);
      
      const results: Array<TransactionProcessResult> = [];
      const transactionProcessor = new TransactionProcessor(this.supabase);
      
      for (const transaction of transactions) {
        try {
          const paymentResult = paymentStatusResults[transaction.id];
          
          if (paymentResult && paymentResult.status === 'approved') {
            this.logger.info(`Processando transação aprovada ${transaction.id}`);
            
            const processResult = await transactionProcessor.processTransaction(
              transaction,
              paymentResult
            );
            
            results.push(processResult);
            
            // Pequena pausa para não sobrecarregar o banco de dados
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          this.logger.error(`Erro ao processar transação ${transaction.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          
          results.push({
            status: 'error',
            reason: 'Erro durante processamento',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Erro ao processar transações aprovadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return [{
        status: 'error',
        reason: 'Erro no processamento em lote',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }];
    }
  }
} 