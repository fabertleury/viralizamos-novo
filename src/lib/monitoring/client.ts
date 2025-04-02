import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Cria uma instância global do PrismaClient
// Isso evita múltiplas conexões em ambiente de desenvolvimento
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Gera um hash para identificação única de um pedido
 * Útil para detectar duplicações
 */
export function generateOrderHash(data: { 
  target_url?: string;
  service_id?: string; 
  provider_id?: string;
  quantity?: number;
}): string {
  const stringToHash = `${data.target_url || ''}|${data.service_id || ''}|${data.provider_id || ''}|${data.quantity || 0}`;
  return crypto.createHash('md5').update(stringToHash).digest('hex');
}

export default prisma; 