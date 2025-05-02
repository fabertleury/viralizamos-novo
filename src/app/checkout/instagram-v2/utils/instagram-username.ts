/**
 * Normaliza um nome de usuário do Instagram, removendo caracteres especiais e URLs
 * @param username - O nome de usuário ou URL do Instagram a ser normalizado
 * @returns O nome de usuário normalizado ou null se inválido
 */
export function normalizeInstagramUsername(username: string): string | null {
  if (!username) return null;

  // Remove espaços em branco
  username = username.trim();

  // Verifica se é um link de post do Instagram
  if (username.includes('instagram.com/p/') || username.includes('instagram.com/reel/')) {
    return 'post_link';
  }

  // Remove o @ se existir no início
  if (username.startsWith('@')) {
    username = username.substring(1);
  }

  // Se for uma URL completa, extrai o nome de usuário
  if (username.includes('instagram.com/')) {
    // Remove o protocolo e www se existir
    username = username.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//, '');
    // Remove qualquer coisa após o nome de usuário (como / ou ?)
    username = username.split(/[\/?]/)[0];
  }

  // Remove caracteres especiais e espaços
  username = username.replace(/[^a-zA-Z0-9._]/g, '');

  // Verifica se o nome de usuário é válido
  if (!username || username.length < 1 || username.length > 30) {
    return null;
  }

  return username;
} 