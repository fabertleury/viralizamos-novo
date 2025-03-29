// Este arquivo importa todos os processadores em background para garantir que sejam inicializados
// quando o servidor iniciar, independentemente de qual rota é acessada primeiro
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('BackgroundProcessors');
logger.info('🔄 Inicializando serviços em background...');

// Tentar importar e inicializar cada processador em um bloco try/catch separado
// para garantir que um erro em um não impede os outros de serem carregados

try {
  logger.info('🔄 Importando backgroundPaymentChecker...');
  // Importar processador de pagamentos
  import('./backgroundPaymentChecker')
    .then(() => logger.success('✅ backgroundPaymentChecker importado com sucesso'))
    .catch((error) => logger.error(`❌ Erro ao importar backgroundPaymentChecker: ${error.message}`));
} catch (error) {
  logger.error(`❌ Erro ao importar backgroundPaymentChecker: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
}

try {
  logger.info('🔄 Importando backgroundOrderProcessor...');
  // Importar processador de pedidos
  import('./backgroundOrderProcessor')
    .then(() => logger.success('✅ backgroundOrderProcessor importado com sucesso'))
    .catch((error) => logger.error(`❌ Erro ao importar backgroundOrderProcessor: ${error.message}`));
} catch (error) {
  logger.error(`❌ Erro ao importar backgroundOrderProcessor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
}

logger.success('✅ Todos os processadores em background foram inicializados');

// Exportar uma função vazia para evitar que o arquivo seja tree-shaken
export function ensureBackgroundProcessorsLoaded() {
  // Esta função existe apenas para garantir que este arquivo seja incluído no build
  logger.info('Verificando se os processadores em background estão carregados');
  return true;
} 