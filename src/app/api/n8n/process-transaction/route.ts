import { NextRequest, NextResponse } from 'next/server';
import { N8NOrderService } from '@/lib/N8N/orderService';

/**
 * Handler para processar uma transação e enviar para o N8N
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar a chave de API
    const apiKey = request.headers.get('X-API-KEY');
    const expectedApiKey = process.env.API_CALLBACK_SECRET;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Requisição rejeitada: Chave de API inválida');
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }
    
    // Processar a requisição
    const data = await request.json();
    
    // Verificar dados básicos
    if (!data.transaction_id) {
      console.error('Requisição sem transaction_id');
      return NextResponse.json({ error: 'transaction_id é obrigatório' }, { status: 400 });
    }
    
    const useTestEnvironment = data.test_environment === true;
    
    // Processar a transação
    const orderService = new N8NOrderService();
    const result = await orderService.createOrderFromTransaction(
      data.transaction_id,
      useTestEnvironment
    );
    
    if (result.success) {
      console.log(`Transação ${data.transaction_id} processada com sucesso`);
      return NextResponse.json({
        success: true,
        order_id: result.order_id
      });
    } else {
      console.error(`Erro ao processar transação ${data.transaction_id}: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao processar transação: ${errorMessage}`);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 