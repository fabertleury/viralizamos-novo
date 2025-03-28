import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TransactionProcessor } from '@/lib/services/payment/TransactionProcessor';
import { OrderProcessor } from '@/lib/services/order/OrderProcessor';

/**
 * Endpoint para processar manualmente as transações aprovadas pendentes
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[ProcessPending] Iniciando processamento manual de transações aprovadas');
    
    const supabase = createClient();
    
    // Extrair parâmetros da requisição
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Se um ID específico foi fornecido, processar apenas essa transação
    if (transactionId) {
      console.log(`[ProcessPending] Processando transação específica: ${transactionId}`);
      
      // Buscar a transação
      const { data: transaction, error: transactionError } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .eq('id', transactionId)
        .single();
        
      if (transactionError || !transaction) {
        console.error(`[ProcessPending] Transação ${transactionId} não encontrada:`, transactionError);
        return NextResponse.json(
          { success: false, error: 'Transação não encontrada' },
          { status: 404 }
        );
      }
      
      // Processar a transação
      const transactionProcessor = new TransactionProcessor(supabase);
      const result = await transactionProcessor.processTransaction(transaction);
      
      console.log(`[ProcessPending] Resultado do processamento:`, result);
      
      return NextResponse.json({
        success: true,
        transaction_id: transactionId,
        result: result
      });
    }
    
    // Caso contrário, processar transações aprovadas pendentes
    console.log(`[ProcessPending] Buscando transações aprovadas pendentes (limite: ${limit})`);
    
    // Buscar transações aprovadas que ainda não têm ordem criada
    const { data: transactions, error } = await supabase
      .from('core_transactions_v2')
      .select('*')
      .eq('status', 'approved')
      .is('order_created', false)
      .limit(limit);
      
    if (error) {
      console.error('[ProcessPending] Erro ao buscar transações aprovadas:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('[ProcessPending] Nenhuma transação aprovada pendente de processamento.');
      return NextResponse.json({ 
        success: true, 
        message: 'Nenhuma transação pendente' 
      });
    }
    
    console.log(`[ProcessPending] Encontradas ${transactions.length} transações aprovadas para processamento.`);
    
    // Processar cada transação
    const transactionProcessor = new TransactionProcessor(supabase);
    const orderProcessor = new OrderProcessor(supabase);
    
    const results = [];
    
    for (const transaction of transactions) {
      try {
        console.log(`[ProcessPending] Processando transação ${transaction.id}...`);
        
        const result = await transactionProcessor.processTransaction(transaction);
        results.push({
          transaction_id: transaction.id,
          status: result.status,
          reason: result.reason,
          success: result.status === 'processed'
        });
        
        if (result.status === 'processed') {
          console.log(`[ProcessPending] Transação ${transaction.id} processada com sucesso!`);
        } else {
          console.warn(`[ProcessPending] Transação ${transaction.id} não foi processada: ${result.reason || 'Razão desconhecida'}`);
        }
      } catch (error) {
        console.error(`[ProcessPending] Erro ao processar transação ${transaction.id}:`, error);
        results.push({
          transaction_id: transaction.id,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          success: false
        });
      }
      
      // Pequena pausa para não sobrecarregar o banco de dados
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Processar ordens pendentes para envio ao provedor
    console.log('[ProcessPending] Processando ordens pendentes para envio ao provedor...');
    const processingResult = await orderProcessor.processPendingOrders();
    
    return NextResponse.json({ 
      success: true, 
      processed: transactions.length,
      results: results,
      orders_processed: processingResult
    });
  } catch (error) {
    console.error('[ProcessPending] Erro ao processar transações aprovadas:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 