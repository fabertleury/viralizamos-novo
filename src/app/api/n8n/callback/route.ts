import { NextRequest, NextResponse } from 'next/server';
import { N8NOrderService } from '@/lib/N8N/orderService';

/**
 * Handler para callbacks do N8N
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Recebido callback do N8N');
    
    // Verificar a chave de API
    const apiKey = request.headers.get('X-API-KEY');
    const expectedApiKey = process.env.API_CALLBACK_SECRET;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Callback do N8N rejeitado: Chave de API inválida');
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }
    
    // Processar o callback
    const data = await request.json();
    
    // Verificar dados básicos
    if (!data.order_id) {
      console.error('Callback sem order_id');
      return NextResponse.json({ error: 'order_id é obrigatório' }, { status: 400 });
    }
    
    // Processar o callback
    const orderService = new N8NOrderService();
    const success = await orderService.processCallback(data);
    
    if (success) {
      console.log(`Callback processado com sucesso para o pedido ${data.order_id}`);
      return NextResponse.json({ success: true });
    } else {
      console.error(`Erro ao processar callback para o pedido ${data.order_id}`);
      return NextResponse.json({ error: 'Erro ao processar callback' }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao processar callback do N8N: ${errorMessage}`);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 