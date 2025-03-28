import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export class ExpireTransactionsService {
  private static instance: ExpireTransactionsService;
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private static isInitialized = false;

  private constructor() {}

  public static getInstance(): ExpireTransactionsService {
    if (!ExpireTransactionsService.instance) {
      ExpireTransactionsService.instance = new ExpireTransactionsService();
    }
    return ExpireTransactionsService.instance;
  }

  public async startChecking(forceCheck = false) {
    // Verificar se já está inicializado
    if (ExpireTransactionsService.isInitialized && !forceCheck) {
      logger.info('ExpireTransactionsService já foi inicializado anteriormente, ignorando solicitação duplicada');
      return { status: 'already_initialized', checked: false };
    }
    
    // Verificar se já está em execução
    if (this.isRunning && !forceCheck) {
      logger.info('ExpireTransactionsService já está em execução, pulando inicialização');
      return { status: 'already_running', checked: false };
    }
    
    logger.info('Iniciando ExpireTransactionsService...');
    this.isRunning = true;
    ExpireTransactionsService.isInitialized = true;

    // Verificar a cada 5 minutos
    if (!this.checkInterval) {
      this.checkInterval = setInterval(async () => {
        try {
          await this.expireOldTransactions();
        } catch (error) {
          logger.error('Erro durante expiração de transações:', error);
        }
      }, 5 * 60 * 1000); // 5 minutos
    }

    // Verificar imediatamente ao iniciar ou se for forçado
    try {
      logger.info(`Realizando verificação inicial${forceCheck ? ' (forçada)' : ''}...`);
      const result = await this.expireOldTransactions();
      return { status: 'success', checked: true, result };
    } catch (error) {
      logger.error('Erro ao expirar transações durante inicialização:', error);
      return { status: 'error', checked: false, error: String(error) };
    }
  }

  public stopChecking() {
    if (this.checkInterval) {
      logger.info('Parando ExpireTransactionsService...');
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
  }

  private async expireOldTransactions() {
    try {
      logger.info('Verificando transações pendentes para expiração...');
      const supabase = createClient();
      
      // Calcular data limite de expiração (30 minutos atrás)
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() - 30); // PIX expira em 30 minutos
      
      // Buscar transações pendentes antigas
      const { data: pendingTransactions, error } = await supabase
        .from('transactions')
        .select('id, created_at, payment_id')
        .eq('status', 'pending')
        .lt('created_at', expirationTime.toISOString())
        .limit(50); // Limitar para não sobrecarregar
      
      if (error) {
        logger.error('Erro ao buscar transações pendentes:', error.message);
        return { success: false, expired: 0, error: error.message };
      }
      
      logger.info(`Encontradas ${pendingTransactions?.length || 0} transações pendentes para expirar`);
      
      // Atualizar status para 'expired'
      if (pendingTransactions && pendingTransactions.length > 0) {
        const transactionIds = pendingTransactions.map(t => t.id);
        
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'rejected', 
            status_text: 'expired',
            updated_at: new Date().toISOString(),
            metadata: supabase.rpc('jsonb_append', { 
              target: 'metadata', 
              key: 'expiration_info', 
              value: JSON.stringify({
                expired_at: new Date().toISOString(),
                reason: 'PIX code expired after 30 minutes'
              })
            })
          })
          .in('id', transactionIds);
        
        if (updateError) {
          logger.error('Erro ao atualizar transações expiradas:', updateError.message);
          return { success: false, expired: 0, error: updateError.message };
        }
        
        logger.info(`${transactionIds.length} transações marcadas como expiradas`);
        
        // Registrar IDs expirados para depuração
        if (transactionIds.length > 0) {
          logger.info(`IDs expirados: ${transactionIds.join(', ')}`);
        }
        
        return { success: true, expired: transactionIds.length, transactionIds };
      }
      
      return { success: true, expired: 0, message: 'Nenhuma transação expirada encontrada' };
    } catch (error) {
      logger.error('Erro ao expirar transações:', error);
      return { success: false, expired: 0, error: String(error) };
    }
  }
} 