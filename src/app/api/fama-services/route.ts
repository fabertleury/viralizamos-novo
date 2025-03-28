import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@/lib/supabase/server';
import qs from 'querystring';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    console.log('Variáveis de ambiente:', {
      FAMA_REDES_API_KEY: process.env.FAMA_REDES_API_KEY ? 'PRESENTE' : 'AUSENTE',
      FAMA_REDES_API_URL: process.env.FAMA_REDES_API_URL ? 'PRESENTE' : 'AUSENTE'
    });

    const body = await request.json();
    const { action } = body;

    console.log('Recebendo requisição na API Fama Redes:', { action, body });

    const apiKey = process.env.FAMA_REDES_API_KEY;
    const apiUrl = process.env.FAMA_REDES_API_URL;

    console.log('Configurações da API:', { 
      apiKeyPresent: !!apiKey, 
      apiUrlPresent: !!apiUrl 
    });

    if (!apiKey || !apiUrl) {
      console.error('Configuração de API incompleta');
      return NextResponse.json(
        { error: 'Configuração de API não encontrada' }, 
        { status: 500 }
      );
    }

    // Configurações padrão para requisição
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Lógica para diferentes ações
    switch (action) {
      case 'service_details':
        const { service_id } = body;
        
        if (!service_id) {
          return NextResponse.json(
            { error: 'ID do serviço não fornecido' }, 
            { status: 400 }
          );
        }

        try {
          // Primeiro, tenta buscar o serviço no banco de dados local
          const { data: localService, error: localError } = await supabase
            .from('services')
            .select('*, category:categories(*), subcategory:subcategories(*)')
            .eq('id', service_id)
            .single();

          if (localService) {
            console.log('Serviço encontrado no banco de dados local:', localService);
            return NextResponse.json(localService);
          }

          // Se não encontrar localmente, busca na API do Fama Redes
          const allServicesData = new URLSearchParams({
            key: apiKey,
            action: 'services'
          }).toString();

          const allServicesResponse = await axios.post(apiUrl, allServicesData, { 
            headers,
            timeout: 10000 // 10 segundos de timeout
          });
          
          // Encontrar o serviço específico
          const serviceDetails = allServicesResponse.data.find(
            (service: any) => service.service.toString() === service_id.toString()
          );

          if (!serviceDetails) {
            return NextResponse.json(
              { error: 'Serviço não encontrado' }, 
              { status: 404 }
            );
          }

          // Garantir que o external_id seja uma string
          if (serviceDetails.service) {
            serviceDetails.external_id = serviceDetails.service.toString();
          }

          return NextResponse.json(serviceDetails);
        } catch (detailsError) {
          console.error('Erro ao buscar detalhes do serviço:', detailsError);
          
          if (axios.isAxiosError(detailsError)) {
            return NextResponse.json(
              { 
                error: 'Erro ao buscar detalhes do serviço',
                details: {
                  status: detailsError.response?.status,
                  data: detailsError.response?.data,
                  message: detailsError.message
                }
              }, 
              { status: detailsError.response?.status || 500 }
            );
          }

          return NextResponse.json(
            { error: 'Erro desconhecido ao buscar detalhes do serviço' }, 
            { status: 500 }
          );
        }

      case 'services':
        try {
          const servicesData = new URLSearchParams({
            key: apiKey,
            action: 'services'
          }).toString();

          console.log('Enviando requisição para Fama Redes:', {
            url: apiUrl,
            data: servicesData
          });

          const servicesResponse = await axios.post(apiUrl, servicesData, { 
            headers,
            timeout: 10000 // 10 segundos de timeout
          });

          console.log('Resposta da API Fama Redes:', {
            status: servicesResponse.status,
            data: servicesResponse.data
          });

          return NextResponse.json(servicesResponse.data);
        } catch (famaError) {
          console.error('Erro na requisição Fama Redes:', famaError);
          
          if (axios.isAxiosError(famaError)) {
            return NextResponse.json(
              { 
                error: 'Erro na requisição Fama Redes',
                details: {
                  status: famaError.response?.status,
                  data: famaError.response?.data,
                  message: famaError.message
                }
              }, 
              { status: famaError.response?.status || 500 }
            );
          }

          return NextResponse.json(
            { error: 'Erro desconhecido na requisição Fama Redes' }, 
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Ação não suportada' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API do Fama Redes:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno ao processar a solicitação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    );
  }
}

// Adicionar suporte para método GET para debug
export async function GET() {
  return NextResponse.json({ 
    message: 'Rota de serviços Fama Redes', 
    status: 'Operacional',
    apiKeyConfigured: !!process.env.FAMA_REDES_API_KEY
  });
}
