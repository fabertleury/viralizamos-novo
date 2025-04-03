/**
 * Este arquivo foi modificado para não inicializar mais os processadores em background
 * que agora são responsabilidade dos microserviços dedicados
 */

import { Logger } from '@/lib/core/utils/logger';
const logger = new Logger('ServerStartup');

// Controle para evitar inicialização duplicada
let initialized = false;

/**
 * Função para garantir que os serviços de inicialização sejam carregados apenas uma vez
 */
export function ensureStartupServicesLoaded() {
  // Executar apenas no servidor e somente uma vez
  if (typeof window === 'undefined' && !initialized) {
    initialized = true;
    
    logger.info('🚀 Iniciando servidor principal...');
    
    // Informação sobre a migração dos processadores para microserviços
    logger.info('ℹ️ Os processadores de background foram migrados para microserviços dedicados:');
    logger.info('ℹ️ • Processamento de pagamentos → microserviço viralizamos_pagamentos');
    logger.info('ℹ️ • Processamento de pedidos → microserviço viralizamos_orders');
    
    logger.success('✅ Servidor principal inicializado com sucesso');
  }
  
  return true;
} 