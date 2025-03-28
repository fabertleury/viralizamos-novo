'use client';

import React, { use, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw, Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { CheckIcon, ClockIcon, XIcon } from 'lucide-react';

interface OrderProps {
  params: {
    id: string;
  };
}

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
  provider_id?: string;
  needs_admin_attention?: boolean;
  metadata: {
    link?: string;
    username?: string;
    post?: {
      shortcode: string;
      display_url: string;
      url?: string;
      code?: string;
    };
    provider: string | { id: string; name: string };
    provider_service_id?: string;
    provider_order_id?: string;
    provider_status?: {
      status: string;
      start_count: string;
      remains: string;
      updated_at: string;
      error?: string;
    };
    grouped?: boolean;
    totalPosts?: number;
    posts?: {
      id: string;
      external_order_id: string;
      post?: {
        shortcode: string;
        display_url: string;
      };
      link: string;
      status: string;
      quantity?: number;
    }[];
    checkout_type?: string;
    provider_name?: string;
    provider_id?: string;
    provider_response?: {
      error?: string;
    };
    error?: string;
    comments?: string[];
    updates?: {
      status: string;
      date: string;
      message?: string;
    }[];
  };
  created_at: string;
  updated_at?: string;
  transaction_id: string;
  service?: {
    id: string;
    name: string;
    type?: string;
  };
  user?: {
    id: string;
    email: string;
  };
  transaction?: {
    id: string;
    metadata?: {
      checkout_type?: string;
    };
  };
}

