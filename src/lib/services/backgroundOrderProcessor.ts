import { createClient } from '@supabase/supabase-js';
import { OrderProcessor } from './order/OrderProcessor';
import { Logger } from '@/lib/core/utils/logger';

// Criar um logger
const logger = new Logger('BackgroundOrderProcessor');
logger.info('⚡ Inicializando sistema de processamento de pedidos pendentes');

// Interval para verificar pedidos pendentes (a cada 3 minutos)
const CHECK_INTERVAL_MS = 3 * 60 * 1000;
let checkInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Classe singleton para gerenciar o processamento de pedidos pendentes
 */
export class BackgroundOrderProcessor {
  private static instance: BackgroundOrderProcessor;
  private isChecking: boolean = false;
  private logger: Logger;
  
  private constructor() {
    this.logger = new Logger('BackgroundOrderProcessor');
    this.logger.info('Nova instância do processador de pedidos em background criada');
  }
  
  /**
   * Obtém a instância singleton do processador
   */
  public static getInstance(): BackgroundOrderProcessor {
    if (!BackgroundOrderProcessor.instance) {
      logger.info('Criando nova instância do BackgroundOrderProcessor');
      BackgroundOrderProcessor.instance = new BackgroundOrderProcessor();
    }
    return BackgroundOrderProcessor.instance;
  }
  
  /**
   * Inicia a verificação periódica de pedidos pendentes
   * @param forceCheck Se deve forçar uma verificação imediata
   */
  public async startChecking(forceCheck = false) {
    if (this.isChecking) {
      this.logger.info('O verificador de pedidos já está em execução');
      
      if (forceCheck) {
        this.logger.info('Realizando verificação imediata (forçada)...');
        await this.processPendingOrders();
      }
      
      return { success: true, message: 'Verificador já em execução' };
    }
    
    this.isChecking = true;
    
    this.logger.info('Iniciando processador de pedidos pendentes...');
    
    // Verificação inicial imediata
    if (forceCheck) {
      this.logger.info('Realizando verificação inicial...');
      await this.processPendingOrders();
    }
    
    // Configurar verificação periódica
    if (checkInterval) {
      clearInterval(checkInterval);
    }
    
    checkInterval = setInterval(async () => {
      try {
        await this.processPendingOrders();
      } catch (error) {
        this.logger.error(`Erro na verificação programada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }, CHECK_INTERVAL_MS);
    
    this.logger.success(`Verificador de pedidos pendentes iniciado. Verificação a cada ${CHECK_INTERVAL_MS / 1000} segundos`);
    
    return { 
      success: true, 
      message: `Verificador iniciado. Verificação a cada ${CHECK_INTERVAL_MS / 1000} segundos` 
    };
  }
  
  /**
   * Para a verificação periódica
   */
  public stopChecking() {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    
    this.isChecking = false;
    this.logger.info('Verificador de pedidos pendentes parado');
    
    return { success: true, message: 'Verificador parado' };
  }
  
  /**
   * Processa pedidos pendentes
   */
  public async processPendingOrders() {
    if (isRunning) {
      this.logger.info('Já existe um processamento em andamento. Aguardando...');
      return { success: true, message: 'Já existe um processamento em andamento' };
    }
    
    isRunning = true;
    
    try {
      this.logger.info('Verificando pedidos pendentes...');
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
      
      // Verificar quantidade de pedidos pendentes
      const { count, error: countError } = await supabase
        .from('core_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (countError) {
        this.logger.error(`Erro ao verificar pedidos pendentes: ${countError.message}`);
        return { success: false, error: countError.message };
      }
      
      if (!count || count === 0) {
        this.logger.info('Nenhum pedido pendente para processamento');
        return { success: true, message: 'Nenhum pedido pendente' };
      }
      
      this.logger.info(`Encontrados ${count} pedidos pendentes para processamento`);
      
      // Inicializar o processador e processar os pedidos
      const orderProcessor = new OrderProcessor(supabase);
      const result = await orderProcessor.processPendingOrders();
      
      if (result.success) {
        const processedCount = result.processed || 0;
        const successCount = result.success_count || 0;
        const errorCount = result.error_count || 0;
        
        if (processedCount > 0) {
          this.logger.success(`Processamento concluído: ${processedCount} pedidos processados, ${successCount} com sucesso, ${errorCount} com erro`);
        } else {
          this.logger.info('Nenhum pedido foi processado');
        }
        
        return { 
          success: true, 
          message: `Processamento concluído: ${processedCount} pedidos processados` 
        };
      } else {
        this.logger.error(`Erro ao processar pedidos: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao processar pedidos pendentes: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      isRunning = false;
    }
  }
}

// Criar a instância do processador
const backgroundOrderProcessor = BackgroundOrderProcessor.getInstance();

// Iniciar automaticamente se estiver no servidor e não for desativado explicitamente
if (typeof window === 'undefined' && process.env.ENABLE_BACKGROUND_PROCESSORS !== 'false') {
  logger.info('Verificador de pedidos pendentes iniciado automaticamente durante inicialização do servidor');
  backgroundOrderProcessor.startChecking(true).catch(error => {
    logger.error(`Erro ao iniciar verificador de pedidos: ${error.message}`);
  });
} else {
  logger.info('Verificador de pedidos pendentes NÃO iniciado automaticamente (ambiente cliente ou desativado)');
}

// Exportar a instância
export { backgroundOrderProcessor }; 