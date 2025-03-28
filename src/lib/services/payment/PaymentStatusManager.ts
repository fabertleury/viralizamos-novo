import mercadopago from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { TransactionType, PaymentStatusResult } from './types';
import { TransactionProcessor } from './TransactionProcessor';

// Cache para evitar consultas repetidas
const statusCache: Record<string, { status: string, timestamp: number }> = {};
const CACHE_TTL = 5000; // 5 segundos

export class PaymentStatusManager {
  constructor() {
    // Configuração do Mercado Pago
    mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');
  }

  /**
   * Verifica o status de um pagamento no Mercado Pago
   */
  public async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    try {
      console.log(`Verificando status do pagamento ${paymentId}...`);
      const supabase = createClient();

      // Buscar transação no Supabase na nova tabela core_transactions_v2
      const { data: transaction, error } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .or(`payment_external_reference.eq."${paymentId}",payment_id.eq."${paymentId}"`)
        .single();

      if (error) {
        console.error('Erro ao buscar transação:', error);
        
        // Verificar se a transação existe na tabela antiga
        const { data: oldTransaction, error: oldError } = await supabase
          .from('core_transactions')
          .select('*')
          .or(`payment_external_reference.eq."${paymentId}",payment_id.eq."${paymentId}"`)
          .single();
          
        if (!oldError && oldTransaction) {
          console.log(`Transação encontrada na tabela antiga para pagamento ${paymentId}`);
          // Continuar com a transação antiga
          return this.processPaymentStatus(paymentId, oldTransaction as TransactionType);
        }
        
        console.log(`Transação não encontrada no Supabase, buscando no Mercado Pago`);
        // Se a transação não foi encontrada em nenhuma tabela, verificar diretamente no Mercado Pago
        return this.checkPaymentDirectly(paymentId);
      }

      if (!transaction) {
        console.warn(`Transação não encontrada para pagamento ${paymentId}`);
        return this.checkPaymentDirectly(paymentId);
      }

      return this.processPaymentStatus(paymentId, transaction as TransactionType);
    } catch (error) {
      console.error(`Erro ao verificar status do pagamento ${paymentId}:`, error);
      return {
        status: 'error',
        error: String(error)
      };
    }
  }

  /**
   * Processa o status de um pagamento e atualiza a transação se necessário
   */
  private async processPaymentStatus(paymentId: string, transaction: TransactionType): Promise<PaymentStatusResult> {
    // Verificar cache para evitar consultas desnecessárias
    const now = Date.now();
    const cachedData = statusCache[paymentId];
    if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Usando cache para payment_id ${paymentId}, status: ${cachedData.status}`);
      
      // Se o pagamento está aprovado e não tem pedido criado, tentar processar
      if (cachedData.status === 'approved' && (!transaction.order_created || transaction.order_created === false)) {
        console.log(`Pagamento ${paymentId} está aprovado em cache mas sem pedido. Tentando processar...`);
        this.processApprovedTransaction(transaction);
      }
      
      return {
        status: cachedData.status,
        transaction_id: transaction.id,
        transaction: transaction,
        source: 'cache'
      };
    }

    // Buscar status no Mercado Pago
    console.log(`Consultando Mercado Pago para pagamento ${paymentId}...`);
    const paymentResponse = await mercadopago.payment.get(String(paymentId));
    const paymentData = paymentResponse.body;
    const currentStatus = paymentData.status;
    
    console.log(`Status atual do pagamento ${paymentId}: ${currentStatus}`);

    // Atualizar cache
    statusCache[paymentId] = {
      status: currentStatus,
      timestamp: now
    };

    // Mapear status do Mercado Pago para status da transação
    let transactionStatus;
    switch (currentStatus) {
      case 'approved':
        transactionStatus = 'approved';
        break;
      case 'pending':
        transactionStatus = 'pending';
        break;
      case 'in_process':
        transactionStatus = 'processing';
        break;
      case 'rejected':
        transactionStatus = 'rejected';
        break;
      case 'cancelled':
        transactionStatus = 'cancelled';
        break;
      case 'refunded':
        transactionStatus = 'refunded';
        break;
      case 'charged_back':
        transactionStatus = 'chargeback';
        break;
      default:
        transactionStatus = 'pending';
    }

    // Verificar se o status mudou
    if (transaction.status !== transactionStatus) {
      console.log(`Status do pagamento ${paymentId} mudou: ${transaction.status} -> ${transactionStatus}`);
      
      // Identificar qual tabela atualizar baseado no ID da transação
      const tableName = 'action_type' in transaction ? 'core_transactions_v2' : 'core_transactions';
      
      // Atualizar a transação
      const { error: updateError } = await createClient()
        .from(tableName)
        .update({
          status: transactionStatus,
          payment_status: currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);
      
      if (updateError) {
        console.error(`Erro ao atualizar transação ${transaction.id}:`, updateError);
      } else {
        console.log(`Transação ${transaction.id} atualizada para status '${transactionStatus}'`);
        
        // Registrar log da atualização
        try {
          await createClient().from('core_processing_logs').insert({
            transaction_id: transaction.id,
            level: 'info',
            message: `Status do pagamento atualizado: ${currentStatus}`,
            metadata: {
              payment_id: paymentId,
              previous_status: transaction.status,
              new_status: transactionStatus
            }
          });
        } catch (logError) {
          console.error('Erro ao registrar log de atualização:', logError);
        }
        
        // Processar a transação automaticamente se foi aprovada
        if (transactionStatus === 'approved' && (!transaction.order_created || transaction.order_created === false)) {
          console.log(`Transação ${transaction.id} aprovada. Iniciando processamento automático...`);
          this.processApprovedTransaction(transaction);
        }
      }
    } else {
      console.log(`Status do pagamento ${paymentId} não mudou: ${transaction.status}`);
      
      // Verificar se a transação está aprovada mas sem pedido criado
      if (transaction.status === 'approved' && (!transaction.order_created || transaction.order_created === false)) {
        console.log(`Transação ${transaction.id} já está aprovada mas sem pedido. Iniciando processamento...`);
        this.processApprovedTransaction(transaction);
      }
    }

    return {
      status: currentStatus,
      statusDetail: paymentData.status_detail,
      payment: paymentData,
      transaction_id: transaction.id,
      source: 'mercadopago'
    };
  }
  
  /**
   * Processa uma transação aprovada de forma assíncrona
   */
  private processApprovedTransaction(transaction: TransactionType) {
    // Executar em background para não bloquear
    setTimeout(async () => {
      try {
        console.log(`Processando transação aprovada ${transaction.id} (assíncrono)`);
        const supabase = createClient();
        const transactionProcessor = new TransactionProcessor(supabase);
        
        const result = await transactionProcessor.processTransaction(transaction);
        console.log(`Resultado do processamento da transação ${transaction.id}:`, result);
        
        if (result.status === 'processed') {
          console.log(`Transação ${transaction.id} processada com sucesso!`);
        } else {
          console.error(`Erro ao processar transação ${transaction.id}: ${result.reason || 'Razão desconhecida'}`);
        }
      } catch (error) {
        console.error(`Erro ao processar transação ${transaction.id}:`, error);
        
        // Registrar erro para análise
        try {
          const supabase = createClient();
          await supabase.from('core_processing_logs').insert({
            transaction_id: transaction.id,
            level: 'error',
            message: 'Erro ao processar transação automaticamente',
            metadata: {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.error('Erro ao registrar log de erro:', logError);
        }
      }
    }, 100);
  }

  /**
   * Verifica o status de um pagamento diretamente no Mercado Pago
   */
  private async checkPaymentDirectly(paymentId: string): Promise<PaymentStatusResult> {
    try {
      console.log(`Status do pagamento (Mercado Pago direto): ${paymentId}`);
      const paymentResponse = await mercadopago.payment.get(String(paymentId));
      const paymentData = paymentResponse.body;
      const currentStatus = paymentData.status;
      
      console.log(`Status do pagamento (Mercado Pago direto): ${currentStatus}`);
      
      // Atualizar cache
      statusCache[paymentId] = {
        status: currentStatus,
        timestamp: Date.now()
      };
      
      return {
        status: currentStatus,
        statusDetail: paymentData.status_detail,
        payment: paymentData,
        source: 'mercadopago_direct'
      };
    } catch (error) {
      console.error(`Erro ao verificar pagamento diretamente no Mercado Pago:`, error);
      return {
        status: 'error',
        error: String(error),
        source: 'error_mercadopago_direct'
      };
    }
  }
} 