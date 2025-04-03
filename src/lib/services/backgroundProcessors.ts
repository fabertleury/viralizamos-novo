// Este arquivo foi modificado para não inicializar mais os processadores em background
// que agora são responsabilidade dos microserviços dedicados
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('BackgroundProcessors');
logger.info('🔄 Verificando configuração de serviços em background...');

// Microserviços dedicados para processar transações e pedidos
logger.info('✅ Processadores migrados para microserviços dedicados:');
logger.info('   → viralizamos_pagamentos: processa transações e pagamentos');
logger.info('   → viralizamos_orders: processa pedidos e integrações com fornecedores');

// Exportar uma função vazia para evitar que o arquivo seja tree-shaken
export function ensureBackgroundProcessorsLoaded() {
  // Esta função existe apenas para garantir que este arquivo seja incluído no build
  return true;
} 