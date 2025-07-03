/**
 * Lista de bloqueio para perfis do Instagram
 * Este arquivo contém funções para gerenciar perfis que não devem passar pela verificação
 */

import { Pool } from 'pg';

// Configurar conexão com o PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:zacEqGceWerpWpBZZqttjamDOCcdhRbO@shinkansen.proxy.rlwy.net:29036/railway'
});

// Interface para o perfil bloqueado
export interface BlockedProfile {
  username: string;
  reason: string;
  blocked_at: string;
  blocked_until?: string | null;
}

/**
 * Inicializa a tabela de perfis bloqueados se não existir
 */
export async function initBlockedProfilesTable(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instagram_blocked_profiles (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        reason TEXT,
        blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        blocked_until TIMESTAMP WITH TIME ZONE
      )
    `);
    console.log('Tabela de perfis bloqueados inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar tabela de perfis bloqueados:', error);
  }
}

/**
 * Verifica se um perfil está na lista de bloqueio
 * @param username Nome de usuário do Instagram
 * @returns Objeto com informações se está bloqueado e o motivo
 */
export async function isProfileBlocked(username: string): Promise<{ isBlocked: boolean; reason?: string }> {
  try {
    // Normalizar o nome de usuário (remover @ e converter para minúsculas)
    const normalizedUsername = username.replace('@', '').toLowerCase();
    
    // Verificar na tabela de perfis bloqueados
    const result = await pool.query(
      'SELECT * FROM instagram_blocked_profiles WHERE username = $1',
      [normalizedUsername]
    );
    
    // Se não encontrou dados, não está bloqueado
    if (result.rows.length === 0) {
      return { isBlocked: false };
    }
    
    const data = result.rows[0];
    
    // Verificar se o bloqueio tem data de expiração e se já passou
    if (data.blocked_until) {
      const now = new Date();
      const expirationDate = new Date(data.blocked_until);
      
      if (now > expirationDate) {
        // O bloqueio expirou, remover da lista
        await pool.query(
          'DELETE FROM instagram_blocked_profiles WHERE username = $1',
          [normalizedUsername]
        );
        return { isBlocked: false };
      }
    }
    
    // Perfil está bloqueado
    return { 
      isBlocked: true, 
      reason: data.reason || 'Perfil bloqueado pelo sistema'
    };
  } catch (error) {
    console.error('Erro ao verificar bloqueio de perfil:', error);
    return { isBlocked: false };
  }
}

/**
 * Adiciona um perfil à lista de bloqueio
 * @param profile Dados do perfil a ser bloqueado
 * @returns Sucesso ou falha da operação
 */
export async function blockProfile(profile: Omit<BlockedProfile, 'blocked_at'>): Promise<{ success: boolean; error?: any }> {
  try {
    // Normalizar o nome de usuário
    const normalizedUsername = profile.username.replace('@', '').toLowerCase();
    
    await pool.query(
      `INSERT INTO instagram_blocked_profiles (username, reason, blocked_at, blocked_until) 
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT (username) 
       DO UPDATE SET reason = $2, blocked_at = NOW(), blocked_until = $3`,
      [normalizedUsername, profile.reason, profile.blocked_until]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao bloquear perfil:', error);
    return { success: false, error };
  }
}

/**
 * Remove um perfil da lista de bloqueio
 * @param username Nome de usuário do Instagram
 * @returns Sucesso ou falha da operação
 */
export async function unblockProfile(username: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Normalizar o nome de usuário
    const normalizedUsername = username.replace('@', '').toLowerCase();
    
    await pool.query(
      'DELETE FROM instagram_blocked_profiles WHERE username = $1',
      [normalizedUsername]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao desbloquear perfil:', error);
    return { success: false, error };
  }
}

/**
 * Lista todos os perfis bloqueados
 * @returns Lista de perfis bloqueados
 */
export async function listBlockedProfiles(): Promise<{ profiles: BlockedProfile[]; error?: any }> {
  try {
    const result = await pool.query(
      'SELECT * FROM instagram_blocked_profiles ORDER BY blocked_at DESC'
    );
    
    return { profiles: result.rows };
  } catch (error) {
    console.error('Erro ao listar perfis bloqueados:', error);
    return { profiles: [], error };
  }
}

// Inicializar a tabela quando o módulo for importado
initBlockedProfilesTable().catch(error => {
  console.error('Falha ao inicializar tabela de perfis bloqueados:', error);
});