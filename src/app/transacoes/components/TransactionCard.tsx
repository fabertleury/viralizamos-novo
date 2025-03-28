import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Clock, X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { getPaymentStatusColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TransactionMetadata {
  payment_qr_code_base64?: string;
  payment_copy_paste?: string;
  processing_status?: string;
  posts?: unknown[];
  selectedPosts?: unknown[];
  reels?: unknown[];
  selectedReels?: unknown[];
  username?: string;
  profile?: {
    username?: string;
    [key: string]: unknown;
  };
  link?: string;
  target_link?: string;
  [key: string]: unknown;
}

interface Transaction {
  id: string;
  created_at: string;
  status: string;
  payment_method?: string;
  payment_id?: string;
  amount?: number;
  metadata?: TransactionMetadata;
  service?: {
    name: string;
    [key: string]: unknown;
  };
  orders?: Array<{
    id: string;
    status: string;
    external_order_id: string | null;
    created_at: string;
  }>;
}

interface TransactionCardProps {
  transaction: Transaction;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

export default function TransactionCard({ transaction, isAdmin = false, onRefresh }: TransactionCardProps) {
  const router = useRouter();
  const [processingOrder, setProcessingOrder] = useState(false);
  const time = formatDistanceToNow(new Date(transaction.created_at), { locale: ptBR, addSuffix: true });
  
  // Determinar o status do pedido
  const orderStatus = getOrderStatus(transaction);
  
  // Formatar valor monetário
  const amount = transaction.amount ? (transaction.amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }) : '---';
  
  // Obter o nome do serviço
  const serviceName = transaction.service?.name || 'Serviço';
  
  // Obter o código do QR para Pix ou link de redirecionamento
  const pixQrCode = transaction.metadata?.payment_qr_code_base64;
  const pixCopyPaste = transaction.metadata?.payment_copy_paste;
  
  // Obter os links ou profiles que foram pedidos
  const targetData = getTargetData(transaction);

  // Função para processar manualmente a transação
  const handleProcessManually = async () => {
    if (!confirm('Tem certeza que deseja processar manualmente esta transação?')) {
      return;
    }

    setProcessingOrder(true);
    
    try {
      const response = await fetch('/api/admin/process-manual-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transaction.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar transação');
      }
      
      toast.success('Transação processada com sucesso');
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      toast.error('Erro ao processar transação', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setProcessingOrder(false);
    }
  };
  
  return (
    <Card className="w-full my-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{serviceName}</CardTitle>
            <CardDescription>{time}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <PaymentStatusBadge status={transaction.status} />
              <OrderStatusBadge status={orderStatus} />
            </div>
            <span className="font-bold">{amount}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {targetData.type === 'username' && (
          <div className="text-sm">
            <p className="font-medium mb-1">Perfil:</p>
            <p>{targetData.value}</p>
          </div>
        )}
        
        {targetData.type === 'links' && (
          <div className="text-sm">
            <p className="font-medium mb-1">Posts/Reels:</p>
            <p className="text-muted-foreground truncate">
              {targetData.count} {targetData.count === 1 ? 'item' : 'itens'} selecionado
            </p>
          </div>
        )}
        
        {targetData.type === 'link' && (
          <div className="text-sm">
            <p className="font-medium mb-1">Link:</p>
            <p className="text-muted-foreground truncate">{targetData.value}</p>
          </div>
        )}
        
        {orderStatus === 'processed' && transaction.orders && transaction.orders.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Pedidos criados:</p>
            <div className="space-y-1">
              {transaction.orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center text-xs">
                  <Badge variant="outline" className="mr-2 px-1">
                    {order.external_order_id || 'Local'}
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(order.created_at), { locale: ptBR, addSuffix: true })}
                  </span>
                  <OrderStatusIcon status={order.status} className="ml-2" />
                </div>
              ))}
              {transaction.orders.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  + {transaction.orders.length - 3} pedidos
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {transaction.status === 'pending' && (pixQrCode || pixCopyPaste) && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => router.push(`/pagamento/${transaction.id}`)}
          >
            Continuar pagamento
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        
        {transaction.status === 'approved' && orderStatus === 'not_processed' && !isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => router.push(`/admin/transacoes/${transaction.id}`)}
          >
            Visualizar detalhes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        
        {transaction.status === 'approved' && orderStatus === 'not_processed' && isAdmin && (
          <div className="w-full flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/admin/transacoes/${transaction.id}`)}
            >
              Detalhes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-pink-600 hover:bg-pink-700"
              onClick={handleProcessManually}
              disabled={processingOrder}
            >
              {processingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Processar
                </>
              )}
            </Button>
          </div>
        )}
        
        {(transaction.status === 'approved' && orderStatus === 'processed') && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => router.push(`/admin/transacoes/${transaction.id}`)}
          >
            Ver detalhes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Componentes auxiliares para os badges de status
