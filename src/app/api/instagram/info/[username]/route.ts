import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Usar o parâmetro username diretamente
    const username = params.username;
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

    // Tentar primeiro com o Instagram Scraper API2
    let response = await fetch(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`,
      {
        headers: {
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY
        }
      }
    );

    // Se falhar, tentar com o RocketAPI (Get Info)
    if (!response.ok) {
      console.log('Instagram Scraper API2 falhou, tentando RocketAPI...');
      response = await fetch(
        `https://instagram-data1.p.rapidapi.com/user/get-info?username=${username}`,
        {
          headers: {
            'x-rapidapi-host': 'instagram-data1.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );
    }

    // Se ainda falhar, tentar com o Real-Time Instagram Scraper
    if (!response.ok) {
      console.log('RocketAPI falhou, tentando Real-Time Instagram Scraper...');
      response = await fetch(
        `https://real-time-instagram-scraper.p.rapidapi.com/user-info?username=${username}`,
        {
          headers: {
            'x-rapidapi-host': 'real-time-instagram-scraper.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );
    }

    // Se todas as APIs falharem
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Erro ao buscar perfil no Instagram. Todas as APIs falharam.' },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { message: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
