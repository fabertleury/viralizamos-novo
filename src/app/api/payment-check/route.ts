import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyApiKey } from '@/lib/utils/auth';

/**
 * Endpoint para verificar se já existe um pagamento para um serviço e usuário
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
    const serviceId = searchParams.get('service_id');
    const username = searchParams.get('username');
    
    if (!serviceId || !username) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos. É necessário fornecer service_id e username.' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Verificar se existe um pagamento pendente ou aprovado para o mesmo serviço e usuário
    const { data: duplicateCheck, error: checkError } = await supabase.rpc(
      'check_duplicate_payment',
      {
        p_service_id: serviceId,
        p_target_username: username,
        p_hours_window: 24
      }
    );
    
    if (checkError) {
      console.error('[API] Erro ao verificar duplicatas:', checkError);
      return NextResponse.json(
        { error: `Erro ao verificar duplicatas: ${checkError.message}` },
        { status: 500 }
      );
    }
    
    // Se não encontrou duplicata
    if (!duplicateCheck || !duplicateCheck.has_duplicate) {
      return NextResponse.json({
        has_duplicate: false
      });
    }
    
    // Retornar informações sobre o pagamento duplicado
    console.log('[API] Pagamento duplicado encontrado:', duplicateCheck);
    return NextResponse.json({
      has_duplicate: true,
      transaction_id: duplicateCheck.transaction_id,
      payment_id: duplicateCheck.payment_id,
      status: duplicateCheck.status,
      created_at: duplicateCheck.created_at,
      message: duplicateCheck.message
    });
  } catch (error) {
    console.error('[API] Erro ao verificar duplicatas:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}