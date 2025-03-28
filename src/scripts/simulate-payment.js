#!/usr/bin/env node

/**
 * Script para simular um pagamento PIX diretamente no banco de dados
 * Útil para testes sem precisar realizar um pagamento real
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Logger simplificado
const logger = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCESSO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[AVISO]${colors.reset} ${msg}`),
  error: (msg, err) => console.log(`${colors.red}[ERRO]${colors.reset} ${msg}${err ? ': ' + JSON.stringify(err) : ''}`)
};

/**
 * Função principal para simular um pagamento
 */
async function simulatePayment(options = {}) {
  logger.info('Iniciando simulação de pagamento PIX...');

  // Inicializar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  );

  try {
    // Buscar um serviço do banco de dados
    const { data: services, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .limit(1);

    if (serviceError || !services || services.length === 0) {
      logger.error('Erro ao buscar serviço para simulação', serviceError);
      return;
    }

    const service = services[0];
    
    // Gerar dados do perfil simulado
    const username = options.username || `user_${Math.floor(Math.random() * 10000)}`;
    const serviceId = options.serviceId || service.id;
    const amount = options.amount || service.preco || 10;
    const posts = options.posts || [];
    
    // Gerar ID único para o pagamento
    const paymentId = `sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Gerar uma URL fake de QR code
    const qrCodeText = `00020101021226890014br.gov.bcb.pix2567simulated-pix@example.com5204000053039865802BR5924SIMULACAO PIX VIRALIZAMOS6009SAO PAULO62070503***63046D3C`;
    
    // Definir metadados da transação
    const metadata = {
      service: {
        id: serviceId,
        provider_id: service.provider_id || null,
        name: service.name || service.nome || 'Serviço Simulado'
      },
      profile: {
        username: username,
        full_name: `Nome de ${username}`,
        link: `https://instagram.com/${username}`
      },
      customer: {
        name: 'Cliente Teste',
        email: 'teste@exemplo.com',
        phone: '11999999999'
      },
      posts: posts.length > 0 ? posts : [
        {
          id: uuidv4(),
          code: 'ABC123',
          url: 'https://instagram.com/p/ABC123',
          caption: 'Post de teste',
          username: username
        }
      ],
      payment: {
        id: paymentId,
        provider: 'simulacao',
        method: 'pix',
        qr_code: qrCodeText,
        qr_code_base64: ''
      }
    };

    // Inserir na tabela core_transactions
    const { data: transaction, error: transactionError } = await supabase
      .from('core_transactions')
      .insert({
        service_id: serviceId,
        user_id: options.userId,
        customer_id: options.customerId,
        amount: amount,
        status: 'approved', // Já aprovado para facilitar os testes
        payment_method: 'pix',
        payment_id: paymentId,
        payment_external_reference: paymentId,
        external_id: paymentId,
        payment_status: 'approved',
        payment_provider: 'simulacao',
        target_username: username,
        target_url: `https://instagram.com/${username}`,
        customer_name: 'Cliente Teste',
        customer_email: 'teste@exemplo.com',
        customer_phone: '11999999999',
        metadata,
        order_created: false
      })
      .select()
      .single();

    if (transactionError) {
      logger.error('Erro ao inserir transação simulada', transactionError);
      return;
    }

    logger.success(`Transação simulada criada com ID: ${transaction.id}`);

    // Inserir posts na tabela core_transaction_posts
    const postsToInsert = metadata.posts.map(post => ({
      transaction_id: transaction.id,
      post_code: post.code || '',
      post_url: post.url || '',
      post_caption: post.caption || '',
      post_type: post.url?.includes('/reel/') ? 'reel' : 'post',
      username: username
    }));

    const { error: postsError } = await supabase
      .from('core_transaction_posts')
      .insert(postsToInsert);

    if (postsError) {
      logger.error('Erro ao inserir posts da transação simulada', postsError);
    } else {
      logger.success(`${postsToInsert.length} posts inseridos para a transação`);
    }

    // Exibir resultado final
    logger.info('Simulação de pagamento concluída com sucesso!');
    logger.info('Detalhes da transação:');
    logger.info(`ID da transação: ${transaction.id}`);
    logger.info(`ID do pagamento: ${paymentId}`);
    logger.info(`Username: ${username}`);
    logger.info(`Valor: R$ ${amount}`);
    logger.info(`Status: ${transaction.status}`);

    logger.info('');
    logger.info('Próximos passos:');
    logger.info('1. Processar a transação: npm run run-jobs transactions');
    logger.info('2. Verificar status dos pedidos: npm run check-orders');

    return transaction;

  } catch (error) {
    logger.error('Erro ao executar simulação de pagamento', error);
  }
}

// Analisar argumentos da linha de comando
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--username' && args[i + 1]) {
    options.username = args[i + 1];
    i++;
  } else if (args[i] === '--serviceId' && args[i + 1]) {
    options.serviceId = args[i + 1];
    i++;
  } else if (args[i] === '--amount' && args[i + 1]) {
    options.amount = parseFloat(args[i + 1]);
    i++;
  } else if (args[i] === '--userId' && args[i + 1]) {
    options.userId = args[i + 1];
    i++;
  } else if (args[i] === '--customerId' && args[i + 1]) {
    options.customerId = args[i + 1];
    i++;
  } else if (args[i] === '--help') {
    console.log(`
Uso: node simulate-payment.js [opções]

Opções:
  --username STRING     Nome de usuário do Instagram
  --serviceId STRING    ID do serviço no banco de dados
  --amount NUMBER       Valor da transação (em reais)
  --userId UUID         ID do usuário (auth.users.id)
  --customerId UUID     ID do cliente (customers.id)
  --help                Exibe esta ajuda
    `);
    process.exit(0);
  }
}

// Executar a simulação
simulatePayment(options).catch(console.error); 