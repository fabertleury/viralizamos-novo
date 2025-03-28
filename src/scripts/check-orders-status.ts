/**
 * Script para verificar o status de pedidos
 * 
 * Uso: 
 * - Para verificar um pedido específico:
 *   npx ts-node -r tsconfig-paths/register src/scripts/check-orders-status.ts <order_id>
 * 
 * - Para verificar todos os pedidos pendentes:
 *   npx ts-node -r tsconfig-paths/register src/scripts/check-orders-status.ts batch [limite]
 */

import { OrderStatusService } from '@/lib/core/services/orderStatusService';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger("CheckOrdersStatus");
const orderStatusService = new OrderStatusService();

/**
 * Verifica o status de um pedido específico
 * @param orderId ID do pedido a verificar
 */
async function checkOrderStatus(orderId: string) {
  try {
    logger.info(`Verificando status do pedido ${orderId}`);
    
    const result = await orderStatusService.checkOrderStatus(orderId);
    
    if (result.success) {
      if (result.statusChanged) {
        logger.success(`Status do pedido ${orderId} alterado: ${result.previousStatus} -> ${result.newStatus}`);
      } else {
        logger.info(`Status do pedido ${orderId} não alterado: ${result.previousStatus}`);
      }
    } else {
      logger.error(`Falha ao verificar status do pedido ${orderId}: ${result.error instanceof Error ? result.error.message : 'Erro desconhecido'}`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Erro ao verificar pedido ${orderId}:`, error);
    return {
      orderId,
      success: false,
      statusChanged: false,
      error
    };
  }
}

/**
 * Verifica o status de pedidos pendentes
 * @param limit Número máximo de pedidos a verificar
 */
async function checkPendingOrders(limit = 50) {
  try {
    logger.info(`Verificando até ${limit} pedidos pendentes`);
    
    const result = await orderStatusService.checkOrdersStatus(limit);
    
    if (result.totalProcessed === 0) {
      logger.info('Nenhum pedido pendente encontrado para verificação');
      return result;
    }
    
    logger.success(`Verificação de status concluída: ${result.successCount} sucessos, ${result.failCount} falhas, ${result.statusChangedCount} mudanças de status`);
    
    // Listar pedidos que mudaram de status
    result.results.filter(r => r.statusChanged).forEach(r => {
      logger.info(`Pedido ${r.orderId}: ${r.previousStatus} -> ${r.newStatus}`);
    });
    
    return result;
  } catch (error) {
    logger.error('Erro ao verificar pedidos pendentes:', error);
    return {
      totalProcessed: 0,
      successCount: 0,
      failCount: 0,
      statusChangedCount: 0,
      error,
      results: []
    };
  }
}

/**
 * Função principal que processa os argumentos da linha de comando
 */
async function main() {
  // Obter argumentos da linha de comando
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    logger.info('Uso: npm run check-orders [id_do_pedido | --all [limite]]');
    logger.info('  - Para verificar um pedido específico: npm run check-orders <id_do_pedido>');
    logger.info('  - Para verificar todos os pedidos pendentes: npm run check-orders --all [limite]');
    process.exit(0);
  }
  
  try {
    if (args[0] === '--all') {
      // Verificar todos os pedidos pendentes
      const limit = args[1] ? parseInt(args[1], 10) : 50;
      
      if (isNaN(limit) || limit <= 0) {
        logger.error('O limite deve ser um número positivo');
        process.exit(1);
      }
      
      await checkPendingOrders(limit);
    } else {
      // Verificar um pedido específico
      const orderId = args[0];
      await checkOrderStatus(orderId);
    }
  } catch (error) {
    logger.error('Erro ao executar verificação de status:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Executar a função principal
main(); 