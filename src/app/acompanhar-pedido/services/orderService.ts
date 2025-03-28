import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function fetchOrdersByEmail(email: string) {
  try {
    // Usando a rota de API track para buscar pedidos por email
    const response = await fetch(`/api/orders/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || `Erro ao buscar pedidos: ${response.status}`);
    }

    const result = await response.json();
    return result.orders || [];
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao buscar pedidos');
    return [];
  }
}

export async function checkOrderStatus(orderId: string) {
  try {
    const response = await fetch(`/api/orders/check-status?id=${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || `Erro ao verificar status do pedido: ${response.status}`);
    }

    const result = await response.json();
    return result.order;
  } catch (error) {
    console.error('Erro ao verificar status do pedido:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao verificar status do pedido');
    throw error;
  }
}

export async function requestRefill(orderId: string) {
  try {
    const response = await fetch('/api/orders/refill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Erro ao solicitar reposição');
    }

    const result = await response.json();
    return result.refill;
  } catch (error) {
    console.error('Erro ao solicitar reposição:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao solicitar reposição');
    throw error;
  }
}

export async function checkRefillStatus(refillId: string) {
  try {
    const response = await fetch(`/api/orders/refill/check-status?id=${refillId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error('Erro ao verificar status da reposição');
    }

    const result = await response.json();
    return result.refill;
  } catch (error) {
    console.error('Erro ao verificar status da reposição:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao verificar status da reposição');
    throw error;
  }
}

export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-orange-100 text-orange-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'needs_retry':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'processing':
      return 'Processando';
    case 'completed':
      return 'Concluído';
    case 'partial':
      return 'Parcial';
    case 'canceled':
      return 'Cancelado';
    case 'failed':
      return 'Falhou';
    case 'needs_retry':
      return 'Aguardando Reprocessamento';
    default:
      return status;
  }
}

export function isWithin30Days(dateString: string) {
  const orderDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - orderDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
}
