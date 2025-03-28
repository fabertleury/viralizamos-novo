import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderProcessor } from '@/lib/services/order/OrderProcessor';
import { Logger } from '@/lib/core/utils/logger';

const logger = new Logger('ProcessPendingAPI');

/**
 * API endpoint para processar todos os pedidos pendentes
 */
export async function POST() {
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
    
    // Verificar se o usuário é administrador
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (!userRoles) {
      logger.warn(`Usuário ${session.user.email} tentou processar pedidos pendentes sem ser administrador`);
      return NextResponse.json({ 
        success: false, 
        error: 'Permissão negada. Apenas administradores podem processar pedidos pendentes.' 
      }, { status: 403 });
    }
    
    logger.info('Iniciando processamento de pedidos pendentes');
    
    // Inicializar o processador de ordens
    const orderProcessor = new OrderProcessor(supabase);
    
    // Processar pedidos pendentes
    const result = await orderProcessor.processPendingOrders();
    
    if (!result.success) {
      logger.error(`Erro ao processar pedidos pendentes: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
    logger.success(`Processamento concluído: ${result.success_count} pedidos processados com sucesso de ${result.processed} total`);
    
    return NextResponse.json({
      success: true,
      message: `Processamento concluído com sucesso`,
      processed: result.processed,
      success_count: result.success_count,
      error_count: result.error_count,
      results: result.results
    });
  } catch (error) {
    logger.error(`Erro na API de processamento de pedidos pendentes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 });
  }
} 