'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  FileText, 
  ExternalLink, 
  LinkIcon,
  UserIcon,
  PackageIcon,
  Send,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

// Melhorar as definições de tipo
interface Order {
  id: string;
  transaction_id: string;
  provider_id?: string;
  status?: string;
  status_provider?: string;
  quantity: number;
  target?: string;
  target_username?: string;
  link?: string;
  external_order_id?: string;
  error_message?: string;
  needs_admin_attention?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  sent_to_provider?: boolean;
  provider_response?: {
    order?: number;
    orderId?: number;
    status?: string;
    message?: string;
  };
  provider_request?: {
    service?: number;
    link?: string;
    quantity?: number;
    transaction_id?: string;
    target_username?: string;
    key?: string;
    action?: string;
  };
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

// Adicionar a interface para logs
interface TransactionLog {
  id: string;
  transaction_id: string;
  message: string;
  created_at: string;
  level: 'info' | 'warning' | 'error';
  metadata?: Record<string, unknown>; // Melhor tipagem para metadata
}

interface Transaction {
  id: string;
  created_at: string;
  status: string | null;
  amount?: number;
  payment_method?: string;
  service_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  target_username?: string;
  target_profile_link?: string;
  customer_links?: string[];
  service?: {
    id?: string;
    name?: string;
    price?: number;
    preco?: number;
    description?: string;
    type?: string;
    provider_id?: string;
    external_id?: string;
  };
  metadata?: {
    customer?: {
      name?: string;
    };
    contact?: {
      email?: string;
      phone?: string;
    };
    username?: string;
    service?: {
      name?: string;
    };
    [key: string]: any;
  };
  orders?: Order[];
  logs?: TransactionLog[];
  processing?: {
    status: string;
    attempts?: number;
    locked_until?: string;
    created_at: string;
  }[];
  webhookCallbacks?: {
    provider: string;
    success: boolean;
    created_at: string;
    action?: string;
  }[];
  posts?: {
    id: string;
    transaction_id: string;
    content: string;
    created_at: string;
  }[];
}

interface TransactionDetailsClientProps {
  id: string;
}

export default function TransactionDetailsClient({ id }: TransactionDetailsClientProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  async function fetchTransactionDetails() {
    try {
      setLoading(true);
      setErrorFeedback(null);
      
      // Buscar detalhes da transação na tabela nova
      const { data: transaction, error } = await supabase
        .from('core_transactions_v2')
        .select(`
          *,
          service:service_id (
            id,
            name,
            description,
            type,
            preco,
            provider_id,
            external_id
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar transação:', error);
        toast.error('Erro ao carregar detalhes da transação');
        setErrorFeedback(`Erro ao buscar transação: ${error.message}`);
        return;
      }
      
      console.log('Dados da transação:', transaction);
      
      // Buscar pedidos associados
      const { data: orders, error: ordersError } = await supabase
        .from('core_orders')
        .select('*, service:service_id(*)')
        .eq('transaction_id', id);
      
      if (ordersError) {
        console.error('Erro ao buscar pedidos:', ordersError);
        setErrorFeedback(`Erro ao buscar pedidos: ${ordersError.message}`);
      }
      
      // Buscar logs de processamento na tabela correta: core_processing_logs
      let processingLogs = [];
      try {
        const { data: logsData, error: logsError } = await supabase
          .from('core_processing_logs')
          .select('*')
          .eq('transaction_id', id)
          .order('created_at', { ascending: false });
        
        if (!logsError && logsData) {
          processingLogs = logsData;
          console.log(`Encontrados ${logsData.length} logs de processamento para a transação ${id}`);
        } else if (logsError) {
          console.error('Erro ao buscar logs de processamento:', logsError);
        }
      } catch (e) {
        console.log('Erro ao buscar logs de processamento:', e);
      }
      
      // Buscar locks de processamento
      let processingLocks = [];
      try {
        const { data: locksData, error: locksError } = await supabase
          .from('core_processing_locks')
          .select('*')
          .eq('transaction_id', id)
          .order('created_at', { ascending: false });
        
        if (!locksError && locksData) {
          processingLocks = locksData;
          console.log(`Encontrados ${locksData.length} locks de processamento para a transação ${id}`);
        } else if (locksError) {
          console.error('Erro ao buscar locks de processamento:', locksError);
        }
      } catch (e) {
        console.log('Erro ao buscar locks de processamento:', e);
      }
      
      // Buscar posts da transação (usando a tabela nova)
      let transactionPosts = [];
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('core_transaction_posts_v2')
          .select('*')
          .eq('transaction_id', id)
          .order('created_at', { ascending: false });
        
        if (!postsError && postsData) {
          transactionPosts = postsData;
        }
      } catch (e) {
        console.log('Tabela de posts da transação pode não existir', e);
      }
      
      // Combinar todos os dados
      setTransaction({
        ...transaction,
        orders: orders || [],
        logs: processingLogs || [],
        processing: processingLocks || [],
        posts: transactionPosts || [],
        webhookCallbacks: [] // Não há tabela de callbacks de webhook, inicializando como array vazio
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setErrorFeedback(`Erro ao buscar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Carregando detalhes da transação..." />
      </div>
    );
  }

  // Renderizar erro
  if (errorFeedback) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-lg font-medium text-red-800 mb-2">Ocorreu um erro</h2>
        <p className="text-sm text-red-700">{errorFeedback}</p>
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/transacoes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setErrorFeedback(null);
              fetchTransactionDetails();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar se a transação não for encontrada
  if (!transaction) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-gray-50 rounded-lg border">
        <h2 className="text-lg font-medium mb-2">Transação não encontrada</h2>
        <p className="text-sm text-gray-500">A transação solicitada não foi encontrada ou não existe.</p>
        <Button 
          className="mt-4"
          variant="outline"
          onClick={() => router.push('/admin/transacoes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista de transações
        </Button>
      </div>
    );
  }

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Formatar status
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-none">
            <Clock className="h-3 w-3 mr-1" /> Pendente
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-none">
            <CheckCircle className="h-3 w-3 mr-1" /> Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-none">
            <AlertTriangle className="h-3 w-3 mr-1" /> Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-none">
            {status || 'Desconhecido'}
          </Badge>
        );
    }
  };

  // Verificar se há erros nos pedidos
  const hasErrors = transaction.orders?.some(
    (order: Order) => order.status?.includes('error_')
  );

  // Verificar se não há pedidos
  const hasNoOrders = transaction.orders?.length === 0;

  // Função para resolver erros de transação
  async function handleResolveTransaction() {
    setProcessingTransaction(true);
    try {
      // Aqui implementaria a lógica para resolver erros
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      toast.success('Erros resolvidos com sucesso!');
      fetchTransactionDetails();
    } catch (error) {
      console.error('Erro ao resolver transação:', error);
      toast.error('Ocorreu um erro ao tentar resolver');
    } finally {
      setProcessingTransaction(false);
    }
  }

  // Função para processar transação
  async function handleForceProcessThisTransaction() {
    setProcessingTransaction(true);
    try {
      // Chamar a API para forçar o processamento
      const response = await fetch('/api/admin/force-process-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId: transaction.id }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Erro ao processar a transação');
      }
      
      toast.success('Transação processada com sucesso! Atualizando dados...');
      
      // Aguardar um momento para que o processamento ocorra no servidor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar dados da transação
      await fetchTransactionDetails();
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      toast.error(`Erro ao processar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoadingAction(null);
      setProcessingTransaction(false);
    }
  }

  // Função para verificar status do pedido
  async function handleCheckOrderStatus(orderId: string) {
    try {
      const response = await fetch('/api/admin/check-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao verificar status');
      }
      
      const data = await response.json();
      toast.success(`Status verificado: ${data.status}`);
      return data;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast.error('Falha ao verificar status do pedido');
      throw error;
    }
  }

  // Função para enviar manualmente para o cliente
  async function handleSendToCustomer(transaction: Transaction) {
    setProcessingTransaction(true);
    try {
      toast.loading("Enviando manualmente para o cliente...");

      // Extrair todas as informações necessárias
      const { customer_email, customer_links, amount } = transaction;
      
      // Verificar se temos as informações necessárias
      if (!customer_email || !customer_links?.length) {
        toast.error("Faltam informações para enviar ao cliente (email ou links)");
        return;
      }
      
      // Chamar API para enviar para o cliente
      const response = await fetch('/api/admin/send-to-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transaction_id: transaction.id,
          customer_email,
          customer_links,
          amount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao enviar para o cliente');
      }
      
      toast.success("Enviado com sucesso para o cliente!");
      fetchTransactionDetails(); // Atualizar os dados
    } catch (error) {
      console.error('Erro ao enviar para o cliente:', error);
      toast.error(`Falha ao enviar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setProcessingTransaction(false);
    }
  }

  // Adicionar depois da função handleForceProcessThisTransaction
  async function handleSendManuallyToProvider() {
    if (!transaction) return;
    
    try {
      setLoadingAction('sending_to_provider');
      
      // Chamar a API para forçar o envio ao provedor
      const response = await fetch('/api/admin/force-send-to-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId: transaction.id }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Erro ao enviar para o provedor');
      }
      
      toast.success('Transação enviada para o provedor com sucesso!');
      
      // Atualizar dados da transação
      fetchTransactionDetails();
    } catch (error) {
      console.error('Erro ao enviar para o provedor:', error);
      toast.error(`Erro ao enviar para o provedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoadingAction(null);
    }
  }

  // Renderização principal
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin/transacoes')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Transação</h1>
          <p className="text-sm text-muted-foreground">Informações completas sobre a transação e pedidos associados</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactionDetails}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>#{transaction.id.substring(0, 8)}</span>
                {getStatusBadge(transaction.status)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {transaction.created_at && formatDate(transaction.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-xl font-bold">
                {transaction.amount ? formatCurrency(transaction.amount) : (transaction.service?.preco ? formatCurrency(transaction.service.preco) : 'N/A')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="provider">Provedor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-3">Informações da Transação</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">ID da Transação</p>
                      <p className="text-sm font-mono bg-gray-50 p-2 rounded">{transaction.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <div>{getStatusBadge(transaction.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Data</p>
                      <p className="text-sm">{transaction.created_at && formatDate(transaction.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Valor</p>
                      <p className="text-sm font-bold">{transaction.amount ? formatCurrency(transaction.amount) : (transaction.service?.preco ? formatCurrency(transaction.service.preco) : 'N/A')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Método de Pagamento</p>
                      <p className="text-sm capitalize">{transaction.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Serviço Contratado</p>
                      <p className="text-sm font-bold">{transaction.service?.name || (transaction.metadata?.service?.name) || 'N/A'}</p>
                      {transaction.service?.description && (
                        <p className="text-xs text-gray-500 mt-1">{transaction.service.description}</p>
                      )}
                      {transaction.service?.type && (
                        <Badge variant="outline" className="mt-1">
                          {transaction.service.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Informações do Cliente</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Nome</p>
                      <p className="text-sm">{transaction.customer_name || transaction.metadata?.customer?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm">{transaction.customer_email || transaction.metadata?.contact?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm">{transaction.customer_phone || transaction.metadata?.contact?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Usuário Instagram</p>
                      <p className="text-sm">{transaction.target_username || transaction.metadata?.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Serviço</p>
                      <p className="text-sm">{transaction.service?.name || transaction.metadata?.service?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Metadados */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">Metadados Completos</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="orders">
              {hasNoOrders ? (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
                  <p className="text-muted-foreground mt-1">Esta transação não possui pedidos associados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transaction.orders?.map((order, index) => (
                    <Card key={order.id || index} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              Pedido #{order.external_order_id || 'Pendente'}
                            </CardTitle>
                            <CardDescription className="text-xs font-mono">
                              ID: {order.id}
                            </CardDescription>
                          </div>
                          <Badge
                            className={
                              order.status?.includes('completed') ? 'bg-green-100 text-green-800 border-green-200' :
                              order.status?.includes('pending') ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              order.status?.includes('error') ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }
                          >
                            {order.status || 'Desconhecido'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Detalhes do Pedido</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Quantidade:</span>
                                <span>{order.quantity}</span>
                              </div>
                              {order.target_username && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Username:</span>
                                  <span>{order.target_username}</span>
                                </div>
                              )}
                              {order.link && (
                                <div className="flex justify-between items-start">
                                  <span className="text-gray-500">Link:</span>
                                  <a 
                                    href={order.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center truncate max-w-[200px]"
                                  >
                                    {order.link.substring(0, 30)}...
                                    <ExternalLink className="h-3 w-3 ml-1 inline" />
                                  </a>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-500">Criado em:</span>
                                <span>{order.created_at ? formatDate(order.created_at) : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Comunicação com Provedor</h4>
                            <div className="space-y-4">
                              {/* Dados enviados ao provedor */}
                              <Collapsible className="w-full">
                                <CollapsibleTrigger className="flex w-full items-center justify-between rounded border p-2 text-sm font-medium hover:bg-gray-50">
                                  <div className="flex items-center">
                                    <Send className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>Dados Enviados ao Provedor</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2">
                                  <div className="rounded border bg-gray-50 p-3">
                                    {order.metadata?.providerRequestData ? (
                                      <pre className="text-xs overflow-auto max-h-40">
                                        {JSON.stringify(order.metadata.providerRequestData, null, 2)}
                                      </pre>
                                    ) : (
                                      <div className="text-xs text-gray-500 italic">
                                        Nenhum dado de requisição disponível
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              
                              {/* Resposta do provedor */}
                              <Collapsible className="w-full">
                                <CollapsibleTrigger className="flex w-full items-center justify-between rounded border p-2 text-sm font-medium hover:bg-gray-50">
                                  <div className="flex items-center">
                                    <PackageIcon className="h-4 w-4 mr-2 text-green-500" />
                                    <span>Resposta do Provedor</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2">
                                  <div className="rounded border bg-gray-50 p-3">
                                    {order.metadata?.providerResponse ? (
                                      <pre className="text-xs overflow-auto max-h-40">
                                        {JSON.stringify(order.metadata.providerResponse, null, 2)}
                                      </pre>
                                    ) : (
                                      <div className="text-xs text-gray-500 italic">
                                        Nenhuma resposta do provedor disponível
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              
                              {/* Detalhes técnicos */}
                              <Collapsible className="w-full">
                                <CollapsibleTrigger className="flex w-full items-center justify-between rounded border p-2 text-sm font-medium hover:bg-gray-50">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>Metadados Completos</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2">
                                  <div className="rounded border bg-gray-50 p-3">
                                    <pre className="text-xs overflow-auto max-h-40">
                                      {JSON.stringify(order.metadata, null, 2)}
                                    </pre>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                              
                              {/* Mensagem de erro, se houver */}
                              {order.error_message && (
                                <div className="mt-3">
                                  <h5 className="text-xs font-medium text-red-600 mb-1">Erro:</h5>
                                  <div className="text-xs bg-red-50 text-red-800 p-2 rounded">
                                    {order.error_message}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="logs">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Histórico de Processamento</h3>
                  {transaction.processing && transaction.processing.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tentativas</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lock</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transaction.processing.map((proc, i) => (
                            <tr key={i} className={proc.status === 'error' ? 'bg-red-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  proc.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  proc.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  proc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  proc.status === 'error' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {proc.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {proc.attempts || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {proc.locked_until ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    new Date(proc.locked_until) > new Date() ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {new Date(proc.locked_until) > new Date() 
                                      ? `Bloqueado até ${format(new Date(proc.locked_until), "HH:mm:ss dd/MM", { locale: ptBR })}` 
                                      : 'Expirado'}
                                  </span>
                                ) : 'Não bloqueado'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(proc.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum registro de processamento encontrado.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Eventos de Webhook</h3>
                  {transaction.webhookCallbacks && transaction.webhookCallbacks.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transaction.webhookCallbacks.map((callback, i) => (
                            <tr key={i} className={!callback.success ? 'bg-red-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {callback.provider || 'Desconhecido'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  callback.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {callback.success ? 'Sucesso' : 'Falha'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(callback.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {callback.action || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum callback de webhook recebido.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Log de Eventos</h3>
                  {transaction.logs && transaction.logs.length > 0 ? (
                    <div className="space-y-3">
                      {transaction.logs.map((log, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-md text-sm ${
                            log.level === 'error' ? 'bg-red-50 border border-red-100' : 
                            log.level === 'warning' ? 'bg-yellow-50 border border-yellow-100' : 
                            'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-start">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                              log.level === 'error' ? 'bg-red-100 text-red-800' :
                              log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.level}
                            </span>
                            <span className="text-gray-500 text-xs mr-2">
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="mt-1 font-medium">{log.message}</p>
                          {log.metadata && (
                            <Collapsible className="mt-2">
                              <CollapsibleTrigger className="flex items-center text-xs text-gray-500 hover:text-gray-700">
                                <ChevronRight className="h-4 w-4 mr-1" />
                                Ver detalhes
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum log encontrado para esta transação.</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="provider" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Comunicação com o Provedor</CardTitle>
                  <CardDescription>
                    Detalhes da comunicação entre o sistema e o provedor do serviço.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transaction.orders && transaction.orders.length > 0 ? (
                    transaction.orders.map((order, index) => (
                      <div key={order.id} className="mb-6 border-b pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-lg">Pedido #{index + 1} - {order.id.substring(0, 8)}</h3>
                          {order.status && (
                            <Badge className={
                              order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                              order.status.includes('error') ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }>
                              {order.status}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {/* Requisição enviada ao provedor */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center">
                              <Send className="h-4 w-4 mr-1" /> Enviado ao Provedor
                            </h4>
                            {order.provider_request ? (
                              <div className="bg-gray-50 p-3 rounded-md overflow-auto max-h-60">
                                <pre className="text-xs whitespace-pre-wrap break-words">
                                  {typeof order.provider_request === 'string' 
                                    ? order.provider_request 
                                    : JSON.stringify(order.provider_request, null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">Nenhuma requisição enviada ou registro não disponível</p>
                            )}
                          </div>
                          
                          {/* Resposta do provedor */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center">
                              <ArrowLeft className="h-4 w-4 mr-1" /> Resposta do Provedor
                            </h4>
                            {order.provider_response ? (
                              <div className="bg-gray-50 p-3 rounded-md overflow-auto max-h-60">
                                <pre className="text-xs whitespace-pre-wrap break-words">
                                  {typeof order.provider_response === 'string' 
                                    ? order.provider_response 
                                    : JSON.stringify(order.provider_response, null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">Nenhuma resposta recebida ou registro não disponível</p>
                            )}
                          </div>
                          
                          {/* Status do pedido no provedor */}
                          {order.external_order_id && (
                            <div className="flex items-center mt-2 text-sm">
                              <strong className="mr-2">ID do pedido no provedor:</strong>
                              <span>{order.external_order_id}</span>
                            </div>
                          )}
                          
                          {/* Status do pedido no provedor */}
                          {order.status_provider && (
                            <div className="flex items-center mt-2 text-sm">
                              <strong className="mr-2">Status no provedor:</strong>
                              <Badge variant="outline" className={
                                order.status_provider === 'completed' ? 'bg-green-50 text-green-700' : 
                                order.status_provider === 'processing' ? 'bg-blue-50 text-blue-700' : 
                                'bg-gray-50 text-gray-700'
                              }>
                                {order.status_provider}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Nenhum pedido associado a esta transação</p>
                      {transaction.status === 'approved' && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setProcessingTransaction(true);
                              handleForceProcessThisTransaction();
                            }}
                            disabled={processingTransaction}
                          >
                            {processingTransaction ? 'Processando...' : 'Criar pedido agora'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ações da Transação */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/transacoes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Transações
        </Button>
        
        <Button 
          onClick={handleForceProcessThisTransaction}
          disabled={loadingAction !== null || (!transaction?.status)}
          variant="secondary"
          size="sm"
        >
          {loadingAction === 'processing' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Forçar Processamento
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleSendManuallyToProvider}
          disabled={loadingAction !== null || (!transaction?.status) || transaction?.status !== 'approved'}
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loadingAction === 'sending_to_provider' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar para Provedor
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 