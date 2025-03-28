/**
 * Classe para padronização de logs na aplicação
 */
export class Logger {
  private prefix: string;

  constructor(module: string) {
    this.prefix = `[${module}]`;
  }

  /**
   * Registra uma mensagem de informação
   * @param message Mensagem a ser registrada
   * @param data Dados adicionais (opcional)
   */
  info(message: string, data?: any): void {
    console.log(`${this.prefix} ${message}`, data !== undefined ? data : '');
  }

  /**
   * Registra uma mensagem de aviso
   * @param message Mensagem a ser registrada
   * @param data Dados adicionais (opcional)
   */
  warn(message: string, data?: any): void {
    console.warn(`${this.prefix} ⚠️ ${message}`, data !== undefined ? data : '');
  }

  /**
   * Registra uma mensagem de erro
   * @param message Mensagem a ser registrada
   * @param error Objeto de erro ou dados adicionais (opcional)
   */
  error(message: string, error?: any): void {
    console.error(`${this.prefix} ❌ ${message}`, error !== undefined ? error : '');
  }

  /**
   * Registra uma mensagem de depuração
   * @param message Mensagem a ser registrada
   * @param data Dados adicionais (opcional)
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${this.prefix} 🔍 ${message}`, data !== undefined ? data : '');
    }
  }

  /**
   * Registra uma mensagem de sucesso
   * @param message Mensagem a ser registrada
   * @param data Dados adicionais (opcional)
   */
  success(message: string, data?: any): void {
    console.log(`${this.prefix} ✅ ${message}`, data !== undefined ? data : '');
  }
} 