/**
 * Script para alternar entre as configurações de ambiente local e produção
 * Uso: node switch-env.js local|prod
 */

const fs = require('fs');
const path = require('path');

// Verifica os argumentos da linha de comando
const args = process.argv.slice(2);
if (args.length === 0 || !['local', 'prod'].includes(args[0])) {
  console.error('Uso: node switch-env.js local|prod');
  process.exit(1);
}

// Caminho para o arquivo .env
const envPath = path.join(__dirname, '.env');

// Lê o conteúdo atual do arquivo .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Alterna as configurações com base no ambiente selecionado
if (args[0] === 'local') {
  console.log('Alternando para ambiente local...');
  
  // Descomenta as URLs locais e comenta as URLs de produção
  envContent = envContent.replace(/# PAYMENT_SERVICE_URL=http:\/\/localhost:3001/g, 'PAYMENT_SERVICE_URL=http://localhost:3001');
  envContent = envContent.replace(/# ORDERS_SERVICE_URL=http:\/\/localhost:3002/g, 'ORDERS_SERVICE_URL=http://localhost:3002');
  envContent = envContent.replace(/# NEXT_PUBLIC_PAYMENT_SERVICE_URL=http:\/\/localhost:3001/g, 'NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:3001');
  envContent = envContent.replace(/# NEXT_PUBLIC_ORDERS_SERVICE_URL=http:\/\/localhost:3002/g, 'NEXT_PUBLIC_ORDERS_SERVICE_URL=http://localhost:3002');
  
  // Comenta as URLs de produção
  envContent = envContent.replace(/^PAYMENT_SERVICE_URL=https:\/\/pagamentos\.viralizamos\.com/gm, '# PAYMENT_SERVICE_URL=https://pagamentos.viralizamos.com');
  envContent = envContent.replace(/^ORDERS_SERVICE_URL=https:\/\/orders\.viralizamos\.com/gm, '# ORDERS_SERVICE_URL=https://orders.viralizamos.com');
  envContent = envContent.replace(/^NEXT_PUBLIC_PAYMENT_SERVICE_URL=https:\/\/pagamentos\.viralizamos\.com/gm, '# NEXT_PUBLIC_PAYMENT_SERVICE_URL=https://pagamentos.viralizamos.com');
  envContent = envContent.replace(/^NEXT_PUBLIC_ORDERS_SERVICE_URL=https:\/\/orders\.viralizamos\.com/gm, '# NEXT_PUBLIC_ORDERS_SERVICE_URL=https://orders.viralizamos.com');
} else {
  console.log('Alternando para ambiente de produção...');
  
  // Comenta as URLs locais
  envContent = envContent.replace(/^PAYMENT_SERVICE_URL=http:\/\/localhost:3001/gm, '# PAYMENT_SERVICE_URL=http://localhost:3001');
  envContent = envContent.replace(/^ORDERS_SERVICE_URL=http:\/\/localhost:3002/gm, '# ORDERS_SERVICE_URL=http://localhost:3002');
  envContent = envContent.replace(/^NEXT_PUBLIC_PAYMENT_SERVICE_URL=http:\/\/localhost:3001/gm, '# NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:3001');
  envContent = envContent.replace(/^NEXT_PUBLIC_ORDERS_SERVICE_URL=http:\/\/localhost:3002/gm, '# NEXT_PUBLIC_ORDERS_SERVICE_URL=http://localhost:3002');
  
  // Descomenta as URLs de produção
  envContent = envContent.replace(/# PAYMENT_SERVICE_URL=https:\/\/pagamentos\.viralizamos\.com/g, 'PAYMENT_SERVICE_URL=https://pagamentos.viralizamos.com');
  envContent = envContent.replace(/# ORDERS_SERVICE_URL=https:\/\/orders\.viralizamos\.com/g, 'ORDERS_SERVICE_URL=https://orders.viralizamos.com');
  envContent = envContent.replace(/# NEXT_PUBLIC_PAYMENT_SERVICE_URL=https:\/\/pagamentos\.viralizamos\.com/g, 'NEXT_PUBLIC_PAYMENT_SERVICE_URL=https://pagamentos.viralizamos.com');
  envContent = envContent.replace(/# NEXT_PUBLIC_ORDERS_SERVICE_URL=https:\/\/orders\.viralizamos\.com/g, 'NEXT_PUBLIC_ORDERS_SERVICE_URL=https://orders.viralizamos.com');
}

// Salva as alterações no arquivo .env
fs.writeFileSync(envPath, envContent);

console.log(`Configuração alterada para ambiente: ${args[0]}`);
console.log('Reinicie o servidor para aplicar as alterações.'); 