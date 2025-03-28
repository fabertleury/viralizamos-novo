#!/usr/bin/env node

/**
 * Script para processar transações pendentes
 * 
 * Uso: 
 * node src/scripts/process-transaction.js [ID da transação]
 * 
 * Se nenhum ID for fornecido, processará todas as transações pendentes
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
 * Processa uma transação específica
 */
async function processTransaction(transactionId) {
  logger.info(`Processando transação: ${transactionId}`);
  
  // Inicializar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  );
  
  try {
    // Buscar a transação
    const { data: transaction, error: transactionError } = await supabase
      .from('core_transactions')
      .select('*, core_transaction_posts(*)')
      .eq('id', transactionId)
      .single();
      
    if (transactionError) {
      logger.error(`Erro ao buscar transação ${transactionId}`, transactionError);
      return false;
    }
    
    if (!transaction) {
      logger.error(`Transação ${transactionId} não encontrada`);
      return false;
    }
    
    logger.info(`Transação encontrada: ${transaction.id} (${transaction.target_username})`);
    logger.info(`Status: ${transaction.status}, Valor: R$ ${transaction.amount}`);
    
    // Verificar se a transação já foi processada
    if (transaction.is_processed) {
      logger.warn(`Transação ${transactionId} já foi processada anteriormente`);
      return false;
    }
    
    // Verificar se a transação está aprovada
    if (transaction.status !== 'approved') {
      logger.warn(`Transação ${transactionId} não está aprovada (${transaction.status})`);
      return false;
    }
    
    // Simular o processamento criando um pedido para cada post
    logger.info(`Processando ${transaction.core_transaction_posts?.length || 0} posts para a transação`);
    
    // Criar pedidos para cada post
    if (transaction.core_transaction_posts && transaction.core_transaction_posts.length > 0) {
      for (const post of transaction.core_transaction_posts) {
        logger.info(`Criando pedido para post: ${post.post_code}`);
        
        // Calcular valor e quantidade para cada post
        const totalPosts = transaction.core_transaction_posts.length;
        const quantityPerPost = Math.floor(transaction.metadata?.service?.quantity || 100) / totalPosts;
        const amountPerPost = transaction.amount / totalPosts;
        
        // Inserir pedido na tabela core_orders
        const { data: order, error: orderError } = await supabase
          .from('core_orders')
          .insert({
            transaction_id: transaction.id,
            post_id: post.id,
            service_id: transaction.service_id,
            provider_id: transaction.metadata?.service?.provider_id || null,
            external_order_id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            status: 'pending',
            amount: amountPerPost,
            quantity: Math.floor(quantityPerPost),
            target_username: transaction.target_username,
            target_url: post.post_url,
            payment_method: transaction.payment_method,
            payment_id: transaction.payment_id,
            metadata: {
              post_type: post.post_type,
              post_code: post.post_code,
              created_at: new Date().toISOString()
            }
          })
          .select()
          .single();
          
        if (orderError) {
          logger.error(`Erro ao criar pedido para post ${post.id}`, orderError);
          // Continuar mesmo com erro para processar outros posts
        } else {
          logger.success(`Pedido criado com ID: ${order.id}`);
          
          // Atualizar o post como processado
          await supabase
            .from('core_transaction_posts')
            .update({ 
              is_processed: true,
              order_id: order.id
            })
            .eq('id', post.id);
        }
      }
    } else {
      logger.warn(`Transação ${transactionId} não tem posts associados`);
    }
    
    // Marcar a transação como processada
    const { error: updateError } = await supabase
      .from('core_transactions')
      .update({ 
        is_processed: true,
        order_created: true,
        processing_attempts: (transaction.processing_attempts || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
      
    if (updateError) {
      logger.error(`Erro ao atualizar transação ${transactionId}`, updateError);
      return false;
    }
    
    // Adicionar log de processamento
    await supabase
      .from('core_processing_logs')
      .insert({
        transaction_id: transactionId,
        level: 'info',
        message: 'Transação processada com sucesso pelo script de processamento',
        metadata: {
          processed_at: new Date().toISOString(),
          processed_by: 'process-transaction-script'
        }
      });
    
    logger.success(`Transação ${transactionId} processada com sucesso!`);
    return true;
  } catch (error) {
    logger.error(`Erro ao processar transação ${transactionId}`, error);
    return false;
  }
}

/**
 * Função para processar todas as transações pendentes
 */
async function processAllPendingTransactions(limit = 10) {
  logger.info(`Processando até ${limit} transações pendentes...`);
  
  // Inicializar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  );
  
  try {
    // Buscar transações pendentes (aprovadas, mas não processadas)
    const { data: transactions, error: transactionsError } = await supabase
      .from('core_transactions')
      .select('id')
      .eq('status', 'approved')
      .eq('is_processed', false)
      .order('created_at', { ascending: true })
      .limit(limit);
      
    if (transactionsError) {
      logger.error('Erro ao buscar transações pendentes', transactionsError);
      return;
    }
    
    if (!transactions || transactions.length === 0) {
      logger.info('Nenhuma transação pendente encontrada');
      return;
    }
    
    logger.info(`Encontradas ${transactions.length} transações pendentes`);
    
    // Processando cada transação
    let success = 0;
    let failed = 0;
    
    for (const transaction of transactions) {
      const result = await processTransaction(transaction.id);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }
    
    logger.info(`Processamento finalizado: ${success} sucesso, ${failed} falhas`);
  } catch (error) {
    logger.error('Erro ao processar transações pendentes', error);
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      // Sem argumentos, processar todas as transações pendentes
      await processAllPendingTransactions();
    } else if (args[0] === '--help' || args[0] === '-h') {
      // Exibir ajuda
      console.log(`
Uso: node src/scripts/process-transaction.js [opções]

Opções:
  <transactionId>     ID da transação a ser processada
  --all [limite]      Processar todas transações pendentes (limite padrão: 10)
  --help, -h          Exibir esta ajuda
`);
    } else if (args[0] === '--all') {
      // Processar todas as transações com limite opcional
      const limit = args[1] ? parseInt(args[1], 10) : 10;
      await processAllPendingTransactions(limit);
    } else {
      // Argumentos tratados como ID de transação
      await processTransaction(args[0]);
    }
  } catch (error) {
    logger.error('Erro fatal:', error);
    process.exit(1);
  }
}

// Executar o script
main().catch(console.error); 