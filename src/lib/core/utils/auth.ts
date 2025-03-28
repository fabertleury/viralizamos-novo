import { Logger } from './logger';

const logger = new Logger('Auth');

/**
 * Verifica se a API key fornecida é válida
 * @param apiKey Chave de API a ser verificada
 * @returns true se a chave for válida, false caso contrário
 */
export function verifyApiKey(apiKey: string | null): boolean {
  if (!apiKey) {
    logger.warn('Tentativa de acesso sem API key');
    return false;
  }

  // Em ambiente de desenvolvimento, aceita a chave do .env
  if (process.env.NODE_ENV === 'development') {
    const validKey = process.env.SYSTEM_API_KEY;
    if (validKey && apiKey === validKey) {
      return true;
    }
  }

  // Em produção, deveria verificar contra um banco de dados
  // Aqui estamos simulando uma verificação
  // Na implementação real, você deve verificar contra seu banco de dados
  const validApiKeys = [
    process.env.SYSTEM_API_KEY,
    process.env.ADMIN_API_KEY,
    // Adicione outras chaves conforme necessário
  ].filter(Boolean);

  if (validApiKeys.includes(apiKey)) {
    return true;
  }

  logger.warn('Tentativa de acesso com API key inválida');
  return false;
} 