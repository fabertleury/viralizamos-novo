import { OrderProcessor } from '../orderProcessor';
import { TransactionLockMaintenance } from '../maintenance/transactionLockMaintenance';

export class MercadoPagoWebhook {
  private supabase;
  private orderProcessor: OrderProcessor;
  private lockMaintenance: TransactionLockMaintenance;

  constructor() {
    this.supabase = createClient();
    this.orderProcessor = new OrderProcessor();
    this.lockMaintenance = new TransactionLockMaintenance();
  }

  public async handleWebhook(req: any, res: any): Promise<ApiResponseType> {
    // ... existing code ...
  }

  public async handleApprovedPayment(
    paymentData: any,
    userData: any
  ): Promise<ApiResponseType> {
    try {
      // Limpa locks expirados antes de continuar
      await this.lockMaintenance.clearExpiredLocks();

      // ... existing code ...

      // Verifica se já existe um lock para esta transação
      const { data: existingLock } = await this.supabase
        .from('transaction_locks')
        .select('transaction_id')
        .eq('transaction_id', transactionId)
        .single();

      if (existingLock) {
        // ... existing code ...
      }

      // Tenta criar um lock para esta transação
      const lockExpiresAt = new Date();
      lockExpiresAt.setMinutes(lockExpiresAt.getMinutes() + 30); // Lock expira em 30 minutos

      const { error: lockError } = await this.supabase
        .from('transaction_locks')
        .insert({
          transaction_id: transactionId,
          locked_at: new Date().toISOString(),
          expires_at: lockExpiresAt.toISOString(),
        });

      // ... rest of existing code ...
    } catch (error) {
      // ... handle error ...
    }
  }
} 