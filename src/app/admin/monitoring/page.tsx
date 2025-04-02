'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Tipos
interface Transaction {
  id: string;
  payment_id: string | null;
  status: string | null;
  amount: number | null;
  created_at: string;
  metadata: any;
  logged_at: string;
}

interface Order {
  id: string;
  transaction_id: string | null;
  provider_id: string | null;
  service_id: string | null;
  quantity: number | null;
  status: string | null;
  target_url: string | null;
  created_at: string;
  provider_response: any;
  logged_at: string;
}

interface Integration {
  id: number;
  order_id: string | null;
  transaction_id: string | null;
  provider_id: string | null;
  request_data: any;
  response_data: any;
  status: string | null;
  error_message: string | null;
  created_at: string;
}

interface Duplicate {
  id: number;
  hash_key: string;
  transaction_id: string;
  order_id: string | null;
  target_url: string | null;
  service_id: string | null;
  provider_id: string | null;
  first_seen: string;
  last_seen: string;
  count: number;
}

interface Webhook {
  id: number;
  webhook_type: string;
  source: string;
  payload: any;
  processed: boolean;
  status_code: number | null;
  response_body: any;
  processing_time: number | null;
  received_at: string;
  processed_at: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

export default function MonitoringDashboard() {
  // Estados para dados
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [statsData, setStatsData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');

  // Função para carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados de transações
        const transactionsResponse = await fetch(`/api/admin/monitoring/transactions?timeRange=${timeRange}`);
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
        
        // Buscar dados de pedidos
        const ordersResponse = await fetch(`/api/admin/monitoring/orders?timeRange=${timeRange}`);
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
        
        // Buscar dados de integrações
        const integrationsResponse = await fetch(`/api/admin/monitoring/integrations?timeRange=${timeRange}`);
        const integrationsData = await integrationsResponse.json();
        setIntegrations(integrationsData.integrations || []);
        
        // Buscar dados de duplicações
        const duplicatesResponse = await fetch(`/api/admin/monitoring/duplicates?timeRange=${timeRange}`);
        const duplicatesData = await duplicatesResponse.json();
        setDuplicates(duplicatesData.duplicates || []);
        
        // Buscar dados de webhooks
        const webhooksResponse = await fetch(`/api/admin/monitoring/webhooks?timeRange=${timeRange}`);
        const webhooksData = await webhooksResponse.json();
        setWebhooks(webhooksData.webhooks || []);
        
        // Buscar estatísticas
        const statsResponse = await fetch(`/api/admin/monitoring/stats?timeRange=${timeRange}`);
        const statsData = await statsResponse.json();
        setStatsData(statsData);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Preparar dados para gráficos
  const transactionStatusChart = statsData.transactionsByStatus?.map((item: any) => ({
    name: item.status || 'unknown',
    count: item.count
  })) || [];

  const ordersByProviderChart = statsData.ordersByProvider?.map((item: any) => ({
    name: item.provider_id || 'unknown',
    count: item.count
  })) || [];
  
  const duplicatesTrendChart = statsData.duplicatesTrend || [];
  
  const webhookPerformanceChart = statsData.webhookPerformance || [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Painel de Monitoramento do Sistema</h1>
        <p className="text-gray-500">
          Monitore transações, pedidos, integrações e problemas de duplicação em tempo real
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant={timeRange === '24h' ? 'default' : 'outline'} 
              onClick={() => setTimeRange('24h')}
            >
              24 horas
            </Button>
            <Button 
              variant={timeRange === '7d' ? 'default' : 'outline'} 
              onClick={() => setTimeRange('7d')}
            >
              7 dias
            </Button>
            <Button 
              variant={timeRange === '30d' ? 'default' : 'outline'} 
              onClick={() => setTimeRange('30d')}
            >
              30 dias
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por ID, URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statsData.transactionsGrowth > 0 ? '+' : ''}{statsData.transactionsGrowth || 0}% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statsData.ordersGrowth > 0 ? '+' : ''}{statsData.ordersGrowth || 0}% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {statsData.successRateChange > 0 ? '+' : ''}{statsData.successRateChange || 0}% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicações Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalDuplicates || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statsData.duplicatesChange > 0 ? '+' : ''}{statsData.duplicatesChange || 0}% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different data views */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicações</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Transações por Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transactionStatusChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {transactionStatusChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pedidos por Provedor</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByProviderChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Duplicações</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={duplicatesTrendChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#ff8042" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance de Webhooks</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={webhookPerformanceChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="time" stroke="#0088FE" />
                    <Line type="monotone" dataKey="count" stroke="#00C49F" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .filter(tx => 
                        searchTerm === '' || 
                        tx.id.includes(searchTerm) || 
                        (tx.payment_id && tx.payment_id.includes(searchTerm))
                      )
                      .slice(0, 10)
                      .map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">{tx.id.substring(0, 8)}...</TableCell>
                          <TableCell>{tx.payment_id}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                tx.status === 'approved' ? 'bg-green-500' :
                                tx.status === 'pending' ? 'bg-yellow-500' :
                                tx.status === 'error' ? 'bg-red-500' :
                                'bg-gray-500'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell>R$ {tx.amount?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => alert(`Detalhes da transação ${tx.id}`)}>
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Transação</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter(order => 
                        searchTerm === '' || 
                        order.id.includes(searchTerm) || 
                        (order.transaction_id && order.transaction_id.includes(searchTerm)) ||
                        (order.target_url && order.target_url.includes(searchTerm))
                      )
                      .slice(0, 10)
                      .map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                          <TableCell>{order.transaction_id?.substring(0, 8)}</TableCell>
                          <TableCell>{order.provider_id}</TableCell>
                          <TableCell>{order.service_id}</TableCell>
                          <TableCell className="max-w-xs truncate">{order.target_url}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                order.status === 'completed' ? 'bg-green-500' :
                                order.status === 'processing' ? 'bg-blue-500' :
                                order.status === 'pending' ? 'bg-yellow-500' :
                                order.status === 'error' ? 'bg-red-500' :
                                'bg-gray-500'
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => alert(`Detalhes do pedido ${order.id}`)}>
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrações com Provedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erro</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations
                      .filter(integ => 
                        searchTerm === '' || 
                        (integ.order_id && integ.order_id.includes(searchTerm)) ||
                        (integ.transaction_id && integ.transaction_id.includes(searchTerm)) ||
                        (integ.provider_id && integ.provider_id.includes(searchTerm))
                      )
                      .slice(0, 10)
                      .map(integ => (
                        <TableRow key={integ.id}>
                          <TableCell className="font-medium">{integ.id}</TableCell>
                          <TableCell>{integ.order_id?.substring(0, 8)}</TableCell>
                          <TableCell>{integ.provider_id}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                integ.status === 'success' ? 'bg-green-500' :
                                integ.status === 'pending' ? 'bg-yellow-500' :
                                integ.status === 'error' ? 'bg-red-500' :
                                'bg-gray-500'
                              }
                            >
                              {integ.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{integ.error_message}</TableCell>
                          <TableCell>{new Date(integ.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => alert(`Detalhes da integração ${integ.id}`)}>
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Duplicates Tab */}
        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <CardTitle>Possíveis Duplicações Detectadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>Transação</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Contagem</TableHead>
                      <TableHead>Primeira vez</TableHead>
                      <TableHead>Última vez</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duplicates
                      .filter(dup => 
                        searchTerm === '' || 
                        dup.hash_key.includes(searchTerm) ||
                        dup.transaction_id.includes(searchTerm) ||
                        (dup.target_url && dup.target_url.includes(searchTerm))
                      )
                      .slice(0, 10)
                      .map(dup => (
                        <TableRow key={dup.id}>
                          <TableCell className="font-medium">{dup.hash_key.substring(0, 8)}...</TableCell>
                          <TableCell>{dup.transaction_id.substring(0, 8)}</TableCell>
                          <TableCell className="max-w-xs truncate">{dup.target_url}</TableCell>
                          <TableCell>{dup.service_id}</TableCell>
                          <TableCell>{dup.provider_id}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                dup.count > 3 ? 'bg-red-500' :
                                dup.count > 1 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }
                            >
                              {dup.count}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(dup.first_seen).toLocaleString()}</TableCell>
                          <TableCell>{new Date(dup.last_seen).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => alert(`Análise de duplicação ${dup.hash_key}`)}>
                              Analisar
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 