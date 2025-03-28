/**
 * Script para descobrir qual é o formato correto da assinatura do Mercado Pago
 * testando múltiplas combinações possíveis.
 */

import crypto from 'crypto';

// CONFIGURAÇÃO - Substitua com dados reais de uma requisição recebida
const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '2c99e2eabbbef282c402132240201725f94c61f8893d8926d87d4091578a173b';
const receivedSignature = '9f3e310a70586f808fdc595e6797c59977a81b9bedea600168a889ae24e259ce'; // Parte v1= da assinatura
const timestamp = '1743004051'; // Parte ts= da assinatura
const requestId = '0fc0d942-fd42-4b1a-a1a1-da1895a4f418'; // X-Request-ID
const dataId = '105973472853'; // data.id ou ID do recurso
const bodyText = JSON.stringify({data: {id: dataId}}); // Corpo da requisição como string

// Para a nova documentação do Mercado Pago (2023+)
const topic = 'payment';
const resource = `/v1/payments/${dataId}`;

// Funções auxiliares
function calculateSignature(template) {
  return crypto.createHmac('sha256', webhookSecret).update(template).digest('hex');
}

function testSignature(name, template) {
  const signature = calculateSignature(template);
  const isValid = signature === receivedSignature;
  
  // Comparar caracter por caracter para ver onde começa a diferença
  let firstDiff = 0;
  while (firstDiff < signature.length && firstDiff < receivedSignature.length && 
         signature[firstDiff] === receivedSignature[firstDiff]) {
    firstDiff++;
  }
  
  const matchInfo = firstDiff > 0 ? 
    `Primeiros ${firstDiff} caracteres iguais: "${signature.substring(0, firstDiff)}"` : 
    'Nenhum caractere igual';
  
  console.log(`\n${isValid ? '✅' : '❌'} ${name}:`);
  console.log(`  Template: "${template}"`);
  console.log(`  Calculada: ${signature}`);
  console.log(`  Recebida:  ${receivedSignature}`);
  console.log(`  Resultado: ${isValid ? 'VÁLIDO' : `INVÁLIDO (${matchInfo})`}`);
  
  return { isValid, firstDiff, signature };
}

// Início dos testes
console.log('=== TESTE DE VALIDAÇÃO DE ASSINATURA MERCADO PAGO ===');
console.log(`Secret: ${webhookSecret.substring(0, 6)}...${webhookSecret.substring(webhookSecret.length - 6)}`);
console.log(`Timestamp: ${timestamp}`);
console.log(`Request ID: ${requestId}`);
console.log(`Data ID: ${dataId}`);
console.log(`Assinatura recebida: ${receivedSignature}`);

// Array com todos os testes a serem executados (série 1 - básicos)
const tests = [
  // Formatos documentados oficialmente
  { 
    name: '1. Formato oficial com ID do recurso', 
    template: `id:${dataId};request-id:${requestId};ts:${timestamp};`
  },
  { 
    name: '2. Formato oficial com resource URL',
    template: `id:${resource};request-id:${requestId};ts:${timestamp};`
  },
  
  // Variações para IDs e caracteres especiais
  { 
    name: '3. IDs tratados como strings literais',
    template: `id:"${dataId}";request-id:"${requestId}";ts:"${timestamp}";`
  },
  
  // Formato Webhook mais genérico (similar a outros serviços como o Stripe)
  { 
    name: '4. Padrão Webhook genérico: timestamp.payload',
    template: `${timestamp}.${bodyText}`
  },
  
  // Formatos da documentação mais antiga
  { 
    name: '5. Documentação antiga: topic.id',
    template: `${topic}.${dataId}`
  },
  { 
    name: '6. Documentação antiga: id',
    template: dataId
  },
  
  // Formatos para HMAC mais simples
  { 
    name: '7. Apenas o corpo (body) bruto',
    template: bodyText
  },
  { 
    name: '8. Timestamp como prefixo do request ID',
    template: `${timestamp}${requestId}`
  },
  
  // Padrão usado em outros serviços
  { 
    name: '9. Timestamp.RequestID.Resource',
    template: `${timestamp}.${requestId}.${resource}`
  },
  
  // Variações específicas do Mercado Pago
  { 
    name: '10. Topic:resource',
    template: `${topic}:${resource}`
  },
];

