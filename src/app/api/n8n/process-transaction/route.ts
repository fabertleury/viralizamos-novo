import { NextRequest, NextResponse } from 'next/server';
import { N8NOrderService } from '@/lib/N8N/orderService';

/**
 * Handler para processar uma transação e enviar para o N8N
 */
export async function POST(request: NextRequest) {
  try {
    // Log detalhado de início
    console.log('[N8N-ProcessTransaction] Iniciando processamento de transação, ambiente:', {
      ENABLE_N8N_INTEGRATION: process.env.ENABLE_N8N_INTEGRATION,
      N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL, 
      N8N_WEBHOOK_URL_TEST: process.env.N8N_WEBHOOK_URL_TEST,
      API_CALLBACK_SECRET: (process.env.API_CALLBACK_SECRET || '').substring(0, 5) + '...',
      N8N_API_KEY: (process.env.N8N_API_KEY || '').substring(0, 5) + '...'
    });
    
    // Verificar a chave de API
    const apiKey = request.headers.get('X-API-KEY');
    const expectedApiKey = process.env.API_CALLBACK_SECRET;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('[N8N-ProcessTransaction] Requisição rejeitada: Chave de API inválida');
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }
    
    // Processar a requisição
    const data = await request.json();
    
    // Verificar dados básicos
    if (!data.transaction_id) {
      console.error('[N8N-ProcessTransaction] Requisição sem transaction_id');
      return NextResponse.json({ error: 'transaction_id é obrigatório' }, { status: 400 });
    }
    
    const useTestEnvironment = data.test_environment === true;
    console.log(`[N8N-ProcessTransaction] Processando transação ${data.transaction_id}, ambiente de teste: ${useTestEnvironment}`);
    
    // Processar a transação
    const orderService = new N8NOrderService();
    
    // Verificar se a integração está ativada
    if (process.env.ENABLE_N8N_INTEGRATION !== 'true') {
      console.error('[N8N-ProcessTransaction] Integração com N8N está desativada. Defina ENABLE_N8N_INTEGRATION=true no .env');
      return NextResponse.json({
        success: false,
        error: 'Integração com N8N está desativada'
      }, { status: 500 });
    }
    
    // Verificar se as URLs estão configuradas
    const webhookUrl = useTestEnvironment ? process.env.N8N_WEBHOOK_URL_TEST : process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error(`[N8N-ProcessTransaction] URL do webhook do N8N não configurada para ambiente ${useTestEnvironment ? 'de teste' : 'de produção'}`);
      return NextResponse.json({
        success: false,
        error: `URL do webhook do N8N não configurada para ambiente ${useTestEnvironment ? 'de teste' : 'de produção'}`
      }, { status: 500 });
    }
    
    const result = await orderService.createOrderFromTransaction(
      data.transaction_id,
      useTestEnvironment
    );
    
    if (result.success) {
      console.log(`[N8N-ProcessTransaction] Transação ${data.transaction_id} processada com sucesso, order_id: ${result.order_id}`);
      return NextResponse.json({
        success: true,
        order_id: result.order_id
      });
    } else {
      console.error(`[N8N-ProcessTransaction] Erro ao processar transação ${data.transaction_id}: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[N8N-ProcessTransaction] Erro ao processar transação: ${errorMessage}`, error);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 