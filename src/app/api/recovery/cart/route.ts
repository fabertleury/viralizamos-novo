import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:osKzFdoorhHttFrGAMPdzNEEPjYDGnhL@turntable.proxy.rlwy.net:55873/railway'
});

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

// Função para gerar um cupom de desconto
async function generateDiscountCoupon(customerEmail: string, cartAmount: number): Promise<string> {
  try {
    // Gerar um código aleatório para o cupom
    const couponCode = `RECOVERY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Calcular o valor do desconto (10% do valor do carrinho)
    const discountAmount = Math.min(cartAmount * 0.1, 50); // Máximo de R$50 de desconto
    
    // Inserir o cupom no banco de dados
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        discount_type: 'value',
        discount_value: discountAmount,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Válido por 7 dias
        max_uses: 1,
        current_uses: 0,
        customer_email: customerEmail,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Erro ao criar cupom:', error);
      return '';
    }
    
    return couponCode;
  } catch (error) {
    console.error('Erro ao gerar cupom de desconto:', error);
    return '';
  }
}

// Função para enviar email de recuperação
async function sendRecoveryEmail(
  customerEmail: string, 
  cartToken: string, 
  serviceName: string, 
  cartAmount: number,
  couponCode: string
): Promise<boolean> {
  try {
    // Construir a URL de recuperação
    const recoveryUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://viralizamos.com.br'}/pagamento/${cartToken}`;
    
    // Formatar o valor do carrinho
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cartAmount);
    
    // Construir o corpo do email
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://viralizamos.com.br/images/logo.png" alt="Viralizamos" style="max-width: 200px;">
        </div>
        
        <h2 style="color: #db2777; text-align: center;">Seu carrinho está esperando por você!</h2>
        
        <p>Olá,</p>
        
        <p>Notamos que você deixou um item em seu carrinho. Não se preocupe, nós guardamos ele para você!</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Detalhes do seu pedido:</h3>
          <p><strong>Serviço:</strong> ${serviceName}</p>
          <p><strong>Valor:</strong> ${formattedAmount}</p>
        </div>
        
        ${couponCode ? `
        <div style="background-color: #fdf2f8; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #db2777;">Cupom de desconto exclusivo para você!</h3>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #db2777; margin: 10px 0;">${couponCode}</p>
          <p>Use este cupom para obter um desconto especial na sua compra.</p>
          <p style="font-size: 12px; color: #666;">Válido por 7 dias. Uso único.</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${recoveryUrl}" style="background-color: #db2777; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Continuar minha compra</a>
        </div>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
          Se você não tentou fazer uma compra em nosso site, por favor ignore este email.
        </p>
      </div>
    `;
    
    // Enviar o email
    const info = await transporter.sendMail({
      from: `"Viralizamos" <${process.env.EMAIL_USER || 'noreply@viralizamos.com.br'}>`,
      to: customerEmail,
      subject: 'Seu carrinho está esperando por você! 🛒',
      html: emailBody,
    });
    
    console.log('Email enviado:', info.messageId);
    
    // Registrar o envio do email no banco de dados
    const client = await pool.connect();
    
    try {
      await client.query(`
        INSERT INTO recovery_emails (
          customer_email, cart_token, service_name, cart_amount, 
          coupon_code, sent_at, email_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        customerEmail,
        cartToken,
        serviceName,
        cartAmount,
        couponCode,
        new Date().toISOString(),
        info.messageId
      ]);
    } finally {
      client.release();
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return false;
  }
}

// Endpoint para enviar email de recuperação de carrinho
export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const data = await request.json();
    
    // Validar os dados recebidos
    if (!data || !data.cart_token || !data.customer_email) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
    
    const { 
      cart_token, 
      customer_email, 
      service_name, 
      cart_amount,
      generate_coupon = true // Por padrão, gera um cupom de desconto
    } = data;
    
    // Verificar se já foi enviado um email de recuperação para este carrinho nas últimas 24 horas
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM recovery_emails 
        WHERE cart_token = $1 AND customer_email = $2 AND sent_at > NOW() - INTERVAL '24 hours'
        LIMIT 1
      `, [cart_token, customer_email]);
      
      if (result.rows.length > 0) {
        return NextResponse.json({ 
          error: 'Já foi enviado um email de recuperação para este carrinho nas últimas 24 horas',
          last_sent: result.rows[0].sent_at
        }, { status: 429 });
      }
    } finally {
      client.release();
    }
    
    // Gerar um cupom de desconto se solicitado
    let couponCode = '';
    if (generate_coupon) {
      couponCode = await generateDiscountCoupon(customer_email, cart_amount);
    }
    
    // Enviar o email de recuperação
    const success = await sendRecoveryEmail(
      customer_email,
      cart_token,
      service_name,
      cart_amount,
      couponCode
    );
    
    if (!success) {
      return NextResponse.json({ error: 'Erro ao enviar email de recuperação' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      coupon_code: couponCode || null
    });
  } catch (error) {
    console.error('Erro ao processar recuperação de carrinho:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Endpoint para obter estatísticas de recuperação de carrinhos
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const email = searchParams.get('email');
    
    // Conectar ao banco de dados
    const client = await pool.connect();
    
    try {
      // Construir a consulta SQL com os filtros
      let queryText = `
        SELECT 
          re.id, re.customer_email, re.cart_token, re.service_name, 
          re.cart_amount, re.coupon_code, re.sent_at, re.email_id,
          CASE WHEN o.id IS NOT NULL THEN true ELSE false END as converted
        FROM 
          recovery_emails re
        LEFT JOIN 
          orders o ON re.cart_token = o.token AND o.status = 'completed'
        WHERE 1=1
      `;
      
      const queryParams = [];
      let paramIndex = 1;
      
      // Adicionar filtros se fornecidos
      if (startDate) {
        queryText += ` AND re.sent_at >= $${paramIndex}`;
        queryParams.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        queryText += ` AND re.sent_at <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }
      
      if (email) {
        queryText += ` AND re.customer_email = $${paramIndex}`;
        queryParams.push(email);
        paramIndex++;
      }
      
      // Adicionar ordenação
      queryText += ` ORDER BY re.sent_at DESC`;
      
      // Executar a consulta
      const result = await client.query(queryText, queryParams);
      
      // Calcular estatísticas
      const totalEmails = result.rows.length;
      const convertedEmails = result.rows.filter(row => row.converted).length;
      const conversionRate = totalEmails > 0 ? (convertedEmails / totalEmails) * 100 : 0;
      const totalRecoveredAmount = result.rows
        .filter(row => row.converted)
        .reduce((sum, row) => sum + parseFloat(row.cart_amount), 0);
      
      return NextResponse.json({
        data: result.rows,
        stats: {
          total_emails: totalEmails,
          converted_emails: convertedEmails,
          conversion_rate: conversionRate,
          total_recovered_amount: totalRecoveredAmount
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas de recuperação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
