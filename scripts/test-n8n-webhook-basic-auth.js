/**
 * Script para testar o webhook do n8n com autenticação básica HTTP
 * 
 * Uso:
 * node test-n8n-webhook-basic-auth.js [username] [password]
 */

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const username = args[0] || 'n8n';
const password = args[1] || 'n8n_viralizamos_2024';

// URLs do webhook
const TEST_WEBHOOK_URL = 'https://automacoes.traconegocios.com.br/webhook-test/order';

// Função para codificar em base64
function base64Encode(str) {
  return Buffer.from(str).toString('base64');
}

// Gerar IDs únicos para teste
const timestamp = Date.now();
const randomNumber = Math.floor(Math.random() * 10000) + 1;
const transactionId = `test-${timestamp}-${randomNumber}`;
const postId = `post-${randomNumber}`;
const orderId = `${transactionId}-${postId}`;

// Dados do pedido simplificados
const orderData = {
  order_id: orderId,
  transaction_id: transactionId,
  service_id: '1001',
  provider_id: '1',
  quantity: 1000,
  webhook_timestamp: new Date().toISOString()
};

// Criar o cabeçalho de autenticação básica
const basicAuthHeader = `Basic ${base64Encode(`${username}:${password}`)}`;

console.log('Iniciando teste com autenticação básica HTTP...');
console.log(`URL: ${TEST_WEBHOOK_URL}`);
console.log(`Credenciais: ${username}:${password}`);
console.log(`Cabeçalho: Authorization: ${basicAuthHeader}`);
console.log('---------------------------------------------------');

// Enviar a requisição
fetch(TEST_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': basicAuthHeader
  },
  body: JSON.stringify(orderData)
})
.then(response => {
  console.log(`Status: ${response.status} ${response.statusText || ''}`);
  return response.text();
})
.then(data => {
  console.log('Resposta:', data);
})
.catch(error => {
  console.error('Erro ao enviar requisição:', error);
}); 