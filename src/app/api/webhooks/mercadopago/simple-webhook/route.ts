'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Webhook simplificado do Mercado Pago que apenas loga as informações
 * e sempre retorna 200 OK, para garantir que o Mercado Pago não bloqueie
 * as notificações futuras.
 */
export async function POST(request: NextRequest) {
  console.log('[SimpleWebhook] Recebendo notificação');
  
  try {
    // Obter e logar todos os headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('[SimpleWebhook] Headers:', JSON.stringify(headers, null, 2));
    
    // Obter o corpo como texto
    const bodyText = await request.text();
    console.log('[SimpleWebhook] Corpo (texto):', bodyText);
    
    // Tentar converter para JSON
    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyText);
      console.log('[SimpleWebhook] Corpo (JSON):', JSON.stringify(bodyJson, null, 2));
    } catch (parseError) {
      console.error('[SimpleWebhook] Erro ao fazer parse do JSON:', parseError);
      bodyJson = null;
    }
    
    // Extrair ID do pagamento (se disponível)
    let paymentId = null;
    
    if (bodyJson) {
      // Tentar extrair de várias localizações possíveis
      if (bodyJson.data && bodyJson.data.id) {
        paymentId = bodyJson.data.id.toString();
      } else if (bodyJson.id) {
        paymentId = bodyJson.id.toString();
      } else if (bodyJson.resource) {
        const match = bodyJson.resource.toString().match(/\/v1\/payments\/(\d+)/);
        if (match && match[1]) {
          paymentId = match[1];
        }
      }
      
      console.log('[SimpleWebhook] Payment ID extraído:', paymentId);
    }
    
    // Salvar um log no banco de dados (se tivermos um ID de pagamento)
    if (paymentId) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('webhook_logs')
          .insert({
            payment_id: paymentId,
            headers: headers,
            body: bodyJson || bodyText,
            processed_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('[SimpleWebhook] Erro ao salvar log:', error);
        } else {
          console.log('[SimpleWebhook] Log salvo com sucesso');
        }
      } catch (dbError) {
        console.error('[SimpleWebhook] Erro ao acessar banco de dados:', dbError);
      }
    }
    
    // Sempre retornar 200 OK
    return NextResponse.json({ 
      success: true, 
      message: 'Notificação recebida com sucesso',
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    // Mesmo em caso de erro, logar e retornar 200
    console.error('[SimpleWebhook] Erro geral:', error);
    return NextResponse.json({ 
      success: true, 
      message: 'Erro ao processar, mas notificação aceita',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
} 