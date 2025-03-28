'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  UserGroupIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ProvidersStatusCard } from './components/ProvidersStatusCard';
import { ScrapAPIBalanceCard } from './components/ScrapAPIBalanceCard';
import DuplicateOrdersTable from "../componentes/DuplicateOrdersTable";

interface Stats {
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
  openTickets: number;
  recentOrders: Array<{
    id: string;
    created_at: string;
    amount: number;
    status: string;
    status_text?: string;
    target_username?: string;
    external_order_id?: string;
    customer?: {
      id: string;
      name: string;
      email: string;
    };
    service?: {
      id: string;
      name: string;
      type: string;
    };
  }>;
  recentTickets: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    user: {
      id: string;
      name: string;
    };
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalOrders: 0,
    totalRevenue: 0,
    openTickets: 0,
    recentOrders: [],
    recentTickets: [],
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Total de Clientes - agora usando a tabela 'customers' em vez de 'profiles'
      const { data: clients } = await supabase
        .from('customers')
        .select('*');

      const totalClients = clients?.length || 0;

      // Total de Pedidos e Receita - usando as novas tabelas core_orders
      const { data: orders } = await supabase
        .from('core_orders')
        .select('amount');
      
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

      // Tickets Abertos
      const { count: ticketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Pedidos Recentes - utilizando core_orders com join para customers
      const { data: recentOrdersData } = await supabase
        .from('core_orders')
        .select(`
          id,
          created_at,
          amount,
          status,
          status_text,
          target_username,
          external_order_id,
          customer:customers(
            id,
            name,
            email
          ),
          service:services(
            id,
            name,
            type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      // Processar os pedidos recentes para corrigir a estrutura de dados
      const recentOrders = recentOrdersData?.map(order => ({
        id: order.id,
        created_at: order.created_at,
        amount: order.amount,
        status: order.status,
        status_text: order.status_text,
        target_username: order.target_username,
        external_order_id: order.external_order_id,
        customer: order.customer?.[0] || null,
        service: order.service?.[0] || null
      })) || [];

      // Tickets Recentes
      const { data: recentTicketsData } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          status,
          created_at,
          user:profiles(
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      // Processar os tickets recentes para corrigir a estrutura de dados
      const recentTickets = recentTicketsData?.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        created_at: ticket.created_at,
        user: ticket.user?.[0] || null
      })) || [];

      // Receita Mensal (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlyOrders } = await supabase
        .from('core_orders')
        .select('created_at, amount')
        .gte('created_at', sixMonthsAgo.toISOString());

      const monthlyRevenue = monthlyOrders?.reduce((acc: {month: string; revenue: number}[], order) => {
        const month = new Date(order.created_at).toLocaleString('pt-BR', { month: 'long' });
        const existingMonth = acc.find(m => m.month === month);
        if (existingMonth) {
          existingMonth.revenue += order.amount || 0;
        } else {
          acc.push({ month, revenue: order.amount || 0 });
        }
        return acc;
      }, []) || [];

      setStats({
        totalClients,
        totalOrders,
        totalRevenue,
        openTickets: ticketsCount || 0,
        recentOrders,
        recentTickets,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total de Clientes</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalClients}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingCartIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total de Pedidos</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalOrders}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Receita Total</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            R$ {stats.totalRevenue.toFixed(2)}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Tickets Abertos</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.openTickets}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Status das APIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProvidersStatusCard />
              <ScrapAPIBalanceCard />
            </div>

            {/* Seção de pedidos duplicados */}
            <div className="mt-8">
              <DuplicateOrdersTable />
            </div>

            {/* Gráficos e Listas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pedidos Recentes */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Pedidos Recentes
                  </h3>
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {stats.recentOrders.map((order, orderIdx) => (
                        <li key={order.id}>
                          <div className="relative pb-8">
                            {orderIdx !== stats.recentOrders.length - 1 ? (
                              <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={classNames(
                                    order.status === 'completed' ? 'bg-green-500' :
                                    order.status === 'failed' ? 'bg-red-500' :
                                    order.status === 'pending' ? 'bg-yellow-500' :
                                    order.status === 'processing' ? 'bg-blue-500' :
                                    'bg-gray-500',
                                    'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                                  )}
                                >
                                  <ShoppingCartIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">
                                      {order.service?.name || 'Serviço Desconhecido'}
                                    </span> para{' '}
                                    <span className="font-medium text-indigo-600">
                                      {order.customer?.name || 'Cliente'}
                                    </span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {order.target_username && 
                                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-2">
                                        @{order.target_username}
                                      </span>
                                    }
                                    {order.external_order_id && 
                                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                        #{order.external_order_id}
                                      </span>
                                    }
                                  </p>
                                </div>
                                <div className="flex flex-col whitespace-nowrap text-right text-sm">
                                  <time dateTime={order.created_at} className="text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                  </time>
                                  <span 
                                    className={classNames(
                                      'inline-flex items-center rounded-md mt-1 px-2 py-1 text-xs font-medium',
                                      order.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                      order.status === 'failed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                      order.status === 'processing' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                      'bg-gray-50 text-gray-700 ring-gray-600/20'
                                    )}
                                  >
                                    {order.status_text || order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Tickets Recentes */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Tickets Recentes
                  </h3>
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {stats.recentTickets.map((ticket, ticketIdx) => (
                        <li key={ticket.id}>
                          <div className="relative pb-8">
                            {ticketIdx !== stats.recentTickets.length - 1 ? (
                              <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={classNames(
                                    ticket.status === 'open' ? 'bg-yellow-500' : 'bg-green-500',
                                    'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                                  )}
                                >
                                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {ticket.title}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    por {ticket.user?.name || 'Usuário Removido'}
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  <time dateTime={ticket.created_at}>
                                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
