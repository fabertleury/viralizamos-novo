import { NextResponse } from 'next/server';
import { processApprovedPayment } from '@/lib/services/api';
import { createClient } from '@/lib/supabase/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('ProcessOrderAPI');

/**
 * API endpoint para processar um pagamento aprovado, criar ordem e enviá-la ao provedor
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não autorizado' 
      }, { status: 401 });
    }
    
    // Obter o ID da transação do corpo da requisição
    const body = await request.json();
    const { transactionId } = body;
    
    if (!transactionId) {
      logger.error('ID da transação não fornecido');
      return NextResponse.json({ 
        success: false, 
        error: 'ID da transação é obrigatório' 
      }, { status: 400 });
    }
    
    logger.info(`Processando transação ${transactionId}`);
    
    // Processar o pagamento e criar a ordem
    const result = await processApprovedPayment(transactionId);
    
    if (!result.success) {
      logger.error(`Erro ao processar transação ${transactionId}: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
    
    logger.success(`Transação ${transactionId} processada com sucesso`);
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error(`Erro na API de processamento de ordem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 });
  }
} 