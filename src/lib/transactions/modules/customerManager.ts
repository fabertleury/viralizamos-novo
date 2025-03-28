import { createClient } from '@/lib/supabase/server';
import { Transaction } from './types';

/**
 * Gerencia a criação e atualização de clientes
 */
export class CustomerManager {
  private supabase = createClient();

  /**
   * Verifica se o cliente existe e cria um novo se necessário
   * @param transaction Dados da transação
   * @param transactionId ID da transação
   * @returns ID do cliente
   */
  async ensureCustomerExists(transaction: Transaction, transactionId: string): Promise<string | null> {
    const customerEmail = this.getCustomerEmail(transaction);
    
    if (!customerEmail) {
      console.log('[CustomerManager] Nenhum email de cliente encontrado na transação');
      return null;
    }
    
    console.log('[CustomerManager] Verificando cliente:', customerEmail);
    
    // Verificar se o cliente já existe
    const { data: existingCustomer, error: customerError } = await this.supabase
      .from('customers')
      .select('*')
      .eq('email', customerEmail)
      .single();
    
    if (customerError && customerError.code !== 'PGSQL_ERROR_NO_DATA_FOUND') {
      console.error('[CustomerManager] Erro ao verificar cliente:', customerError);
    }
    
    let customerId = existingCustomer?.id;
    
    // Se o cliente não existe, criar novo
    if (!existingCustomer) {
      customerId = await this.createNewCustomer(transaction, customerEmail);
      
      if (customerId) {
        // Atualizar a transação com o ID do cliente
        await this.updateTransactionWithCustomerId(transactionId, customerId);
      }
    } else {
      console.log('[CustomerManager] Cliente encontrado:', existingCustomer);
      
      // Garantir que a transação tenha o customer_id correto
      if (!transaction.customer_id || transaction.customer_id !== customerId) {
        await this.updateTransactionWithCustomerId(transactionId, customerId);
      }
    }
    
    return customerId;
  }

  /**
   * Obtém o email do cliente de várias fontes possíveis na transação
   * @param transaction Dados da transação
   * @returns Email do cliente
   */
  private getCustomerEmail(transaction: Transaction): string | null {
    return transaction.customer_email || 
           transaction.metadata?.email || 
           transaction.metadata?.contact?.email || 
           transaction.metadata?.profile?.email || 
           null;
  }

  /**
   * Cria um novo cliente no banco de dados
   * @param transaction Dados da transação
   * @param customerEmail Email do cliente
   * @returns ID do cliente criado
   */
  private async createNewCustomer(transaction: Transaction, customerEmail: string): Promise<string | null> {
    console.log('[CustomerManager] Criando cliente para usuário:', customerEmail);
    
    // Obter o nome de usuário do Instagram do perfil alvo
    const instagramUsername = this.getInstagramUsername(transaction);
    
    console.log('[CustomerManager] Instagram username detectado:', instagramUsername);
    
    const { data: newCustomer, error: createError } = await this.supabase
      .from('customers')
      .insert({
        email: customerEmail,
        name: this.getCustomerName(transaction, customerEmail),
        phone: this.getCustomerPhone(transaction),
        instagram_username: instagramUsername
      })
      .select()
      .single();
    
    if (createError) {
      console.error('[CustomerManager] Erro ao criar cliente:', createError);
      return null;
    } else {
      console.log('[CustomerManager] Cliente criado com sucesso:', newCustomer);
      return newCustomer.id;
    }
  }

  /**
   * Obtém o nome de usuário do Instagram de várias fontes possíveis na transação
   * @param transaction Dados da transação
   * @returns Nome de usuário do Instagram
   */
  private getInstagramUsername(transaction: Transaction): string {
    return transaction.target_username || 
           transaction.metadata?.profile?.username || 
           transaction.metadata?.target_username || 
           (transaction.metadata?.posts && transaction.metadata?.posts.length > 0 ? 
             transaction.metadata?.posts[0].username : '');
  }

  /**
   * Obtém o nome do cliente de várias fontes possíveis na transação
   * @param transaction Dados da transação
   * @param customerEmail Email do cliente para usar como fallback
   * @returns Nome do cliente
   */
  private getCustomerName(transaction: Transaction, customerEmail: string): string {
    return transaction.customer_name || 
           transaction.metadata?.profile?.full_name || 
           transaction.metadata?.profile?.username || 
           transaction.metadata?.target_username || 
           customerEmail.split('@')[0];
  }

  /**
   * Obtém o telefone do cliente de várias fontes possíveis na transação
   * @param transaction Dados da transação
   * @returns Telefone do cliente
   */
  private getCustomerPhone(transaction: Transaction): string {
    return transaction.customer_phone || 
           transaction.metadata?.phone || 
           transaction.metadata?.contact?.phone || 
           '';
  }

  /**
   * Atualiza a transação com o ID do cliente
   * @param transactionId ID da transação
   * @param customerId ID do cliente
   */
  private async updateTransactionWithCustomerId(transactionId: string, customerId: string): Promise<void> {
    const { error: updateError } = await this.supabase
      .from('transactions')
      .update({ customer_id: customerId })
      .eq('id', transactionId);
    
    if (updateError) {
      console.error('[CustomerManager] Erro ao atualizar transação com customer_id:', updateError);
    }
  }
}
