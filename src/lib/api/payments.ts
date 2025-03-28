import { cookies } from 'next/headers';
import { Transaction } from '@/types/payment';

/**
 * Busca os dados de uma transação pelo ID
 */
export async function getTransaction(id: string): Promise<Transaction | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Sem cache
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar transação: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    return null;
  }
}

/**
 * Busca todas as transações do usuário
 */
export async function getUserTransactions(): Promise<Transaction[]> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Sem cache
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar transações: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar transações do usuário:', error);
    return [];
  }
} 