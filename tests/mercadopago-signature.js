/**
 * Script para testar a validação de assinatura do Mercado Pago
 * seguindo exatamente o exemplo PHP fornecido na documentação.
 * 
 * Para executar:
 * node tests/mercadopago-signature.js
 */

// Simulação de cabeçalhos e parâmetros recebidos
const headers = {
  'x-signature': 'ts=1743004051,v1=9f3e310a70586f808fdc595e6797c59977a81b9bedea600168a889ae24e259ce',
  'x-request-id': '0fc0d942-fd42-4b1a-a1a1-da1895a4f418'
};

// Simulação de parâmetros de query string
const queryParams = {
  'data.id': '105973472853'
};

// O segredo da webhook usado para validação
const secret = '2c99e2eabbbef282c402132240201725f94c61f8893d8926d87d4091578a173b';

// Extrair dados da assinatura (equivalente ao processo PHP)
const xSignature = headers['x-signature'];
const xRequestId = headers['x-request-id'];
const dataId = queryParams['data.id'];

console.log('=== Teste de Validação de Assinatura Mercado Pago ===');
console.log('Headers recebidos:');
console.log(`  X-Signature: ${xSignature}`);
console.log(`  X-Request-ID: ${xRequestId}`);
console.log('Query Params:');
console.log(`  data.id: ${dataId}`);
console.log('Secret:');
console.log(`  ${secret.substring(0, 6)}...${secret.substring(secret.length - 6)}`);

// Separar o X-Signature em partes
const parts = xSignature.split(',');
let ts = null;
let hash = null;

// Iterar pelas partes para obter ts e v1
for (const part of parts) {
  const keyValue = part.split('=', 2);
  if (keyValue.length === 2) {
    const key = keyValue[0].trim();
    const value = keyValue[1].trim();
    if (key === 'ts') {
      ts = value;
    } else if (key === 'v1') {
      hash = value;
    }
  }
}

console.log('\nDados extraídos:');
console.log(`  Timestamp (ts): ${ts}`);
console.log(`  Hash (v1): ${hash}`);

// Gerar a string do manifesto (template)
const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
console.log('\nManifest (template) gerado:');
console.log(`  "${manifest}"`);

// Criar uma assinatura HMAC
const crypto = require('crypto');
const calculatedHash = crypto
  .createHmac('sha256', secret)
  .update(manifest)
  .digest('hex');

console.log('\nAssinatura HMAC calculada:');
console.log(`  ${calculatedHash}`);

// Verificar se a assinatura calculada corresponde à recebida
const isValid = calculatedHash === hash;
console.log('\nResultado da verificação:');
if (isValid) {
  console.log('  ✅ HMAC verification passed - Assinatura válida!');
} else {
  console.log('  ❌ HMAC verification failed - Assinatura inválida!');
  console.log('\nComparação:');
  console.log(`  Esperado: ${hash}`);
  console.log(`  Calculado: ${calculatedHash}`);
  
  // Verificar se alguma das primeiras posições bate
  let matchingChars = 0;
  while (matchingChars < hash.length && 
         matchingChars < calculatedHash.length && 
         hash[matchingChars] === calculatedHash[matchingChars]) {
    matchingChars++;
  }
  
  console.log(`\nPrimeiros ${matchingChars} caracteres correspondem.`);
  
  // Tente algumas variações se a verificação falhar
  console.log('\nTestando variações:');
  
  // Testar com dataId em minúsculas
  if (/[a-zA-Z]/.test(dataId)) {
    const lowerCaseDataId = dataId.toLowerCase();
    const altManifest = `id:${lowerCaseDataId};request-id:${xRequestId};ts:${ts};`;
    const altHash = crypto.createHmac('sha256', secret).update(altManifest).digest('hex');
    console.log(`\n1. Com dataId em minúsculas (${lowerCaseDataId}):`);
    console.log(`   Template: "${altManifest}"`);
    console.log(`   Hash: ${altHash}`);
    console.log(`   Válido: ${altHash === hash ? '✅ SIM' : '❌ NÃO'}`);
  }
  
  // Testar sem ponto-e-vírgula no final
  const noSemicolonManifest = `id:${dataId};request-id:${xRequestId};ts:${ts}`;
  const noSemicolonHash = crypto.createHmac('sha256', secret).update(noSemicolonManifest).digest('hex');
  console.log('\n2. Sem ponto-e-vírgula no final:');
  console.log(`   Template: "${noSemicolonManifest}"`);
  console.log(`   Hash: ${noSemicolonHash}`);
  console.log(`   Válido: ${noSemicolonHash === hash ? '✅ SIM' : '❌ NÃO'}`);
  
  // Testar com resource ao invés de data.id
  const resource = dataId;
  const resourceManifest = `id:${resource};request-id:${xRequestId};ts:${ts};`;
  const resourceHash = crypto.createHmac('sha256', secret).update(resourceManifest).digest('hex');
  console.log('\n3. Com resource ao invés de data.id:');
  console.log(`   Template: "${resourceManifest}"`);
  console.log(`   Hash: ${resourceHash}`);
  console.log(`   Válido: ${resourceHash === hash ? '✅ SIM' : '❌ NÃO'}`);
  
  // Testar com id como query parameter literal
  const queryParamManifest = `id:data.id;request-id:${xRequestId};ts:${ts};`;
  const queryParamHash = crypto.createHmac('sha256', secret).update(queryParamManifest).digest('hex');
  console.log('\n4. Com "data.id" literal:');
  console.log(`   Template: "${queryParamManifest}"`);
  console.log(`   Hash: ${queryParamHash}`);
  console.log(`   Válido: ${queryParamHash === hash ? '✅ SIM' : '❌ NÃO'}`);
} 