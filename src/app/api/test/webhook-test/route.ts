'use server';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota para testar envio de webhooks do Mercado Pago localmente
 */
export async function POST(request: NextRequest) {
  try {
    // Obter o corpo da requisição
    const body = await request.json();
    
    // Construir a requisição para o webhook local
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`;
    
    // Determinar qual formato de webhook utilizar
    const userAgent = body.format === 'v1' 
      ? 'MercadoPago WebHook v1.0 payment' 
      : 'MercadoPago Feed v2.0 payment';
    
    // Construir o payload conforme o formato
    let payload;
    if (body.format === 'v1') {
      payload = {
        action: 'payment.updated',
        api_version: 'v1',
        data: {
          id: body.payment_id
        }
      };
    } else {
      payload = {
        type: 'payment',
        data: {
          id: body.payment_id
        }
      };
    }
    
    console.log(`Enviando webhook de teste para ${webhookUrl}`);
    console.log('User-Agent:', userAgent);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Enviar a requisição para o webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent
      },
      body: JSON.stringify(payload)
    });
    
    // Obter a resposta
    const responseText = await response.text();
    let responseJson;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { text: responseText };
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: responseJson
    });
  } catch (error) {
    console.error('Erro ao testar webhook:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 