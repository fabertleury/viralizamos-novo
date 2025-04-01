import { NextRequest, NextResponse } from 'next/server';
import { N8NOrderService } from '@/lib/N8N/orderService';

/**
 * Handler para processar pedidos pendentes e enviar para o N8N em lote
 * Esta rota pode ser chamada por um cron job
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
    
    // Processar pedidos pendentes
    const orderService = new N8NOrderService();
    const results = await orderService.processUnsentOrders();
    
    // Log dos resultados
    console.log(`Processamento de pedidos pendentes concluído: 
      Total: ${results.total}
      Enviados: ${results.sent}
      Erros: ${Object.keys(results.errors).length}`);
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao processar pedidos pendentes: ${errorMessage}`);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 