'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDateToBrasilia } from '@/lib/utils/date';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  Trash2, 
  Info,
  AlertCircle,
  CheckCircle,
  Code,
  Send,
  RepeatCircle,
  LinkIcon,
  ExternalLink,
  FileText,
  Loader2,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  quantity: number;
  amount: number;
  target_username: string;
  payment_status: string;
  payment_method: string;
  payment_id: string;
  external_order_id: string;
  metadata: {
    link: string;
    username?: string;
    post?: {
      shortcode: string;
      display_url: string;
      url?: string;
      code?: string;
      caption?: string;
      username?: string;
    };
    provider?: {
      id: string;
      name: string;
    };
    provider_name?: string;
    provider: string;
    provider_service_id: string;
    provider_order_id: string;
    provider_status?: {
      status: string;
      start_count: string;
      remains: string;
      charge?: string;
      currency?: string;
      updated_at: string;
      error?: string;
    };
    error?: string;
    providerResponse?: {
      error?: string;
    };
    providerRequestData?: {
      key: string;
      link: string;
      action: string;
      service: string;
      quantity: string;
    };
    formattedLink?: string;
    resent?: boolean;
    resent_at?: string;
    resent_result?: any;
    // Campos para agrupamento de pedidos
    grouped?: boolean;
    totalPosts?: number;
    posts?: {
      id: string;
      external_order_id: string;
      post?: {
        shortcode: string;
        display_url: string;
        url?: string;
        code?: string;
        caption?: string;
        username?: string;
      };
      link: string;
      status: string;
    }[];
  };
  created_at: string;
  updated_at: string;
  transaction_id: string;
  service?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
  };
  provider_id?: string;
}

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const supabase = createClientComponentClient();
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<{ [key: string]: boolean }>({});
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [resendingOrder, setResendingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [apiResponseModalOpen, setApiResponseModalOpen] = useState(false);
  const [groupedPostsModalOpen, setGroupedPostsModalOpen] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  // Função para extrair o código do post do Instagram de forma padronizada
  const extractPostCode = (link: string | undefined): string | null => {
    if (!link) return null;
    
    // Padrão para extrair o código do post do Instagram
    const regex = /instagram\.com\/p\/([^\/\?]+)/;
    const match = link.match(regex);
    
    return match ? match[1] : null;
  };

  // Função para formatar o link do Instagram para exibição
  const formatInstagramLink = (link: string | undefined): string | null => {
    if (!link) return null;
    
    const postCode = extractPostCode(link);
    if (!postCode) return link; // Retorna o link original se não conseguir extrair o código
    
    return `https://instagram.com/p/${postCode}`;
  };

  // Filtrar os pedidos com base no termo de busca e no filtro de status
  const filteredOrders = useMemo(() => {
    return localOrders.filter(order => {
      // Filtrar por status se um filtro estiver selecionado
      if (statusFilter && order.status !== statusFilter) {
        return false;
      }
      
      // Se não houver termo de busca, retorna todos os pedidos que passaram pelo filtro de status
      if (!searchTerm.trim()) {
        return true;
      }
      
      const searchTermLower = searchTerm.toLowerCase();
      
      // Buscar em vários campos
      return (
        // ID do pedido
        order.id.toLowerCase().includes(searchTermLower) ||
        // ID externo
        (order.external_order_id && order.external_order_id.toLowerCase().includes(searchTermLower)) ||
        // Nome do serviço
        (order.service?.name && order.service.name.toLowerCase().includes(searchTermLower)) ||
        // Nome de usuário alvo
        (order.target_username && order.target_username.toLowerCase().includes(searchTermLower)) ||
        // Email do usuário
        (order.user?.email && order.user.email.toLowerCase().includes(searchTermLower)) ||
        // Nome do provedor
        (order.metadata?.provider?.name && order.metadata.provider.name.toLowerCase().includes(searchTermLower))
      );
    });
  }, [localOrders, searchTerm, statusFilter]);

  // Atualizar os pedidos locais quando os pedidos da prop mudarem
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    // Atualizar a cada 4 minutos (240000ms)
    const interval = setInterval(fetchOrders, 240000);
    
    // Verificar status de pedidos pendentes/em processamento a cada 4 minutos
    const statusInterval = setInterval(checkPendingOrdersStatus, 240000);
    
    // Executar uma verificação inicial ao carregar a página
    checkPendingOrdersStatus();
    
    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

  const checkPendingOrdersStatus = async () => {
    // Filtra apenas pedidos pendentes ou em processamento
    const pendingOrders = localOrders.filter(order => 
      order.status.toLowerCase() === 'pending' || 
      order.status.toLowerCase() === 'processing' || 
      order.status.toLowerCase() === 'in progress'
    );
    
    if (pendingOrders.length === 0) return;
    
    // Atualiza o status de cada pedido pendente
    for (const order of pendingOrders) {
      try {
        await checkOrderStatus(order);
        // Pequena pausa entre as verificações para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro ao verificar status do pedido ${order.id}:`, error);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:service_id (
            id,
            name
          ),
          user:user_id (
            id,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocalOrders(data || []);
    } catch (error) {
      console.error('Erro ao atualizar pedidos:', error);
      toast.error('Erro ao atualizar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'pending':
      case 'processing':
      case 'in progress':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'failed':
      case 'rejected':
      case 'canceled':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'partial':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch(statusLower) {
      case 'completed':
      case 'paid':
      case 'approved':
        return <Badge className="bg-green-500">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'canceled':
      case 'refunded':
        return <Badge className="bg-red-500">Cancelado</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Falhou</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processando</Badge>;
      case 'partial':
        return <Badge className="bg-purple-500">Parcial</Badge>;
      default:
        return <Badge className="bg-gray-500">{status || 'Desconhecido'}</Badge>;
    }
  };

  const checkOrderStatus = async (order: any) => {
    // Verificar se o pedido tem um provedor associado
    if (!order.provider_id && !order.metadata?.provider && !order.metadata?.provider_name) {
      console.error('Pedido não tem provedor associado:', order.id);
      toast.error('Pedido não tem provedor associado');
      return;
    }
    
    // Se o pedido já está marcado como needs_retry, mostrar mensagem apropriada
    if (order.status === 'needs_retry') {
      toast.info('Este pedido precisa ser reprocessado devido a um erro de conexão com o provedor.');
      setSelectedOrderStatus({
        order: order,
        provider_response: {
          status: 'needs_retry',
          message: 'Este pedido precisa ser reprocessado devido a um erro de conexão com o provedor.',
          connection_error: true,
          updated_at: new Date().toISOString()
        }
      });
      setStatusModalOpen(true);
      return;
    }
    
    try {
      setCheckingStatus(prev => ({ ...prev, [order.id]: true }));
      
      console.log(`Verificando status do pedido ${order.id}`);
      
      const response = await fetch('/api/orders/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: order.id }),
      });
      
      console.log(`Resposta da API para o pedido ${order.id}:`, {
        status: response.status,
        statusText: response.statusText
      });
      
      let result;
      try {
        result = await response.json();
        console.log(`Dados da resposta para o pedido ${order.id}:`, result);
      } catch (parseError) {
        console.error('Erro ao analisar resposta JSON:', parseError);
        toast.error('Erro ao processar resposta do servidor');
        return;
      }
      
      if (!response.ok) {
        const errorMessage = result && result.error ? result.error : 'Erro ao verificar status do pedido';
        console.error('Erro na resposta da API:', errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      // Traduzir o status para português para a mensagem de sucesso
      let statusTraduzido = 'atualizado';
      if (result.status) {
        switch (result.status.toLowerCase()) {
          case 'pending':
            statusTraduzido = 'Pendente';
            break;
          case 'processing':
          case 'in progress':
            statusTraduzido = 'Processando';
            break;
          case 'completed':
          case 'success':
            statusTraduzido = 'Concluído';
            break;
          case 'failed':
          case 'rejected':
            statusTraduzido = 'Falhou';
            break;
          case 'canceled':
            statusTraduzido = 'Cancelado';
            break;
          case 'partial':
            statusTraduzido = 'Parcial';
            break;
          default:
            statusTraduzido = result.status;
        }
      }
      
      toast.success(`Status do pedido atualizado: ${statusTraduzido}`);
      
      // Atualizar o pedido na lista
      if (result.data) {
        setLocalOrders(prevOrders => {
          return prevOrders.map(o => {
            if (o.id === order.id) {
              return { ...o, ...result.data };
            }
            return o;
          });
        });
      }
      
      // Verificar e corrigir o link do Instagram se existir
      if (result.data?.metadata?.link) {
        const displayLink = formatInstagramLink(result.data.metadata.link);
        if (displayLink) {
          result.data.metadata.link = displayLink;
        }
      }

      // Exibir o modal com a resposta da API
      setSelectedOrderStatus({
        order: result.data,
        provider_response: result.provider_response
      });
      setStatusModalOpen(true);
      
      return result;
    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao verificar status do pedido');
    } finally {
      setCheckingStatus(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setDeleting(true);
      
      // Primeiro, atualizamos o status do pedido para "canceled"
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('id', orderToDelete.id);
        
      if (updateError) throw updateError;
      
      // Opcionalmente, podemos também tentar cancelar o pedido no provedor
      // através de uma API específica, se disponível
      try {
        const response = await fetch('/api/orders/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            orderId: orderToDelete.id,
            externalOrderId: orderToDelete.external_order_id 
          }),
        });
        
        if (!response.ok) {
          console.warn('Não foi possível cancelar o pedido no provedor, mas foi marcado como cancelado no sistema.');
        }
      } catch (providerError) {
        console.error('Erro ao tentar cancelar no provedor:', providerError);
      }
      
      // Atualizar a lista local
      setLocalOrders(localOrders.map(order => 
        order.id === orderToDelete.id ? { ...order, status: 'canceled' } : order
      ));
      
      toast.success('Pedido cancelado com sucesso');
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      toast.error('Erro ao cancelar pedido');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (order: Order) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const openErrorModal = (order: Order) => {
    setSelectedOrder(order);
    setErrorModalOpen(true);
  };

  const resendOrder = async (order: Order) => {
    if (!order || !order.metadata?.providerRequestData) {
      toast.error('Dados insuficientes para reenviar o pedido');
      return;
    }

    try {
      setResendingOrder(true);
      
      // Chamar a API para reenviar o pedido
      const response = await fetch('/api/admin/orders/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          transactionId: order.transaction_id,
          serviceId: order.service_id,
          providerRequestData: order.metadata.providerRequestData,
          formattedLink: order.metadata.formattedLink || order.metadata.providerRequestData.link,
          quantity: order.quantity
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Atualizar o pedido local com o erro
        setLocalOrders(localOrders.map(o => {
          if (o.id === order.id) {
            return {
              ...o,
              metadata: {
                ...o.metadata,
                error: responseData.error || 'Erro desconhecido ao reenviar pedido'
              }
            };
          }
          return o;
        }));
        
        throw new Error(responseData.error || 'Erro ao reenviar pedido');
      }
      
      // Atualizar a lista local
      setLocalOrders(localOrders.map(o => {
        if (o.id === order.id) {
          return { 
            ...o, 
            status: 'pending', 
            external_order_id: responseData.orderId || null,
            metadata: {
              ...o.metadata,
              error: null, // Limpar o erro anterior
              resent: true,
              resent_at: new Date().toISOString(),
              resent_result: responseData.result
            }
          };
        }
        return o;
      }));
      
      toast.success('Pedido reenviado com sucesso!');
      setErrorModalOpen(false);
    } catch (error) {
      console.error('Erro ao reenviar pedido:', error);
      
      // Exibir mensagem de erro mais detalhada
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Verificar se é um erro de saldo insuficiente
      if (errorMessage.toLowerCase().includes('insufficient') || 
          errorMessage.toLowerCase().includes('saldo') || 
          errorMessage.toLowerCase().includes('balance')) {
        toast.error(`Erro ao reenviar pedido: Saldo insuficiente no provedor. Por favor, recarregue o saldo antes de tentar novamente.`, {
          duration: 6000,
        });
      } else {
        toast.error(`Erro ao reenviar pedido: ${errorMessage}`, {
          duration: 5000,
        });
      }
      
      // Não fechar o modal em caso de erro para permitir nova tentativa
    } finally {
      setResendingOrder(false);
    }
  };

  // Função para abrir o modal de resposta da API
  const openApiResponseModal = (order: Order) => {
    setSelectedOrder(order);
    setApiResponseModalOpen(true);
  };

  // Função para fechar o modal de resposta da API
  const closeApiResponseModal = () => {
    setApiResponseModalOpen(false);
    setSelectedOrder(null);
  };

  // Função para abrir o modal de posts agrupados
  const openGroupedPostsModal = (order: Order) => {
    setSelectedOrder(order);
    setGroupedPostsModalOpen(true);
  };

  return (
    <div>
      <div className="py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Pedidos</h2>
            <p className="text-sm text-gray-500">
              O status dos pedidos é atualizado automaticamente a cada 4 minutos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <input
              type="text"
              placeholder="Buscar por ID, usuário, serviço..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídos</option>
              <option value="processing">Em processamento</option>
              <option value="cancelled">Cancelados</option>
              <option value="partial">Parciais</option>
            </select>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </>
              )}
            </button>
            <button
              onClick={() => setShowHelpPanel(!showHelpPanel)}
              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
            >
              <Info className="h-4 w-4 mr-2" />
              Ajuda
            </button>
          </div>
        </div>
        
        {/* Painel de ajuda para problemas comuns */}
        {showHelpPanel && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-md font-semibold text-blue-800 mb-2">Soluções para problemas comuns</h3>
              <button 
                onClick={() => setShowHelpPanel(false)} 
                className="text-blue-500 hover:text-blue-700"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="font-medium text-gray-900 mb-1">Erro de Link Inválido</h4>
                <p className="text-sm text-gray-600 mb-2">
                  O link fornecido pode estar incorreto, privado ou inacessível.
                </p>
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Solução:</span> Verifique se o link do post está acessível publicamente 
                  e se o formato está correto. Se necessário, reenvie o pedido com um link válido.
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="font-medium text-gray-900 mb-1">Erro de Quantidade Mínima</h4>
                <p className="text-sm text-gray-600 mb-2">
                  A quantidade solicitada está abaixo do mínimo exigido pelo provedor.
                </p>
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Solução:</span> Cancelar o pedido atual e criar um novo com uma 
                  quantidade que atenda aos requisitos mínimos do provedor.
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="font-medium text-gray-900 mb-1">Erro de Conexão com Provedor</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Não foi possível estabelecer conexão com o provedor no momento do pedido.
                </p>
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Solução:</span> Utilize o botão "Reenviar" para tentar novamente.
                  Se o problema persistir, verifique o status do provedor e tente mais tarde.
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="font-medium text-gray-900 mb-1">Pedido Duplicado</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Já existe um pedido ativo com o mesmo link no provedor.
                </p>
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Solução:</span> Aguarde a conclusão do pedido anterior
                  ou utilize a função "Verificar Status" para atualizar o status atual.
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-blue-700">
              <p>
                <span className="font-medium">Dica:</span> Para a maioria dos erros, verificar o status do pedido 
                pode ajudar a identificar se o problema foi resolvido automaticamente.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
            {(searchTerm || statusFilter) && ' com os filtros aplicados'}
          </p>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          {/* Cabeçalho em desktop */}
          <div className="hidden md:grid md:grid-cols-8 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-t-lg">
            <div className="col-span-1">ID / Data</div>
            <div className="col-span-1">Cliente</div>
            <div className="col-span-1">Serviço</div>
            <div className="col-span-1">Qtd / Valor</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Status Pagamento</div>
            <div className="col-span-1">Provedor</div>
            <div className="col-span-1">Ações</div>
          </div>
          
          {/* Lista de pedidos */}
          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                Nenhum pedido encontrado.
              </div>
            ) : (
              filteredOrders.map((order) => {
                // Verificar e corrigir o link do Instagram para exibição
                let displayLink = formatInstagramLink(order.metadata?.link);
                
                // Obter o nome do provedor dos metadados
                const providerName = order.metadata?.provider?.name || 
                                     order.metadata?.provider_name || 
                                     (order.metadata?.provider ? 
                                       order.metadata.provider.charAt(0).toUpperCase() + 
                                       order.metadata.provider.slice(1) : 
                                       'Fama Redes');
                
                // Obter o email do cliente
                const customerEmail = order.user?.email || 
                  (order.metadata?.post?.username ? `@${order.metadata.post.username}` : 'N/A');
                
                return (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                    {/* Layout para desktop */}
                    <div className="hidden md:grid md:grid-cols-8 gap-4 text-sm">
                      {/* ID e Data */}
                      <div className="col-span-1">
                        <div className="font-medium text-gray-900">{order.id.substring(0, 8)}...</div>
                        <div className="text-xs text-gray-500">{formatDateToBrasilia(order.created_at)}</div>
                        {order.external_order_id && (
                          <div className="text-xs text-blue-600 mt-1">
                            ID Externo: {order.external_order_id}
                          </div>
                        )}
                      </div>
                      
                      {/* Cliente */}
                      <div className="col-span-1">
                        <div className="font-medium text-gray-900 truncate">{customerEmail}</div>
                        <div className="text-xs text-gray-500 truncate">
                          <strong>Username:</strong> {order.target_username || 'N/A'}
                        </div>
                        {order.metadata?.username && (
                          <div className="text-xs text-gray-500 truncate">
                            <strong>Perfil:</strong> @{order.metadata.username}
                          </div>
                        )}
                      </div>
                      
                      {/* Serviço */}
                      <div className="col-span-1">
                        <div className="font-medium text-gray-900 truncate">{order.service?.name || 'N/A'}</div>
                        {displayLink && (
                          <a 
                            href={displayLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Ver Link
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                      
                      {/* Quantidade e Valor */}
                      <div className="col-span-1">
                        <div className="font-medium text-gray-900">{order.quantity} unidades</div>
                        <div className="text-xs text-gray-500">R$ {order.amount.toFixed(2)}</div>
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'partial' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'needs_retry' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'retrying' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'needs_retry' ? 'Requer Reenvio' :
                           order.status === 'retrying' ? 'Reenviando' :
                           order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <button
                          onClick={() => checkOrderStatus(order)}
                          disabled={checkingStatus[order.id]}
                          className="mt-1 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          {checkingStatus[order.id] ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Atualizar
                            </>
                          )}
                        </button>
                        {order.metadata?.provider_status?.status && (
                          <div className="text-xs text-gray-500 mt-1">
                            Status no provedor: {order.metadata.provider_status.status}
                          </div>
                        )}
                        {order.metadata?.error || order.metadata?.provider_response?.error || order.metadata?.providerResponse?.error ? (
                          <div className="text-xs text-red-500 mt-1">
                            Erro: {order.metadata?.error || order.metadata?.provider_response?.error || order.metadata?.providerResponse?.error}
                          </div>
                        ) : null}
                      </div>
                      
                      {/* Status Pagamento */}
                      <div className="col-span-1">
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                      
                      {/* Provedor */}
                      <div className="col-span-1">
                        <div className="font-medium text-gray-900">{providerName}</div>
                        {order.metadata?.provider_service_id && (
                          <div className="text-xs text-gray-500">
                            Serviço: {order.metadata.provider_service_id}
                          </div>
                        )}
                        {order.metadata?.provider_order_id && (
                          <div className="text-xs text-gray-500">
                            ID: {order.metadata.provider_order_id}
                          </div>
                        )}
                        {order.metadata?.provider_status?.start_count && (
                          <div className="text-xs text-gray-500">
                            Inicial: {order.metadata.provider_status.start_count}
                          </div>
                        )}
                        {order.metadata?.provider_status?.remains && (
                          <div className="text-xs text-gray-500">
                            Restante: {order.metadata.provider_status.remains}
                          </div>
                        )}
                      </div>
                      
                      {/* Ações */}
                      <div className="col-span-1 flex flex-col gap-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => checkOrderStatus(order)}
                            disabled={checkingStatus[order.id]}
                            className="inline-flex items-center justify-center p-1.5 rounded text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                            title="Verificar Status"
                          >
                            {checkingStatus[order.id] ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => openApiResponseModal(order)}
                            className="inline-flex items-center justify-center p-1.5 rounded text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                            title="Ver Detalhes"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          
                          {order.status === 'needs_retry' || order.metadata?.error ? (
                            <button
                              onClick={() => resendOrder(order)}
                              disabled={resendingOrder}
                              className="inline-flex items-center justify-center p-1.5 rounded text-sm text-amber-700 bg-amber-100 hover:bg-amber-200"
                              title="Reenviar Pedido"
                            >
                              {resendingOrder ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RepeatCircle className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}
                          
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => openDeleteModal(order)}
                              className="inline-flex items-center justify-center p-1.5 rounded text-sm text-red-700 bg-red-100 hover:bg-red-200"
                              title="Cancelar Pedido"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        {order.metadata?.grouped && order.metadata?.posts && order.metadata.posts.length > 0 && (
                          <button
                            onClick={() => openGroupedPostsModal(order)}
                            className="mt-1 text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 flex items-center justify-center"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Ver {order.metadata.posts.length} Posts
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Layout para mobile - colapsável para economizar espaço */}
                    <div className="md:hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{order.id.substring(0, 8)}...</div>
                          <div className="text-xs text-gray-500">{formatDateToBrasilia(order.created_at)}</div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'partial' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'needs_retry' ? 'Requer Reenvio' :
                           order.status === 'retrying' ? 'Reenviando' :
                           order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Serviço</div>
                          <div className="text-sm">{order.service?.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Cliente</div>
                          <div className="text-sm truncate">{customerEmail}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Quantidade</div>
                          <div className="text-sm">{order.quantity}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500">Provedor</div>
                          <div className="text-sm">{providerName}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs font-semibold text-gray-500">Username Alvo</div>
                          <div className="text-sm">{order.target_username || 'N/A'}</div>
                        </div>
                        {order.external_order_id && (
                          <div className="col-span-2">
                            <div className="text-xs font-semibold text-gray-500">ID Externo</div>
                            <div className="text-sm">{order.external_order_id}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex justify-between">
                        <button
                          onClick={() => checkOrderStatus(order)}
                          disabled={checkingStatus[order.id]}
                          className="text-xs flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {checkingStatus[order.id] ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Verificar Status
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => openApiResponseModal(order)}
                          className="text-xs flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Detalhes
                        </button>
                        
                        {order.status === 'needs_retry' || order.metadata?.error ? (
                          <button
                            onClick={() => resendOrder(order)}
                            disabled={resendingOrder}
                            className="text-xs flex items-center justify-center px-2 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                          >
                            {resendingOrder ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Reenviando...
                              </>
                            ) : (
                              <>
                                <RepeatCircle className="h-3 w-3 mr-1" />
                                Reenviar
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Informações completas do pedido e status no provedor
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderStatus && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Informações do Pedido</h3>
                  <div className="border rounded-md p-4 bg-white space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">ID do Pedido</p>
                        <p className="font-medium">{selectedOrderStatus.order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ID Externo</p>
                        <p className="font-medium">{selectedOrderStatus.order.external_order_id || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Provedor</p>
                        <p className="font-medium">{selectedOrderStatus.order.metadata?.provider?.name || 'Fama Redes'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Serviço</p>
                        <p className="font-medium">{selectedOrderStatus.order.service?.name || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-medium">{selectedOrderStatus.order.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quantidade</p>
                        <p className="font-medium">{selectedOrderStatus.order.quantity}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="font-medium">{selectedOrderStatus.order.user?.email || selectedOrderStatus.order.metadata?.customer?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Data de Criação</p>
                        <p className="font-medium">{formatDateToBrasilia(selectedOrderStatus.order.created_at)}</p>
                      </div>
                    </div>
                    
                    {selectedOrderStatus.order.metadata?.link && (
                      <div>
                        <p className="text-xs text-gray-500">Link</p>
                        <a 
                          href={formatInstagramLink(selectedOrderStatus.order.metadata.link)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          {formatInstagramLink(selectedOrderStatus.order.metadata.link)}
                        </a>
                      </div>
                    )}
                    
                    {selectedOrderStatus.order.target_username && (
                      <div>
                        <p className="text-xs text-gray-500">Usuário Alvo</p>
                        <p className="font-medium">@{selectedOrderStatus.order.target_username}</p>
                      </div>
                    )}
                    
                    {selectedOrderStatus.order.transaction_id && (
                      <div>
                        <p className="text-xs text-gray-500">ID da Transação</p>
                        <p className="font-medium">{selectedOrderStatus.order.transaction_id}</p>
                      </div>
                    )}
                    
                    {selectedOrderStatus.order.payment_id && (
                      <div>
                        <p className="text-xs text-gray-500">ID do Pagamento</p>
                        <p className="font-medium">{selectedOrderStatus.order.payment_id}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Status do Provedor</h3>
                  <div className="border rounded-md p-4 bg-white">
                    {selectedOrderStatus.order.metadata?.provider_status ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className={`font-medium ${selectedOrderStatus.order.metadata.provider_status.status.toLowerCase() === 'completed' ? 'text-green-600' : selectedOrderStatus.order.metadata.provider_status.status.toLowerCase() === 'pending' ? 'text-yellow-600' : selectedOrderStatus.order.metadata.provider_status.status.toLowerCase() === 'processing' ? 'text-blue-600' : 'text-gray-900'}`}>
                              {selectedOrderStatus.order.metadata.provider_status.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Última Atualização</p>
                            <p className="font-medium">{formatDateToBrasilia(selectedOrderStatus.order.metadata.provider_status.updated_at)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Contagem Inicial</p>
                            <p className="font-medium">{selectedOrderStatus.order.metadata.provider_status.start_count}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Restante</p>
                            <p className="font-medium">{selectedOrderStatus.order.metadata.provider_status.remains}</p>
                          </div>
                        </div>
                        
                        {selectedOrderStatus.order.metadata.provider_status.charge && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-500">Custo</p>
                              <p className="font-medium">{selectedOrderStatus.order.metadata.provider_status.charge} {selectedOrderStatus.order.metadata.provider_status.currency}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedOrderStatus.order.metadata.provider_status.error && (
                          <div>
                            <p className="text-xs text-gray-500">Erro</p>
                            <p className="font-medium text-red-600">{selectedOrderStatus.order.metadata.provider_status.error}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma informação de status disponível do provedor</p>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 mt-4 mb-2">Resposta da API</h3>
                  <div className="border rounded-md p-4 bg-white">
                    <pre className="text-xs overflow-auto max-h-60">
                      {JSON.stringify(selectedOrderStatus.provider_response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => checkOrderStatus(selectedOrderStatus.order)}
                  disabled={!selectedOrderStatus.order.external_order_id || checkingStatus[selectedOrderStatus.order.id]}
                >
                  {checkingStatus[selectedOrderStatus.order.id] ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar Status
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={() => setStatusModalOpen(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Cancelar Pedido
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {orderToDelete && (
            <div className="py-4">
              <div className="border rounded-md p-4 bg-white space-y-2">
                <p><span className="font-medium">ID:</span> {orderToDelete.id}</p>
                <p><span className="font-medium">Serviço:</span> {orderToDelete.service?.name || 'N/A'}</p>
                <p><span className="font-medium">Quantidade:</span> {orderToDelete.quantity}</p>
                <p><span className="font-medium">Status Atual:</span> {orderToDelete.status}</p>
                {orderToDelete.external_order_id && (
                  <p><span className="font-medium">ID Externo:</span> {orderToDelete.external_order_id}</p>
                )}
                <p className="text-red-600 text-sm mt-2">
                  Nota: O pedido será marcado como cancelado no sistema. Se o pedido já foi processado pelo provedor, 
                  pode não ser possível cancelá-lo completamente.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-end space-x-2">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle>Detalhes do Erro</DialogTitle>
            <DialogDescription>
              Informações sobre o erro no pedido e opções para reenvio
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="border rounded-md p-4 bg-red-50">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Mensagem de Erro</h3>
                  <p className="text-sm text-red-700">
                    {selectedOrder.metadata?.error || 
                     selectedOrder.metadata?.providerResponse?.error && `Erro do provedor: ${selectedOrder.metadata.providerResponse.error}` || 
                     'Erro desconhecido'}
                  </p>
                  
                  {(selectedOrder.metadata?.error?.toLowerCase().includes('insufficient') || 
                    selectedOrder.metadata?.error?.toLowerCase().includes('saldo') || 
                    selectedOrder.metadata?.error?.toLowerCase().includes('balance')) && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded-md">
                      <p className="text-sm font-medium text-yellow-800">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Atenção: O provedor está com saldo insuficiente. É necessário recarregar o saldo antes de reenviar este pedido.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4 bg-white">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Detalhes do Pedido</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Serviço</p>
                      <p className="font-medium">{selectedOrder.service?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantidade</p>
                      <p className="font-medium">{selectedOrder.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor</p>
                      <p className="font-medium">R$ {selectedOrder.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Link</p>
                      <p className="font-medium truncate">
                        {selectedOrder.metadata?.formattedLink || 
                         selectedOrder.metadata?.providerRequestData?.link || 
                         selectedOrder.metadata?.post?.url || 
                         'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedOrder.metadata?.providerRequestData && (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Dados Enviados ao Provedor</h3>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(selectedOrder.metadata.providerRequestData, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedOrder.metadata?.resent && (
                  <div className="border rounded-md p-4 bg-blue-50">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Histórico de Reenvio</h3>
                    <p className="text-sm text-blue-700">
                      Este pedido foi reenviado em {formatDateToBrasilia(selectedOrder.metadata.resent_at || '')}
                    </p>
                    {selectedOrder.metadata.resent_result && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-600">
                          {selectedOrder.metadata.resent_result.success ? 
                            'Reenvio bem-sucedido' : 
                            `Falha no reenvio: ${selectedOrder.metadata.resent_result.error || 'Erro desconhecido'}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setErrorModalOpen(false)}>
                  Fechar
                </Button>
                <Button 
                  onClick={() => resendOrder(selectedOrder)}
                  disabled={resendingOrder}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {resendingOrder ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Reenviar Pedido
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para visualizar a resposta da API */}
      {apiResponseModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Resposta da API do Provedor</h3>
                <button
                  onClick={closeApiResponseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">ID do Pedido</h4>
                <p className="text-sm text-gray-900">{selectedOrder.id}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">ID Externo</h4>
                <p className="text-sm text-gray-900">{selectedOrder.external_order_id || 'N/A'}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                <p className="text-sm text-gray-900">{selectedOrder.status}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Dados Enviados para o Provedor</h4>
                <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedOrder.metadata?.providerRequestData || {}, null, 2)}
                </pre>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Resposta do Provedor</h4>
                <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedOrder.metadata?.provider_response || {}, null, 2)}
                </pre>
              </div>
              
              {selectedOrder.metadata?.provider_status && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status do Provedor</h4>
                  <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedOrder.metadata.provider_status, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedOrder.metadata?.error && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Erro</h4>
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{selectedOrder.metadata.error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeApiResponseModal}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Fechar
                </button>
                {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'error') && (
                  <button
                    onClick={() => {
                      closeApiResponseModal();
                      resendOrder(selectedOrder);
                    }}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Reenviar Pedido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para visualizar posts agrupados */}
      {groupedPostsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Posts Agrupados</h3>
                <button
                  onClick={() => setGroupedPostsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">ID do Pedido</h4>
                <p className="text-sm text-gray-900">{selectedOrder.id}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Quantidade de Posts</h4>
                <p className="text-sm text-gray-900">{selectedOrder.metadata?.totalPosts}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Posts</h4>
                <div className="space-y-2">
                  {selectedOrder.metadata?.posts?.map((post, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-md">
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Post {index + 1}</h5>
                      <p className="text-sm text-gray-500">ID: {post.id}</p>
                      <p className="text-sm text-gray-500">Link: {post.link}</p>
                      <p className="text-sm text-gray-500">Status: {post.status}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setGroupedPostsModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
