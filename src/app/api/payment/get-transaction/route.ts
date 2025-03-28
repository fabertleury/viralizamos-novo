import { NextResponse } from 'next/server';
import { getTransactionInfo } from '@/lib/services/api';
import { createClient } from '@/lib/supabase/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('GetTransactionAPI');

/**
 * API endpoint para obter detalhes de uma transação
 */
export async function GET(request: Request) {
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
    
    // Obter o ID da transação da URL
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId');
    
    if (!transactionId) {
      logger.error('ID da transação não fornecido');
      return NextResponse.json({ 
        success: false, 
        error: 'ID da transação é obrigatório' 
      }, { status: 400 });
    }
    
    logger.info(`Buscando informações da transação ${transactionId}`);
    
    // Obter informações da transação
    const result = await getTransactionInfo(transactionId);
    
    if (!result.success) {
      logger.error(`Erro ao buscar informações da transação ${transactionId}: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 404 });
    }
    
    logger.success(`Informações da transação ${transactionId} obtidas com sucesso`);
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error(`Erro na API de informações de transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 });
  }
} 