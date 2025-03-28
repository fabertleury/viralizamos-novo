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

// Função para verificar se uma string é um UUID válido
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function fixProviderIds() {
  console.log('Iniciando correção de provider_ids inválidos...');

  // 1. Buscar o provedor padrão (fama)
  console.log('Buscando provedor padrão (fama)...');
  const { data: famaProvider, error: famaError } = await supabase
    .from('providers')
    .select('id, name, slug')
    .eq('slug', 'fama')
    .single();

  if (famaError) {
    console.error('Erro ao buscar provedor padrão (fama):', famaError);
    console.log('Criando um provedor padrão com slug "fama"...');
    
    // Criar um provedor padrão se não existir
    const { data: newProvider, error: createError } = await supabase
      .from('providers')
      .insert({
        name: 'Fama Redes',
        slug: 'fama',
        api_url: 'https://fama-redes.com/api/v2',
        api_key: process.env.FAMA_API_KEY || '',
        status: true
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Erro ao criar provedor padrão:', createError);
      return;
    }
    
    console.log('Provedor padrão criado com sucesso:', newProvider);
    
    // Usar o novo provedor como padrão
    const defaultProviderId = newProvider.id;
    console.log('ID do provedor padrão:', defaultProviderId);
  } else {
    console.log('Provedor padrão encontrado:', famaProvider);
    const defaultProviderId = famaProvider.id;
    console.log('ID do provedor padrão:', defaultProviderId);
    
    // 2. Buscar serviços com provider_id inválido
    console.log('\nBuscando serviços com provider_id = "1"...');
    const { data: invalidServices, error: servicesError } = await supabase
      .from('services')
      .select('id, name, provider_id')
      .eq('provider_id', '1');
    
    if (servicesError) {
      console.error('Erro ao buscar serviços com provider_id inválido:', servicesError);
      return;
    }
    
    console.log(`Encontrados ${invalidServices?.length || 0} serviços com provider_id = "1"`);
    
    // 3. Atualizar os serviços com provider_id inválido
    if (invalidServices && invalidServices.length > 0) {
      console.log('\nAtualizando serviços com provider_id inválido...');
      
      for (const service of invalidServices) {
        console.log(`Atualizando serviço "${service.name}" (${service.id})...`);
        
        const { error: updateError } = await supabase
          .from('services')
          .update({ provider_id: defaultProviderId })
          .eq('id', service.id);
        
        if (updateError) {
          console.error(`Erro ao atualizar serviço ${service.id}:`, updateError);
        } else {
          console.log(`Serviço ${service.id} atualizado com sucesso.`);
        }
      }
    }
    
    // 4. Buscar outros serviços com provider_id não UUID
    console.log('\nBuscando outros serviços com provider_id não UUID...');
    const { data: otherInvalidServices, error: otherError } = await supabase
      .from('services')
      .select('id, name, provider_id');
    
    if (otherError) {
      console.error('Erro ao buscar outros serviços:', otherError);
      return;
    }
    
    const nonUuidServices = otherInvalidServices?.filter(
      service => service.provider_id && !isValidUUID(service.provider_id)
    );
    
    console.log(`Encontrados ${nonUuidServices?.length || 0} outros serviços com provider_id não UUID`);
    
    // 5. Atualizar outros serviços com provider_id não UUID
    if (nonUuidServices && nonUuidServices.length > 0) {
      console.log('\nAtualizando outros serviços com provider_id não UUID...');
      
      for (const service of nonUuidServices) {
        console.log(`Atualizando serviço "${service.name}" (${service.id}) com provider_id "${service.provider_id}"...`);
        
        const { error: updateError } = await supabase
          .from('services')
          .update({ provider_id: defaultProviderId })
          .eq('id', service.id);
        
        if (updateError) {
          console.error(`Erro ao atualizar serviço ${service.id}:`, updateError);
        } else {
          console.log(`Serviço ${service.id} atualizado com sucesso.`);
        }
      }
    }
  }
  
  console.log('\nProcesso de correção concluído.');
}

// Executar a função principal
fixProviderIds().catch(console.error);
