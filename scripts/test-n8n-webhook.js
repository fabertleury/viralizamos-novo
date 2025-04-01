/**
 * Script para testar o envio de pedidos para o webhook do n8n
 * 
 * Como usar:
 * 1. Certifique-se de ter o Node.js instalado
 * 2. Execute: node test-n8n-webhook.js [test|production] --providerId=<id-do-provedor>
 *    - test: Envia para o ambiente de teste (padrão se não especificado)
 *    - production: Envia para o ambiente de produção
 *    - providerId: ID do provedor a ser usado (opcional)
 */

const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Obter o ambiente a partir dos argumentos da linha de comando
const env = process.argv[2] || 'test';
const isProduction = env === 'production';

// Extrair o providerId dos argumentos (se fornecido)
let providerId = "1"; // Valor padrão
const providerArg = process.argv.find(arg => arg.startsWith('--providerId='));
if (providerArg) {
  providerId = providerArg.split('=')[1];
}

// URLs dos webhooks
const webhookUrls = {
  test: process.env.N8N_WEBHOOK_URL_TEST || 'https://automacoes.traconegocios.com.br/webhook-test/order',
  production: process.env.N8N_WEBHOOK_URL || 'https://n8nwebhook.traconegocios.com.br/webhook/order'
};

// Chave de API para autenticação
const apiKey = process.env.N8N_API_KEY || 'n8n_viralizamos_2024';

// Gerar IDs únicos para o teste
const timestamp = Date.now();
const randomNum = Math.floor(Math.random() * 10000);
const transactionId = `test-${timestamp}-${randomNum}`;
const postId = `post-${randomNum}`;
const orderId = `${transactionId}-${postId}`;

// Dados do pedido para teste
const orderData = {
  order_id: orderId,
  transaction_id: transactionId,
  service_id: "1001",
  provider_id: providerId,
  external_service_id: "1234",
  quantity: 1000,
  target_url: "https://instagram.com/p/ABC123XYZ/",
  target_username: "usuario_instagram",
  metadata: {
    post_id: postId,
    post_code: "ABC123XYZ",
    post_type: "post",
    service_type: "likes",
    payment_id: "106707916782",
    customer_email: "cliente@exemplo.com",
    customer_name: "Cliente Exemplo"
  },
  webhook_timestamp: new Date().toISOString()
};

// Determinar a URL com base no ambiente
const webhookUrl = webhookUrls[isProduction ? 'production' : 'test'];

console.log(`Enviando pedido para ${isProduction ? 'PRODUÇÃO' : 'TESTE'}`);
console.log(`URL: ${webhookUrl}`);
console.log(`Provider ID: ${providerId}`);
console.log('Dados do pedido:', JSON.stringify(orderData, null, 2));

// Enviar o pedido para o webhook
axios.post(webhookUrl, orderData, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey
  }
})
.then(response => {
  console.log('Resposta:', response.data);
})
.catch(error => {
  console.error('Erro:', error.response ? error.response.data : error.message);
}); 