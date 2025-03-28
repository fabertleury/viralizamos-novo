'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, CheckCircle, AlertTriangle, Send, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

interface Transaction {
  id: string;
  created_at: string;
  status: string | null;
  amount?: number;
  payment_method?: string;
  payment_id?: string;
  service_id?: string;
  metadata?: Record<string, unknown>;
  customer_name?: string;
  customer_email?: string;
  services?: {
    name?: string;
  };
  orders?: Array<{
    id: string;
    status: string;
  }>;
}

interface ManualTransactionCardProps {
  transaction?: Transaction;
  onRefresh?: () => void;
  onClose?: () => void;
  onTransactionCreated?: (transaction: Transaction) => void;
}

export function ManualTransactionCard({ 
  transaction, 
  onRefresh, 
  onClose, 
  onTransactionCreated 
}: ManualTransactionCardProps) {
  const [processingOrder, setProcessingOrder] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  // Estado para formulário de criação
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceName: '',
    amount: 0,
    notes: '',
  });

  const time = transaction?.created_at 
    ? formatDistanceToNow(new Date(transaction.created_at), { locale: ptBR, addSuffix: true })
    : 'Novo';

  const amount = transaction?.amount 
    ? (transaction.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '---';

  const serviceName = transaction?.services?.name || 
    (transaction?.metadata?.service as { name?: string })?.name || 'Serviço';

  const isProcessed = transaction?.orders && transaction.orders.length > 0;
  const isManual = transaction?.metadata?.manual_transaction === true;
  const isCreateMode = !transaction;

  // Função para processar manualmente a transação
  const handleProcessManually = async () => {
    if (!transaction) return;
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
      onRefresh?.();
    } catch (error) {
      console.error('Error processing transaction:', error);
      toast.error('Erro ao processar transação', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  // Função para verificar o status do pagamento
  const handleCheckStatus = async () => {
    if (!transaction) return;
    setCheckingStatus(true);
    
    try {
      const response = await fetch('/api/payment/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: transaction.payment_id || (transaction.metadata?.payment as { id?: string })?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status do pagamento');
      }
      
      await response.json(); // Consumir o response
      toast.success('Status do pagamento atualizado');
      onRefresh?.();
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Erro ao verificar pagamento');
    } finally {
      setCheckingStatus(false);
    }
  };
  
  // Função para criar transação manual
  const handleCreateTransaction = async () => {
    if (formData.customerName.trim() === '' || formData.serviceName.trim() === '' || formData.amount <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Criar transação manualmente no banco de dados
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          status: 'approved',
          amount: Math.round(formData.amount * 100), // Converter para centavos
          payment_method: 'admin_manual',
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          metadata: {
            manual_transaction: true,
            notes: formData.notes,
            service: {
              name: formData.serviceName
            },
            customer: {
              name: formData.customerName
            },
            contact: {
              email: formData.customerEmail
            }
          }
        })
        .select()
        .single();
        
      if (transactionError) {
        throw new Error(transactionError.message);
      }
      
      toast.success('Transação manual criada com sucesso');
      
      if (onTransactionCreated && transactionData) {
        onTransactionCreated(transactionData);
      }
    } catch (error) {
      console.error('Error creating manual transaction:', error);
      toast.error('Erro ao criar transação manual', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Renderizar formulário de criação
  if (isCreateMode) {
    return (
      <Card className="fixed inset-0 m-auto max-w-md max-h-[600px] z-50 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Nova Transação Manual</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome do Cliente *</Label>
              <Input 
                id="customerName" 
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email do Cliente</Label>
              <Input 
                id="customerEmail" 
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceName">Nome do Serviço *</Label>
              <Input 
                id="serviceName" 
                value={formData.serviceName}
                onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                placeholder="Ex: 1000 Seguidores Instagram"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input 
                id="amount" 
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Informações adicionais sobre esta transação"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleCreateTransaction}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : "Criar Transação"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Renderizar detalhes da transação (modo de visualização)
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium">{serviceName}</h3>
            <p className="text-xs text-muted-foreground">{time}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex gap-2 mb-1">
              <Badge 
                variant="secondary" 
                className={
                  transaction?.status === 'approved' ? 'bg-green-100 text-green-800' :
                  transaction?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }
              >
                {transaction?.status === 'approved' ? 'Aprovado' :
                 transaction?.status === 'pending' ? 'Pendente' :
                 transaction?.status === 'processed' ? 'Processado' : 'Rejeitado'}
              </Badge>

              {isManual && (
                <Badge variant="outline" className="bg-pink-50 text-pink-800 border-pink-200">
                  Manual
                </Badge>
              )}
              
              {isProcessed ? (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" /> Processado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Não processado
                </Badge>
              )}
            </div>
            <p className="font-bold">{amount}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">ID:</span>{' '}
            <span className="font-mono text-xs">{transaction?.id.slice(0, 12)}...</span>
          </p>
          
          {transaction?.metadata?.username && (
            <p>
              <span className="text-muted-foreground">Usuário:</span>{' '}
              {transaction.metadata.username as string}
            </p>
          )}
          
          {transaction?.metadata?.link && (
            <p>
              <span className="text-muted-foreground">Link:</span>{' '}
              <span className="truncate inline-block max-w-[200px]">{transaction.metadata.link as string}</span>
            </p>
          )}
          
          {transaction?.orders && transaction.orders.length > 0 && (
            <p>
              <span className="text-muted-foreground">Pedidos:</span>{' '}
              {transaction.orders.length}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          {transaction?.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCheckStatus}
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>
          )}
          
          {transaction?.status === 'approved' && !isProcessed && (
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
          )}
          
          <Button
            variant={isProcessed ? "outline" : "secondary"}
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/admin/transacoes/${transaction?.id}`)}
          >
            {isProcessed ? "Ver detalhes" : "Detalhes"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 