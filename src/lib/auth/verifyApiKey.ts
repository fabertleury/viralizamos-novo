import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Verifica se a requisição contém uma API key válida
 * @param request A requisição Next.js
 * @returns true se a API key for válida, false caso contrário
 */
export async function verifyApiKey(request: NextRequest): Promise<boolean> {
  try {
    // Obter API key do header Authorization ou query param
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader
      ? authHeader.replace('Bearer ', '')
      : request.nextUrl.searchParams.get('key');
    
    if (!apiKey) {
      logger.warn('[verifyApiKey] Nenhuma API key fornecida');
      return false;
    }
    
    // Verificar chave em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development' && apiKey === process.env.SYSTEM_API_KEY) {
      return true;
    }
    
    // Verificar na tabela de API keys
    const supabase = createClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, active')
      .eq('key', apiKey)
      .eq('active', true)
      .maybeSingle();
    
    if (error) {
      logger.error('[verifyApiKey] Erro ao verificar API key:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    logger.error('[verifyApiKey] Erro ao verificar API key:', error);
    return false;
  }
} 