/**
 * Sistema de rate limiting para gerenciar chamadas às APIs externas
 * Evita erros 429 (Too Many Requests) distribuindo as chamadas ao longo do tempo
 */

interface RateLimitOptions {
  // Quantas chamadas permitidas em um intervalo
  maxRequests: number;
  
  // Intervalo em milissegundos
  interval: number;
  
  // Tempo de espera quando o limite é atingido (ms)
  backoffTime: number;
}

// Configurações padrão para diferentes APIs
const DEFAULT_RATE_LIMITS: Record<string, RateLimitOptions> = {
  // APIs do Instagram
  'instagram': {
    maxRequests: 10,
    interval: 60000, // 60 segundos
    backoffTime: 5000 // 5 segundos
  },
  
  // APIs de provedores 
  'provider': {
    maxRequests: 30,
    interval: 60000, // 60 segundos
    backoffTime: 2000 // 2 segundos
  },
  
  // Configuração padrão para qualquer API
  'default': {
    maxRequests: 20,
    interval: 60000, // 60 segundos
    backoffTime: 1000 // 1 segundo
  }
};

export class RateLimiter {
  private requestCounts: Map<string, number[]> = new Map();
  private options: Record<string, RateLimitOptions>;
  
  constructor(options?: Record<string, RateLimitOptions>) {
    this.options = options || DEFAULT_RATE_LIMITS;
  }
  
  /**
   * Aguarda se necessário e então permite a execução da requisição
   * @param apiKey Identificador da API (instagram, provider, etc)
   * @returns Promise que resolve quando for seguro fazer a requisição
   */
  async acquireToken(apiKey: string = 'default'): Promise<void> {
    const options = this.options[apiKey] || this.options.default;
    const now = Date.now();
    
    // Inicializar o contador de requisições para esta API
    if (!this.requestCounts.has(apiKey)) {
      this.requestCounts.set(apiKey, []);
    }
    
    // Obter o histórico de requisições para esta API
    const requests = this.requestCounts.get(apiKey)!;
    
    // Remover requisições antigas fora do intervalo
    const validRequests = requests.filter(
      timestamp => now - timestamp < options.interval
    );
    
    // Atualizar o histórico com apenas requisições válidas
    this.requestCounts.set(apiKey, validRequests);
    
    // Verificar se atingiu o limite
    if (validRequests.length >= options.maxRequests) {
      // Calcular tempo necessário para esperar antes da próxima requisição
      const oldestRequest = Math.min(...validRequests);
      const timeToWait = Math.max(
        oldestRequest + options.interval - now,
        options.backoffTime
      );
      
      console.log(`[RateLimiter] Limite atingido para API ${apiKey}. Aguardando ${timeToWait}ms antes da próxima requisição.`);
      
      // Aguardar o tempo necessário
      await new Promise(resolve => setTimeout(resolve, timeToWait));
      
      // Recursivamente tentar novamente após a espera
      return this.acquireToken(apiKey);
    }
    
    // Registrar esta requisição
    this.requestCounts.get(apiKey)!.push(now);
    return Promise.resolve();
  }
  
  /**
   * Executa uma função com rate limiting
   * @param fn Função a ser executada
   * @param apiKey Identificador da API
   * @returns Resultado da função
   */
  async executeWithRateLimit<T>(fn: () => Promise<T>, apiKey: string = 'default'): Promise<T> {
    await this.acquireToken(apiKey);
    try {
      return await fn();
    } catch (error: unknown) {
      // Se receber erro 429, fazer backoff e tentar novamente
      if (
        error && 
        typeof error === 'object' && 
        'response' in error && 
        error.response && 
        typeof error.response === 'object' && 
        'status' in error.response && 
        error.response.status === 429
      ) {
        const options = this.options[apiKey] || this.options.default;
        console.log(`[RateLimiter] Recebido erro 429 da API ${apiKey}. Fazendo backoff de ${options.backoffTime * 2}ms.`);
        
        // Esperar o dobro do tempo de backoff
        await new Promise(resolve => setTimeout(resolve, options.backoffTime * 2));
        
        // Tentar novamente
        return this.executeWithRateLimit(fn, apiKey);
      }
      
      // Outros erros são propagados
      throw error;
    }
  }
}

// Exportar uma instância única para ser usada em toda a aplicação
export const rateLimiter = new RateLimiter();

// Função utilitária para esperar um tempo específico
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms)); 