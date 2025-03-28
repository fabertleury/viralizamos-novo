import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Função padronizada para extrair o código do post do Instagram
function extractPostCode(link: string | undefined): string | null {
  if (!link) return null;
  
  // Se já for um código direto (não uma URL)
  if (link && !link.includes('http') && !link.includes('/')) {
    return link;
  }
  
  try {
    // Extrair o código da URL do post
    if (link.includes('instagram.com/p/')) {
      const postCode = link.split('/p/')[1]?.split('/')[0]?.split('?')[0];
      if (postCode) return postCode;
    }
    
    // Extrair o código da URL do reel
    if (link.includes('instagram.com/reel/')) {
      const postCode = link.split('/reel/')[1]?.split('/')[0]?.split('?')[0];
      if (postCode) return postCode;
    }
    
    // Extrair o código de URLs curtas do Instagram
    if (link.includes('instagr.am/p/')) {
      const postCode = link.split('/p/')[1]?.split('/')[0]?.split('?')[0];
      if (postCode) return postCode;
    }
    
    // Extrair o código de URLs com www
    if (link.includes('www.instagram.com/')) {
      if (link.includes('/p/')) {
        const postCode = link.split('/p/')[1]?.split('/')[0]?.split('?')[0];
        if (postCode) return postCode;
      }
      if (link.includes('/reel/')) {
        const postCode = link.split('/reel/')[1]?.split('/')[0]?.split('?')[0];
        if (postCode) return postCode;
      }
    }
    
    // Tentar extrair o código de qualquer formato de URL que tenha um padrão /CÓDIGO/
    // Removido a restrição de comprimento {11} para aceitar códigos de diferentes tamanhos
    const matches = link.match(/\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair código do post:', error);
    return null;
  }
}

// Formatar o link do Instagram corretamente
function formatInstagramLink(link: string | undefined): string | null {
  if (!link) return null;
  
  console.log('Link original recebido:', link);
  
  // Extrair o código do post
  const postCode = extractPostCode(link);
  if (!postCode) {
    console.error('Não foi possível extrair o código do post do link:', link);
    return null;
  }
  
  console.log('Código do post extraído:', postCode);
  
  // Formatar o link com https:// para evitar problemas com provedores
  // Alguns serviços estão sendo cancelados sem o protocolo https://
  const formattedLink = `https://instagram.com/p/${postCode}`;
  console.log('Link formatado:', formattedLink);
  
  return formattedLink;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  console.log('Rota dinâmica de provedores chamada para:', params.provider);
  
  try {
    const requestData = await request.json();
    console.log('Dados recebidos:', requestData);
    
    const { 
      service, 
      link, 
      quantity, 
      transaction_id, 
      target_username, 
      user_id, 
      customer_id 
    } = requestData;
    
    // Buscar o provedor pelo slug
    const supabase = createClient();
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('slug', params.provider)
      .single();
    
    if (providerError || !provider) {
      console.error('Erro ao buscar provedor:', providerError);
      return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });
    }
    
    console.log('Provedor encontrado:', provider);
    
    // Buscar o serviço
    let serviceData;
    if (typeof service === 'string') {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', service)
        .single();
      
      if (error || !data) {
        console.error('Erro ao buscar serviço:', error);
        return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
      }
      
      serviceData = data;
    } else {
      serviceData = service;
    }
    
    console.log('Serviço encontrado:', serviceData);
    
    // Verificar se o provedor tem API configurada
    const { api_url: apiUrl, api_key: apiKey } = provider;
    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: 'Configuração de provedor incompleta.' }, { status: 400 });
    }
    
    // Formatar o link do Instagram
    const formattedLink = formatInstagramLink(link);
    if (!formattedLink) {
      return NextResponse.json({ error: 'Link inválido ou não suportado' }, { status: 400 });
    }
    
    // Verificar se o serviço tem um external_id
    if (!serviceData.external_id) {
      console.error('Serviço não possui external_id:', serviceData);
      return NextResponse.json({ error: 'Serviço não possui ID externo configurado' }, { status: 400 });
    }
    
    // Preparar os dados para a requisição ao provedor
    const providerRequestData = {
      key: apiKey,
      action: 'add',
      service: serviceData.external_id.toString(),
      link: formattedLink,
      quantity: quantity.toString()
    };
    
    // Converter para formato x-www-form-urlencoded manualmente
    const formData = Object.entries(providerRequestData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    console.log('Dados para o provedor:', providerRequestData);
    console.log('API URL do provedor:', apiUrl);
    console.log('Dados formatados para envio:', formData);
    
    // Log detalhado para depuração
    console.log('Enviando para o provedor:');
    console.log(`key: ${apiKey}`);
    console.log(`action: add`);
    console.log(`service: ${serviceData.external_id.toString()}`);
    console.log(`link: ${formattedLink}`);
    console.log(`quantity: ${quantity.toString()}`);
    
    // Enviar pedido para o provedor usando POST com x-www-form-urlencoded
    try {
      console.log('Iniciando requisição para o provedor...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        body: formData,
      });
      
      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na resposta do provedor (${response.status}): ${errorText}`);
        console.error('URL usada:', apiUrl);
        console.error('Dados enviados:', formData);
        
        let errorMessage = `Erro ao enviar pedido para o provedor (${response.status})`;
        
        try {
          // Tentar analisar o erro como JSON
          const errorData = JSON.parse(errorText);
          errorMessage = `Erro ao enviar pedido para o provedor: ${JSON.stringify(errorData)}`;
          console.error('Detalhes do erro:', errorData);
        } catch (parseError) {
          // Se não for JSON, usar o texto bruto
          errorMessage = `Erro ao enviar pedido para o provedor: ${errorText}`;
        }
        
        return NextResponse.json({ error: errorMessage }, { status: response.status });
      }
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Resposta do provedor:', JSON.stringify(responseData, null, 2));
      } catch (jsonError) {
        const textResponse = await response.text();
        console.error('Erro ao analisar resposta JSON do provedor:', jsonError);
        console.log('Resposta em texto:', textResponse);
        return NextResponse.json({ error: `Resposta inválida do provedor: ${textResponse}` }, { status: 500 });
      }
      
      if (!responseData.order) {
        throw new Error(`Resposta do provedor não contém ID do pedido: ${JSON.stringify(responseData)}`);
      }
      
      console.log('Resposta do provedor:', responseData);
      
      // Salvar o pedido no banco de dados
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          external_order_id: responseData.order,
          service_id: serviceData.id,
          provider_id: provider.id,
          user_id: user_id,
          customer_id: customer_id,
          transaction_id: transaction_id,
          quantity: quantity,
          status: 'pending',
          metadata: {
            provider: provider.name,
            link: link,
            target_username: target_username,
            request: providerRequestData,
            response: responseData
          }
        })
        .select()
        .single();
        
      if (orderError) {
        console.error('Error saving order to database:', orderError);
        throw new Error(`Error saving order to database: ${orderError.message}`);
      }

      // Retornar a resposta da API do provedor
      return NextResponse.json({
        success: true,
        order: {
          id: orderData.id,
          external_id: responseData.order,
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Error processing order:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
