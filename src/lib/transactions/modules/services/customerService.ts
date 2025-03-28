import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Serviço para gerenciar clientes durante o processamento de transações
 */
export class CustomerService {
  private supabase = createClient();

  /**
   * Busca um cliente por ID
   */
  async getCustomerById(customerId: string) {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) {
        logger.error(`[CustomerService] Erro ao buscar cliente por ID: ${customerId}`, { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`[CustomerService] Erro inesperado ao buscar cliente: ${customerId}`, { error });
      throw error;
    }
  }

  /**
   * Busca um cliente por e-mail
   */
  async getCustomerByEmail(email: string) {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        logger.error(`[CustomerService] Erro ao buscar cliente por e-mail: ${email}`, { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`[CustomerService] Erro inesperado ao buscar cliente por e-mail: ${email}`, { error });
      throw error;
    }
  }

  /**
   * Atualiza os dados de um cliente
   */
  async updateCustomer(customerId: string, data: any) {
    try {
      const { data: updatedData, error } = await this.supabase
        .from('customers')
        .update(data)
        .eq('id', customerId)
        .select()
        .single();

      if (error) {
        logger.error(`[CustomerService] Erro ao atualizar cliente: ${customerId}`, { error });
        throw error;
      }

      return updatedData;
    } catch (error) {
      logger.error(`[CustomerService] Erro inesperado ao atualizar cliente: ${customerId}`, { error });
      throw error;
    }
  }

  /**
   * Cria um novo cliente
   */
  async createCustomer(customerData: any) {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) {
        logger.error(`[CustomerService] Erro ao criar cliente:`, { error, customerData });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`[CustomerService] Erro inesperado ao criar cliente`, { error, customerData });
      throw error;
    }
  }

  /**
   * Verifica se o cliente existe e cria/atualiza se necessário
   */
  async getOrCreateCustomer(email: string, customerData: any) {
    try {
      // Verificar se o cliente já existe
      const existingCustomer = await this.getCustomerByEmail(email).catch(() => null);
      
      if (existingCustomer) {
        // Atualizar dados do cliente existente
        return await this.updateCustomer(existingCustomer.id, customerData);
      } else {
        // Criar novo cliente
        return await this.createCustomer({
          email,
          ...customerData
        });
      }
    } catch (error) {
      logger.error(`[CustomerService] Erro ao obter ou criar cliente: ${email}`, { error });
      throw error;
    }
  }
} 