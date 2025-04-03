import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * Serviço para garantir idempotência nas operações de pagamento
 * Isto evita que a mesma transação seja processada múltiplas vezes
 */
export class IdempotencyService {
  /**
   * Cria um hash único baseado nos dados da transação
   * Este hash será usado como chave de idempotência
   */
  static createIdempotencyKey(data: Record<string, any>): string {
    const stringToHash = JSON.stringify({
      service_id: data.service_id,
      customer_email: data.customer_email,
      target_username: data.target_username,
      amount: data.amount,
      timestamp: Math.floor(Date.now() / 60000) // Arredondar para minutos para permitir tentativas dentro de um período curto
    });
    
    return crypto.createHash('sha256').update(stringToHash).digest('hex');
  }

  /**
   * Verifica se já existe uma transação com a mesma chave de idempotência
   * Retorna a transação existente ou null se não existir
   */
  static async checkExistingTransaction(idempotencyKey: string): Promise<any | null> {
    const supabase = createClient();
    
    // Verificar se existe alguma transação recente (últimas 24 horas) com esta chave
    // Isso permite que tentativas após 24 horas sejam tratadas como novas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .gt('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar existência de transação:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Registra uma tentativa de transação no log de idempotência
   */
  static async logTransactionAttempt(
    idempotencyKey: string, 
    transactionId: string | null,
    requestData: Record<string, any>,
    result: 'new' | 'existing' | 'error',
    errorMessage?: string
  ): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase.from('payment_idempotency_log').insert({
        idempotency_key: idempotencyKey,
        transaction_id: transactionId,
        request_data: requestData,
        result,
        error_message: errorMessage || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar tentativa de transação idempotente:', error);
      // Não deixamos falhar a transação se o log falhar
    }
  }

  /**
   * Processa uma requisição de forma idempotente
   * Retorna a transação existente se já foi processada, ou processa e retorna uma nova
   */
  static async processIdempotentRequest(
    requestData: Record<string, any>,
    processFn: (data: Record<string, any>, idempotencyKey: string) => Promise<any>
  ): Promise<{
    transaction: any;
    isNew: boolean;
    idempotencyKey: string;
  }> {
    // Criar chave de idempotência
    const idempotencyKey = this.createIdempotencyKey(requestData);
    
    try {
      // Verificar se já existe uma transação com esta chave
      const existingTransaction = await this.checkExistingTransaction(idempotencyKey);
      
      // Se já existe, retornar a transação existente
      if (existingTransaction) {
        await this.logTransactionAttempt(
          idempotencyKey,
          existingTransaction.id,
          requestData,
          'existing'
        );
        
        return {
          transaction: existingTransaction,
          isNew: false,
          idempotencyKey
        };
      }
      
      // Processar nova transação
      const newTransaction = await processFn(requestData, idempotencyKey);
      
      // Registrar tentativa bem-sucedida
      await this.logTransactionAttempt(
        idempotencyKey,
        newTransaction.id,
        requestData,
        'new'
      );
      
      return {
        transaction: newTransaction,
        isNew: true,
        idempotencyKey
      };
    } catch (error) {
      // Registrar erro
      await this.logTransactionAttempt(
        idempotencyKey,
        null,
        requestData,
        'error',
        error instanceof Error ? error.message : String(error)
      );
      
      // Reenviar erro
      throw error;
    }
  }
} 