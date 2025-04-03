'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDateToBrasilia } from '@/lib/utils/date';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Refill {
  id: string;
  external_refill_id?: string;
  status: string;
  created_at: string;
}

interface ServiceDetails {
  refill?: boolean;
  name?: string;
  type?: string;
}

interface Service {
  provider_id?: string;
  name?: string;
  type?: string;
  service_details?: ServiceDetails;
}

interface Provider {
  id: string;
  name: string;
  api_url?: string;
  api_key?: string;
}

interface Post {
  shortcode: string;
  display_url: string;
}

interface ProviderStatus {
  status: string;
  start_count: string;
  remains: string;
  updated_at: string;
  charge?: string;
  currency?: string;
}

interface Payment {
  status: string;
  qr_code?: string;
  qr_code_base64?: string;
}

interface OrderMetadata {
  link: string;
  username?: string;
  post?: Post;
  provider_status?: ProviderStatus;
  email?: string;
  provider?: Provider;
  provider_name?: string;
  payment?: Payment;
}

interface Order {
  id: string;
  external_order_id?: string;
  status: string;
  created_at: string;
  service?: Service;
  provider?: Provider;
  provider_id?: string;
  amount: number;
  quantity: number;
  payment_status?: string;
  metadata: OrderMetadata;
  refills?: Refill[];
}

interface Transaction {
  id: string;
  customer_name?: string;
  customer_email?: string;
  payment_status?: string;
}

export default function AcompanharPedidoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
        <span className="ml-2 text-xl font-medium">Carregando...</span>
      </div>
    }>
      <AcompanharPedidoContent />
    </Suspense>
  );
}

function AcompanharPedidoContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [processingRefill, setProcessingRefill] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>({});
  const [checkingAllStatus, setCheckingAllStatus] = useState(false);
  const [checkingRefillStatus, setCheckingRefillStatus] = useState<Record<string, boolean>>({});
  const [userProfile, setUserProfile] = useState<{ email: string; name: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      handleSearchOrders(emailFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (orders.length === 0) return;
    
    // Verificar status de pedidos pendentes/em processamento a cada 4 minutos
    const statusInterval = setInterval(checkPendingOrdersStatus, 240000);
    
    // Removendo a verificação inicial automática para evitar loops
    // checkPendingOrdersStatus();
    
    return () => {
      clearInterval(statusInterval);
    };
  }, [orders]);

  const checkPendingOrdersStatus = async () => {
    if (!email) return;
    
    // Filtra apenas pedidos pendentes ou em processamento
    const pendingOrders = orders.filter(order => 
      order.status.toLowerCase() === 'pending' || 
      order.status.toLowerCase() === 'processing' || 
      order.status.toLowerCase() === 'in progress'
    );
    
    if (pendingOrders.length === 0) return;
    
    // Limitar a verificação a apenas um pedido por vez para evitar sobrecarga
    let processedCount = 0;
    
    // Atualiza o status de cada pedido pendente
    for (const order of pendingOrders) {
      try {
        // Limitar o número de verificações simultâneas para evitar sobrecarga
        if (processedCount >= 2) break;
        
        // Verificar se o pedido tem um provedor associado
        if (!order.provider_id && !order.metadata?.provider && !order.metadata?.provider_name && !order.service?.provider_id) {
          console.error(`Pedido ${order.external_order_id} não tem provedor associado`);
          continue; // Pular para o próximo pedido
        }
        
        // Verificar se já estamos verificando este pedido
        if (checkingStatus[order.id]) {
          continue; // Pular para o próximo pedido
        }
        
        await checkOrderStatus(order);
        processedCount++;
        
        // Pequena pausa entre as verificações para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: Error | unknown) {
        console.error(`Erro ao verificar status do pedido ${order.external_order_id}:`, error);
      }
    }
  };

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const supabase = createClientComponentClient();
        
        // Verificar se há uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Buscar perfil do usuário na tabela customers
          const { data: customer, error } = await supabase
            .from('customers')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          if (!error && customer) {
            setUserProfile({
              email: customer.email,
              name: customer.name || customer.instagram_username
            });
            setEmail(customer.email);
            // Buscar pedidos automaticamente se o usuário estiver logado
            handleSearchOrders(customer.email);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar perfil do usuário:', error);
      }
    };
    
    checkUserProfile();
  }, []);

  // Função para buscar pedidos sem o evento de formulário
  const handleSearchOrders = async (emailToSearch: string) => {
    if (!emailToSearch) return;
    
    setLoading(true);
    setSearched(true);
    // Limpar os pedidos existentes antes de buscar novos
    setOrders([]);
    
    try {
      const supabase = createClientComponentClient();

      // Primeiro tenta buscar pelo campo customer_email diretamente na nova tabela core_transactions_v2
      const { data: transactionsV2, error: transactionsError } = await supabase
        .from('core_transactions_v2')
        .select('id, customer_name, customer_email, payment_status')
        .eq('customer_email', emailToSearch)
        .order('created_at', { ascending: false });
          
      // Usaremos essa variável para armazenar as transações encontradas
      let foundTransactions = transactionsV2;
          
      if (transactionsError) {
        console.error('Erro ao buscar transações pelo email na tabela core_transactions_v2:', transactionsError);
        
        // Tenta buscar na tabela antiga como fallback
        console.log('Tentando buscar na tabela antiga como fallback...');
        const { data: oldTransactions, error: oldTransactionsError } = await supabase
          .from('core_transactions')
          .select('id, customer_name, customer_email, payment_status')
          .eq('customer_email', emailToSearch)
          .order('created_at', { ascending: false });
          
        if (!oldTransactionsError && oldTransactions && oldTransactions.length > 0) {
          console.log(`Encontradas ${oldTransactions.length} transações na tabela antiga`);
          foundTransactions = oldTransactions;
        } else if (oldTransactionsError) {
          console.error('Erro ao buscar transações na tabela antiga:', oldTransactionsError);
        }
      }
      
      // Se não encontrou registros, busca nos metadados da nova tabela
      if (!foundTransactions || foundTransactions.length === 0) {
        console.log('Email não encontrado em customer_email, buscando nos metadados...');
        
        // Tentar buscar pelo email nos metadados da transação na nova tabela
        const { data: metadataTransactions, error: metadataError } = await supabase
          .from('core_transactions_v2')
          .select('id, customer_name, customer_email, payment_status')
          .or(`metadata->email.eq.${emailToSearch},metadata->contact->email.eq.${emailToSearch}`) // Busca em múltiplos caminhos do metadata
          .order('created_at', { ascending: false });
          
        if (metadataError) {
          console.error('Erro ao buscar transações pelos metadados na tabela nova:', metadataError);
          
          // Tenta buscar nos metadados da tabela antiga
          const { data: oldMetadataTransactions, error: oldMetadataError } = await supabase
            .from('core_transactions')
            .select('id, customer_name, customer_email, payment_status')
            .or(`metadata->email.eq.${emailToSearch},metadata->contact->email.eq.${emailToSearch}`)
            .order('created_at', { ascending: false });
            
          if (!oldMetadataError && oldMetadataTransactions && oldMetadataTransactions.length > 0) {
            foundTransactions = oldMetadataTransactions;
          } else if (oldMetadataError) {
            console.error('Erro ao buscar transações pelos metadados na tabela antiga:', oldMetadataError);
          }
        } else if (metadataTransactions && metadataTransactions.length > 0) {
          foundTransactions = metadataTransactions;
        }
      }
      
      // Se ainda não encontrou transações
      if (!foundTransactions || foundTransactions.length === 0) {
        toast.info('Nenhuma transação encontrada para este email');
        setLoading(false);
        return;
      }
          
      console.log(`Encontradas ${foundTransactions.length} transações para o email ${emailToSearch}`);
      
      // Extrair IDs das transações encontradas
      const transactionIds = foundTransactions.map(t => t.id);
      
      // Buscar pedidos pelas transaction_ids
      const { data: userOrders, error: ordersError } = await supabase
        .from('core_orders')
        .select(`
          *,
          service:service_id (
            name,
            type,
            service_details,
            provider:provider_id (*)
          ),
          provider:provider_id (*)
        `)
        .in('transaction_id', transactionIds)
        .not('status', 'in', '("skipped","error")') // Excluir pedidos com status 'skipped' ou 'error'
        .order('created_at', { ascending: false });
            
      if (ordersError) {
        console.error('Erro ao buscar pedidos:', ordersError);
        toast.error('Erro ao buscar pedidos');
        setLoading(false);
        return;
      }
      
      if (userOrders && userOrders.length > 0) {
        // Criar um mapa das transações para acesso rápido
        const transactionsMap: Record<string, Transaction> = foundTransactions.reduce((acc: Record<string, Transaction>, transaction) => {
          acc[transaction.id] = transaction;
          return acc;
        }, {});
        
        // Buscar reposições para os pedidos encontrados
        const orderIds = userOrders.map(order => order.id);
        
        const { data: refills, error: refillsError } = await supabase
          .from('core_refills')
          .select('*')
          .in('order_id', orderIds);
          
        if (refillsError) {
          console.error('Erro ao buscar reposições:', refillsError);
        }
        
        // Adicionar as reposições e status de pagamento aos pedidos
        const ordersWithData = userOrders.map(order => {
          // Buscar a transação associada
          const transaction = transactionsMap[order.transaction_id] || {};
          
          // Buscar as reposições associadas
          const orderRefills = refills?.filter(refill => refill.order_id === order.id) || [];
          
          return {
            ...order,
            refills: orderRefills,
            payment_status: transaction.payment_status || 'pending'
          };
        });
        
        setOrders(ordersWithData);
        console.log(`Processados ${ordersWithData.length} pedidos com ${refills?.length || 0} reposições`);
      } else {
        setOrders([]);
      }
      
      if (!userOrders || userOrders.length === 0) {
        toast.info('Nenhum pedido encontrado para este email');
      } else {
        console.log(`Encontrados ${userOrders.length} pedidos para o email ${emailToSearch}`);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao buscar pedidos');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter a cor do badge de status
  const getStatusColor = (status: string = 'pending') => {
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

  // Função para obter o texto do badge de status
  const getOrderStatusBadge = (status: string = 'pending') => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'processing':
      case 'in progress':
        return 'Processando';
      case 'failed':
        return 'Falhou';
      case 'rejected':
        return 'Rejeitado';
      case 'canceled':
        return 'Cancelado';
      case 'partial':
        return 'Parcial';
      default:
        return status || 'Desconhecido';
    }
  };
  
  // Função para obter a cor do badge de status de pagamento
  const getPaymentStatusColor = (status: string = 'pending') => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'paid':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'pending':
      case 'awaiting_payment':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'rejected':
      case 'failed':
      case 'canceled':
      case 'refunded':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'processing':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  // Função para obter o texto do badge de status de pagamento
  const getPaymentStatusBadge = (status: string = 'pending') => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'paid':
        return 'Pagamento Aprovado';
      case 'pending':
      case 'awaiting_payment':
        return 'Aguardando Pagamento';
      case 'rejected':
      case 'failed':
        return 'Pagamento Rejeitado';
      case 'canceled':
        return 'Pagamento Cancelado';
      case 'refunded':
        return 'Reembolsado';
      case 'processing':
        return 'Processando Pagamento';
      default:
        return status || 'Status Desconhecido';
    }
  };

  const getDaysRemaining = (date: string) => {
    const orderDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(orderDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return 30 - diffDays;
  };

  const isWithin30Days = (date: string) => {
    return getDaysRemaining(date) > 0;
  };

  // Função auxiliar para verificar se um pedido é refilável
  const isOrderRefillable = (order: Order) => {
    // Log detalhado para depuração
    console.log(`Verificando refilabilidade do pedido ${order.id}:`, {
      isWithin30Days: isWithin30Days(order.created_at),
      hasNoRefills: !order.refills || order.refills.length === 0,
      isCompleted: order.status === 'completed',
      refillableService: order.service?.service_details?.refill,
      serviceDetails: order.service?.service_details,
      serviceName: order.service?.name
    });

    // Algumas vezes o service_details pode não estar aninhado corretamente
    // ou o campo refill pode estar em um formato diferente do esperado
    const isRefillableService = 
      // Verificação principal: campo refill em service_details
      !!order.service?.service_details?.refill ||
      // Verificação alternativa: serviço com nome que contenha "refill" ou "refilável"
      (order.service?.name && (
        order.service.name.toLowerCase().includes('refill') ||
        order.service.name.toLowerCase().includes('refilável') ||
        order.service.name.toLowerCase().includes('reposição')
      ));

    return (
      isWithin30Days(order.created_at) && 
      (!order.refills || order.refills.length === 0) && 
      order.status === 'completed' && 
      isRefillableService
    );
  };

  const checkOrderStatus = async (order: Order) => {
    try {
      setCheckingStatus(prev => ({ ...prev, [order.id]: true }));
      
      const orderData = orders.find((o) => o.id === order.id);
      
      if (!orderData || !orderData.provider) {
        toast.error('Dados do provedor não disponíveis para este pedido');
        return;
      }

      let provider = orderData.provider;
      // Se o provider for um array, pegar o primeiro item
      if (Array.isArray(provider)) {
        provider = provider[0];
      }
      
      if (!provider.api_url || !provider.api_key) {
        toast.error('Informações do provedor incompletas');
        console.error('Provider sem api_url ou api_key:', provider);
        return;
      }
      
      // Verificar se tem ID externo para o pedido
      const externalOrderId = orderData.external_order_id;
      if (!externalOrderId) {
        toast.error('ID externo do pedido não disponível');
        return;
      }
      
      // Usar o endpoint proxy
      const response = await fetch('/api/provider-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiUrl: provider.api_url,
          apiKey: provider.api_key,
          action: 'status',
          orderId: externalOrderId
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao verificar status do pedido:', errorText);
        toast.error(`Erro ao verificar status: ${response.status}`);
        return;
      }
      
      interface ProviderResponse {
        status?: string;
        start_count?: string;
        remains?: string;
        charge?: string;
        currency?: string;
        error?: string;
      }
      
      const result: ProviderResponse = await response.json();
      console.log('Resposta do status do pedido:', result);
      
      if (result.error) {
        toast.error(`Erro: ${result.error}`);
        return;
      }

      // Normalizar o status para o formato do sistema
      let normalizedStatus = result.status?.toLowerCase() || 'unknown';
      
      // Mapear o status do provedor para o formato usado pelo sistema
      if (normalizedStatus === 'completed' || normalizedStatus === 'complete') {
        normalizedStatus = 'completed';
      } else if (normalizedStatus === 'processing' || normalizedStatus === 'in progress' || normalizedStatus === 'inprogress') {
        normalizedStatus = 'processing';
      } else if (normalizedStatus === 'pending') {
        normalizedStatus = 'pending';
      } else if (normalizedStatus === 'partial') {
        normalizedStatus = 'partial';
      } else if (normalizedStatus === 'canceled' || normalizedStatus === 'cancelled') {
        normalizedStatus = 'canceled';
      } else if (normalizedStatus === 'failed' || normalizedStatus === 'error') {
        normalizedStatus = 'failed';
      }
      
      // Registrar o status no banco de dados
      const supabase = createClientComponentClient();
      
      // Tentar registrar em core_status_check_logs
      try {
        await supabase.from('core_status_check_logs').insert({
          order_id: orderData.id,
          external_order_id: externalOrderId,
          provider_id: provider.id,
          status: normalizedStatus,
          raw_status: result.status,
          metadata: {
            start_count: result.start_count || '0',
            remains: result.remains || '0',
            charge: result.charge || '0',
            source: 'client_check'
          }
        });
        console.log('Log de checagem de status registrado com sucesso');
      } catch (logError) {
        console.error('Erro ao registrar log de checagem:', logError);
      }
      
      // Atualizar o status do pedido no banco
      try {
        // Atualizar o pedido na tabela core_orders
        await supabase
          .from('core_orders')
          .update({
            status: normalizedStatus,
            metadata: {
              ...orderData.metadata,
              provider_status: {
                status: result.status?.toLowerCase() || 'unknown',
                start_count: result.start_count || '0',
                remains: result.remains || '0',
                charge: result.charge || '0',
                currency: result.currency || 'USD',
                updated_at: new Date().toISOString()
              }
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', orderData.id);
          
        console.log(`Pedido ${orderData.id} atualizado com status ${normalizedStatus}`);
      } catch (updateError) {
        console.error('Erro ao atualizar status do pedido:', updateError);
      }
      
      // Atualizar o status do pedido na UI
      setOrders(prevOrders => {
        // Verificar se o pedido já existe na lista
        const orderExists = prevOrders.some(o => o.id === orderData.id);
        
        if (orderExists) {
          // Atualizar o pedido existente
          return prevOrders.map(o => {
            if (o.id === orderData.id) {
              return {
                ...o,
                status: normalizedStatus,
                metadata: {
                  ...o.metadata,
                  provider_status: {
                    status: result.status?.toLowerCase() || 'unknown',
                    start_count: result.start_count || '0',
                    remains: result.remains || '0',
                    charge: result.charge || '0',
                    currency: result.currency || 'USD',
                    updated_at: new Date().toISOString()
                  }
                }
              };
            }
            return o;
          });
        } else {
          // Não adicionar novos pedidos
          console.warn('Pedido não encontrado na lista atual:', orderData.id);
          return prevOrders;
        }
      });
      
      // Explicar a diferença entre os status para o usuário
      toast.success(
        <div>
          <p>Status atualizado com sucesso!</p>
          <p className="text-xs mt-1">
            <span className="font-semibold">Lembre-se:</span> O status do pedido mostra o andamento do serviço no provedor, 
            enquanto o status de pagamento indica se o pagamento foi aprovado.
          </p>
        </div>
      );
    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
      toast.error('Erro ao verificar status do pedido. Por favor, tente novamente.');
    } finally {
      setCheckingStatus(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const handleRefill = async (orderId: string) => {
    try {
      setProcessingRefill(orderId);
      
      const orderData = orders.find((o) => o.id === orderId);
      
      if (!orderData || !orderData.provider) {
        toast.error('Dados do provedor não disponíveis para este pedido');
        return;
      }
      
      let provider = orderData.provider;
      // Se o provider for um array, pegar o primeiro item
      if (Array.isArray(provider)) {
        provider = provider[0];
      }
      
      if (!provider.api_url || !provider.api_key) {
        toast.error('Informações do provedor incompletas');
        console.error('Provider sem api_url ou api_key:', provider);
        return;
      }
      
      console.log('Solicitando refill para o pedido:', orderData);
      
      const externalOrderId = orderData.external_order_id;
      if (!externalOrderId) {
        toast.error('ID externo do pedido não disponível');
        return;
      }
      
      // Usar o novo endpoint proxy
      const response = await fetch('/api/provider-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiUrl: provider.api_url,
          apiKey: provider.api_key,
          action: 'refill',
          orderId: externalOrderId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao solicitar refill:', errorData);
        toast.error(`Erro ao solicitar refill: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log('Resposta do refill:', data);
      
      if (data.error) {
        // Tratar erros específicos com mensagens amigáveis em português
        if (typeof data.error === 'string' && data.error.includes("The order was completed or refill was requested less than 24 hours ago")) {
          toast.error("Não é possível solicitar reposição: o pedido foi concluído ou uma reposição já foi solicitada nas últimas 24 horas.");
        } else {
          toast.error(`Erro: ${data.error}`);
        }
        return;
      }
      
      if (data.refill) {
        toast.success('Refill solicitado com sucesso!');
        
        try {
          // Salvar o refill no banco de dados
          const supabase = createClientComponentClient();
          const { data: refillData, error: refillError } = await supabase
            .from('core_refills')
            .insert({
              order_id: orderId,
              status: 'pending',
              external_refill_id: data.refill,
              quantity: orderData.quantity,
              metadata: {
                provider_order_id: externalOrderId,
                provider_refill_id: data.refill,
                requested_at: new Date().toISOString()
              }
            })
            .select('*')
            .single();
            
          if (refillError) {
            console.error('Erro ao salvar refill no banco de dados:', refillError);
            toast.error('Reposição solicitada, mas houve um erro ao salvar os dados');
          } else {
            console.log('Refill salvo com sucesso:', refillData);
        
        // Atualizar a UI com o novo refill
          setOrders(prev => 
            prev.map(o => 
              o.id === orderId 
                ? { 
                    ...o, 
                      refills: [...(o.refills || []), refillData] 
                  } 
                : o
            )
          );
          }
        } catch (dbError) {
          console.error('Erro ao salvar refill:', dbError);
          // Não mostrar toast aqui, pois o refill foi solicitado com sucesso
          // Apenas recarregar os pedidos para obter os dados atualizados
          await handleSearchOrders(email);
        }
      } else {
        toast.error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao solicitar refill:', error);
      toast.error('Erro ao solicitar refill. Tente novamente.');
    } finally {
      setProcessingRefill(null);
    }
  };
  
  const checkRefillStatus = async (orderId: string, refillId: string) => {
    try {
      const orderIndex = orders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) {
        console.error('Pedido não encontrado:', orderId);
        return;
      }

      const orderData = orders[orderIndex];
      if (!orderData || !orderData.provider) {
        toast.error('Dados do provedor não disponíveis para este pedido');
        return;
      }

      let provider = orderData.provider;
      // Se o provider for um array, pegar o primeiro item
      if (Array.isArray(provider)) {
        provider = provider[0];
      }

      if (!provider.api_url || !provider.api_key) {
        toast.error('Informações do provedor incompletas');
        console.error('Provider sem api_url ou api_key:', provider);
        return;
      }

      // Atualizar o estado para mostrar o loading
      setCheckingRefillStatus(prev => ({ ...prev, [refillId]: true }));

      console.log(`Verificando status do refill ${refillId} para o pedido ${orderId}`);
      console.log('API URL:', provider.api_url);

      // Usar o novo endpoint proxy
      const response = await fetch('/api/provider-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiUrl: provider.api_url,
          apiKey: provider.api_key,
          action: 'refill_status',
          refillId: refillId
        })
      });

      if (!response.ok) {
        toast.error(`Erro ao verificar status: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Resposta do status do refill:', data);

      if (data.error) {
        toast.error(`Erro: ${data.error}`);
        return;
      }

      if (data.status) {
        // Atualizar o status do refill no banco de dados
        const supabase = createClientComponentClient();
        const { error } = await supabase
          .from('core_refills')
          .update({ status: data.status.toLowerCase() })
          .eq('external_refill_id', refillId);

        if (error) {
          console.error('Erro ao atualizar status do refill:', error);
          toast.error('Erro ao atualizar status do refill no banco de dados');
          return;
        }

        // Atualizar a UI com o novo status
        setOrders(prev => {
          const newOrders = [...prev];
          const orderToUpdate = newOrders[orderIndex];
          
          if (orderToUpdate && orderToUpdate.refills) {
            const refillIndex = orderToUpdate.refills.findIndex(
              r => r.external_refill_id === refillId
            );
            
            if (refillIndex !== -1) {
              orderToUpdate.refills[refillIndex].status = data.status.toLowerCase();
            }
          }
          
          return newOrders;
        });
        
        toast.success(`Status atualizado: ${data.status}`);
      } else {
        toast.error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao verificar status do refill:', error);
      toast.error('Erro ao verificar status. Tente novamente.');
    } finally {
      setCheckingRefillStatus(prev => ({ ...prev, [refillId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchOrders(email);
  };

  const checkAllOrdersStatus = async () => {
    if (orders.length === 0) {
      toast.info('Não há pedidos para verificar');
      return;
    }
    
    if (checkingAllStatus) {
      toast.info('Já existe uma verificação em andamento, aguarde...');
      return;
    }
    
    setCheckingAllStatus(true);
    
    try {
      // Limitar a verificação a apenas alguns pedidos por vez
      let processedCount = 0;
      const maxProcessedOrders = 3; // Limite máximo de pedidos para verificar de uma vez
      
      for (const order of orders) {
        // Limitar o número de verificações para evitar sobrecarga
        if (processedCount >= maxProcessedOrders) {
          toast.info(`Verificados ${processedCount} pedidos. Para verificar mais, aguarde e tente novamente.`);
          break;
        }
        
        // Verificar se o pedido tem um provedor associado
        if (!order.provider_id && !order.metadata?.provider && !order.metadata?.provider_name && !order.service?.provider_id) {
          console.error(`Pedido ${order.external_order_id} não tem provedor associado`);
          continue; // Pular para o próximo pedido
        }
        
        // Verificar se já estamos verificando este pedido
        if (checkingStatus[order.id]) {
          continue; // Pular para o próximo pedido
        }
        
        await checkOrderStatus(order);
        processedCount++;
        
        // Pequena pausa entre as verificações para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (processedCount > 0) {
        toast.success(`Status de ${processedCount} pedidos verificado com sucesso`);
      } else {
        toast.info('Nenhum pedido foi verificado');
      }
    } catch (error) {
      console.error('Erro ao verificar status de todos os pedidos:', error);
      toast.error('Erro ao verificar status de todos os pedidos');
    } finally {
      setCheckingAllStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Acompanhar Pedido</h1>
            
            {userProfile ? (
              <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
                <p className="text-gray-700">Bem-vindo, <span className="font-semibold">{userProfile.name || userProfile.email}</span></p>
                <p className="text-sm text-gray-500">Seus pedidos são mostrados automaticamente abaixo.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Button type="submit" className="ml-2 bg-pink-600 hover:bg-pink-700" disabled={loading}>
                        {loading ? (
                          <div className="flex items-center">
                            <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                            <span>Buscando...</span>
                          </div>
                        ) : (
                          'Buscar'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
            
            {searched && orders.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seus Pedidos</h2>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Seus Pedidos</h2>
                    {userProfile && (
                      <p className="text-sm text-gray-600">
                        Olá, {userProfile.name || userProfile.email}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      O status dos pedidos é atualizado automaticamente a cada 4 minutos.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Buscar pedidos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os status</option>
                      <option value="pending">Pendente</option>
                      <option value="processing">Processando</option>
                      <option value="completed">Concluído</option>
                      <option value="partial">Parcial</option>
                      <option value="failed">Falhou</option>
                      <option value="canceled">Cancelado</option>
                    </select>
                    <Button
                      onClick={checkAllOrdersStatus}
                      disabled={checkingAllStatus}
                      variant="default"
                      size="sm"
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
                      {checkingAllStatus ? 'Verificando...' : 'Verificar Todos'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders
                    .filter(order => {
                      // Filtrar por status
                      if (filterStatus !== 'all' && order.status?.toLowerCase() !== filterStatus) {
                        return false;
                      }
                      
                      // Filtrar por termo de busca
                      if (searchTerm) {
                        const searchLower = searchTerm.toLowerCase();
                        return (
                          order.service?.name?.toLowerCase().includes(searchLower) ||
                          (order.external_order_id || order.id).toLowerCase().includes(searchLower)
                        );
                      }
                      
                      return true;
                    })
                    .map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-gray-500 mr-2">Status do pedido:</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(order.status || 'pending')}`}>
                              {getOrderStatusBadge(order.status || 'pending')}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPaymentStatusColor(order.payment_status || 'pending')}`}>
                              {getPaymentStatusBadge(order.payment_status || 'pending')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{order.service?.name}</h3>
                              <p className="text-sm text-gray-500">Pedido #{order.external_order_id || order.id.substring(0, 8)}</p>
                              <p className="text-sm text-gray-500">{formatDateToBrasilia(order.created_at)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Quantidade</p>
                              <p className="text-sm font-medium">{order.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Link</p>
                              <a 
                                href={order.metadata.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {order.service?.type === 'followers' ? 'Ver Perfil' : (order.metadata.post ? 'Ver Post' : 'Ver Perfil')}
                              </a>
                            </div>
                          </div>
                          
                          {order.metadata.provider_status && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Progresso:</span>
                                <span className="text-xs font-medium">{order.metadata.provider_status.remains} restantes</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.max(0, Math.min(100, 100 - (parseInt(order.metadata.provider_status.remains || '0') / order.quantity * 100)))}%` 
                                  }}
                                ></div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {order.metadata.provider_status.start_count && (
                                  <div>
                                    <span className="text-xs text-gray-500">Contagem inicial:</span>
                                    <span className="text-xs font-medium ml-1">{order.metadata.provider_status.start_count}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-400 mt-1">
                                Atualizado: {new Date(order.metadata.provider_status.updated_at).toLocaleString('pt-BR')}
                              </div>
                            </div>
                          )}
                          
                          {order.refills && order.refills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-2">Reposições:</p>
                              <div className="space-y-2">
                                {order.refills.map((refill, index) => {
                                  const refillId = refill.id || `temp-${index}`;
                                  const isChecking = Object.prototype.hasOwnProperty.call(checkingRefillStatus, refillId) && checkingRefillStatus[refillId];
                                  
                                  return (
                                    <div key={refill.id || `refill-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                      <div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(refill.status)}`}>
                                          {getOrderStatusBadge(refill.status)}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                          {formatDateToBrasilia(refill.created_at)}
                                        </span>
                                      </div>
                                        <Button
                                        onClick={() => checkRefillStatus(order.id, refill.external_refill_id || '')}
                                          disabled={isChecking}
                                        variant="outline"
                                        size="sm"
                                      >
                                        {isChecking ? 'Verificando...' : 'Verificar'}
                                        </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                              <Button
                              onClick={() => checkOrderStatus(order)}
                                disabled={checkingStatus[order.id]}
                                variant="outline"
                                size="sm"
                              className="text-sm"
                            >
                              {checkingStatus[order.id] ? 'Verificando...' : 'Verificar Status'}
                              </Button>
                            
                            {isOrderRefillable(order) && (
                              <Button
                                onClick={() => handleRefill(order.id)}
                                disabled={processingRefill === order.id}
                                variant="default"
                                size="sm"
                                className="bg-pink-600 hover:bg-pink-700 text-sm"
                              >
                                {processingRefill === order.id ? 'Solicitando...' : 'Solicitar Reposição'}
                              </Button>
                            )}
                          </div>
                                </div>
                              </div>
                    ))}
                                </div>
                            </div>
                          )}
                          
            {searched && orders.length === 0 && !loading && (
              <div className="bg-white shadow-sm rounded-lg p-6 text-center">
                <p className="text-gray-700 mb-2">Nenhum pedido encontrado para este email.</p>
                <p className="text-sm text-gray-500">
                  Verifique se digitou o email correto ou entre em contato com o suporte.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}