function PaymentStatusBadge({ status }: { status: string }) {
  const statusColor = getPaymentStatusColor(status);
  let statusText = status;
  
  switch (status) {
    case 'pending':
      statusText = 'Pendente';
      break;
    case 'approved':
      statusText = 'Aprovado';
      break;
    case 'in_process':
      statusText = 'Em processo';
      break;
    case 'rejected':
      statusText = 'Rejeitado';
      break;
    case 'cancelled':
      statusText = 'Cancelado';
      break;
    case 'refunded':
      statusText = 'Reembolsado';
      break;
    case 'processed':
      statusText = 'Processado';
      break;
  }
  
  return (
    <Badge className={`${statusColor} text-xs`}>
      {statusText}
    </Badge>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  if (status === 'not_processed') {
    return (
      <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 text-xs">
        Não processado
      </Badge>
    );
  }
  
  if (status === 'processing') {
    return (
      <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50 text-xs">
        Processando
      </Badge>
    );
  }
  
  if (status === 'error') {
    return (
      <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 text-xs">
        Erro
      </Badge>
    );
  }
  
  if (status === 'processed') {
    return (
      <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 text-xs">
        Processado
      </Badge>
    );
  }
  
  return null;
}

function OrderStatusIcon({ status, className = '' }: { status: string, className?: string }) {
  const combinedClass = `w-3 h-3 ${className}`;
  
  switch (status) {
    case 'pending':
      return <Clock className={`${combinedClass} text-amber-500`} />;
    case 'processing':
      return <Clock className={`${combinedClass} text-blue-500`} />;
    case 'completed':
      return <CheckCircle2 className={`${combinedClass} text-green-500`} />;
    case 'error':
      return <AlertTriangle className={`${combinedClass} text-red-500`} />;
    case 'cancelled':
      return <X className={`${combinedClass} text-slate-500`} />;
    default:
      return <Clock className={`${combinedClass} text-slate-500`} />;
  }
}

// Utilitários para preparar os dados
function getOrderStatus(transaction: Transaction): string {
  // Se o pagamento ainda não foi aprovado, não pode ter sido processado
  if (transaction.status !== 'approved' && transaction.status !== 'processed') {
    return 'not_applicable';
  }
  
  // Se o status já indica que foi processado
  if (transaction.status === 'processed') {
    return 'processed';
  }
  
  // Se tem ordens associadas, foi processado
  if (transaction.orders && transaction.orders.length > 0) {
    return 'processed';
  }
  
  // Verificar se está em processamento
  if (transaction.metadata?.processing_status === 'processing') {
    return 'processing';
  }
  
  // Verificar se houve erro no processamento
  if (transaction.metadata?.processing_status === 'error') {
    return 'error';
  }
  
  // Verificar se foi processado com sucesso
  if (transaction.metadata?.processing_status === 'success') {
    return 'processed';
  }
  
  // Se o pagamento está aprovado mas não há informação sobre processamento
  return 'not_processed';
}

function getTargetData(transaction: Transaction): { type: string; value?: string; count?: number } {
  // Verificar se é um pedido com múltiplos posts/reels
  if (transaction.metadata?.posts && Array.isArray(transaction.metadata.posts)) {
    return {
      type: 'links',
      count: transaction.metadata.posts.length
    };
  }
  
  if (transaction.metadata?.selectedPosts && Array.isArray(transaction.metadata.selectedPosts)) {
    return {
      type: 'links',
      count: transaction.metadata.selectedPosts.length
    };
  }
  
  if (transaction.metadata?.reels && Array.isArray(transaction.metadata.reels)) {
    return {
      type: 'links',
      count: transaction.metadata.reels.length
    };
  }
  
  if (transaction.metadata?.selectedReels && Array.isArray(transaction.metadata.selectedReels)) {
    return {
      type: 'links',
      count: transaction.metadata.selectedReels.length
    };
  }
  
  // Verificar se é um pedido com username/perfil
  if (transaction.metadata?.username) {
    return {
      type: 'username',
      value: transaction.metadata.username
    };
  }
  
  if (transaction.metadata?.profile?.username) {
    return {
      type: 'username',
      value: transaction.metadata.profile.username
    };
  }
  
  // Verificar se é um pedido com link específico
  if (transaction.metadata?.link) {
    return {
      type: 'link',
      value: transaction.metadata.link
    };
  }
  
  if (transaction.metadata?.target_link) {
    return {
      type: 'link',
      value: transaction.metadata.target_link
    };
  }
  
  // Caso não tenha informações suficientes
  return {
    type: 'unknown'
  };
} 