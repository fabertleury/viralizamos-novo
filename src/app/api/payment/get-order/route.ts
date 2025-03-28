import { NextResponse } from 'next/server';
import { getOrderInfo } from '@/lib/services/api';
import { createClient } from '@/lib/supabase/server';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('GetOrderAPI');

/**
 * API endpoint para obter detalhes de uma ordem
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
    
    // Obter o ID da ordem da URL
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    
    if (!orderId) {
      logger.error('ID da ordem não fornecido');
      return NextResponse.json({ 
        success: false, 
        error: 'ID da ordem é obrigatório' 
      }, { status: 400 });
    }
    
    logger.info(`Buscando informações da ordem ${orderId}`);
    
    // Obter informações da ordem
    const result = await getOrderInfo(orderId);
    
    if (!result.success) {
      logger.error(`Erro ao buscar informações da ordem ${orderId}: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 404 });
    }
    
    logger.success(`Informações da ordem ${orderId} obtidas com sucesso`);
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error(`Erro na API de informações de ordem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 });
  }
} 