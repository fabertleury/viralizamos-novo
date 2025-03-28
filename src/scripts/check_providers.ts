import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProviders() {
  console.log('Consultando todos os provedores...');
  const { data: providers, error } = await supabase
    .from('providers')
    .select('*');

  if (error) {
    console.error('Erro ao consultar provedores:', error);
    return;
  }

  console.log(`\n=== ${providers.length} Provedores Encontrados ===\n`);
  
  providers.forEach(provider => {
    console.log(`ID: ${provider.id}`);
    console.log(`Nome: ${provider.name}`);
    console.log(`Slug: ${provider.slug}`);
    console.log(`API URL: ${provider.api_url}`);
    console.log(`Status: ${provider.status ? 'Ativo' : 'Inativo'}`);
    console.log(`Mapeamento de Serviços:`, provider.service_mapping || {});
    console.log(`Serviços:`, (provider.services || []).length);
    console.log(`Criado em: ${provider.created_at}`);
    console.log(`Atualizado em: ${provider.updated_at}`);
    console.log('-----------------------------------');
  });

  // Verificar se existe um provedor com slug 'fama'
  const { data: famaProvider, error: famaError } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', 'fama')
    .single();

  if (famaError) {
    console.error('Erro ao buscar provedor com slug "fama":', famaError);
  } else if (famaProvider) {
    console.log('\n=== Provedor com slug "fama" ===');
    console.log(`ID: ${famaProvider.id}`);
    console.log(`Nome: ${famaProvider.name}`);
  } else {
    console.log('\nNenhum provedor com slug "fama" encontrado');
  }

  // Verificar se existe um provedor com id = '1'
  const { data: providerOne, error: providerOneError } = await supabase
    .from('providers')
    .select('*')
    .eq('id', '1')
    .single();

  if (providerOneError) {
    console.log('\nProvedor com ID "1" não encontrado (esperado, pois IDs são UUIDs)');
  } else if (providerOne) {
    console.log('\n=== Provedor com ID "1" ===');
    console.log(`ID: ${providerOne.id}`);
    console.log(`Nome: ${providerOne.name}`);
  }

  // Verificar serviços com provider_id = '1'
  const { data: servicesWithProviderOne, error: servicesError } = await supabase
    .from('services')
    .select('id, name, provider_id')
    .eq('provider_id', '1');

  if (servicesError) {
    console.error('\nErro ao buscar serviços com provider_id = "1":', servicesError);
  } else {
    console.log(`\n=== ${servicesWithProviderOne.length} Serviços com provider_id = "1" ===`);
    servicesWithProviderOne.forEach(service => {
      console.log(`ID: ${service.id}`);
      console.log(`Nome: ${service.name}`);
      console.log(`Provider ID: ${service.provider_id}`);
      console.log('-----------------------------------');
    });
  }
}

// Executar a função principal
checkProviders().catch(console.error);
