/**
 * Script para testar o webhook do n8n
 * 
 * Uso:
 * node test-webhook.js [test|production]
 */

// Determinar ambiente (test ou production)
const env = process.argv[2] || 'test';
const isTest = env.toLowerCase() === 'test';

// URLs do webhook
const TEST_WEBHOOK_URL = 'https://automacoes.traconegocios.com.br/webhook-test/order';
const PROD_WEBHOOK_URL = 'https://n8nwebhook.traconegocios.com.br/webhook/order';
const webhookUrl = isTest ? TEST_WEBHOOK_URL : PROD_WEBHOOK_URL;

// Credenciais de autenticação
const username = 'n8n';
const password = 'n8n_viralizamos_2024';
const basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

// Gerar IDs únicos para teste
const timestamp = Date.now();
const randomNumber = Math.floor(Math.random() * 10000) + 1;
const transactionId = `test-${timestamp}-${randomNumber}`;
const postId = `post-${randomNumber}`;
const orderId = `${transactionId}-${postId}`;

// Dados do pedido
const orderData = {
  order_id: orderId,
  transaction_id: transactionId,
  service_id: '1001',
  provider_id: '1',
  external_service_id: '1234',
  quantity: 1000,
  target_url: 'https://instagram.com/p/ABC123XYZ/',
  target_username: 'usuario_instagram',
  metadata: {
    posts: [
      {
        id: postId,
        code: 'ABC123XYZ',
        url: 'https://instagram.com/p/ABC123XYZ/',
        type: 'post',
        quantity: 1000,
        username: 'usuario_instagram',
        service_type: 'curtidas',
        selected: true
      }
    ],
    type: 'curtidas',
    customer_email: 'cliente@exemplo.com',
    customer_name: 'Cliente Exemplo',
    customer_phone: '11999998888',
    service_name: 'Curtidas Instagram',
    service_type: 'instagram_likes'
  },
  webhook_timestamp: new Date().toISOString()
};

console.log(`Enviando requisição para o webhook ${isTest ? 'de TESTE' : 'de PRODUÇÃO'}`);
console.log(`URL: ${webhookUrl}`);
console.log(`Usando autenticação básica com credenciais: ${username}:${password}`);
console.log('Dados:', JSON.stringify(orderData, null, 2));

// Usar fetch do Node.js nativo (disponível a partir do Node.js 18)
fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': basicAuthHeader
  },
  body: JSON.stringify(orderData)
})
.then(response => {
  console.log(`Status: ${response.status} ${response.statusText}`);
  return response.text();
})
.then(data => {
  console.log('Resposta:', data);
})
.catch(error => {
  console.error('Erro ao enviar requisição:', error);
}); 