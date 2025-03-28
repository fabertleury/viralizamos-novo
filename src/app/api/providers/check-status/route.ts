import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { api_url, api_key } = await request.json();

    if (!api_url || !api_key) {
      return NextResponse.json({
        success: false,
        error: 'URL da API e chave da API são obrigatórios'
      }, { status: 400 });
    }

    // Verifica o status e saldo usando a action=balance
    const url = api_url.replace(/\/$/, '');
    
    // Preparar o corpo da requisição
    const formBody = new URLSearchParams({
      key: api_key,
      action: 'balance'
    }).toString();
    
    console.log(`Verificando status da API: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `API não acessível: ${response.status} ${response.statusText}`
      });
    }

    // Processar a resposta
    const data = await response.json();
    console.log('Resposta da API:', data);
    
    let balance = 0;
    let currency = 'BRL';
    let error = null;

    // Tentar extrair o saldo de diferentes formatos de resposta
    if (typeof data === 'object') {
      // Verificar o formato específico da resposta
      if (data.balance !== undefined) {
        // Formato: { "balance": "100.84292", "currency": "USD" }
        balance = typeof data.balance === 'string' ? parseFloat(data.balance) : Number(data.balance);
        currency = data.currency || currency;
      } else if (data.saldo !== undefined) {
        // Formato alternativo
        balance = typeof data.saldo === 'string' ? parseFloat(data.saldo) : Number(data.saldo);
        currency = data.moeda || currency;
      }
      
      if (data.error) {
        error = data.error;
      }
    } else {
      error = 'Formato de resposta inválido';
    }

    return NextResponse.json({
      success: !error,
      balance,
      currency,
      error
    });

  } catch (error: any) {
    console.error('Erro ao verificar status da API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao verificar API'
    }, { status: 500 });
  }
}
