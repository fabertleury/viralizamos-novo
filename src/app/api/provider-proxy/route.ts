import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const { apiUrl, apiKey, action, orderId, refillId } = await request.json();

    // Validar parâmetros obrigatórios
    if (!apiUrl || !apiKey) {
      return Response.json({ error: 'API URL e API Key são obrigatórios' }, { status: 400 });
    }

    if (!action) {
      return Response.json({ error: 'Ação é obrigatória' }, { status: 400 });
    }

    // Construir o corpo da requisição com base na ação
    const requestBody: Record<string, string> = {
      key: apiKey,
      action: action
    };

    // Adicionar parâmetros específicos com base na ação
    if (action === 'refill' && orderId) {
      requestBody.order = orderId;
    } else if (action === 'refill_status' && refillId) {
      requestBody.refill = refillId;
    } else if (action === 'status' && orderId) {
      requestBody.order = orderId;
    } else {
      return Response.json({ 
        error: 'Parâmetros inválidos para a ação solicitada',
        details: `Ação '${action}' requer parâmetros específicos que não foram fornecidos`
      }, { status: 400 });
    }

    console.log(`[Provider Proxy] Enviando requisição para ${apiUrl}:`, requestBody);

    // Enviar a requisição para o provedor
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    // Se a resposta não for ok, retornar o erro
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Provider Proxy] Erro na resposta do provedor: ${response.status} - ${errorText}`);
      return Response.json({ 
        error: 'Erro na resposta do provedor', 
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    // Obter e retornar a resposta do provedor
    const providerResponse = await response.json();
    console.log(`[Provider Proxy] Resposta do provedor:`, providerResponse);

    // Se for uma solicitação de refill bem-sucedida, registrar no banco de dados
    if (action === 'refill' && providerResponse.refill && orderId) {
      try {
        const supabase = createClientComponentClient();
        const { data: refill, error: refillError } = await supabase
          .from('refills')
          .insert({
            order_id: orderId,
            external_refill_id: providerResponse.refill,
            status: 'pending',
            metadata: {
              provider_order_id: orderId,
              provider_refill_id: providerResponse.refill
            }
          })
          .select()
          .single();

        if (refillError) {
          console.error('[Provider Proxy] Erro ao registrar refill no banco de dados:', refillError);
          // Ainda retornamos sucesso para o cliente, apenas logamos o erro
        } else {
          console.log('[Provider Proxy] Refill registrado com sucesso:', refill);
          // Adicionar o refill à resposta
          providerResponse.refill_record = refill;
        }
      } catch (error) {
        console.error('[Provider Proxy] Erro ao registrar refill:', error);
        // Ainda retornamos sucesso para o cliente, apenas logamos o erro
      }
    }

    // Retornar a resposta do provedor para o cliente
    return Response.json(providerResponse);
  } catch (error) {
    console.error('[Provider Proxy] Erro ao processar requisição:', error);
    return Response.json({ 
      error: 'Erro ao processar requisição', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 