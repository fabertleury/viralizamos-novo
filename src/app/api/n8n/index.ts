import { NextResponse } from 'next/server';

export async function GET() {
  // Gerar documentação das rotas da API do N8N
  const apiDocs = {
    base_url: '/api/n8n',
    description: 'API para integração com o N8N (plataforma de automação de workflows)',
    version: '1.0.0',
    endpoints: [
      {
        path: '/callback',
        method: 'POST',
        description: 'Endpoint para receber callbacks do N8N com atualizações de status de pedidos',
        auth: 'Requer chave API no header X-API-KEY',
        request_body: {
          order_id: 'ID do pedido (obrigatório)',
          status: 'Status do pedido (pending, processing, completed, error, cancelled)',
          message: 'Mensagem opcional com detalhes',
          external_order_id: 'ID externo do pedido no provedor (opcional)',
          details: 'Objeto com detalhes adicionais (opcional)'
        }
      },
      {
        path: '/process-transaction',
        method: 'POST',
        description: 'Endpoint para processar uma transação específica e enviar para o N8N',
        auth: 'Requer chave API no header X-API-KEY',
        request_body: {
          transaction_id: 'ID da transação a ser processada (obrigatório)',
          test_environment: 'Boolean opcional para usar ambiente de teste (default: false)'
        }
      },
      {
        path: '/cron/process-orders',
        method: 'POST',
        description: 'Endpoint para processar pedidos pendentes em lote e enviar para o N8N',
        auth: 'Requer chave API no header X-API-KEY'
      }
    ],
    auth: {
      type: 'API Key',
      header: 'X-API-KEY',
      value: 'Valor definido em API_CALLBACK_SECRET no arquivo .env'
    }
  };
  
  return NextResponse.json(apiDocs);
} 