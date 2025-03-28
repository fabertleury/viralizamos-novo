import { TransactionExpirationChecker } from './transactionExpirationChecker';

/**
 * Classe que gerencia todos os serviços em background da aplicação
 */
export class BackgroundServices {
  private static instance: BackgroundServices;
  private initialized: boolean = false;
  private services: { name: string; instance: { stop?: () => void }; }[] = [];

  private constructor() {}

  /**
   * Obtém a instância singleton do gerenciador de serviços
   */
  public static getInstance(): BackgroundServices {
    if (!BackgroundServices.instance) {
      BackgroundServices.instance = new BackgroundServices();
    }
    return BackgroundServices.instance;
  }

  /**
   * Inicializa todos os serviços de background
   */
  public init(): void {
    if (this.initialized) {
      console.log('Serviços de background já inicializados');
      return;
    }

    console.log('Inicializando serviços de background...');

    try {
      // Inicializar serviço de verificação de transações expiradas
      const expirationChecker = TransactionExpirationChecker.getInstance();
      expirationChecker.start();
      this.services.push({
        name: 'TransactionExpirationChecker',
        instance: expirationChecker
      });

      console.log('Serviços de background inicializados com sucesso!');
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar serviços de background:', error);
      throw error;
    }
  }

  /**
   * Para todos os serviços de background
   */
  public stop(): void {
    console.log('Parando serviços de background...');

    for (const service of this.services) {
      try {
        if (service.instance && typeof service.instance.stop === 'function') {
          service.instance.stop();
          console.log(`Serviço ${service.name} parado com sucesso`);
        }
      } catch (error) {
        console.error(`Erro ao parar serviço ${service.name}:`, error);
      }
    }

    this.initialized = false;
    console.log('Todos os serviços de background foram parados');
  }

  /**
   * Retorna lista de serviços ativos
   */
  public getActiveServices(): string[] {
    return this.services.map(service => service.name);
  }
} 