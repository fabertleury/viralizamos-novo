/**
 * Script para testar o webhook do n8n
 * 
 * Uso:
 * node test-n8n-webhook.js [test|production] [api_key]
 * 
 * Exemplo:
 * node test-n8n-webhook.js test "minha_chave_api"
 */

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const env = args[0] || 'test';
const customApiKey = args[1]; // Chave de API personalizada, se fornecida

const isTest = env.toLowerCase() === 'test';

// URLs do webhook
const TEST_WEBHOOK_URL = 'https://automacoes.traconegocios.com.br/webhook-test/order';
const PROD_WEBHOOK_URL = 'https://n8nwebhook.traconegocios.com.br/webhook/order';
const webhookUrl = isTest ? TEST_WEBHOOK_URL : PROD_WEBHOOK_URL;

// Chave de API padrão
const DEFAULT_API_KEY = 'n8n_viralizamos_2024';
// Usar chave personalizada se fornecida, senão usar a padrão
const API_KEY = customApiKey || DEFAULT_API_KEY;

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
console.log(`Usando chave API: ${API_KEY}${customApiKey ? ' (personalizada)' : ' (padrão)'}`);
console.log('Dados:', JSON.stringify(orderData, null, 2));

// Enviar a requisição
fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY
  },
  body: JSON.stringify(orderData)
})
.then(response => {
  console.log(`Status: ${response.status} ${response.statusText || ''}`);
  return response.text().then(text => {
    try {
      // Tentar converter para JSON se possível
      return JSON.parse(text);
    } catch (e) {
      // Se não for JSON, retornar o texto como está
      return text;
    }
  });
})
.then(data => {
  console.log('Resposta:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Erro ao enviar requisição:', error);
}); 