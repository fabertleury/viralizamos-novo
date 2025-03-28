'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, Info, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Adicionar tipagem para os parâmetros
type TransactionLogsParams = {
  id: string;
  [key: string]: string | string[];
};

interface TransactionLog {
  id: string;
  transaction_id: string;
  level: string;
  message: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface Transaction {
  id: string;
  status: string;
  payment_id: string;
  order_created: boolean;
  service_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export default function TransactionLogsPage() {
  // Usar o useParams com tipagem apropriada
  const params = useParams<TransactionLogsParams>();
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const transactionId = params.id;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar a transação
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (transactionError) {
          throw new Error(`Erro ao buscar transação: ${transactionError.message}`);
        }

        setTransaction(transactionData as Transaction);

        // Buscar os logs da transação
        const { data: logsData, error: logsError } = await supabase
          .from('transaction_logs')
          .select('*')
          .eq('transaction_id', transactionId)
          .order('created_at', { ascending: false });

        if (logsError) {
          throw new Error(`Erro ao buscar logs: ${logsError.message}`);
        }

        setLogs(logsData as TransactionLog[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    if (transactionId) {
      fetchData();
    }
  }, [transactionId, supabase]);

  const forceProcessTransaction = async () => {
    try {
      setLoading(true);
      
      // Chamar a API para forçar o processamento
      const response = await fetch('/api/admin/force-process-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar transação');
      }

      alert(`Processamento iniciado: ${result.message}`);
      
      // Recarregar a página para ver os novos logs
      window.location.reload();
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      console.error('Erro ao forçar processamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleString()} (${formatDistanceToNow(date, { locale: ptBR, addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Logs da Transação</h1>
        <Button onClick={() => window.history.back()} variant="outline">
          Voltar
        </Button>
      </div>

      {transaction && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalhes da Transação</CardTitle>
            <CardDescription>ID: {transaction.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1 flex items-center">
                  <Badge 
                    className={
                      transaction.status === 'approved' ? 'bg-green-500' : 
                      transaction.status === 'pending' ? 'bg-yellow-500' : 
                      transaction.status === 'rejected' ? 'bg-red-500' : 
                      'bg-gray-500'
                    }
                  >
                    {transaction.status}
                  </Badge>
                  {transaction.order_created && (
                    <Badge className="ml-2 bg-blue-500">Pedido Criado</Badge>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID do Pagamento</h3>
                <p className="mt-1 text-sm">{transaction.payment_id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Valor</h3>
                <p className="mt-1 text-sm">
                  {(transaction.amount || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Criada em</h3>
                <p className="mt-1 text-sm">
                  {formatDate(transaction.created_at)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Atualizada em</h3>
                <p className="mt-1 text-sm">
                  {formatDate(transaction.updated_at)}
                </p>
              </div>
              <div>
                <Button 
                  onClick={forceProcessTransaction} 
                  disabled={loading || !transaction.status || transaction.order_created}
                  className={transaction.status === 'approved' && !transaction.order_created ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Forçar Processamento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Histórico de Logs ({logs.length})</h2>
        
        {logs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Info className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum log encontrado para esta transação.</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getLevelIcon(log.level)}
                    <CardTitle className="ml-2 text-lg">
                      {log.message}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(log.created_at)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {log.metadata && (
                  <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-60">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 