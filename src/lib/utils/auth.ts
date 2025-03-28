/**
 * Verifica se a API key é válida
 * @param apiKey API key a verificar
 * @returns true se a API key for válida, false caso contrário
 */
export function verifyApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false;
  
  // Verificar se a API key corresponde ao valor configurado
  const configuredApiKey = process.env.API_KEY;
  
  if (!configuredApiKey) {
    console.warn('API_KEY não está configurada no ambiente');
    return false;
  }
  
  return apiKey === configuredApiKey;
}

/**
 * Verifica se a admin key é válida
 * @param adminKey Admin key a verificar
 * @returns true se a admin key for válida, false caso contrário
 */
export function verifyAdminKey(adminKey: string | null): boolean {
  if (!adminKey) return false;
  
  // Verificar se a admin key corresponde ao valor configurado
  const configuredAdminKey = process.env.ADMIN_API_KEY;
  
  if (!configuredAdminKey) {
    console.warn('ADMIN_API_KEY não está configurada no ambiente');
    return false;
  }
  
  return adminKey === configuredAdminKey;
} 