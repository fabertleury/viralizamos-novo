/**
 * Este arquivo foi modificado para não inicializar mais os processadores em background
 * que agora são responsabilidade dos microserviços dedicados
 */

import { Logger } from '@/lib/core/utils/logger';
const logger = new Logger('ServerStartup');

// Informações apenas no lado do servidor
if (typeof window === 'undefined') {
  logger.info('🚀 Iniciando servidor principal...');
  
  // Informação sobre a migração dos processadores para microserviços
  logger.info('ℹ️ Os processadores de background foram migrados para microserviços dedicados:');
  logger.info('ℹ️ • Processamento de pagamentos → microserviço viralizamos_pagamentos');
  logger.info('ℹ️ • Processamento de pedidos → microserviço viralizamos_orders');
  
  logger.success('✅ Servidor principal inicializado com sucesso');
}

// Exportar uma função para garantir que este arquivo não seja removido
export function ensureStartupServicesLoaded() {
  return true;
} 