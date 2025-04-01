import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/core/utils/logger';
import { TransactionProcessor } from '@/lib/services/payment/TransactionProcessor';
import { OrderProcessor } from '@/lib/services/order/OrderProcessor';

const logger = new Logger('force-process-transaction');

export async function GET(req: NextRequest) {
  try {
    // Obter o ID da transação da URL
    const url = new URL(req.url);
    const transactionId = url.searchParams.get('transaction_id');
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        message: 'transaction_id é obrigatório'
      }, { status: 400 });
    }
    
    logger.info(`Forçando processamento da transação: ${transactionId}`);
    
    // Inicializar o Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Buscar a transação
    const { data: transaction, error: txError } = await supabase
      .from('core_transactions_v2')
      .select('*')
      .eq('id', transactionId)
      .single();
      
    if (txError || !transaction) {
      logger.error(`Erro ao buscar transação ${transactionId}: ${txError?.message || 'Não encontrada'}`);
      
      return NextResponse.json({
        success: false,
        message: `Transação ${transactionId} não encontrada`,
        error: txError?.message
      }, { status: 404 });
    }
    
    // Garantir que a transação está com status approved
    if (transaction.status !== 'approved') {
      logger.warn(`Transação ${transactionId} não está aprovada (status: ${transaction.status}). Atualizando para approved...`);
      
      // Forçar o status para approved para processamento
      const { error: updateError } = await supabase
        .from('core_transactions_v2')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
        
      if (updateError) {
        logger.error(`Erro ao atualizar status da transação ${transactionId}: ${updateError.message}`);
        
        return NextResponse.json({
          success: false,
          message: `Erro ao atualizar status da transação: ${updateError.message}`
        }, { status: 500 });
      }
      
      // Recarregar a transação com o novo status
      const { data: updatedTransaction } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .eq('id', transactionId)
        .single();
        
      if (updatedTransaction) {
        transaction.status = updatedTransaction.status;
      }
    }
    
    // Inicializar o processador de transações
    const transactionProcessor = new TransactionProcessor(supabase);
    
    // Processar a transação
    const processResult = await transactionProcessor.processTransaction(transaction);
    
    if (processResult.status === 'processed') {
      logger.success(`Transação ${transactionId} processada com sucesso`);
      
      // Processar pedidos pendentes
      const orderProcessor = new OrderProcessor(supabase);
      const ordersResult = await orderProcessor.processPendingOrders();
      
      return NextResponse.json({
        success: true,
        transaction_id: transactionId,
        process_result: processResult,
        orders_result: ordersResult
      });
    } else {
      logger.warn(`Transação ${transactionId} não foi processada: ${processResult.reason}`);
      
      return NextResponse.json({
        success: false,
        transaction_id: transactionId,
        process_result: processResult,
        message: `Transação não processada: ${processResult.reason}`
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error(`Erro ao forçar processamento da transação: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      message: `Erro ao forçar processamento: ${errorMessage}`
    }, { status: 500 });
  }
} 