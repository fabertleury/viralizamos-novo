// Script para verificar variáveis de ambiente necessárias
console.log('Verificando variáveis de ambiente necessárias...');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'FAMA_REDES_API_KEY',
  'FAMA_REDES_API_URL',
  'MERCADO_PAGO_ACCESS_TOKEN'
];

const missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    console.log(`✅ ${varName} está configurada`);
  }
}

if (missingVars.length > 0) {
  console.error('❌ As seguintes variáveis de ambiente estão faltando:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nAdicione essas variáveis ao arquivo .env.local');
} else {
  console.log('\n✅ Todas as variáveis de ambiente necessárias estão configuradas!');
}
