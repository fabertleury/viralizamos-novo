/**
 * Script para executar jobs em background
 * 
 * Uso: 
 * - Para processar transações pendentes:
 *   npx ts-node -r tsconfig-paths/register src/scripts/run-background-jobs.ts transactions [limite]
 * 
 * - Para verificar status de pedidos:
 *   npx ts-node -r tsconfig-paths/register src/scripts/run-background-jobs.ts orders [limite]
 * 
 * - Para executar ambos sequencialmente:
 *   npx ts-node -r tsconfig-paths/register src/scripts/run-background-jobs.ts complete
 */

import { BackgroundJobService } from '@/lib/core/jobs/backgroundJobs';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('BackgroundJobs');
const jobService = new BackgroundJobService();

/**
 * Processa transações pendentes
 * @param limit Número máximo de transações a processar
 */
async function processTransactions(limit = 10) {
  try {
    logger.info(`Iniciando processamento de até ${limit} transações pendentes`);
    
    const result = await jobService.processTransactions(limit);
    
    if (result.success) {
      logger.success(result.message);
    } else {
      logger.error(`Falha ao processar transações: ${result.message}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Erro ao processar transações:', error);
    return {
      success: false,
      message: `Erro: ${error instanceof Error ? error.message : String(error)}`,
      error
    };
  }
}

/**
 * Verifica status de pedidos pendentes
 * @param limit Número máximo de pedidos a verificar
 */
async function checkOrders(limit = 50) {
  try {
    logger.info(`Iniciando verificação de status para até ${limit} pedidos`);
    
    const result = await jobService.checkOrdersStatus(limit);
    
    if (result.success) {
      logger.success(result.message);
    } else {
      logger.error(`Falha ao verificar status de pedidos: ${result.message}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Erro ao verificar status de pedidos:', error);
    return {
      success: false,
      message: `Erro: ${error instanceof Error ? error.message : String(error)}`,
      error
    };
  }
}

/**
 * Executa um batch completo (processamento de transações + verificação de status)
 */
async function runComplete() {
  try {
    logger.info('Iniciando processamento completo (transações + verificação de status)');
    
    const result = await jobService.runCompleteBatch();
    
    if (result.transactions.success && result.ordersStatus.success) {
      logger.success('Processamento completo executado com sucesso');
      logger.info(`Transações: ${result.transactions.message}`);
      logger.info(`Verificação de status: ${result.ordersStatus.message}`);
    } else {
      logger.error('Falha durante o processamento completo:');
      
      if (!result.transactions.success) {
        logger.error(`- Transações: ${result.transactions.message}`);
      }
      
      if (!result.ordersStatus.success) {
        logger.error(`- Verificação de status: ${result.ordersStatus.message}`);
      }
    }
    
    return result;
  } catch (error) {
    logger.error('Erro durante o processamento completo:', error);
    return {
      transactions: {
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : String(error)}`
      },
      ordersStatus: {
        success: false,
        message: 'Não executado devido a erro anterior'
      },
      completedAt: new Date().toISOString()
    };
  }
}

/**
 * Função principal
 */
async function main() {
  // Obter argumentos da linha de comando
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    logger.info('Uso:');
    logger.info('  npm run run-jobs transactions [limite]   - Processa transações pendentes');
    logger.info('  npm run run-jobs orders [limite]         - Verifica status de pedidos');
    logger.info('  npm run run-jobs complete               - Executa ambos os processos');
    process.exit(0);
  }
  
  try {
    const command = args[0].toLowerCase();
    
    if (command === 'transactions') {
      const limit = args[1] ? parseInt(args[1], 10) : 10;
      
      if (isNaN(limit) || limit <= 0) {
        logger.error('O limite deve ser um número positivo');
        process.exit(1);
      }
      
      await processTransactions(limit);
    } else if (command === 'orders') {
      const limit = args[1] ? parseInt(args[1], 10) : 50;
      
      if (isNaN(limit) || limit <= 0) {
        logger.error('O limite deve ser um número positivo');
        process.exit(1);
      }
      
      await checkOrders(limit);
    } else if (command === 'complete') {
      await runComplete();
    } else {
      logger.error(`Comando desconhecido: ${command}`);
      logger.info('Comandos válidos: transactions, orders, complete');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Erro fatal:', error);
    process.exit(1);
  }
}

main(); 