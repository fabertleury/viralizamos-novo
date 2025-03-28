'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import OrdersTable from './components/OrdersTable';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Filter, RefreshCw, CheckCircle, Clock, XCircle, AlertCircle, BarChart4, AlertTriangle, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import axios from 'axios';
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from '@/hooks/use-user';
import { Input } from '@/components/ui/input';
import { Order, OrderStatus } from '@/types';
import Select from 'react-select';
import React from 'react';
import Link from 'next/link';

// Remover as configurações de revalidação e dynamic que não funcionam em componentes cliente
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

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
    link: string;
    username?: string;
    post?: {
      shortcode: string;
      display_url: string;
    };
    provider: string | { id: string; name: string };
    provider_service_id: string;
    provider_order_id: string;
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
  };
  created_at: string;
  updated_at: string;
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
    customer_name?: string;
    customer_email?: string;
  };
}

export default function PedidosPage() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    canceled: 0,
    pending: 0,
    partial: 0
  });
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
    calculateStats();
  }, [orders, searchTerm, statusFilter, providerFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Buscando pedidos...');
      
      // Buscar os pedidos
      const { data, error } = await supabase
        .from('core_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        toast.error('Falha ao carregar pedidos: ' + error.message);
        setLoading(false);
        return;
      }
      
      console.log(`Encontrados ${data?.length || 0} pedidos`);
      
      // Buscar serviços relacionados
      const serviceIds = data?.filter(order => order.service_id).map(order => order.service_id) || [];
      let servicesMap = {};
      
      if (serviceIds.length > 0) {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .in('id', serviceIds);
          
        if (servicesError) {
          console.error('Erro ao buscar serviços:', servicesError);
        } else {
          servicesMap = services.reduce((acc, service) => {
            acc[service.id] = service;
            return acc;
          }, {});
          console.log(`Encontrados ${services.length} serviços relacionados`);
        }
      }
      
      // Buscar transações relacionadas
      const transactionIds = data?.filter(order => order.transaction_id).map(order => order.transaction_id) || [];
      let transactionsMap = {};
      
      if (transactionIds.length > 0) {
        const { data: transactions, error: transactionsError } = await supabase
          .from('core_transactions')
          .select('id, customer_name, customer_email, status, payment_method, payment_id, metadata')
          .in('id', transactionIds);
          
        if (transactionsError) {
          console.error('Erro ao buscar transações:', transactionsError);
        } else {
          transactionsMap = transactions.reduce((acc, transaction) => {
            acc[transaction.id] = transaction;
            return acc;
          }, {});
          console.log(`Encontradas ${transactions.length} transações relacionadas`);
          console.log('Exemplo de transação:', transactions[0]);
        }
      }
      
      // Buscar provedores relacionados
      const providerIds = data?.filter(order => order.provider_id).map(order => order.provider_id) || [];
      let providersMap = {};
      
      if (providerIds.length > 0) {
        const { data: providers, error: providersError } = await supabase
          .from('providers')
          .select('*')
          .in('id', providerIds);
          
        if (providersError) {
          console.error('Erro ao buscar provedores:', providersError);
        } else {
          providersMap = providers.reduce((acc, provider) => {
            acc[provider.id] = provider;
            return acc;
          }, {});
          console.log(`Encontrados ${providers.length} provedores relacionados`);
        }
      }
      
      // Converter para o formato esperado
      const mappedOrders = (data || []).map(order => {
        const service = servicesMap[order.service_id] || {};
        const transaction = transactionsMap[order.transaction_id] || {};
        const provider = providersMap[order.provider_id] || {};
        
        // Extrair o nome do cliente dos metadados da transação
        let customerName = '';
        if (transaction.metadata?.customer?.name) {
          customerName = transaction.metadata.customer.name;
        } else if (transaction.customer_name) {
          customerName = transaction.customer_name;
        }
        
        // Extrair o email do cliente dos metadados da transação
        let customerEmail = '';
        if (transaction.metadata?.customer?.email) {
          customerEmail = transaction.metadata.customer.email;
        } else if (transaction.metadata?.contact?.email) {
          customerEmail = transaction.metadata.contact.email;
        } else if (transaction.customer_email) {
          customerEmail = transaction.customer_email;
        }
        
        return {
          ...order,
          service: service ? {
            id: service.id,
            name: service.name,
            type: service.type
          } : undefined,
          transaction: transaction ? {
            id: transaction.id,
            customer_name: customerName,
            customer_email: customerEmail,
            metadata: transaction.metadata,
            status: transaction.status
          } : undefined,
          // Usar o status da transação como status de pagamento
          payment_status: transaction.status || order.payment_status || 'pending',
          payment_method: transaction.payment_method || order.payment_method,
          payment_id: transaction.payment_id || order.payment_id,
          // Se o status da transação for 'approved' ou 'completed', definir o status do pedido como 'completed'
          status: (transaction.status === 'approved' || transaction.status === 'completed') ? 'completed' : order.status
        }
      });
      
      setOrders(mappedOrders as Order[]);
      console.log('Pedidos mapeados com sucesso:', mappedOrders.length);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Falha ao carregar pedidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Aplicar filtro de pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(term) ||
        (order.external_order_id && order.external_order_id.toLowerCase().includes(term)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(term)) ||
        (order.target_username && order.target_username.toLowerCase().includes(term)) ||
        (order.service?.name && order.service.name.toLowerCase().includes(term)) ||
        (order.metadata?.provider && order.metadata.provider.toLowerCase().includes(term))
      );
    }

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Aplicar filtro de provedor
    if (providerFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.metadata?.provider && order.metadata.provider.toLowerCase() === providerFilter.toLowerCase()
      );
    }

    // Aplicar filtro de data
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= today;
        });
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= yesterday && orderDate < today;
        });
      } else if (dateFilter === 'last7days') {
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= last7Days;
        });
      } else if (dateFilter === 'last30days') {
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= last30Days;
        });
      }
    }

    setFilteredOrders(filtered);
  };

  const calculateStats = () => {
    const newStats = {
      total: orders.length,
      completed: orders.filter(order => order.status === 'completed').length,
      processing: orders.filter(order => order.status === 'processing').length,
      failed: orders.filter(order => order.status === 'failed').length,
      canceled: orders.filter(order => order.status === 'canceled').length,
      pending: orders.filter(order => order.status === 'pending').length,
      partial: orders.filter(order => order.status === 'partial').length
    };
    setStats(newStats);
  };

  // Extrair lista única de provedores para o filtro
  const getProviderName = (provider: unknown): string => {
    if (!provider) return 'Desconhecido';
    
    if (typeof provider === 'string') {
      return provider.toLowerCase();
    }
    
    if (typeof provider === 'object' && provider !== null) {
      const providerObj = provider as { id?: string; name?: string };
      if (providerObj.name) {
        return providerObj.name;
      }
      if (providerObj.id) {
        return providerObj.id;
      }
    }
    
    return 'Desconhecido';
  };
  
  const providers = ['all', ...Array.from(new Set(
    orders
      .filter(order => order.metadata?.provider)
      .map(order => getProviderName(order.metadata.provider))
  ))];

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProviderFilter('all');
    setDateFilter('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (providerFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    if (searchTerm) count++;
    return count;
  };

  const handleCheckStatus = async (orderId: string) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      // Buscar o pedido
      const { data: order } = await supabase
        .from('core_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) throw new Error('Pedido não encontrado');

      // Verificar o status da transação associada
      const { data: transaction, error: transactionError } = await supabase
        .from('core_transactions')
        .select('status')
        .eq('id', order.transaction_id)
        .single();

      if (transactionError) {
        console.error('Erro ao buscar status da transação:', transactionError);
      }

      // Se o status da transação for 'approved' ou 'completed', definir o status do pedido como 'completed'
      if (transaction && (transaction.status === 'approved' || transaction.status === 'completed')) {
        await supabase
          .from('core_orders')
          .update({ status: 'completed' })
          .eq('id', orderId);
        
        toast.success('Status atualizado para Concluído (baseado no pagamento)');
        await loadOrders();
        return;
      }

      // Obter o ID do provedor
      let providerId = order.provider_id;
      
      // Se não tiver provider_id direto, tentar pegar do metadata
      if (!providerId && order.metadata?.provider_id) {
        providerId = order.metadata.provider_id;
      }
      
      // Se ainda não tiver, tentar pegar do metadata.provider
      if (!providerId && order.metadata?.provider?.id) {
        providerId = order.metadata.provider.id;
      }
      
      // Se ainda não tiver, tentar usar o provider_name como fallback
      if (!providerId && order.metadata?.provider_name) {
        providerId = order.metadata.provider_name;
      }

      // Se ainda não tiver, usar o provider como string
      if (!providerId && typeof order.metadata?.provider === 'string') {
        providerId = order.metadata.provider;
      }
      
      if (!providerId) {
        toast.error('Pedido não tem provedor associado válido');
        return;
      }

      // Buscar os dados do provedor
      const { data: provider } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (!provider || !provider.api_key || !provider.api_url) {
        toast.error('Provedor não encontrado ou não configurado corretamente');
        return;
      }
      
      // Criar os parâmetros da requisição usando URLSearchParams
      const requestParams = new URLSearchParams();
      requestParams.append('key', provider.api_key);
      requestParams.append('action', 'status');
      requestParams.append('order', order.external_order_id.toString());
      
      console.log(`Verificando status do pedido ${order.external_order_id} no provedor ${provider.name || providerId}`);
      
      // Fazer a requisição para a API do provedor usando axios
      const response = await axios.post(provider.api_url, requestParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const responseData = response.data;
      console.log('Resposta do provedor:', responseData);
      
      // Verificar se a resposta contém um erro
      if (responseData.error) {
        toast.error(`Erro do provedor: ${responseData.error}`);
        return;
      }
      
      // Normalizar o status
      let orderStatus = responseData.status?.toLowerCase() || 'unknown';
      
      // Mapear o status para o formato usado pelo sistema
      if (orderStatus === 'completed' || orderStatus === 'complete') {
        orderStatus = 'completed';
      } else if (orderStatus === 'processing' || orderStatus === 'in progress' || orderStatus === 'inprogress') {
        orderStatus = 'processing';
      } else if (orderStatus === 'pending') {
        orderStatus = 'pending';
      } else if (orderStatus === 'partial') {
        orderStatus = 'partial';
      } else if (orderStatus === 'canceled' || orderStatus === 'cancelled') {
        orderStatus = 'canceled';
      } else if (orderStatus === 'failed' || orderStatus === 'error') {
        orderStatus = 'failed';
      }
      
      // Atualizar status do pedido no banco de dados
      await supabase
        .from('orders')
        .update({ 
          status: orderStatus,
          metadata: {
            ...order.metadata,
            provider_status: {
              status: responseData.status?.toLowerCase() || 'unknown',
              start_count: responseData.start_count || '0',
              remains: responseData.remains || '0',
              charge: responseData.charge || '0',
              currency: responseData.currency || 'USD',
              updated_at: new Date().toISOString()
            }
          } 
        })
        .eq('id', orderId);

      toast.success(`Status atualizado: ${orderStatus}`);
      
      // Recarregar pedidos
      await loadOrders();
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      
      // Melhorar a mensagem de erro exibida para o usuário
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          toast.error('Não foi possível conectar ao servidor do provedor. Verifique se a URL está correta e acessível.');
        } else if (error.response) {
          toast.error(`Erro na resposta do servidor: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          toast.error('Não houve resposta do servidor do provedor. Verifique a conexão.');
        } else {
          toast.error(`Erro na requisição: ${error.message}`);
        }
      } else {
        toast.error(error instanceof Error ? error.message : 'Erro ao verificar status');
      }
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  const viewOrderDetails = (orderId: string) => {
    router.push(`/admin/pedidos/${orderId}`);
  };

  function getStatusBadge(status: string) {
    if (!status) return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Desconhecido</Badge>;
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'approved':
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
      case 'failed':
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      case 'processing':
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><RefreshCw className="h-3 w-3 mr-1" /> Processando</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><AlertTriangle className="h-3 w-3 mr-1" /> Parcial</Badge>;
      case 'canceled':
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><XCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">{status}</Badge>;
    }
  }

  if (loading && !orders.length) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="p-4 max-w-full">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Pedidos</h1>
            <button
              onClick={loadOrders}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full sm:w-auto"
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
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <BarChart4 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total de Pedidos</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Concluídos</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% do total
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Em Processamento</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.processing}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.processing / stats.total) * 100) : 0}% do total
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Falhas/Cancelados</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.failed + stats.canceled}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round(((stats.failed + stats.canceled) / stats.total) * 100) : 0}% do total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-gray-700">Filtros</h2>
            {(statusFilter !== 'all' || providerFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar pedidos..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro de Status */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="completed">Concluído</option>
                <option value="failed">Falhou</option>
                <option value="canceled">Cancelado</option>
                <option value="partial">Parcial</option>
              </select>
            </div>

            {/* Filtro de Provedor */}
            <div>
              <label htmlFor="provider-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Provedor
              </label>
              <select
                id="provider-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              >
                <option value="all">Todos os Provedores</option>
                {providers.filter(p => p !== 'all').map((provider) => (
                  <option key={provider} value={provider}>
                    {provider === 'unknown' ? 'Desconhecido' : 
                     provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Data */}
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <select
                id="date-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Todas as Datas</option>
                <option value="today">Hoje</option>
                <option value="yesterday">Ontem</option>
                <option value="last7days">Últimos 7 dias</option>
                <option value="last30days">Últimos 30 dias</option>
              </select>
            </div>
          </div>
          
          {/* Resumo dos filtros */}
          <div className="mt-4 flex flex-wrap items-center justify-between border-t pt-4">
            <div className="flex items-center text-sm text-gray-700 mb-2 sm:mb-0">
              <span className="font-medium mr-2">{filteredOrders.length}</span> 
              pedidos encontrados
              {filteredOrders.length !== orders.length && (
                <span className="ml-1 text-gray-500">
                  (de <span className="font-medium">{orders.length}</span> total)
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button 
                    onClick={() => setStatusFilter('all')} 
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </span>
              )}
              
              {providerFilter !== 'all' && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  Provedor: {providerFilter.charAt(0).toUpperCase() + providerFilter.slice(1)}
                  <button 
                    onClick={() => setProviderFilter('all')} 
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    &times;
                  </button>
                </span>
              )}
              
              {dateFilter !== 'all' && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Data: {
                    dateFilter === 'today' ? 'Hoje' : 
                    dateFilter === 'yesterday' ? 'Ontem' : 
                    dateFilter === 'last7days' ? 'Últimos 7 dias' : 
                    'Últimos 30 dias'
                  }
                  <button 
                    onClick={() => setDateFilter('all')} 
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    &times;
                  </button>
                </span>
              )}
              
              {searchTerm && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Busca: "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="ml-1 text-amber-600 hover:text-amber-800"
                  >
                    &times;
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <Filter className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros ou realizar uma nova busca.
              </p>
              {getActiveFiltersCount() > 0 && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div className="flex items-center">
                  <h2 className="text-base font-semibold leading-6 text-gray-900">Pedidos dos Clientes</h2>
                  <p className="ml-4 text-sm text-gray-500 hidden sm:block">
                    Acompanhe todos os pedidos realizados no sistema
                  </p>
                </div>
                <button
                  onClick={loadOrders}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
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
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      // Determinar provedor
                      const providerName = order.metadata?.provider_name || 
                        (typeof order.metadata?.provider === 'string' ? 
                          order.metadata.provider : 
                          order.metadata?.provider?.name || 'N/A');
                          
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                          <TableCell>{order.service?.name || "N/A"}</TableCell>
                          <TableCell>
                            {order.transaction?.customer_name || 
                             order.transaction?.customer_email || 
                             order.user?.email || 
                             "Cliente não identificado"}
                          </TableCell>
                          <TableCell>
                            {order.target_username ? (
                              <a 
                                href={`https://instagram.com/${order.target_username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                @{order.target_username}
                              </a>
                            ) : "N/A"}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell>{providerName}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCheckStatus(order.id)}
                                disabled={updatingStatus[order.id]}
                              >
                                {updatingStatus[order.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewOrderDetails(order.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pedido encontrado
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
