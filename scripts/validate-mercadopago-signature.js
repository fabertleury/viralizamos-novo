/**
 * Script para validar a assinatura do webhook do Mercado Pago
 * Seguindo a documentação oficial em:
 * https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks
 * 
 * Para usar:
 * node scripts/validate-mercadopago-signature.js
 */

const crypto = require('crypto');

// Aqui estão os dados do exemplo da documentação:
// https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks
const exampleSignature = {
  secret: '2c99e2eabbbef282c402132240201725f94c61f8893d8926d87d4091578a173b',
  signature: '9f3e310a70586f808fdc595e6797c59977a81b9bedea600168a889ae24e259ce',
  timestamp: '1743004051',
  requestId: '0fc0d942-fd42-4b1a-a1a1-da1895a4f418',
  dataId: '105973472853'
};

// Função para testar uma assinatura com um template específico
function testSignature(name, template, data = exampleSignature) {
  const signature = crypto
    .createHmac('sha256', data.secret)
    .update(template)
    .digest('hex');
  
  const isValid = signature === data.signature;
  
  console.log(`\n${isValid ? '✅' : '❌'} ${name}:`);
  console.log(`  Template: "${template}"`);
  console.log(`  Calculada: ${signature}`);
  console.log(`  Esperada:  ${data.signature}`);
  
  if (!isValid) {
    // Mostrar os primeiros caracteres que coincidem
    let matchingChars = 0;
    while (matchingChars < signature.length && 
           matchingChars < data.signature.length &&
           signature[matchingChars] === data.signature[matchingChars]) {
      matchingChars++;
    }
    
    if (matchingChars > 0) {
      console.log(`  ${matchingChars} caracteres iguais: "${signature.substring(0, matchingChars)}"`);
    }
  }
  
  return isValid;
}

console.log('=== VALIDAÇÃO DE ASSINATURA DO MERCADO PAGO ===');
console.log(`Secret: ${exampleSignature.secret.substring(0, 6)}...`);
console.log(`Timestamp: ${exampleSignature.timestamp}`);
console.log(`Request ID: ${exampleSignature.requestId}`);
console.log(`Data ID: ${exampleSignature.dataId}`);
console.log(`Assinatura: ${exampleSignature.signature}`);

// Testar as variações mais prováveis baseadas na documentação
const { dataId, requestId, timestamp } = exampleSignature;

// Formatos documentados ou prováveis
const mainTemplates = [
  {
    name: "Formato da documentação",
    template: `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`
  },
  {
    name: "Usando path completo",
    template: `id:/v1/payments/${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`
  },
  {
    name: "ID com letras maiúsculas",
    template: `id:${dataId};request-id:${requestId};ts:${timestamp};`
  },
  {
    name: "Sem o ponto-e-vírgula final",
    template: `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp}`
  }
];

console.log('\n=== TESTANDO FORMATOS DOCUMENTADOS ===');
for (const template of mainTemplates) {
  testSignature(template.name, template.template);
}

// Testar variações na ordem dos parâmetros
console.log('\n=== TESTANDO VARIAÇÕES NA ORDEM DOS PARÂMETROS ===');
const orderVariations = [
  {
    name: "Timestamp primeiro",
    template: `ts:${timestamp};id:${dataId.toLowerCase()};request-id:${requestId};`
  },
  {
    name: "RequestId primeiro",
    template: `request-id:${requestId};id:${dataId.toLowerCase()};ts:${timestamp};`
  }
];

for (const template of orderVariations) {
  testSignature(template.name, template.template);
}

// Testar variações com apenas alguns parâmetros
console.log('\n=== TESTANDO REMOÇÃO DE PARÂMETROS ===');
const paramVariations = [
  {
    name: "Sem request-id",
    template: `id:${dataId.toLowerCase()};ts:${timestamp};`
  },
  {
    name: "Apenas ID",
    template: `id:${dataId.toLowerCase()};`
  },
  {
    name: "Apenas timestamp",
    template: `ts:${timestamp};`
  },
  {
    name: "ID e timestamp sem ponto-e-vírgula",
    template: `id:${dataId.toLowerCase()};ts:${timestamp}`
  }
];

for (const template of paramVariations) {
  testSignature(template.name, template.template);
}

// Testar outros formatos comuns de assinatura HMAC
console.log('\n=== TESTANDO OUTROS FORMATOS COMUNS ===');
const otherFormats = [
  {
    name: "Timestamp.Data (formato Stripe)",
    template: `${timestamp}.${JSON.stringify({data: {id: dataId}})}`
  },
  {
    name: "Apenas Data JSON",
    template: JSON.stringify({data: {id: dataId}})
  },
  {
    name: "ID literal",
    template: dataId.toLowerCase()
  },
  {
    name: "ID literal sem conversão",
    template: dataId
  },
  {
    name: "ID.Timestamp",
    template: `${dataId.toLowerCase()}.${timestamp}`
  }
];

for (const template of otherFormats) {
  testSignature(template.name, template.template);
}

// Verificar se a assinatura é baseada em alguma estrutura simples como hash do secret ou timestamp
console.log('\n=== VERIFICANDO POSSÍVEIS PADRÕES ===');
const simplePatterns = [
  {
    name: "Hash do secret (SHA-256)",
    value: crypto.createHash('sha256').update(exampleSignature.secret).digest('hex')
  },
  {
    name: "Hash do timestamp (SHA-256)",
    value: crypto.createHash('sha256').update(exampleSignature.timestamp).digest('hex')
  },
  {
    name: "Hash do dataId (SHA-256)",
    value: crypto.createHash('sha256').update(exampleSignature.dataId).digest('hex')
  },
  {
    name: "Hash do requestId (SHA-256)",
    value: crypto.createHash('sha256').update(exampleSignature.requestId).digest('hex')
  }
];

for (const pattern of simplePatterns) {
  const isMatch = pattern.value === exampleSignature.signature;
  console.log(`\n${isMatch ? '✅' : '❌'} ${pattern.name}:`);
  console.log(`  Valor: ${pattern.value}`);
  console.log(`  Esperado: ${exampleSignature.signature}`);
  
  if (!isMatch) {
    // Mostrar os primeiros caracteres que coincidem
    let matchingChars = 0;
    while (matchingChars < pattern.value.length && 
           matchingChars < exampleSignature.signature.length &&
           pattern.value[matchingChars] === exampleSignature.signature[matchingChars]) {
      matchingChars++;
    }
    
    if (matchingChars > 0) {
      console.log(`  ${matchingChars} caracteres iguais: "${pattern.value.substring(0, matchingChars)}"`);
    }
  }
} 