/**
 * Script para testar a validação de assinatura do webhook do Mercado Pago
 * com dados reais de uma requisição.
 * 
 * Uso:
 * node scripts/test-webhook-signature.js
 */

const crypto = require('crypto');

// Simulação de uma requisição real
const mockRequest = {
  headers: {
    'user-agent': 'MercadoPago Webhook',
    'content-type': 'application/json',
    'x-signature': 'ts=1743004051,v1=9f3e310a70586f808fdc595e6797c59977a81b9bedea600168a889ae24e259ce',
    'x-request-id': '0fc0d942-fd42-4b1a-a1a1-da1895a4f418'
  },
  body: {
    id: 12345,
    live_mode: true,
    type: 'payment',
    date_created: '2023-07-25T10:04:58.396-04:00',
    user_id: 44444,
    api_version: 'v1',
    action: 'payment.created',
    data: {
      id: '105973472853'
    }
  }
};

// Configuração
const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '2c99e2eabbbef282c402132240201725f94c61f8893d8926d87d4091578a173b';

// Função que simula a lógica de verificação de assinatura do webhook
function verifySignature(signature, paymentId, requestId) {
  try {
    // Extrair dados da assinatura
    const signatureParts = signature.split(',');
    const timestampPart = signatureParts.find(part => part.startsWith('ts='));
    const v1Part = signatureParts.find(part => part.startsWith('v1='));
    
    if (!timestampPart || !v1Part) {
      console.error('Formato de assinatura inválido:', signature);
      return false;
    }
    
    const timestamp = timestampPart.substring(3);
    const receivedSignature = v1Part.substring(3);
    
    console.log('Timestamp da assinatura:', timestamp);
    console.log('Assinatura v1:', receivedSignature);
    
    // IMPORTANTE: Normalizar o ID para minúsculas (se for alfanumérico)
    const normalizedId = String(paymentId).toLowerCase();
    
    // Construir o template conforme documentação do Mercado Pago
    // id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
    const signatureTemplate = `id:${normalizedId};request-id:${requestId};ts:${timestamp};`;
    
    console.log('Template de assinatura:', signatureTemplate);
    
    // Calcular HMAC SHA-256 em formato hexadecimal
    const calculatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signatureTemplate)
      .digest('hex');
    
    console.log('Assinatura calculada:', calculatedSignature);
    console.log('Assinatura recebida:', receivedSignature);
    
    const isValid = calculatedSignature === receivedSignature;
    
    if (!isValid) {
      console.warn('❌ A assinatura calculada não corresponde à recebida.');
      
      // Tentar verificar alternativas
      const alternativeTemplates = [
        // 1. Sem o ponto-e-vírgula no final
        `id:${normalizedId};request-id:${requestId};ts:${timestamp}`,
        // 2. ID com URL completa
        `id:/v1/payments/${normalizedId};request-id:${requestId};ts:${timestamp};`,
        // 3. ID como número literal (sem aspas ou conversão) se for numérico
        /^\d+$/.test(paymentId) ? `id:${paymentId};request-id:${requestId};ts:${timestamp};` : null,
        // 4. Outros formatos a testar
        JSON.stringify({"data":{"id":paymentId}}),
        `${timestamp}.${JSON.stringify({"data":{"id":paymentId}})}`,
        paymentId
      ].filter(Boolean);
      
      let alternativeValid = false;
      
      for (const template of alternativeTemplates) {
        const altSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(template)
          .digest('hex');
          
        const matches = altSignature === receivedSignature;
        console.log(`\nTemplate alternativo: "${template}"`);
        console.log(`Assinatura alternativa: ${altSignature}`);
        console.log(`Válido: ${matches ? '✅ SIM' : '❌ NÃO'}`);
        
        if (matches) {
          alternativeValid = true;
          console.log('✅ Assinatura válida usando template alternativo!');
          break;
        }
      }
      
      return alternativeValid;
    }
    
    console.log('✅ Assinatura válida!');
    return true;
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return false;
  }
}

// Executar o teste
console.log('=== TESTE DE VERIFICAÇÃO DE ASSINATURA DO WEBHOOK ===');
console.log('Secret usado:', webhookSecret.substring(0, 8) + '...' + webhookSecret.substring(webhookSecret.length - 8));

// Dados da requisição
const signature = mockRequest.headers['x-signature'];
const requestId = mockRequest.headers['x-request-id'];
const paymentId = mockRequest.body.data.id;

console.log('\nDados do webhook:');
console.log('- Signature:', signature);
console.log('- Request ID:', requestId);
console.log('- Payment ID:', paymentId);
console.log('- Body:', JSON.stringify(mockRequest.body));

// Verificar assinatura
console.log('\nValidando assinatura...');
const isValid = verifySignature(signature, paymentId, requestId);

console.log('\nResultado final:');
console.log(isValid ? '✅ ASSINATURA VÁLIDA' : '❌ ASSINATURA INVÁLIDA');

// Relatório geral
console.log('\n=== RELATÓRIO GERAL ===');
console.log(`- Objeto da requisição parece válido: ${mockRequest.body.type === 'payment' ? 'Sim' : 'Não'}`);
console.log(`- Cabeçalhos necessários presentes: ${signature && requestId ? 'Sim' : 'Não'}`);
console.log(`- ID do pagamento presente: ${paymentId ? 'Sim' : 'Não'}`);
console.log(`- Assinatura verificada com sucesso: ${isValid ? 'Sim' : 'Não'}`);
console.log(`- Secret do webhook corretamente configurado: ${webhookSecret ? 'Sim' : 'Não'}`);

console.log('\nConclusão:');
if (isValid) {
  console.log('A verificação de assinatura está funcionando corretamente!');
} else {
  console.log('A verificação de assinatura falhou. Possíveis razões:');
  console.log('1. O secret usado não corresponde ao secret usado para gerar a assinatura');
  console.log('2. O formato do template de assinatura está incorreto');
  console.log('3. Os dados de teste não correspondem a uma requisição real');
  console.log('4. O Mercado Pago está usando um método de assinatura não documentado');
} 