// Executar testes básicos
console.log('\n=== SÉRIE 1: TESTES BÁSICOS ===');
let validMethods = [];
let bestMatch = { name: '', firstDiff: 0, signature: '' };

for (const test of tests) {
  const result = testSignature(test.name, test.template);
  if (result.isValid) {
    validMethods.push(test.name);
  }
  
  // Manter registro do melhor match parcial
  if (result.firstDiff > bestMatch.firstDiff) {
    bestMatch = { 
      name: test.name, 
      firstDiff: result.firstDiff,
      signature: result.signature,
      template: test.template
    };
  }
}

// Série 2 - Testes adicionais baseados no melhor match parcial (se existir)
if (bestMatch.firstDiff > 0) {
  console.log('\n=== SÉRIE 2: TESTES BASEADOS NO MELHOR MATCH PARCIAL ===');
  console.log(`Melhor match parcial: ${bestMatch.name} (${bestMatch.firstDiff} caracteres)`);
  console.log(`Template: "${bestMatch.template}"`);
  
  // Criar variações baseadas no melhor template
  const variations = [
    { 
      name: 'Variação 1: Codificação diferente',
      template: Buffer.from(bestMatch.template).toString('base64')
    },
    { 
      name: 'Variação 2: URL Encoding',
      template: encodeURIComponent(bestMatch.template)
    },
    { 
      name: 'Variação 3: Sem espaços',
      template: bestMatch.template.replace(/\s+/g, '')
    },
    { 
      name: 'Variação 4: Letras maiúsculas',
      template: bestMatch.template.toUpperCase()
    },
    { 
      name: 'Variação 5: Letras minúsculas',
      template: bestMatch.template.toLowerCase()
    }
  ];
  
  for (const variation of variations) {
    const result = testSignature(variation.name, variation.template);
    if (result.isValid) {
      validMethods.push(variation.name);
    }
  }
}

// Série 3 - Testes adicionais com base na documentação do Mercado Pago
console.log('\n=== SÉRIE 3: TESTES WEBHOOK ESPECÍFICOS ===');

// Exemplos de notificações IPN do Mercado Pago
const notificationFormats = [
  {
    name: 'IPN: Action + ID',
    template: `${topic}.${dataId}`
  },
  {
    name: 'IPN: Action + Resource + ID',
    template: `${topic}.${resource}.${dataId}`
  },
  {
    name: 'Webhook: Header completo',
    template: `ts=${timestamp},v1=${receivedSignature}`
  },
  {
    name: 'Webhook: Apenas hash',
    template: receivedSignature
  },
  {
    name: 'Webhook: Timestamp:Signature',
    template: `${timestamp}:${receivedSignature}`
  },
];

for (const format of notificationFormats) {
  const result = testSignature(format.name, format.template);
  if (result.isValid) {
    validMethods.push(format.name);
  }
}

// Resumo dos resultados
console.log('\n=== RESUMO DOS RESULTADOS ===');
if (validMethods.length > 0) {
  console.log('✅ MÉTODOS VÁLIDOS ENCONTRADOS:');
  validMethods.forEach(method => console.log(`- ${method}`));
} else {
  console.log('❌ NENHUM MÉTODO VÁLIDO ENCONTRADO');
  console.log('Informações para investigação:');
  console.log('- Melhor correspondência parcial:', bestMatch.name);
  console.log(`  ${bestMatch.firstDiff} caracteres correspondentes`);
  
  console.log('\nSugestões:');
  console.log('1. Verifique se o secret está correto em MERCADOPAGO_WEBHOOK_SECRET');
  console.log('2. Verifique se a assinatura v1 foi extraída corretamente da header');
  console.log('3. Solicite ao suporte do Mercado Pago detalhes sobre a validação de assinatura HMAC');
  console.log('4. Considere usar APENAS verificação de IPs para validar temporariamente');
}

// Imprimir informações técnicas adicionais para debug
console.log('\n=== INFORMAÇÕES TÉCNICAS ===');
console.log('Secret Hash:');
console.log(crypto.createHash('sha256').update(webhookSecret).digest('hex'));
console.log('Timestamp Hash:');
console.log(crypto.createHash('sha256').update(timestamp).digest('hex'));
console.log('Conjunto de caracteres do secret:');
console.log([...new Set(webhookSecret.split(''))].sort().join('')); 