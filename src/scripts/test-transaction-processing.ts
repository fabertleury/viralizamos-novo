/**
 * Script para testar o processamento de transações
 * 
 * Uso: 
 * - Para processar uma transação específica:
 *   npx ts-node -r tsconfig-paths/register src/scripts/test-transaction-processing.ts <transaction_id>
 * 
 * - Para processar todas as transações pendentes:
 *   npx ts-node -r tsconfig-paths/register src/scripts/test-transaction-processing.ts batch
 */

import { createClient } from "@/lib/supabase/server";
import { TransactionProcessor } from "@/lib/core/transaction/transactionProcessor";
import { Logger } from "@/lib/core/utils/logger";

const logger = new Logger("TestProcessing");

/**
 * Processa uma transação específica
 */
async function processTransaction(transactionId: string) {
  logger.info(`Processando transação: ${transactionId}`);
  
  const processor = new TransactionProcessor();
  const result = await processor.processTransaction(transactionId);
  
  if (result.success) {
    logger.success(`Transação processada com sucesso: ${result.message}`);
    
    if (result.details) {
      logger.info("Detalhes do processamento:", result.details);
    }
  } else {
    logger.error(`Erro ao processar transação: ${result.error}`);
    
    if (result.needsRetry) {
      logger.info("A transação precisa ser processada novamente mais tarde");
    }
  }
  
  return result;
}

/**
 * Processa todas as transações pendentes aprovadas
 */
async function processBatch() {
  logger.info("Processando lote de transações pendentes");
  
  const supabase = createClient();
  
  // Buscar transações aprovadas que não foram processadas ainda
  const { data: transactions, error } = await supabase
    .from("core_transactions")
    .select("id, status, is_processed, processing_attempts")
    .eq("status", "approved")
    .eq("is_processed", false)
    .lt("processing_attempts", 3) // Limitar a 3 tentativas
    .order("created_at", { ascending: true })
    .limit(10); // Limitar a 10 transações por execução
    
  if (error) {
    logger.error("Erro ao buscar transações pendentes:", error);
    return;
  }
  
  if (!transactions || transactions.length === 0) {
    logger.info("Nenhuma transação pendente encontrada");
    return;
  }
  
  logger.info(`Encontradas ${transactions.length} transações pendentes para processamento`);
  
  // Processar cada transação
  const results = [];
  for (const transaction of transactions) {
    logger.info(`Processando transação ${transaction.id} (tentativa ${transaction.processing_attempts + 1})`);
    
    try {
      const result = await processTransaction(transaction.id);
      results.push({
        transactionId: transaction.id,
        success: result.success,
        message: result.success ? result.message : result.error
      });
    } catch (error) {
      logger.error(`Erro inesperado ao processar transação ${transaction.id}:`, error);
      results.push({
        transactionId: transaction.id,
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
    
    // Esperar 1 segundo entre cada processamento para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Resumo do processamento
  logger.info("Resumo do processamento em lote:");
  logger.info(`- Total processado: ${results.length}`);
  logger.info(`- Sucessos: ${results.filter(r => r.success).length}`);
  logger.info(`- Falhas: ${results.filter(r => !r.success).length}`);
  
  // Detalhes das falhas
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    logger.info("Detalhes das falhas:");
    failures.forEach(f => {
      logger.info(`- Transação ${f.transactionId}: ${f.message}`);
    });
  }
}

/**
 * Função principal
 */
async function main() {
  const args = process.argv.slice(2);
  
  try {
    // Verificar comando
    if (args.length === 0) {
      logger.error("Nenhum argumento fornecido. Use 'batch' para processar todas as transações pendentes ou forneça um ID de transação específico.");
      process.exit(1);
    }
    
    const command = args[0].toLowerCase();
    
    if (command === "batch") {
      await processBatch();
    } else {
      // Assumir que é um ID de transação
      await processTransaction(command);
    }
  } catch (error) {
    logger.error("Erro durante a execução:", error);
    process.exit(1);
  }
}

// Executar script
main()
  .then(() => {
    logger.info("Script concluído com sucesso");
    process.exit(0);
  })
  .catch(error => {
    logger.error("Erro fatal durante a execução:", error);
    process.exit(1);
  }); 