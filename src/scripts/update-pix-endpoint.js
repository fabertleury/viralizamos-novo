#!/usr/bin/env node

/**
 * Este script identifica os arquivos que precisam ser atualizados para usar o novo endpoint
 * de pagamento PIX. Ele exibe uma lista de arquivos a serem modificados e as alterações
 * necessárias.
 */

console.log('\x1b[36m%s\x1b[0m', '== Processo de Migração para o Novo Endpoint de Pagamento PIX ==');
console.log('\x1b[33m%s\x1b[0m', 'Os seguintes arquivos precisam ser atualizados para usar o novo endpoint:');
console.log();

const filesToUpdate = [
  {
    path: 'src/components/payment/PixPaymentModal.tsx',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
  {
    path: 'src/app/checkout/instagram/visualizacao/step2/page.tsx',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
  {
    path: 'src/app/checkout/instagram/utils/payment-utils.ts',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
  {
    path: 'src/app/checkout/instagram/curtidas/step2/page.tsx',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
  {
    path: 'src/app/checkout/instagram/comentarios/step2/page.tsx',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
  {
    path: 'src/components/checkout/InstagramSeguidoresStep2.tsx',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
  {
    path: 'src/components/checkout/InstagramReelsServiceStep2.tsx',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
  {
    path: 'src/components/checkout/InstagramPostsReelsStep2.tsx',
    oldEndpoint: '/api/payment/pix',
    newEndpoint: '/api/core/payment/pix'
  },
];

filesToUpdate.forEach((file, index) => {
  console.log(`${index + 1}. \x1b[32m${file.path}\x1b[0m`);
  console.log(`   Substituir: \x1b[31m${file.oldEndpoint}\x1b[0m por \x1b[32m${file.newEndpoint}\x1b[0m`);
  console.log();
});

console.log('\x1b[36m%s\x1b[0m', '== Instruções de Migração ==');
console.log('1. Para cada arquivo acima, você precisa editar e substituir o endpoint antigo pelo novo.');
console.log('2. Após as alterações, verifique se os pagamentos estão sendo salvos na tabela `core_transactions`.');
console.log('3. Você pode testar um pagamento e verificar a tabela usando o script de diagnóstico:');
console.log();
console.log('\x1b[33m%s\x1b[0m', '   npm run check-js');
console.log();
console.log('4. Certifique-se de que o webhook do Mercado Pago esteja configurado para apontar para o endpoint correto:');
console.log();
console.log('\x1b[33m%s\x1b[0m', '   <seu-dominio>/api/webhooks/mercadopago');
console.log();
console.log('\x1b[36m%s\x1b[0m', '== Observações ==');
console.log('- O novo fluxo de pagamento está completo e totalmente funcional.');
console.log('- A tabela `core_transactions` substituirá a antiga tabela `transactions`.');
console.log('- O processamento de transações em background funcionará com as novas tabelas.');
console.log('- Todos os logs de status e verificações serão armazenados nas tabelas core_*.');
console.log();
console.log('\x1b[32m%s\x1b[0m', 'Boa migração!'); 