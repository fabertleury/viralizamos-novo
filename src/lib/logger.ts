/**
 * Sistema de logging centralizado para a aplicação
 * 
 * Este módulo fornece funções para logging consistente em toda a aplicação,
 * com níveis de severidade e formatação padronizada.
 */

// Níveis de log disponíveis
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success' | 'critical';

// Cores para console
const LOG_COLORS = {
  debug: '\x1b[90m', // Cinza
  info: '\x1b[36m',  // Ciano
  warn: '\x1b[33m',  // Amarelo
  error: '\x1b[31m', // Vermelho
  success: '\x1b[32m', // Verde
  critical: '\x1b[41m\x1b[37m', // Fundo vermelho, texto branco
  reset: '\x1b[0m'
};

// Configuração do logger
const config = {
  // Nível mínimo para exibir logs (pode ser alterado em tempo de execução)
  minLevel: process.env.LOG_LEVEL || 'info',
  
  // Se deve salvar logs no banco de dados
  saveToDatabase: true,
  
  // Se deve mostrar logs no console
  showInConsole: process.env.NODE_ENV !== 'production',
  
  // Se deve incluir timestamp nos logs do console
  includeTimestamp: true
};

// Mapa de prioridade dos níveis de log para filtragem
const LOG_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4,
  critical: 5
};

// Interface para mensagens de log
interface LogMessage {
  level: LogLevel;
  timestamp: Date;
  message: string;
  metadata?: any;
  transactionId?: string;
  userId?: string;
  orderId?: string;
}

/**
 * Cliente de logging centralizado
 */
class Logger {
  /**
   * Salva um log com nível específico
   */
  private log(level: LogLevel, message: string, metadata?: any): void {
    // Verificar se este nível deve ser registrado com base na configuração
    if (LOG_PRIORITY[level] < LOG_PRIORITY[config.minLevel as LogLevel]) {
      return;
    }

    const logEntry: LogMessage = {
      level,
      timestamp: new Date(),
      message,
      metadata
    };

    // Extrair IDs importantes do metadata para facilitar consultas
    if (metadata) {
      if (metadata.transactionId) logEntry.transactionId = metadata.transactionId;
      if (metadata.userId) logEntry.userId = metadata.userId;
      if (metadata.orderId) logEntry.orderId = metadata.orderId;
    }

    // Mostrar no console se configurado
    if (config.showInConsole) {
      this.printToConsole(logEntry);
    }

    // Salvar no banco de dados se configurado
    if (config.saveToDatabase) {
      this.saveToDatabase(logEntry).catch(err => {
        // Se falhar ao salvar no banco, pelo menos mostramos no console
        console.error('Erro ao salvar log no banco de dados:', err);
        this.printToConsole({
          level: 'error',
          timestamp: new Date(),
          message: 'Falha ao salvar log no banco de dados',
          metadata: { originalLog: logEntry, error: err }
        });
      });
    }
  }

  /**
   * Imprime uma mensagem de log no console
   */
  private printToConsole(log: LogMessage): void {
    const color = LOG_COLORS[log.level] || LOG_COLORS.info;
    const reset = LOG_COLORS.reset;
    
    let prefix = `[${log.level.toUpperCase()}]`;
    if (config.includeTimestamp) {
      prefix = `[${log.timestamp.toISOString()}] ${prefix}`;
    }
    
    // Mensagem básica
    console.log(`${color}${prefix} ${log.message}${reset}`);
    
    // Metadados, se existirem
    if (log.metadata) {
      console.log(`${color}Metadata:${reset}`, log.metadata);
    }
  }

  /**
   * Salva uma mensagem de log no banco de dados
   */
  private async saveToDatabase(log: LogMessage): Promise<void> {
    try {
      // Importar createClient assincronamente para evitar loops de importação
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      
      // Determinar a tabela baseada no contexto do log
      let table = 'system_logs';
      
      if (log.transactionId) {
        table = 'transaction_logs';
      } else if (log.orderId) {
        table = 'order_logs';
      }
      
      // Preparar dados para inserção
      const logData: any = {
        level: log.level,
        message: log.message,
        metadata: log.metadata || {}
      };
      
      // Adicionar IDs relacionados se existirem
      if (log.transactionId) logData.transaction_id = log.transactionId;
      if (log.orderId) logData.order_id = log.orderId;
      if (log.userId) logData.user_id = log.userId;
      
      // Inserir no banco de dados
      const { error } = await supabase.from(table).insert(logData);
      
      if (error) {
        // Se a tabela não existe, tenta criar (apenas para logs críticos ou de erro)
        if (error.code === '42P01' && (log.level === 'error' || log.level === 'critical')) {
          // Log para sistema_logs apenas para registrar
          await supabase.from('system_logs').insert({
            level: 'error',
            message: `Tabela de logs ${table} não existe. O log original foi: ${log.message}`,
            metadata: { originalLog: log }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      // Apenas registramos o erro no console - não podemos fazer muito mais se o próprio logging falhar
      console.error('Erro ao salvar log no banco de dados:', error);
    }
  }

  /**
   * Registra um log de nível debug
   */
  debug(message: string, metadata?: any): void {
    this.log('debug', message, metadata);
  }

  /**
   * Registra um log de nível info
   */
  info(message: string, metadata?: any): void {
    this.log('info', message, metadata);
  }

  /**
   * Registra um log de nível warn
   */
  warn(message: string, metadata?: any): void {
    this.log('warn', message, metadata);
  }

  /**
   * Registra um log de nível error
   */
  error(message: string, metadata?: any): void {
    this.log('error', message, metadata);
  }

  /**
   * Registra um log de nível success
   */
  success(message: string, metadata?: any): void {
    this.log('success', message, metadata);
  }

  /**
   * Registra um log de nível critical
   */
  critical(message: string, metadata?: any): void {
    this.log('critical', message, metadata);
  }

  /**
   * Configurar opções do logger
   */
  setConfig(options: Partial<typeof config>): void {
    Object.assign(config, options);
  }
}

// Exporta uma instância única do logger
export const logger = new Logger(); 