/**
 * Serviço para gerenciar clientes
 */
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export class CustomerService {
  private supabase = createClient();

  /**
   * Busca um cliente por ID
   */
  async getCustomerById(customerId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();

      if (error) {
        logger.error(`Erro ao buscar cliente por ID: ${customerId}`, { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Erro inesperado ao buscar cliente: ${customerId}`, { error });
      throw error;
    }
  }

  /**
   * Busca um cliente por e-mail
   */
  async getCustomerByEmail(email: string) {
    try {
      // Primeiro buscar o usuário na tabela auth.users
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        logger.error(`Erro ao buscar usuário por e-mail: ${email}`, { error: userError });
        throw userError;
      }

      if (!userData) {
        return null;
      }

      // Agora buscar o perfil completo
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .maybeSingle();

      if (profileError) {
        logger.error(`Erro ao buscar perfil do usuário: ${userData.id}`, { error: profileError });
        throw profileError;
      }

      return profileData;
    } catch (error) {
      logger.error(`Erro inesperado ao buscar cliente por e-mail: ${email}`, { error });
      throw error;
    }
  }

  /**
   * Atualiza os dados de um cliente
   */
  async updateCustomer(customerId: string, data: any) {
    try {
      const { data: updatedData, error } = await this.supabase
        .from('profiles')
        .update(data)
        .eq('id', customerId)
        .select()
        .maybeSingle();

      if (error) {
        logger.error(`Erro ao atualizar cliente: ${customerId}`, { error });
        throw error;
      }

      return updatedData;
    } catch (error) {
      logger.error(`Erro inesperado ao atualizar cliente: ${customerId}`, { error });
      throw error;
    }
  }

  /**
   * Cria um novo cliente (para usuários não autenticados)
   * Retorna um ID temporário
   */
  generateTemporaryCustomerId() {
    return crypto.randomUUID();
  }
} 