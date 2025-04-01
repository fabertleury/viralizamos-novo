import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/core/utils/logger';
import { N8nIntegrationService } from '@/lib/core/services/n8nIntegrationService';

const logger = new Logger('n8n-callback');

/**
 * Endpoint para receber callbacks do n8n após processamento de pedidos
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('Tentativa de acesso sem token de autenticação');
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remover "Bearer " do início
    
    // Verificar se o token é válido
    if (token !== process.env.API_CALLBACK_SECRET) {
      logger.error('Tentativa de acesso com token inválido');
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 403 });
    }
    
    // Obter dados do corpo da requisição
    const data = await req.json();
    
    if (!data.order_id) {
      logger.error('Callback recebido sem order_id');
      return NextResponse.json({ success: false, message: 'order_id é obrigatório' }, { status: 400 });
    }
    
    logger.info(`Callback recebido para o pedido ${data.order_id}`);
    
    // Inicializar o Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Verificar se o pedido existe
    const { data: order, error: orderError } = await supabase
      .from('core_orders')
      .select('*')
      .eq('id', data.order_id)
      .single();
      
    if (orderError || !order) {
      logger.error(`Pedido ${data.order_id} não encontrado: ${orderError?.message || 'Não encontrado'}`);
      return NextResponse.json({ success: false, message: 'Pedido não encontrado' }, { status: 404 });
    }
    
    // Atualizar o pedido com base no resultado do n8n
    if (data.success === true) {
      // Pedido processado com sucesso
      const { error: updateError } = await supabase
        .from('core_orders')
        .update({
          external_order_id: data.external_order_id,
          provider_order_id: data.external_order_id,
          status: 'processing',
          updated_at: new Date().toISOString(),
          metadata: {
            ...(order.metadata || {}),
            n8n_response: data.response,
            n8n_processed_at: new Date().toISOString()
          }
        })
        .eq('id', data.order_id);
        
      if (updateError) {
        logger.error(`Erro ao atualizar pedido ${data.order_id}: ${updateError.message}`);
        return NextResponse.json({ success: false, message: `Erro ao atualizar pedido: ${updateError.message}` }, { status: 500 });
      }
      
      logger.success(`Pedido ${data.order_id} atualizado com sucesso`);
    } else {
      // Pedido processado com erro
      const { error: updateError } = await supabase
        .from('core_orders')
        .update({
          status: 'error',
          updated_at: new Date().toISOString(),
          metadata: {
            ...(order.metadata || {}),
            error: data.error || 'Erro não especificado',
            n8n_error_response: data.response,
            n8n_error_at: new Date().toISOString()
          }
        })
        .eq('id', data.order_id);
        
      if (updateError) {
        logger.error(`Erro ao atualizar pedido ${data.order_id} com status de erro: ${updateError.message}`);
        return NextResponse.json({ success: false, message: `Erro ao atualizar pedido: ${updateError.message}` }, { status: 500 });
      }
      
      logger.warn(`Pedido ${data.order_id} atualizado com status de erro: ${data.error || 'Erro não especificado'}`);
    }
    
    // Processar o callback usando o serviço de integração
    const n8nService = new N8nIntegrationService();
    await n8nService.processCallback(data);
    
    return NextResponse.json({
      success: true,
      message: 'Callback processado com sucesso',
      order_id: data.order_id
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error(`Erro ao processar callback: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      message: `Erro ao processar callback: ${errorMessage}`
    }, { status: 500 });
  }
} 