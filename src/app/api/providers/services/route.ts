import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const requestData = await request.json();
    
    // Obter o provedor selecionado
    const { provider, action, service_id } = requestData;
    
    if (!provider) {
      return NextResponse.json({ error: 'Provedor não especificado' }, { status: 400 });
    }
    
    console.log('Ação solicitada:', action);
    console.log('Provedor selecionado:', provider.name);
    
    // Verificar se o provedor tem API URL e API Key
    if (!provider.api_url) {
      return NextResponse.json({ error: 'URL da API não configurada para este provedor' }, { status: 400 });
    }
    
    // Construir o corpo da requisição - sempre usar form-urlencoded por padrão
    const formData = new URLSearchParams();
    formData.append('key', provider.api_key);
    
    // Determinar a ação a ser executada
    if (action === 'service_details' && service_id) {
      console.log('Buscando detalhes do serviço:', service_id);
      formData.append('action', 'services');
      
      // Fazer a requisição para obter todos os serviços
      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status, response.statusText);
        return NextResponse.json({ 
          error: `Erro na resposta da API: ${response.status} ${response.statusText}` 
        }, { status: response.status });
      }
      
      // Processar a resposta
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // Se não for JSON, tentar como texto
        const textData = await response.text();
        try {
          responseData = JSON.parse(textData);
        } catch (e2) {
          return NextResponse.json({ 
            error: 'A resposta da API não é um JSON válido'
          }, { status: 500 });
        }
      }
      
      // Processar a resposta para encontrar o serviço específico
      let services = [];
      
      // Tentar extrair serviços de diferentes formatos comuns de resposta
      if (Array.isArray(responseData)) {
        services = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        services = responseData.data;
      } else if (responseData.services && Array.isArray(responseData.services)) {
        services = responseData.services;
      } else if (responseData.result && Array.isArray(responseData.result)) {
        services = responseData.result;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        services = responseData.items;
      } else if (typeof responseData === 'object') {
        services = Object.values(responseData);
      }
      
      // Encontrar o serviço específico
      const serviceDetail = services.find((service: any) => {
        // Tentar diferentes propriedades que podem conter o ID do serviço
        const serviceId = service.service || service.id || service.service_id;
        return serviceId && serviceId.toString() === service_id.toString();
      });
      
      if (!serviceDetail) {
        return NextResponse.json({ 
          error: 'Serviço não encontrado' 
        }, { status: 404 });
      }
      
      // Garantir que o serviço tenha um external_id
      if (serviceDetail.service) {
        serviceDetail.external_id = serviceDetail.service.toString();
      } else if (serviceDetail.id) {
        serviceDetail.external_id = serviceDetail.id.toString();
      } else if (serviceDetail.service_id) {
        serviceDetail.external_id = serviceDetail.service_id.toString();
      }
      
      return NextResponse.json(serviceDetail);
    } else {
      // Ação padrão: listar todos os serviços
      formData.append('action', 'services');
    }
    
    console.log('Fazendo requisição para:', provider.api_url);
    
    // Fazer a requisição para a API do provedor
    const response = await fetch(provider.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error('Erro na resposta da API:', response.status, response.statusText);
      return NextResponse.json({ 
        error: `Erro na resposta da API: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }
    
    // Tentar processar a resposta como JSON
    let responseData;
    try {
      responseData = await response.json();
      console.log('Resposta recebida (JSON)');
    } catch (e) {
      // Se não for JSON, tentar como texto
      const textData = await response.text();
      console.log('Resposta recebida (texto)');
      try {
        // Tentar converter para JSON
        responseData = JSON.parse(textData);
      } catch (e2) {
        // Se não for JSON, retornar como texto
        console.error('Resposta não é um JSON válido');
        return NextResponse.json({ 
          error: 'A resposta da API não é um JSON válido',
          data: textData.substring(0, 1000) // Limitar o tamanho para evitar respostas muito grandes
        }, { status: 500 });
      }
    }
    
    // Processar a resposta
    let services = [];
    
    // Tentar extrair serviços de diferentes formatos comuns de resposta
    if (Array.isArray(responseData)) {
      // Resposta é um array direto de serviços
      services = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // Resposta tem um campo data que é um array
      services = responseData.data;
    } else if (responseData.services && Array.isArray(responseData.services)) {
      // Resposta tem um campo services que é um array
      services = responseData.services;
    } else if (responseData.result && Array.isArray(responseData.result)) {
      // Resposta tem um campo result que é um array
      services = responseData.result;
    } else if (responseData.items && Array.isArray(responseData.items)) {
      // Resposta tem um campo items que é um array
      services = responseData.items;
    } else if (typeof responseData === 'object') {
      // Resposta é um objeto com serviços como propriedades
      services = Object.values(responseData);
    } else {
      console.error('Formato de resposta não reconhecido:', responseData);
      return NextResponse.json({ 
        error: 'Formato de resposta não reconhecido', 
        data: JSON.stringify(responseData).substring(0, 1000) // Limitar o tamanho
      }, { status: 500 });
    }
    
    console.log(`${services.length} serviços encontrados`);
    
    return NextResponse.json({ 
      success: true, 
      services,
      provider: provider.slug
    });
    
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json({ 
      error: `Erro ao buscar serviços: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}
