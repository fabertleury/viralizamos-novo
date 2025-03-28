'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Post {
  id: string;
  link: string;
  code?: string;
  caption?: string;
}

interface Order {
  id: string;
  service: {
    name: string;
    category: {
      name: string;
      icon: string;
    };
  };
  quantity: number;
  amount: number;
  status: string;
  target_username: string;
  payment_status: string;
  created_at: string;
  metadata: {
    posts: Post[];
  };
}

interface GroupedOrder {
  username: string;
  orders: Order[];
  totalAmount: number;
  totalQuantity: number;
  posts: Post[];
  latestCreatedAt: string;
  statuses: Set<string>;
  paymentStatuses: Set<string>;
  expanded: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Você precisa estar logado para ver seus pedidos');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            service:services(
              name,
              category:categories(name, icon)
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Agrupar pedidos por username quando os pedidos mudarem
  useEffect(() => {
    if (orders.length === 0) return;

    const groupedByUsername: Record<string, GroupedOrder> = {};

    orders.forEach(order => {
      const username = order.target_username;
      
      if (!groupedByUsername[username]) {
        groupedByUsername[username] = {
          username,
          orders: [],
          totalAmount: 0,
          totalQuantity: 0,
          posts: [],
          latestCreatedAt: order.created_at,
          statuses: new Set(),
          paymentStatuses: new Set(),
          expanded: false
        };
      }

      // Adicionar o pedido ao grupo
      groupedByUsername[username].orders.push(order);
      
      // Atualizar totais
      groupedByUsername[username].totalAmount += order.amount;
      groupedByUsername[username].totalQuantity += order.quantity;
      
      // Adicionar posts
      if (order.metadata?.posts) {
        groupedByUsername[username].posts = [
          ...groupedByUsername[username].posts,
          ...order.metadata.posts
        ];
      }
      
      // Atualizar data mais recente
      if (new Date(order.created_at) > new Date(groupedByUsername[username].latestCreatedAt)) {
        groupedByUsername[username].latestCreatedAt = order.created_at;
      }
      
      // Adicionar status
      groupedByUsername[username].statuses.add(order.status);
      groupedByUsername[username].paymentStatuses.add(order.payment_status);
    });

    // Converter o objeto em array
    const groupedOrdersArray = Object.values(groupedByUsername);
    
    // Ordenar por data mais recente
    groupedOrdersArray.sort((a, b) => 
      new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime()
    );
    
    setGroupedOrders(groupedOrdersArray);
  }, [orders]);

  const toggleExpand = (username: string) => {
    setGroupedOrders(prevGrouped => 
      prevGrouped.map(group => 
        group.username === username 
          ? { ...group, expanded: !group.expanded } 
          : group
      )
    );
  };

  // Função para determinar o status consolidado
  const getConsolidatedStatus = (statuses: Set<string>) => {
    if (statuses.has('completed')) return 'completed';
    if (statuses.has('processing')) return 'processing';
    if (statuses.has('pending')) return 'pending';
    return 'failed';
  };

  // Função para determinar o status de pagamento consolidado
  const getConsolidatedPaymentStatus = (statuses: Set<string>) => {
    if (statuses.has('approved')) return 'approved';
    if (statuses.has('pending')) return 'pending';
    return 'rejected';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Meus Pedidos</h1>

      <div className="grid grid-cols-1 gap-4">
        {groupedOrders.map((group) => (
          <Card key={group.username} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{group.orders[0].service.category.icon}</span>
                  <h3 className="text-lg font-semibold">{group.orders[0].service.name}</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-4">
                  <span className="text-sm text-gray-600">
                    Quantidade Total: {group.totalQuantity}
                  </span>
                  <span className="text-sm text-gray-600">
                    Total: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(group.totalAmount)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Username: {group.username}
                  </span>
                  <span className={`text-sm ${
                    getConsolidatedStatus(group.statuses) === 'completed' ? 'text-green-600' :
                    getConsolidatedStatus(group.statuses) === 'pending' ? 'text-yellow-600' :
                    getConsolidatedStatus(group.statuses) === 'processing' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    Status: {getConsolidatedStatus(group.statuses)}
                  </span>
                  <span className={`text-sm ${
                    getConsolidatedPaymentStatus(group.paymentStatuses) === 'approved' ? 'text-green-600' :
                    getConsolidatedPaymentStatus(group.paymentStatuses) === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    Pagamento: {
                      getConsolidatedPaymentStatus(group.paymentStatuses) === 'approved' ? 'Aprovado' :
                      getConsolidatedPaymentStatus(group.paymentStatuses) === 'pending' ? 'Pendente' :
                      'Rejeitado'
                    }
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Último pedido em: {new Date(group.latestCreatedAt).toLocaleString('pt-BR')}
                </div>

                {/* Contador de posts */}
                <div className="mt-2 text-sm text-gray-600">
                  Total de posts: {group.posts.length}
                </div>

                {/* Links dos Posts */}
                {getConsolidatedPaymentStatus(group.paymentStatuses) === 'approved' && group.posts.length > 0 && (
                  <div className="mt-4">
                    <div 
                      className="flex items-center gap-2 cursor-pointer" 
                      onClick={() => toggleExpand(group.username)}
                    >
                      <h4 className="text-sm font-medium text-gray-500">Posts Selecionados</h4>
                      {group.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    
                    {group.expanded && (
                      <div className="space-y-2 mt-2 pl-4 border-l-2 border-gray-200">
                        {group.posts.map((post, index) => (
                          <div key={`${post.id}-${index}`} className="flex items-center gap-2">
                            <span className="text-sm font-medium">Post {index + 1}:</span>
                            <a
                              href={post.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-500 hover:text-pink-600 text-sm"
                            >
                              Ver Post
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpand(group.username)}
                >
                  {group.expanded ? 'Ocultar' : 'Mostrar'} Posts
                </Button>
                {group.orders.length === 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/pedido/${group.orders[0].id}`}
                  >
                    Ver Detalhes
                  </Button>
                )}
              </div>
            </div>
            
            {/* Se tiver mais de um pedido e estiver expandido, mostrar os detalhes de cada pedido */}
            {group.orders.length > 1 && group.expanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Detalhes dos Pedidos</h4>
                <div className="space-y-4">
                  {group.orders.map((order) => (
                    <div key={order.id} className="pl-4 border-l-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">
                            Pedido: {order.id.substring(0, 8)}...
                          </span>
                          <span className="text-sm text-gray-600 ml-4">
                            Quantidade: {order.quantity}
                          </span>
                          <span className="text-sm text-gray-600 ml-4">
                            Valor: {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(order.amount)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/pedido/${order.id}`}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {groupedOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Você ainda não tem pedidos</p>
            <Button
              className="mt-4"
              onClick={() => window.location.href = '/servicos'}
            >
              Ver Serviços
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
