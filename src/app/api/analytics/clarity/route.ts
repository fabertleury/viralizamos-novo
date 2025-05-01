import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:osKzFdoorhHttFrGAMPdzNEEPjYDGnhL@turntable.proxy.rlwy.net:55873/railway'
});

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const data = await request.json();
    
    // Validar os dados recebidos
    if (!data || !data.event_type) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
    
    // Extrair dados específicos para carrinhos abandonados
    const {
      event_type,
      data: eventData,
      cart_token,
      cart_amount,
      service_name,
      customer_email,
      time_spent,
      user_id,
      session_id,
      page_url = request.headers.get('referer') || '',
      user_agent = request.headers.get('user-agent') || '',
      device_type,
      browser,
      country,
      referrer
    } = data;
    
    // Obter o IP do cliente
    const ip_address = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       '127.0.0.1';
    
    // Conectar ao banco de dados
    const client = await pool.connect();
    
    try {
      // Inserir os dados na tabela analytics_clarity
      const insertQuery = `
        INSERT INTO analytics_clarity (
          event_type, event_data, user_id, session_id, page_url, user_agent, ip_address,
          cart_token, cart_amount, service_name, customer_email, time_spent,
          device_type, browser, country, referrer
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `;
      
      const values = [
        event_type,
        eventData ? JSON.stringify(eventData) : null,
        user_id || null,
        session_id || null,
        page_url,
        user_agent,
        ip_address,
        cart_token || null,
        cart_amount || null,
        service_name || null,
        customer_email || null,
        time_spent || null,
        device_type || null,
        browser || null,
        country || null,
        referrer || null
      ];
      
      const result = await client.query(insertQuery, values);
      
      // Liberar o cliente
      client.release();
    } catch (dbError) {
      // Liberar o cliente em caso de erro
      client.release();
      console.error('Erro ao salvar evento do Clarity no PostgreSQL:', dbError);
      return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar evento do Clarity:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Endpoint para obter dados de analytics (para o painel administrativo)
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('event_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Conectar ao banco de dados
    const client = await pool.connect();
    
    try {
      // Construir a consulta SQL com os filtros
      let queryText = 'SELECT * FROM analytics_clarity WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;
      
      // Adicionar filtros se fornecidos
      if (eventType) {
        queryText += ` AND event_type = $${paramIndex}`;
        queryParams.push(eventType);
        paramIndex++;
      }
      
      if (startDate) {
        queryText += ` AND created_at >= $${paramIndex}`;
        queryParams.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        queryText += ` AND created_at <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }
      
      if (email) {
        queryText += ` AND customer_email = $${paramIndex}`;
        queryParams.push(email);
        paramIndex++;
      }
      
      // Adicionar ordenação e limite
      queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
      queryParams.push(limit);
      
      // Executar a consulta
      const result = await client.query(queryText, queryParams);
      
      // Liberar o cliente
      client.release();
      
      return NextResponse.json({ data: result.rows });
    } catch (dbError) {
      // Liberar o cliente em caso de erro
      client.release();
      console.error('Erro ao buscar eventos do Clarity do PostgreSQL:', dbError);
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao processar requisição de analytics:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
