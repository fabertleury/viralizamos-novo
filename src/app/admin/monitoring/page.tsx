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
  const [statsData, setStatsData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncingTransactions, setSyncingTransactions] = useState(false);

  // Função para carregar dados
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

  // Função para sincronizar transações
  const syncTransactions = async () => {
    setSyncingTransactions(true);
    try {
      const response = await fetch('/api/admin/monitoring/sync-transactions', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Sincronização concluída! ${data.synced} transações sincronizadas.`);
        // Recarregar dados
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erro ao sincronizar: ${error.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert(`Erro ao sincronizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.error('Erro na sincronização:', error);
    } finally {
      setSyncingTransactions(false);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Preparar dados para gráficos
  const transactionStatusChart = statsData.transactionsByStatus?.map((item: Record<string, any>) => ({
    name: item.status || 'unknown',
    count: item.count
  })) || [];

  const ordersByProviderChart = statsData.ordersByProvider?.map((item: Record<string, any>) => ({
    name: item.provider_id || 'unknown',
    count: item.count
  })) || [];
  
  const duplicatesTrendChart = statsData.duplicatesTrend || [];
  
  const webhookPerformanceChart = statsData.webhookPerformance || [];

  // Função para filtrar transações por status
  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      // Aplicar filtro de pesquisa
      const matchesSearch = searchTerm === '' || 
        tx.id.includes(searchTerm) || 
        (tx.payment_id && tx.payment_id.includes(searchTerm));
      
      // Aplicar filtro de status
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Botões com estilo rosa padrão do site
  const StyledButton = ({ children, onClick, disabled, active, className = "" }) => (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className={`transition-all duration-300 ease-in-out ${
        active 
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
          : 'bg-white hover:bg-gray-100 text-gray-800'
      } ${className}`}
    >
      {children}
    </Button>
  );

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Painel de Monitoramento do Sistema</h1>
        <p className="text-gray-500">
          Monitore transações, pedidos, integrações e problemas de duplicação em tempo real
        </p>
        
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2">
            <StyledButton 
              onClick={() => setTimeRange('24h')}
              active={timeRange === '24h'}
            >
              24 horas
            </StyledButton>
            <StyledButton 
              onClick={() => setTimeRange('7d')}
              active={timeRange === '7d'}
            >
              7 dias
            </StyledButton>
            <StyledButton 
              onClick={() => setTimeRange('30d')}
              active={timeRange === '30d'}
            >
              30 dias
            </StyledButton>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por ID, URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            
            <StyledButton 
              onClick={syncTransactions}
              disabled={syncingTransactions}
              active={true}
              className="font-medium"
            >
              {syncingTransactions ? 'Sincronizando...' : 'Sincronizar Transações'}
            </StyledButton>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      
      {/* Tabs for different data views - com estilo customizado */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-transparent p-0 rounded-lg">
          {['dashboard', 'transactions', 'orders', 'integrations', 'duplicates'].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className={`py-3 data-[state=active]:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-medium rounded-lg`}
            >
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'transactions' && 'Transações'}
              {tab === 'orders' && 'Pedidos'}
              {tab === 'integrations' && 'Integrações'}
              {tab === 'duplicates' && 'Duplicações'}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Status de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactionStatusChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Quantidade" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transactionStatusChart}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        labelLine={true}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {transactionStatusChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Pedidos por Provedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByProviderChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Quantidade" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance de Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={webhookPerformanceChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="time" name="Tempo (ms)" stroke="#8884d8" />
                      <Line type="monotone" dataKey="count" name="Quantidade" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Input
                  placeholder="Buscar por ID ou Payment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                <select
                  className="p-2 border rounded-md text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovadas</option>
                  <option value="processing">Em processamento</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="error">Com erro</option>
                </select>
              </div>
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
                    {getFilteredTransactions()
                      .slice(0, 20)
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
                                tx.status === 'processing' ? 'bg-blue-500' :
                                tx.status === 'cancelled' ? 'bg-gray-500' :
                                'bg-gray-500'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell>R$ {tx.amount ? Number(tx.amount).toFixed(2) : '0.00'}</TableCell>
                          <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button 
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                              size="sm" 
                              onClick={() => window.open(`/admin/transacoes/${tx.id}`, '_blank')}
                            >
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              {getFilteredTransactions().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma transação encontrada com os filtros aplicados
                </div>
              )}
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
                      <TableHead>Status</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>URL Alvo</TableHead>
                      <TableHead>Data</TableHead>
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
                          <TableCell>{order.transaction_id?.substring(0, 8) || 'N/A'}</TableCell>
                          <TableCell>{order.provider_id || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                order.status === 'completed' ? 'bg-green-500' :
                                order.status === 'pending' ? 'bg-yellow-500' :
                                order.status === 'failed' ? 'bg-red-500' :
                                order.status === 'processing' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.quantity || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {order.target_url ? (
                              <a 
                                href={order.target_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {order.target_url}
                              </a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
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
                      <TableHead>Mensagem de Erro</TableHead>
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
                            <Button 
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                              size="sm"
                              onClick={() => alert(`Detalhes da integração ${integ.id}`)}
                            >
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {integrations.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma integração encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Duplicates Tab */}
        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <CardTitle>Potenciais Duplicações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>Último Pedido</TableHead>
                      <TableHead>Transação</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>URL Alvo</TableHead>
                      <TableHead>Ocorrências</TableHead>
                      <TableHead>Detectado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duplicates
                      .filter(dup => 
                        searchTerm === '' || 
                        dup.hash_key.includes(searchTerm) || 
                        (dup.order_id && dup.order_id.includes(searchTerm)) ||
                        (dup.transaction_id && dup.transaction_id.includes(searchTerm))
                      )
                      .slice(0, 10)
                      .map(dup => (
                        <TableRow key={dup.id}>
                          <TableCell className="font-medium">{dup.hash_key.substring(0, 8)}...</TableCell>
                          <TableCell>{dup.order_id?.substring(0, 8) || 'N/A'}</TableCell>
                          <TableCell>{dup.transaction_id?.substring(0, 8) || 'N/A'}</TableCell>
                          <TableCell>{dup.provider_id || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {dup.target_url ? (
                              <a 
                                href={dup.target_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {dup.target_url}
                              </a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{dup.count}</Badge>
                          </TableCell>
                          <TableCell>{new Date(dup.first_seen).toLocaleString()}</TableCell>
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