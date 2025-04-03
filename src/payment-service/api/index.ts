import { QueueWorker } from '../lib/queue/worker';
import redis, { isRedisConnected } from '../lib/queue/redis';
import { MercadoPagoService } from '../lib/providers/mercadopago';

/**
 * Configuração do microsserviço de pagamento
 */
export function setupPaymentService() {
  console.log('Iniciando microsserviço de pagamento...');
  
  // Verificar conexão com Redis
  if (!isRedisConnected()) {
    console.error('Erro: Redis não está conectado. Serviço de pagamento não iniciado.');
    return false;
  }
  
  try {
    // Inicializar provedor de pagamento
    MercadoPagoService.initialize();
    
    // Iniciar worker de processamento
    QueueWorker.getInstance().start();
    
    console.log('Microsserviço de pagamento iniciado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao iniciar microsserviço de pagamento:', error);
    return false;
  }
}

/**
 * Encerrar conexões e workers do microsserviço
 */
export async function shutdownPaymentService() {
  console.log('Encerrando microsserviço de pagamento...');
  
  // Parar worker
  QueueWorker.getInstance().stop();
  
  // Fechar conexão com Redis
  if (isRedisConnected()) {
    await redis.quit();
    console.log('Conexão com Redis encerrada');
  }
  
  console.log('Microsserviço de pagamento encerrado com sucesso');
}

/**
 * Verificar status do microsserviço
 */
export function getPaymentServiceStatus() {
  return {
    redis: isRedisConnected() ? 'connected' : 'disconnected',
    worker: QueueWorker.getInstance().isRunning() ? 'running' : 'stopped',
    mercadoPago: MercadoPagoService.isInitialized() ? 'initialized' : 'not_initialized'
  };
} 