'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Search,
  RefreshCw,
  Download,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ManualTransactionCard } from '@/components/admin/ManualTransactionCard';

interface Transaction {
  id: string;
  created_at: string;
  status: string;
  amount: number;
  payment_method?: string;
  customer_name?: string;
  customer_email?: string;
  service_id?: string;
  service?: {
    name: string;
  };
  orders?: {
    id: string;
    status: string;
    provider_id?: string;
    metadata?: Record<string, unknown>;
    needs_admin_attention?: boolean;
    status_provider?: string;
    external_order_id?: string;
  }[];
  manual_transaction?: boolean;
  status_provider?: string;
  external_order_id?: string;
}

// Definir interface para um Order para resolver o erro de tipagem
interface Order {
  id: string;
  transaction_id: string;
  status: string;
  provider_id?: string;
  metadata?: Record<string, unknown>;
  provider_order_id?: string;
  last_status_response?: { status?: string };
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchTransactions();
    
    // Atualizar a cada 4 minutos
    const intervalId = setInterval(fetchTransactions, 240000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Filtrar transações baseadas no termo de busca
  const filteredTransactions = transactions.filter(transaction => {
    const term = searchTerm.toLowerCase();
    return (
      transaction.id.toLowerCase().includes(term) ||
      (transaction.customer_name && transaction.customer_name.toLowerCase().includes(term)) ||
      (transaction.customer_email && transaction.customer_email.toLowerCase().includes(term)) ||
      (transaction.service?.name && transaction.service.name.toLowerCase().includes(term)) ||
      (transaction.payment_method && transaction.payment_method.toLowerCase().includes(term))
    );
  });

  async function fetchTransactions() {
    try {
      setLoading(true);
      
      console.log('Buscando transações...');
      
      // Primeiro, vamos verificar se a tabela core_transactions_v2 existe
      const { count, error: countError } = await supabase
        .from('core_transactions_v2')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('Erro ao verificar a existência da tabela core_transactions_v2:', countError);
        toast.error('Erro ao acessar a tabela de transações');
        setLoading(false);
        return;
      }
      
      console.log('Contagem de transações disponíveis:', count);
      
      // Agora vamos buscar as transações
      const { data, error } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) {
        console.error('Erro ao buscar transações:', error);
        toast.error(`Erro: ${error.message || 'Erro desconhecido'}`);
        setLoading(false);
        return;
      }
      
      console.log(`Encontradas ${data?.length || 0} transações`);
      
      // Buscar informações dos serviços relacionados
      const serviceIds = data?.filter(t => t.service_id).map(t => t.service_id) || [];
      let servicesMap = {};
      
      if (serviceIds.length > 0) {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id, name, type, preco')
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
      
      // Buscar pedidos relacionados
      const transactionIds = data?.map(t => t.id) || [];
      let ordersMap = {};
      
      if (transactionIds.length > 0) {
        const { data: orders, error: ordersError } = await supabase
          .from('core_orders')
          .select('*')
          .in('transaction_id', transactionIds);
          
        if (ordersError) {
          console.error('Erro ao buscar pedidos:', ordersError);
        } else {
          ordersMap = transactionIds.reduce((acc, transId) => {
            acc[transId] = orders.filter(order => order.transaction_id === transId);
            return acc;
          }, {});
          console.log(`Encontrados ${orders.length} pedidos relacionados`);
        }
      }
      
      // Buscar usuários/clientes relacionados
      const userIds = data?.filter(t => t.user_id).map(t => t.user_id) || [];
      let usersMap = {};
      
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('auth.users')
          .select('id, email')
          .in('id', userIds);
          
        if (usersError) {
          console.error('Erro ao buscar usuários:', usersError);
        } else if (users) {
          usersMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
          console.log(`Encontrados ${users.length} usuários relacionados`);
        }
      }
      
      // Mapear os dados completos
      const mappedTransactions = data?.map(trans => {
        const service = servicesMap[trans.service_id] || null;
        const orders = ordersMap[trans.id] || [];
        
        // Formatador da visualização do cliente
        const displayCustomerName = trans.customer_name || 'Cliente não identificado';
        const displayCustomerEmail = trans.customer_email || '';
        
        return {
          id: trans.id,
          created_at: trans.created_at,
          status: trans.status,
          amount: trans.amount * 100, // Converter para centavos para manter compatibilidade
          payment_method: trans.payment_method,
          customer_name: displayCustomerName,
          customer_email: displayCustomerEmail,
          service_id: trans.service_id,
          service: service ? {
            id: service.id,
            name: service.name,
            type: service.type
          } : null,
          orders: orders.map(order => ({
            id: order.id,
            status: order.status,
            provider_id: order.provider_id,
            metadata: order.metadata,
            needs_admin_attention: order.status?.includes('failed') || order.status?.includes('error'),
            status_provider: order.metadata?.provider_status?.status || 
                            order.metadata?.provider_response?.status ||
                            null,
            external_order_id: order.provider_order_id || order.metadata?.provider_order_id
          })),
          manual_transaction: trans.is_manual
        };
      }) || [];
      
      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Erro inesperado ao buscar transações:', error);
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Ocorreu um erro ao buscar as transações'}`);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
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

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  }
  
