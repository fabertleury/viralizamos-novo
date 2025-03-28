import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TransactionProcessor } from '@/lib/core/transaction/transactionProcessor';
import { verifyApiKey } from '@/lib/utils/auth';

/**
 * Endpoint para processar transações pendentes
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar API key para segurança
    const apiKey = request.headers.get('x-api-key');
    if (!verifyApiKey(apiKey)) {
      console.error('[API] Acesso não autorizado ao endpoint de processamento de transações');
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter parâmetros de query
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const processAll = searchParams.get('all') === 'true';
    
    const supabase = createClient();
    
    // Se um ID específico foi fornecido, processar apenas essa transação
    if (transactionId) {
      console.log(`[API] Processando transação específica: ${transactionId}`);
      
      const processor = new TransactionProcessor();
      const result = await processor.processTransaction(transactionId);
      
      return NextResponse.json({
        processed: 1,
        success: result.success,
        transaction_id: transactionId,
        message: result.message || result.error,
        needs_retry: result.needsRetry
      });
    }
    
    // Caso contrário, buscar transações pendentes para processar
    console.log(`[API] Buscando transações aprovadas para processar...`);
    
    // Buscar transações aprovadas que ainda não foram processadas
    let query = supabase
      .from('core_transactions')
      .select('id')
      .eq('status', 'approved')
      .eq('is_processed', false)
      .order('created_at', { ascending: true });
      
    // Limitar a quantidade de transações a serem processadas, a menos que processAll seja true
    if (!processAll) {
      query = query.limit(limit);
    }
    
    const { data: transactions, error } = await query;
    
    if (error) {
      console.error('[API] Erro ao buscar transações para processar:', error);
      return NextResponse.json(
        { error: `Erro ao buscar transações: ${error.message}` },
        { status: 500 }
      );
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('[API] Nenhuma transação pendente encontrada para processar');
      return NextResponse.json({
        processed: 0,
        message: 'Nenhuma transação pendente encontrada'
      });
    }
    
    console.log(`[API] Encontradas ${transactions.length} transações para processar`);
    
    // Registrar início do processamento em lote
    await supabase.from('core_processing_logs').insert({
      level: 'info',
      message: `Iniciando processamento em lote de ${transactions.length} transações`,
      metadata: { 
        transaction_count: transactions.length,
        transaction_ids: transactions.map(t => t.id),
        started_at: new Date().toISOString()
      }
    });
    
    // Processar cada transação
    const processor = new TransactionProcessor();
    const results = [];
    
    for (const transaction of transactions) {
      try {
        console.log(`[API] Processando transação ${transaction.id}`);
        const result = await processor.processTransaction(transaction.id);
        
        results.push({
          transaction_id: transaction.id,
          success: result.success,
          message: result.message || result.error,
          needs_retry: result.needsRetry
        });
      } catch (error) {
        console.error(`[API] Erro ao processar transação ${transaction.id}:`, error);
        
        results.push({
          transaction_id: transaction.id,
          success: false,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          needs_retry: true
        });
      }
    }
    
    // Registrar conclusão do processamento em lote
    await supabase.from('core_processing_logs').insert({
      level: 'info',
      message: `Concluído processamento em lote de ${transactions.length} transações`,
      metadata: { 
        transaction_count: transactions.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        completed_at: new Date().toISOString()
      }
    });
    
    // Retornar resumo dos resultados
    return NextResponse.json({
      processed: transactions.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    console.error('[API] Erro no endpoint de processamento de transações:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 