import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const data = await request.json();
    
    console.log('🔍 DEBUG - Dados recebidos para teste de pagamento:', JSON.stringify(data, null, 2));
    
    // Verificar se o amount está presente e não é nulo
    if (data.amount === null || data.amount === undefined) {
      console.error('⚠️ ERRO - Valor amount está nulo ou indefinido!');
      return NextResponse.json({ 
        error: 'Valor amount está nulo ou indefinido',
        receivedData: data
      }, { status: 400 });
    }
    
    // Simular o registro na tabela orders sem realmente inserir
    console.log('📝 DEBUG - Dados que seriam inseridos na tabela orders:', {
      user_id: data.user_id || 'user_test',
      order_id: data.order_id || `test_${Date.now()}`,
      amount: data.amount,
      status: 'test',
      payment_method: data.payment_method || 'pix',
      payment_id: data.payment_id || `payment_test_${Date.now()}`,
      metadata: data.metadata || {},
      customer_name: data.customer_name || 'Test User',
      customer_email: data.customer_email || 'test@example.com',
      customer_phone: data.customer_phone || '123456789',
      target_username: data.target_username || 'test_user',
      target_full_name: data.target_full_name || 'Test User',
      payment_qr_code: data.payment_qr_code || 'test_qr_code',
      payment_external_reference: data.payment_external_reference || 'test_reference',
      service_id: data.service_id || 'test_service',
      provider_id: data.provider_id || '1',
      target_profile_link: data.target_profile_link || 'https://instagram.com/test_user/'
    });
    
    // Retornar os dados que seriam enviados para o provedor
    return NextResponse.json({
      success: true,
      message: 'Teste de pagamento simulado com sucesso',
      receivedData: data,
      amountStatus: data.amount ? 'OK' : 'MISSING',
      amountValue: data.amount
    });
    
  } catch (error) {
    console.error('Erro ao processar teste de pagamento:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
