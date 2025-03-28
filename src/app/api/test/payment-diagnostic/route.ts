'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Obter o cliente do Supabase
    const supabase = createClient();
    
    // Verificar se o token do Mercado Pago está configurado
    const accessTokenConfigured = !!process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    // Verificar se o segredo do webhook está configurado
    const webhookSecretConfigured = !!process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    
    // Obter a URL base
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('host') || 'https://viralizamos.com';
    
    // Construir a URL do webhook
    const webhookUrl = `${baseUrl.startsWith('http') ? '' : 'https://'}${baseUrl}/api/webhooks/mercadopago`;
    
    // Obter transações recentes
    const { data: recentTransactions, error: recentError } = await supabase
      .from('transactions')
      .select('id, payment_id, payment_external_reference, status, amount, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      console.error('Erro ao buscar transações recentes:', recentError);
    }
    
    // Obter transações pendentes
    const { data: pendingTransactions, error: pendingError } = await supabase
      .from('transactions')
      .select('id, payment_id, payment_external_reference, status, amount, created_at, updated_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (pendingError) {
      console.error('Erro ao buscar transações pendentes:', pendingError);
    }
    
    // Determinar o ambiente
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    
    // Construir a resposta
    const diagnosticData = {
      environment,
      webhookUrl,
      accessTokenConfigured,
      webhookSecretConfigured,
      recentTransactions: recentTransactions || [],
      pendingTransactions: pendingTransactions || [],
      serverTime: new Date().toISOString()
    };
    
    return NextResponse.json(diagnosticData);
  } catch (error) {
    console.error('Erro ao gerar diagnóstico:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao gerar diagnóstico',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 