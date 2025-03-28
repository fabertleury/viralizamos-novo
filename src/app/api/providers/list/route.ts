import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Buscar todos os provedores
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar provedores:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Retornar os provedores (sem expor as chaves de API)
    const safeProviders = providers.map(provider => ({
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      description: provider.description,
      api_url: provider.api_url,
      status: provider.status,
      has_api_key: !!provider.api_key,
      api_key_length: provider.api_key ? provider.api_key.length : 0,
      metadata: provider.metadata,
      created_at: provider.created_at,
      updated_at: provider.updated_at
    }));
    
    return NextResponse.json({ 
      providers: safeProviders,
      count: safeProviders.length
    });
  } catch (error) {
    console.error('Erro na rota de listagem de provedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
