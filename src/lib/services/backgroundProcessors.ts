// Este arquivo foi modificado para não inicializar mais os processadores em background
// que agora são responsabilidade dos microserviços dedicados
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('BackgroundProcessors');
logger.info('🔄 Verificando configuração de serviços em background...');

// Agora os processadores de pagamentos e pedidos foram movidos para seus respectivos microserviços
logger.info('ℹ️ Os processadores de pagamentos e pedidos foram migrados para microserviços dedicados');
logger.info('ℹ️ backgroundPaymentChecker → viralizamos_pagamentos');
logger.info('ℹ️ backgroundOrderProcessor → viralizamos_orders');

logger.success('✅ Configuração de processadores em background concluída');

// Exportar uma função vazia para evitar que o arquivo seja tree-shaken
export function ensureBackgroundProcessorsLoaded() {
  // Esta função existe apenas para garantir que este arquivo seja incluído no build
  logger.info('Verificando configuração de processadores em background');
  return true;
} 