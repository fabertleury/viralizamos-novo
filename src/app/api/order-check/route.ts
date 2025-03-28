import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyApiKey } from '@/lib/utils/auth';

/**
 * Endpoint para verificar se já existe um pedido para um post e serviço
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar API key por segurança (opcional)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey && !verifyApiKey(apiKey)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter parâmetros de query
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transaction_id');
    const postCode = searchParams.get('post_code');
    const serviceId = searchParams.get('service_id');
    
    if (!transactionId || !postCode || !serviceId) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos. É necessário fornecer transaction_id, post_code e service_id.' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Verificar se existe um pedido para o mesmo post e serviço
    const { data: duplicateCheck, error: checkError } = await supabase.rpc(
      'check_duplicate_order',
      {
        p_transaction_id: transactionId,
        p_post_code: postCode,
        p_service_id: serviceId
      }
    );
    
    if (checkError) {
      console.error('[API] Erro ao verificar duplicatas de pedidos:', checkError);
      return NextResponse.json(
        { error: `Erro ao verificar duplicatas de pedidos: ${checkError.message}` },
        { status: 500 }
      );
    }
    
    // Se não encontrou duplicata
    if (!duplicateCheck || !duplicateCheck.has_duplicate) {
      return NextResponse.json({
        has_duplicate: false
      });
    }
    
    // Retornar informações sobre o pedido duplicado
    console.log('[API] Pedido duplicado encontrado:', duplicateCheck);
    return NextResponse.json({
      has_duplicate: true,
      order_id: duplicateCheck.order_id,
      external_order_id: duplicateCheck.external_order_id,
      status: duplicateCheck.status,
      created_at: duplicateCheck.created_at,
      message: duplicateCheck.message
    });
  } catch (error) {
    console.error('[API] Erro ao verificar duplicatas de pedidos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 