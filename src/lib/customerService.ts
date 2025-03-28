import { createClient } from '@/lib/supabase/server';
import { Customer, CustomerData } from '@/types/customer';

/**
 * Cria ou atualiza um cliente no sistema
 * @param customerData Dados do cliente
 * @returns O cliente criado ou atualizado
 */
export async function createOrUpdateCustomer(customerData: CustomerData): Promise<Customer> {
  const supabase = createClient();
  
  // Verificar se o cliente já existe
  const { data: existingCustomer, error: searchError } = await supabase
    .from('customers')
    .select('*')
    .eq('email', customerData.email)
    .single();
  
  if (searchError && searchError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
    console.error('Erro ao buscar cliente:', searchError);
    throw searchError;
  }
  
  if (existingCustomer) {
    // Atualizar cliente existente
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({
        name: customerData.name || existingCustomer.name,
        phone: customerData.phone || existingCustomer.phone,
        instagram_username: customerData.instagram_username || existingCustomer.instagram_username,
        metadata: {
          ...existingCustomer.metadata,
          ...customerData.metadata
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCustomer.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Erro ao atualizar cliente:', updateError);
      throw updateError;
    }
    
    return updatedCustomer;
  } else {
    // Criar novo cliente
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        email: customerData.email,
        name: customerData.name || '',
        phone: customerData.phone || '',
        instagram_username: customerData.instagram_username || '',
        metadata: customerData.metadata || {},
        active: true
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Erro ao criar cliente:', createError);
      throw createError;
    }
    
    return newCustomer;
  }
}

/**
 * Busca um cliente pelo email
 * @param email Email do cliente
 * @returns O cliente encontrado ou null
 */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Não encontrado
      return null;
    }
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }
  
  return data as Customer;
}

/**
 * Vincula um cliente a um pedido
 * @param orderId ID do pedido
 * @param customerId ID do cliente
 */
export async function linkCustomerToOrder(orderId: string, customerId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ customer_id: customerId })
    .eq('id', orderId);
  
  if (error) {
    console.error('Erro ao vincular cliente ao pedido:', error);
    throw error;
  }
}

/**
 * Busca os pedidos de um cliente
 * @param customerId ID do cliente
 * @returns Lista de pedidos do cliente
 */
export async function getCustomerOrders(customerId: string): Promise<any[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      service:service_id (*),
      provider:provider_id (*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar pedidos do cliente:', error);
    throw error;
  }
  
  return data || [];
}

export const customerService = {
  createOrUpdateCustomer,
  getCustomerByEmail,
  linkCustomerToOrder,
  getCustomerOrders
};
