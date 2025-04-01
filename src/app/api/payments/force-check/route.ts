import { NextRequest, NextResponse } from 'next/server';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';
import { createClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('force-check-payment');

export async function GET(req: NextRequest) {
  try {
    // Obter o ID do pagamento da URL
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('payment_id');
    
    if (!paymentId) {
      return NextResponse.json({
        success: false,
        message: 'payment_id é obrigatório'
      }, { status: 400 });
    }
    
    logger.info(`Forçando verificação do pagamento: ${paymentId}`);
    
    // Inicializar o verificador de pagamentos
    const paymentChecker = BackgroundPaymentChecker.getInstance();
    
    // Forçar a verificação do status do pagamento (ignorando cache)
    const result = await paymentChecker.checkPaymentStatus(paymentId, true);
    
    logger.info(`Resultado da verificação: ${JSON.stringify(result)}`);
    
    if (result.status === 'approved') {
      logger.success(`Pagamento ${paymentId} verificado e APROVADO. Iniciando processamento...`);
      
      // Se o pagamento estiver aprovado, buscar a transação associada
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
      
      const { data: transaction, error: txError } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .eq('payment_id', paymentId)
        .single();
        
      if (txError || !transaction) {
        logger.error(`Erro ao buscar transação para pagamento ${paymentId}: ${txError?.message || 'Não encontrada'}`);
        
        return NextResponse.json({
          success: false,
          payment_status: result.status,
          message: `Transação não encontrada para pagamento ${paymentId}`,
          error: txError?.message
        });
      }
      
      // Processar a transação
      const processResult = await paymentChecker.checkPayment(transaction);
      
      return NextResponse.json({
        success: true,
        payment_status: result.status,
        transaction_id: transaction.id,
        process_result: processResult
      });
    }
    
    // Retornar o resultado da verificação
    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      status: result.status,
      message: 'Status verificado com sucesso'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error(`Erro ao forçar verificação do pagamento: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      message: `Erro ao forçar verificação: ${errorMessage}`
    }, { status: 500 });
  }
} 