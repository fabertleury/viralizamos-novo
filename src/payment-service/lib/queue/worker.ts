import { getNextJob, completeJob, retryJob } from './redis';
import { MercadoPagoService } from '../providers/mercadopago';
import { createClient } from '@/lib/supabase/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

// Intervalo de verificação da fila (em ms)
const POLLING_INTERVAL = 5000;

/**
 * Processador de jobs da fila de pagamentos
 */
export class QueueWorker {
  private static instance: QueueWorker;
  private running = false;
  private interval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Construtor privado para singleton
  }
  
  /**
   * Obtém instância única do worker
   */
  static getInstance(): QueueWorker {
    if (!QueueWorker.instance) {
      QueueWorker.instance = new QueueWorker();
    }
    return QueueWorker.instance;
  }
  
  /**
   * Inicia o processamento da fila
   */
  start(): void {
    if (this.running) {
      console.log('Worker já está em execução');
      return;
    }
    
    console.log('Iniciando worker de processamento de pagamentos');
    this.running = true;
    
    // Processar imediatamente e depois a cada intervalo
    this.processNextJob();
    this.interval = setInterval(() => this.processNextJob(), POLLING_INTERVAL);
  }
  
  /**
   * Para o processamento da fila
   */
  stop(): void {
    if (!this.running) {
      return;
    }
    
    console.log('Parando worker de processamento de pagamentos');
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.running = false;
  }
  
  /**
   * Processa o próximo job disponível na fila
   */
  private async processNextJob(): Promise<void> {
    try {
      const job = await getNextJob();
      
      if (!job) {
        return; // Nenhum job disponível no momento
      }
      
      console.log(`Processando job ${job.id} (operação: ${job.operation})`);
      
      try {
        // Processar de acordo com a operação
        switch (job.operation) {
          case 'checkPaymentStatus':
            await this.handleCheckPaymentStatus(job);
            break;
            
          case 'processApprovedTransaction':
            await this.handleProcessApprovedTransaction(job);
            break;
            
          case 'notifyMainSystem':
            await this.handleNotifyMainSystem(job);
            break;
            
          default:
            console.warn(`Operação desconhecida: ${job.operation}`);
            // Completar o job mesmo assim para não bloquear a fila
            await completeJob(job.id);
        }
      } catch (error) {
        console.error(`Erro ao processar job ${job.id}:`, error);
        
        // Tentar novamente mais tarde
        const scheduled = await retryJob(job.id);
        
        if (!scheduled) {
          console.error(`Job ${job.id} falhou permanentemente após várias tentativas`);
          
          // Registrar falha no banco de dados
          const supabase = createClient();
          await supabase.from('payment_processing_failures').insert({
            job_id: job.id,
            operation: job.operation,
            transaction_id: job.transactionId || null,
            payload: job.payload,
            attempts: job.retries,
            last_error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      console.error('Erro ao obter próximo job:', error);
      // Aguardar próximo intervalo para tentar novamente
    }
  }
  
  /**
   * Manipula verificação de status de pagamento
   */
  private async handleCheckPaymentStatus(job: any): Promise<void> {
    const { paymentId } = job.payload;
    
    if (!paymentId) {
      throw new Error('ID do pagamento não fornecido');
    }
    
    // Verificar status no Mercado Pago
    const result = await MercadoPagoService.checkPaymentStatus(paymentId);
    
    // Se o status foi atualizado com sucesso
    if (result.updated) {
      // Atualizar status no banco de dados
      const supabase = createClient();
      const { data, error } = await supabase
        .from('transactions')
        .update({ status: result.status })
        .eq('payment_id', paymentId)
        .select();
      
      if (error) {
        throw new Error(`Erro ao atualizar status da transação: ${error.message}`);
      }
      
      // Se a transação foi encontrada e atualizada
      if (data && data.length > 0) {
        const transaction = data[0];
        console.log(`Status da transação ${transaction.id} atualizado para ${result.status}`);
        
        // Se o pagamento foi aprovado, criar job para processar a transação
        if (result.status === 'approved' && !transaction.order_created) {
          await this.createJobToProcessTransaction(transaction.id);
        }
      }
    }
    
    // Marcar job como concluído
    await completeJob(job.id);
  }
  
  /**
   * Cria um job para processar uma transação aprovada
   */
  private async createJobToProcessTransaction(transactionId: string): Promise<void> {
    // Importar a função de adição à fila
    const { addToQueue } = await import('./redis');
    
    // Adicionar job para processar a transação
    await addToQueue('processApprovedTransaction', { transactionId }, {
      transactionId,
      priority: 2, // Prioridade alta
    });
    
    console.log(`Job de processamento criado para transação ${transactionId}`);
  }
  
  /**
   * Manipula o processamento de transação aprovada
   */
  private async handleProcessApprovedTransaction(job: any): Promise<void> {
    const { transactionId } = job.payload;
    
    if (!transactionId) {
      throw new Error('ID da transação não fornecido');
    }
    
    console.log(`Processando transação aprovada ${transactionId}`);
    
    // Processar a transação com a função existente
    const orders = await processTransaction(transactionId);
    
    // Atualizar transação com IDs dos pedidos criados
    if (orders && orders.length > 0) {
      const supabase = createClient();
      await supabase
        .from('transactions')
        .update({
          order_created: true,
          order_id: orders[0].id,
          processed_at: new Date().toISOString()
        })
        .eq('id', transactionId);
      
      console.log(`Transação ${transactionId} processada, pedido ${orders[0].id} criado`);
      
      // Criar job para notificar o sistema principal
      await this.createJobToNotifyMainSystem(transactionId, orders[0].id);
    }
    
    // Marcar job como concluído
    await completeJob(job.id);
  }
  
  /**
   * Cria um job para notificar o sistema principal
   */
  private async createJobToNotifyMainSystem(transactionId: string, orderId: string): Promise<void> {
    // Importar a função de adição à fila
    const { addToQueue } = await import('./redis');
    
    // Adicionar job para notificar o sistema principal
    await addToQueue('notifyMainSystem', { transactionId, orderId }, {
      transactionId,
      priority: 1,
    });
    
    console.log(`Job de notificação criado para transação ${transactionId}`);
  }
  
  /**
   * Manipula a notificação para o sistema principal
   */
  private async handleNotifyMainSystem(job: any): Promise<void> {
    const { transactionId, orderId } = job.payload;
    
    if (!transactionId) {
      throw new Error('ID da transação não fornecido');
    }
    
    console.log(`Notificando sistema principal sobre transação ${transactionId}`);
    
    // TODO: Implementar webhook de notificação para o sistema principal se necessário
    
    // Marcar job como concluído
    await completeJob(job.id);
  }
} 