import { createClient } from '@/lib/supabase/client';

interface TransactionLog {
  transaction_id?: string;
  event_type: string;
  message: string;
  metadata?: {
    transaction_created_at?: string;
    expiration_time?: string;
    canceled_at?: string;
    [key: string]: string | number | boolean | object | null | undefined;
  };
}

/**
 * Serviço para verificar e cancelar transações expiradas
 * O QR code PIX expira após 30 minutos da expiração do QR code PIX
 * Esta classe detecta e marca essas transações como canceladas
 */
export class TransactionExpirationChecker {
  private static instance: TransactionExpirationChecker;
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  /**
   * Obtém a instância singleton do verificador de expiração
   */
  public static getInstance(): TransactionExpirationChecker {
    if (!TransactionExpirationChecker.instance) {
      TransactionExpirationChecker.instance = new TransactionExpirationChecker();
    }
    return TransactionExpirationChecker.instance;
  }

  /**
   * Inicia o processo de verificação periódica
   */
  public start(): void {
    if (this.isRunning) {
      console.log('Verificador de expiração de transações já está em execução');
      return;
    }

    this.isRunning = true;

    // Verificar a cada 5 minutos
    if (!this.checkInterval) {
      this.checkInterval = setInterval(async () => {
        try {
          await this.checkExpiredTransactions();
        } catch (error) {
          console.error('Erro durante verificação programada de transações expiradas:', error);
        }
      }, 5 * 60 * 1000); // 5 minutos
    }

    // Executar uma verificação imediata ao iniciar
    this.checkExpiredTransactions().catch(error => {
      console.error('Erro durante verificação inicial de transações expiradas:', error);
    });

    console.log('Verificador de expiração de transações iniciado com sucesso');
  }

  /**
   * Para o processo de verificação
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Verificador de expiração de transações parado');
  }

  /**
   * Verifica transações pendentes que já passaram do tempo de expiração
   * PIX QR Code expira após 30 minutos (1800 segundos)
   */
  private async checkExpiredTransactions(): Promise<void> {
    console.log('Verificando transações expiradas...');
    const supabase = createClient();

    try {
      // Calcular o tempo de expiração (30 minutos = 1800 segundos atrás)
      const expirationTime = new Date();
      expirationTime.setSeconds(expirationTime.getSeconds() - 1800);
      const expirationTimeISO = expirationTime.toISOString();

      // Buscar transações pendentes criadas antes do tempo de expiração
      const { data: expiredTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', expirationTimeISO);

      if (error) {
        console.error('Erro ao buscar transações expiradas:', error);
        return;
      }

      if (!expiredTransactions || expiredTransactions.length === 0) {
        console.log('Nenhuma transação expirada encontrada');
        return;
      }

      console.log(`Encontradas ${expiredTransactions.length} transações expiradas para cancelar`);

      // Processar cada transação expirada
      for (const transaction of expiredTransactions) {
        console.log(`Cancelando transação expirada: ${transaction.id}`);

        // Inserir log da transação
        const log: TransactionLog = {
          transaction_id: transaction.id,
          event_type: 'expiration',
          message: 'Transação cancelada por expiração do prazo de pagamento',
          metadata: {
            transaction_created_at: transaction.created_at,
            expiration_time: expirationTimeISO,
            canceled_at: new Date().toISOString()
          }
        };

        await supabase.from('transaction_logs').insert(log);

        // Atualizar status da transação para "canceled"
        await supabase
          .from('transactions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
            status_details: 'Cancelada automaticamente após expiração do QR code PIX (30 minutos)'
          })
          .eq('id', transaction.id);

        console.log(`Transação ${transaction.id} cancelada com sucesso`);
      }
    } catch (error) {
      console.error('Erro ao processar transações expiradas:', error);
    }
  }

  /**
   * Método público para forçar uma verificação imediata
   */
  public async forceCheck(): Promise<{ success: boolean; count: number }> {
    try {
      await this.checkExpiredTransactions();
      return { success: true, count: 0 }; // O count exato não é retornado por simplicidade
    } catch (error) {
      console.error('Erro durante verificação forçada de transações expiradas:', error);
      return { success: false, count: 0 };
    }
  }
} 