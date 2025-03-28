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

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const data = await request.json();
    
    // Validar dados necessários
    if (!data.service || !data.link) {
      return NextResponse.json({ error: 'Dados incompletos. Serviço e link são obrigatórios.' }, { status: 400 });
    }
    
    const service = data.service;
    const quantity = data.quantity || 1;
    const link = data.link;
    const transaction_id = data.transaction_id;
    const target_username = data.target_username;
    const user_id = data.user_id;
    const customer_id = data.customer_id;
    
    // Buscar o serviço para obter o provider_id
    let provider = data.provider;
    
    // Se o provider não foi fornecido, buscar do serviço
    if (!provider) {
      console.log('Buscando informações do serviço para obter o provider_id:', service.id);
      
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*, provider:providers(*)')
        .eq('id', service.id)
        .single();
      
      if (serviceError) {
        console.error('Erro ao buscar serviço:', serviceError);
        return NextResponse.json({ error: `Erro ao buscar serviço: ${serviceError.message}` }, { status: 500 });
      }
      
      // Verificar se o serviço tem um provedor no metadata
      if (serviceData.metadata && serviceData.metadata.provider) {
        provider = serviceData.metadata.provider;
        console.log('Provedor encontrado no metadata do serviço:', provider.name);
      } 
      // Se não tem no metadata, usar o provider do serviço
      else if (serviceData.provider) {
        provider = serviceData.provider;
        console.log('Provedor encontrado no relacionamento do serviço:', provider.name);
      }
      // Se não tem provider, buscar pelo provider_id
      else if (serviceData.provider_id) {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', serviceData.provider_id)
          .single();
        
        if (providerError) {
          console.error('Erro ao buscar provedor:', providerError);
          return NextResponse.json({ error: `Erro ao buscar provedor: ${providerError.message}` }, { status: 500 });
        }
        
        provider = providerData;
        console.log('Provedor encontrado pelo provider_id:', provider.name);
      }
    }
    
    if (!provider) {
      return NextResponse.json({ error: 'Provedor não encontrado para o serviço.' }, { status: 400 });
    }
    
    console.log('Processando pedido para provedor:', provider.name);
    console.log('Dados do pedido:', { service, quantity, link, transaction_id, target_username });
    
    // Determinar qual API do provedor usar
    const apiUrl = provider.api_url;
    const apiKey = provider.api_key;
    
    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: 'Configuração de provedor incompleta.' }, { status: 400 });
    }
    
    // Formatar o link do Instagram
    const formattedLink = formatInstagramLink(link);
    if (!formattedLink) {
      return NextResponse.json({ error: 'Link inválido ou não suportado' }, { status: 400 });
    }
    
    // Verificar se o serviço tem um external_id
    if (!service.external_id) {
      console.error('Serviço não possui external_id:', service);
      return NextResponse.json({ error: 'Serviço não possui ID externo configurado' }, { status: 400 });
    }
    
    // Preparar os dados para a requisição ao provedor
    const providerRequestData = {
      key: apiKey,
      action: 'add',
      service: service.external_id.toString(),
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
    console.log(`service: ${service.external_id.toString()}`);
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
        console.error('Dados enviados:', Object.fromEntries(providerRequestData.entries()));
        
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
          service_id: service.id,
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
            request: Object.fromEntries(providerRequestData.entries()),
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