  function formatDate(date: string) {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  }
  
  function hasErrorOrders(transaction: Transaction) {
    return transaction.orders?.some(order => order.status?.includes('error_'));
  }

  function exportToCSV() {
    try {
      // Cabeçalhos do CSV
      const headers = [
        'ID', 
        'Data', 
        'Status', 
        'Valor',
        'Cliente',
        'Email',
        'Serviço',
        'Método'
      ].join(',');
      
      // Converter cada transação para uma linha CSV
      const rows = filteredTransactions.map(t => {
        const fields = [
          `"${t.id}"`,
          `"${t.created_at}"`, 
          `"${t.status}"`,
          t.amount/100,
          `"${t.customer_name || ''}"`,
          `"${t.customer_email || ''}"`,
          `"${t.service?.name || ''}"`,
          `"${t.payment_method || ''}"`,
        ];
        return fields.join(',');
      });
      
      // Juntar tudo em uma string CSV
      const csv = [headers, ...rows].join('\n');
      
      // Criar um Blob e um link para download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `transacoes_${date}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Relatório de transações exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar transações');
    }
  }

  function handleOpenDetails(clickedTransaction: Transaction) {
    router.push(`/admin/transacoes/${clickedTransaction.id}`);
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="text-sm text-muted-foreground">Gerenciamento de transações e pagamentos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Manual
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar por ID, cliente, email, serviço..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin text-muted-foreground h-8 w-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-medium">Nenhuma transação encontrada</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm 
              ? 'Não há transações correspondentes à sua busca'
              : 'Não há transações registradas no sistema'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Status Provedor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className={
                    hasErrorOrders(transaction) 
                      ? "bg-red-50 hover:bg-red-100"
                      : undefined
                  }
                >
                  <TableCell className="font-mono text-xs">
                    {transaction.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {formatDate(transaction.created_at)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium truncate max-w-[150px]">
                        {transaction.customer_name || 'N/A'}
                      </p>
                      {transaction.customer_email && (
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {transaction.customer_email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.service?.name || 'Serviço não identificado'}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    {transaction.orders && transaction.orders.length > 0 ? (
                      <div>
                        {transaction.orders.find(order => order.status_provider)?.status_provider ? (
                          <>
                            {getStatusBadge(transaction.orders.find(order => order.status_provider)?.status_provider || '')}
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {transaction.orders.find(order => order.external_order_id)?.external_order_id || 'N/A'}
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-400 text-xs">Status não disponível</span>
                            {transaction.orders.find(order => order.external_order_id) && (
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {transaction.orders.find(order => order.external_order_id)?.external_order_id || 'N/A'}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Não disponível</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenDetails(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ManualTransactionCard
            onClose={() => setShowCreateModal(false)}
            onTransactionCreated={(newTransaction: any) => {
              setTransactions([newTransaction, ...transactions]);
              setShowCreateModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