interface Log {
  id: string;
  order_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface Update {
  status: string;
  date: string;
  message?: string;
}

export default function OrderDetail({ params }: OrderProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Em vez de usar Promise.resolve, use params diretamente
  // No Next.js 14, params já será resolvido
  const orderId = use(params).id;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Fetch order details - sem tentar buscar user:user_id relacionado
      const { data: orderData, error: orderError } = await supabase
        .from('core_orders')
        .select(`*,
          service:service_id (*)`)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      
      // Buscar transação relacionada
      let transactionData = null;
      if (orderData?.transaction_id) {
        const { data: transaction, error: transactionError } = await supabase
          .from('core_transactions')
          .select('*')
          .eq('id', orderData.transaction_id)
          .single();
          
        if (!transactionError && transaction) {
          transactionData = transaction;
        }
      }
      
      // Combinar os dados do pedido com os dados da transação
      const enrichedOrderData = {
        ...orderData,
        transaction: transactionData,
        // Garantir que temos as informações do provedor e link acessíveis
        metadata: {
          ...orderData.metadata,
          link: orderData.metadata?.link || orderData.target_username ? `https://instagram.com/${orderData.target_username}` : null,
          provider: orderData.metadata?.provider || { 
            id: orderData.provider_id || 'unknown', 
            name: 'Desconhecido' 
          },
          provider_name: orderData.metadata?.provider_name || (
            typeof orderData.metadata?.provider === 'object' ? 
            orderData.metadata?.provider?.name : 
            typeof orderData.metadata?.provider === 'string' ? 
            orderData.metadata?.provider : 'Desconhecido'
          )
        }
      };
      
      console.log('Dados do pedido enriquecidos:', {
        id: enrichedOrderData.id,
        link: enrichedOrderData.metadata?.link,
        providerInfo: {
          provider: enrichedOrderData.metadata?.provider,
          provider_name: enrichedOrderData.metadata?.provider_name,
          provider_id: enrichedOrderData.provider_id
        }
      });
      
      // Fetch logs related to this order
      const { data: logsData, error: logsError } = await supabase
        .from('order_logs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      
      if (logsError) throw logsError;

      setOrder(enrichedOrderData);
      setLogs(logsData || []);
    } catch (error: unknown) {
      console.error('Error fetching order details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao buscar detalhes do pedido: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setUpdatingStatus(true);
    
    try {
      const response = await axios.post('/api/admin/check-order-status', {
        order_id: orderId
      });
      
      if (response.data.success) {
        toast.success('Status do pedido atualizado com sucesso!');
        fetchOrderDetails(); // Refresh order details
      } else {
        toast.error(`Erro ao verificar status: ${response.data.error}`);
      }
    } catch (error: unknown) {
      console.error('Error checking order status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao verificar status: ${errorMessage}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'processing') return 'warning';
    if (status === 'pending') return 'default';
    if (status === 'partial') return 'warning';
    if (status.includes('error_') || status === 'failed') return 'destructive';
    if (status === 'canceled') return 'outline';
    return 'secondary';
  };

  const getStatusText = (status: string) => {
    if (status === 'completed') return 'Concluído';
    if (status === 'processing') return 'Processando';
    if (status === 'pending') return 'Pendente';
    if (status === 'partial') return 'Parcial';
    if (status.includes('error_')) return 'Erro';
    if (status === 'canceled') return 'Cancelado';
    if (status === 'failed') return 'Falhou';
    return status;
  };

  const getProviderName = (provider: string | { id: string; name: string }) => {
    if (typeof provider === 'string') return provider;
    if (provider && typeof provider === 'object' && 'name' in provider) return provider.name;
    return 'Desconhecido';
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-2 text-gray-600">Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-600" />
        <h2 className="mt-2 text-lg font-semibold">Pedido não encontrado</h2>
        <p className="mt-1 text-gray-600">O pedido que você está procurando não existe ou foi removido.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/admin/pedidos')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a lista de pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => router.push('/admin/pedidos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Pedido #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-gray-500">
              Criado em {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="ml-auto">
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={fetchOrderDetails}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={handleCheckStatus}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Status
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <div className="flex items-center">
                <Badge variant={getStatusColor(order.status)} className="mr-2 text-base py-1 px-3">
                  {getStatusText(order.status)}
                </Badge>
                {order.needs_admin_attention && (
                  <Badge variant="destructive" className="text-base py-1 px-3">
                    Requer Atenção
                  </Badge>
                )}
              </div>
              {order.metadata?.provider_status?.status && (
                <p className="text-sm text-gray-500 mt-2">
                  Status no provedor: <span className="font-medium">{order.metadata.provider_status.status}</span>
                </p>
              )}
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="text-sm text-gray-500">
                ID Externo: <span className="font-medium">{order.external_order_id || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-500">
                Provedor: <span className="font-medium">
                  {order.metadata?.provider_name || 
                   (typeof order.metadata?.provider === 'object' ? 
                    getProviderName(order.metadata.provider) : 
                    typeof order.metadata?.provider === 'string' ? 
                    order.metadata.provider : 'N/A')}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Informações do Pedido</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">ID do Pedido</h3>
                    <p className="mt-1 text-sm text-gray-600 font-mono">{order.id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Data de Criação</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Serviço</h3>
                    <p className="mt-1 text-sm text-gray-600">{order.service?.name || 'N/A'}</p>
                    </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Quantidade</h3>
                    <p className="mt-1 text-sm text-gray-600">{order.quantity}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Link</h3>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      <a 
                        href={order.metadata?.link} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                        {order.metadata?.link}
                          </a>
                        </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Transação</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      <Link href={`/admin/transacoes/${order.transaction_id}`} className="text-blue-600 hover:underline">
                        Ver transação
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Exibir histórico de atualizações */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-2">Histórico de Atualizações</h3>
                  {order.metadata?.updates && order.metadata.updates.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md space-y-3">
                      {order.metadata.updates.map((update: Update, index: number) => (
                        <div key={index} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{update.status || 'Atualização'}</span>
                            <span className="text-xs text-gray-500">
                              {update.date ? format(new Date(update.date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Data não disponível'}
                            </span>
                          </div>
                          {update.message && (
                            <p className="text-sm text-gray-600 mt-1">{update.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma atualização registrada</p>
                  )}
                </div>
              </div>
            </div>

            {/* Processamento da Transação */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Processamento da Transação</h2>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Fluxo de Processamento</h3>
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-3 relative">
                      {order.status === 'completed' && (
                        <>
                          <div className="flex items-center">
                            <div className="absolute left-3 transform -translate-x-1/2 w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                              <CheckIcon className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="ml-8">
                              <p className="text-sm font-medium">Pedido enviado ao provedor</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="absolute left-3 transform -translate-x-1/2 w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                              <CheckIcon className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="ml-8">
                              <p className="text-sm font-medium">Pedido processado com sucesso</p>
                              <p className="text-xs text-gray-500">
                                {order.updated_at && format(new Date(order.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {order.status === 'processing' && (
                        <>
                          <div className="flex items-center">
                            <div className="absolute left-3 transform -translate-x-1/2 w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                              <CheckIcon className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="ml-8">
                              <p className="text-sm font-medium">Pedido enviado ao provedor</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="absolute left-3 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                              <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                            </div>
                            <div className="ml-8">
                              <p className="text-sm font-medium">Pedido em processamento</p>
                              <p className="text-xs text-gray-500">Esperando conclusão pelo provedor</p>
                            </div>
                          </div>
                        </>
                      )}

                      {order.status === 'pending' && (
                        <div className="flex items-center">
                          <div className="absolute left-3 transform -translate-x-1/2 w-6 h-6 rounded-full bg-yellow-100 border-2 border-yellow-500 flex items-center justify-center">
                            <ClockIcon className="h-3 w-3 text-yellow-600" />
                          </div>
                          <div className="ml-8">
                            <p className="text-sm font-medium">Aguardando processamento</p>
                            <p className="text-xs text-gray-500">
                              Criado em {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      )}

                      {order.status === 'failed' && (
                        <div className="flex items-center">
                          <div className="absolute left-3 transform -translate-x-1/2 w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                            <XIcon className="h-3 w-3 text-red-600" />
                              </div>
                          <div className="ml-8">
                            <p className="text-sm font-medium">Falha no processamento</p>
                            <p className="text-xs text-gray-500">
                              {order.metadata?.error || 'Erro no processamento do pedido'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Exibir erros, se existirem */}
                {order.metadata?.error && (
                  <div className="mb-4 bg-red-50 p-3 rounded-md">
                    <h3 className="font-medium text-red-800 text-sm">Erro no Processamento</h3>
                    <p className="text-sm text-red-700 mt-1">{order.metadata.error}</p>
                  </div>
                )}

                {/* Mensagens de status do provedor */}
                {order.metadata?.provider_status && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Status do Provedor</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="text-sm font-medium">{order.metadata.provider_status.status || 'N/A'}</p>
                        </div>
                        {order.metadata.provider_status.remains !== undefined && (
                  <div>
                            <p className="text-xs text-gray-500">Restante</p>
                            <p className="text-sm font-medium">{order.metadata.provider_status.remains}</p>
                          </div>
                        )}
                        {order.metadata.provider_status.start_count !== undefined && (
                          <div>
                            <p className="text-xs text-gray-500">Contagem Inicial</p>
                            <p className="text-sm font-medium">{order.metadata.provider_status.start_count}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                    </div>
                  </div>
                </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Posts Section for Grouped Orders */}
            {order.metadata?.grouped && order.metadata.posts && order.metadata.posts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Posts ({order.metadata.posts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Link
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID Externo
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.metadata.posts.map((post, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <a 
                                href={post.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline"
                              >
                                {post.link.length > 40 ? `${post.link.substring(0, 40)}...` : post.link}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {post.quantity || Math.floor(order.quantity / order.metadata.posts!.length)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {post.external_order_id || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                post.status === 'completed' ? 'bg-green-100 text-green-800' :
                                post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                post.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {post.status || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Information */}
            {(order.status?.includes('error_') || order.metadata?.error || order.needs_admin_attention) && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50 border-b border-red-100">
                  <CardTitle className="text-red-700 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Informações de Erro
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-red-50 bg-opacity-30">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-red-800 mb-2">Mensagem de Erro</h3>
                      <p className="text-sm bg-white p-3 rounded border border-red-100">
                        {order.metadata?.error || 
                        order.metadata?.provider_response?.error || 
                        (order.status?.includes('error_') ? 
                          `Erro no processamento: ${order.status}` : 
                          'Este pedido precisa de atenção administrativa.')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800 mb-2">Possíveis Soluções</h3>
                      <ul className="text-sm space-y-2 bg-white p-3 rounded border border-red-100">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Verificar se o link do post está acessível e corresponde ao formato esperado pelo provedor.</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Confirmar se a conta-alvo existe e está pública (para serviços de seguidores).</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Verificar disponibilidade do serviço no provedor ou tentar reprocessar após alguns minutos.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Raw Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadados Brutos</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-xs">
                  {JSON.stringify(order.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Logs Section */}
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="logs">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ações</CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum registro de atividade encontrado para este pedido.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="border-b pb-4 mb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {log.action}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 