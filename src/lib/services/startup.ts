/**
 * Este arquivo é carregado automaticamente no início da aplicação
 * e garante que todos os processadores em background sejam inicializados
 */

import { Logger } from '@/lib/core/utils/logger';
const logger = new Logger('ServerStartup');

// Importar os serviços em background apenas no lado do servidor
if (typeof window === 'undefined') {
  logger.info('🚀 Inicializando serviços em background no início do servidor...');
  
  try {
    // Importar processador de pagamentos
    logger.info('Carregando módulo backgroundPaymentChecker...');
    import('./backgroundPaymentChecker')
      .then(() => logger.success('✅ Processador de pagamentos carregado'))
      .catch((error) => logger.error(`❌ Erro ao carregar processador de pagamentos: ${error.message}`));
  } catch (error) {
    logger.error(`❌ Erro ao carregar processador de pagamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
  
  try {
    // Importar processador de pedidos
    logger.info('Carregando módulo backgroundOrderProcessor...');
    import('./backgroundOrderProcessor')
      .then(() => logger.success('✅ Processador de pedidos carregado'))
      .catch((error) => logger.error(`❌ Erro ao carregar processador de pedidos: ${error.message}`));
  } catch (error) {
    logger.error(`❌ Erro ao carregar processador de pedidos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
  
  logger.success('✅ Todos os serviços em background foram carregados com sucesso');
}

// Exportar uma função para garantir que este arquivo não seja removido
export function ensureStartupServicesLoaded() {
  return true;
} 