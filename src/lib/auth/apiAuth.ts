import { NextRequest } from 'next/server';
import { verifyApiKey as verify } from './verifyApiKey';

// Type for API auth result
export type ApiAuthResult = {
  success: boolean;
  message?: string;
};

/**
 * Verifica se a requisição contém uma API key válida
 * @param request A requisição Next.js
 * @returns Objeto com resultado da autenticação
 */
export async function verifyApiKey(request: NextRequest): Promise<ApiAuthResult> {
  const isValid = await verify(request);
  
  return {
    success: isValid,
    message: isValid ? undefined : 'API key inválida ou não fornecida'
  };
} 