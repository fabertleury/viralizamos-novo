import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API para consultar pedidos no microserviço de pagamentos
 */
export async function POST(request: NextRequest) {
  try {
    // Obter dados da requisição
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email não fornecido' },
        { status: 400 }
      );
    }
    
    const { email } = body;
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';
    
    // Configurar o token de autorização entre serviços
    const serviceToken = process.env.MICROSERVICE_SERVICE_TOKEN || '';
    
    console.log(`[API] Buscando pedidos para o email ${email} no microserviço de pagamentos`);
    
    // Chamar a API do microserviço de pagamentos
    const response = await fetch(`${paymentServiceUrl}/api/orders/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceToken}`
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API] Erro ao buscar pedidos no microserviço: ${response.status}`, errorData);
      
      return NextResponse.json(
        { error: 'Erro ao buscar pedidos no microserviço de pagamentos' },
        { status: response.status }
      );
    }
    
    // Dados dos pedidos do microserviço
    const ordersData = await response.json();
    
    console.log(`[API] Recebidos ${ordersData.orders?.length || 0} pedidos do microserviço`);
    
    return NextResponse.json(ordersData);
  } catch (error) {
    console.error('[API] Erro ao processar requisição:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Garantir que a API não é cacheada
export const dynamic = 'force-dynamic';
export const revalidate = 0; 