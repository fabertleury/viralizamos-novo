'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Order {
  id: string;
  external_order_id: string;
  service: {
    name: string;
  };
  provider: {
    name: string;
  };
  quantity: number;
  status: string;
  created_at: string;
  metadata: {
    link: string;
    provider_status?: {
      status: string;
      start_count: number;
      remains: number;
    };
  };
}

export default function VerifyOrderPage() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const supabase = createClientComponentClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, informe seu email');
      return;
    }
    
    setLoading(true);
    setSearched(true);
    
    try {
      // Buscar cliente pelo email
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .single();
      
      if (customerError) {
        if (customerError.code === 'PGRST116') { // Não encontrado
          setOrders([]);
          return;
        }
        throw customerError;
      }
      
      // Buscar pedidos do cliente
      let query = supabase
        .from('orders')
        .select(`
          *,
          service:service_id (*),
          provider:provider_id (*)
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      
      // Se foi informado um ID de pedido, filtrar por ele
      if (orderId) {
        query = query.or(`id.eq.${orderId},external_order_id.eq.${orderId}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao buscar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'processing':
      case 'in_progress':
      case 'inprogress':
        return 'text-blue-600';
      case 'canceled':
      case 'cancelled':
      case 'refunded':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'processing':
      case 'in_progress':
      case 'inprogress':
        return 'Em Processamento';
      case 'canceled':
      case 'cancelled':
        return 'Cancelado';
      case 'refunded':
        return 'Reembolsado';
      case 'partial':
        return 'Parcialmente Concluído';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Verificar Status do Pedido</h1>

      <Card className="p-6 max-w-md mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="orderId">ID do Pedido (opcional)</Label>
            <Input
              id="orderId"
              type="text"
              placeholder="ID do pedido (opcional)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Buscando...' : 'Verificar Pedidos'}
          </Button>
        </form>
      </Card>

      {searched && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resultados</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{order.service?.name || 'Serviço'}</h3>
                        <p className="text-sm text-gray-600">Provedor: {order.provider?.name || 'N/A'}</p>
                      </div>
                      <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">ID do Pedido:</span>
                        <p className="text-gray-600">{order.id.substring(0, 8)}</p>
                      </div>
                      <div>
                        <span className="font-medium">ID Externo:</span>
                        <p className="text-gray-600">{order.external_order_id || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Quantidade:</span>
                        <p className="text-gray-600">{order.quantity}</p>
                      </div>
                      <div>
                        <span className="font-medium">Data:</span>
                        <p className="text-gray-600">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    
                    {order.metadata?.link && (
                      <div>
                        <span className="font-medium text-sm">Link:</span>
                        <a 
                          href={order.metadata.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline truncate"
                        >
                          {order.metadata.link}
                        </a>
                      </div>
                    )}
                    
                    {order.metadata?.provider_status && (
                      <div className="text-sm border-t pt-3 mt-3">
                        <h4 className="font-medium mb-2">Detalhes do Status:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Status:</span>
                            <p className={`${getStatusColor(order.metadata.provider_status.status)}`}>
                              {getStatusText(order.metadata.provider_status.status)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Contagem Inicial:</span>
                            <p className="text-gray-600">{order.metadata.provider_status.start_count}</p>
                          </div>
                          <div>
                            <span className="font-medium">Restante:</span>
                            <p className="text-gray-600">{order.metadata.provider_status.remains}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          
                          const response = await fetch('/api/orders/check-status', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              order_id: order.id
                            }),
                          });
                          
                          if (!response.ok) {
                            throw new Error('Erro ao verificar status');
                          }
                          
                          const result = await response.json();
                          
                          if (result.success) {
                            toast.success('Status atualizado com sucesso!');
                            // Atualizar o pedido na lista
                            setOrders(orders.map(o => 
                              o.id === order.id ? { ...o, ...result.order } : o
                            ));
                          } else {
                            toast.error(result.error || 'Erro ao verificar status');
                          }
                        } catch (error) {
                          console.error('Erro:', error);
                          toast.error('Erro ao verificar status do pedido');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Atualizar Status
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhum pedido encontrado para este email{orderId ? ' e ID' : ''}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
