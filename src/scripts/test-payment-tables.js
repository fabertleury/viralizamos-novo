#!/usr/bin/env node

/**
 * Este script verifica quantas transações existem nas tabelas antiga e nova,
 * e lista as transações mais recentes para comparação.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Logger simplificado
const logger = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCESSO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[AVISO]${colors.reset} ${msg}`),
  error: (msg, err) => console.log(`${colors.red}[ERRO]${colors.reset} ${msg}${err ? ': ' + JSON.stringify(err) : ''}`)
};

/**
 * Função principal para verificar as tabelas de transações
 */
async function checkTransactionTables() {
  logger.info('Verificando tabelas de transações...');

  // Inicializar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  );

  // Verificar tabela antiga (transactions)
  try {
    const { count: oldCount, error: oldError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (oldError) {
      logger.error('Erro ao consultar tabela antiga (transactions)', oldError);
    } else {
      logger.info(`Tabela antiga (transactions): ${oldCount} registros`);
    }

    // Buscar as 5 transações mais recentes da tabela antiga
    const { data: oldTransactions, error: oldListError } = await supabase
      .from('transactions')
      .select('id, created_at, status, payment_method, amount, target_username')
      .order('created_at', { ascending: false })
      .limit(5);

    if (oldListError) {
      logger.error('Erro ao listar transações antigas', oldListError);
    } else if (oldTransactions && oldTransactions.length > 0) {
      logger.info('5 transações mais recentes da tabela antiga:');
      oldTransactions.forEach((tx, index) => {
        logger.info(`${index + 1}. ID: ${tx.id} | Data: ${new Date(tx.created_at).toLocaleString()} | Status: ${tx.status} | Valor: ${tx.amount} | Usuário: ${tx.target_username}`);
      });
    } else {
      logger.info('Tabela antiga não possui transações.');
    }
  } catch (error) {
    logger.error('Erro ao consultar tabela antiga', error);
  }

  console.log(''); // Espaço

  // Verificar tabela nova (core_transactions)
  try {
    const { count: newCount, error: newError } = await supabase
      .from('core_transactions')
      .select('*', { count: 'exact', head: true });

    if (newError) {
      logger.error('Erro ao consultar tabela nova (core_transactions)', newError);
    } else {
      logger.info(`Tabela nova (core_transactions): ${newCount} registros`);
    }

    // Buscar as 5 transações mais recentes da tabela nova
    const { data: newTransactions, error: newListError } = await supabase
      .from('core_transactions')
      .select('id, created_at, status, payment_method, amount, target_username')
      .order('created_at', { ascending: false })
      .limit(5);

    if (newListError) {
      logger.error('Erro ao listar transações novas', newListError);
    } else if (newTransactions && newTransactions.length > 0) {
      logger.info('5 transações mais recentes da tabela nova:');
      newTransactions.forEach((tx, index) => {
        logger.info(`${index + 1}. ID: ${tx.id} | Data: ${new Date(tx.created_at).toLocaleString()} | Status: ${tx.status} | Valor: ${tx.amount} | Usuário: ${tx.target_username}`);
      });
    } else {
      logger.warn('Tabela nova não possui transações. É necessário atualizar os endpoints de pagamento!');
    }
  } catch (error) {
    logger.error('Erro ao consultar tabela nova', error);
  }

  console.log(''); // Espaço

  // Verificar tabela de posts
  try {
    const { count: postsCount, error: postsError } = await supabase
      .from('core_transaction_posts')
      .select('*', { count: 'exact', head: true });

    if (postsError) {
      logger.error('Erro ao consultar tabela de posts (core_transaction_posts)', postsError);
    } else {
      logger.info(`Tabela de posts (core_transaction_posts): ${postsCount} registros`);
    }
  } catch (error) {
    logger.error('Erro ao consultar tabela de posts', error);
  }

  logger.info('Verificação de tabelas concluída');
  
  if ((await supabase.from('core_transactions').select('*', { count: 'exact', head: true })).count === 0) {
    logger.warn('');
    logger.warn('ATENÇÃO: Nenhuma transação encontrada na nova tabela core_transactions.');
    logger.warn('Execute o script npm run update-pix-endpoints para obter instruções');
    logger.warn('sobre como atualizar os endpoints de pagamento no frontend.');
  }
}

// Executar a verificação
checkTransactionTables().catch(console.error); 