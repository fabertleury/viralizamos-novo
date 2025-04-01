/**
 * Script para testar o webhook do n8n com diferentes formatos de autenticação
 * 
 * Uso:
 * node test-n8n-webhook-auth.js
 */

// URLs do webhook
const TEST_WEBHOOK_URL = 'https://automacoes.traconegocios.com.br/webhook-test/order';

// Chave de API
const API_KEY = 'n8n_viralizamos_2024';

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

// Variações de cabeçalhos de autenticação para testar
const authHeaders = [
  { name: 'X-API-KEY', value: API_KEY, description: 'Padrão X-API-KEY' },
  { name: 'Authorization', value: `Bearer ${API_KEY}`, description: 'Bearer token' },
  { name: 'Authorization', value: API_KEY, description: 'Auth direto' },
  { name: 'api_key', value: API_KEY, description: 'api_key' },
  { name: 'auth', value: API_KEY, description: 'auth simples' },
  { name: 'key', value: API_KEY, description: 'key simples' },
  { name: 'n8n-auth', value: API_KEY, description: 'n8n-auth' }
];

// Função para testar um formato de autenticação
async function testAuth(authHeader) {
  console.log(`\n[TESTE] ${authHeader.description} (${authHeader.name}: ${authHeader.value})`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Adicionar o cabeçalho de autenticação
    headers[authHeader.name] = authHeader.value;
    
    const response = await fetch(TEST_WEBHOOK_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(orderData)
    });
    
    console.log(`Status: ${response.status} ${response.statusText || ''}`);
    
    const textResponse = await response.text();
    console.log('Resposta:', textResponse);
    
    return {
      success: response.status === 200,
      status: response.status,
      response: textResponse
    };
  } catch (error) {
    console.error('Erro ao enviar requisição:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Testar todas as variações de autenticação em sequência
async function runTests() {
  console.log('Iniciando testes de autenticação com o webhook do n8n...');
  console.log(`URL: ${TEST_WEBHOOK_URL}`);
  console.log(`Chave API: ${API_KEY}`);
  console.log('---------------------------------------------------');
  
  for (const header of authHeaders) {
    await testAuth(header);
  }
  
  console.log('\nTestes concluídos!');
}

// Executar os testes
runTests().catch(error => {
  console.error('Erro fatal:', error);
}); 