'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TransactionData = {
  id: string;
  payment_id: string;
  payment_external_reference: string;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

type DiagnosticData = {
  environment: string;
  webhookUrl: string;
  accessTokenConfigured: boolean;
  webhookSecretConfigured: boolean;
  recentTransactions: TransactionData[];
  pendingTransactions: TransactionData[];
  serverTime: string;
};

export default function DiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState('');

  const fetchDiagnosticData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test/payment-diagnostic');
      if (!response.ok) {
        throw new Error(`Erro ao buscar diagnóstico: ${response.status}`);
      }
      
      const data = await response.json();
      setDiagnosticData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar diagnóstico:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const checkPaymentStatus = async () => {
    if (!paymentId) {
      setError('Informe um ID de pagamento');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payment/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_id: paymentId })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao verificar pagamento: ${response.status}`);
      }
      
      const data = await response.json();
      alert(`Status do pagamento ${paymentId}: ${data.status || 'desconhecido'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchDiagnosticData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Diagnóstico do Sistema de Pagamentos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card de Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Informações gerais sobre o ambiente de pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p>Carregando...</p>}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {diagnosticData && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ambiente:</span>
                  <Badge variant={diagnosticData.environment === 'production' ? 'default' : 'outline'}>
                    {diagnosticData.environment}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Token de acesso:</span>
                  <Badge variant={diagnosticData.accessTokenConfigured ? 'default' : 'destructive'}>
                    {diagnosticData.accessTokenConfigured ? 'Configurado' : 'Não configurado'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Webhook Secret:</span>
                  <Badge variant={diagnosticData.webhookSecretConfigured ? 'default' : 'destructive'}>
                    {diagnosticData.webhookSecretConfigured ? 'Configurado' : 'Não configurado'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>URL de webhook:</span>
                  <span className="text-sm truncate max-w-[180px]">{diagnosticData.webhookUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hora do servidor:</span>
                  <span>{new Date(diagnosticData.serverTime).toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={fetchDiagnosticData} disabled={loading} className="w-full">
              Atualizar Dados
            </Button>
          </CardFooter>
        </Card>
        
        {/* Card de Verificação de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Verificar Pagamento</CardTitle>
            <CardDescription>Consultar status de um pagamento específico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_id">ID do Pagamento</Label>
                <Input 
                  id="payment_id" 
                  value={paymentId} 
                  onChange={(e) => setPaymentId(e.target.value)} 
                  placeholder="Ex: 123456789" 
                />
              </div>
              <Button onClick={checkPaymentStatus} disabled={loading || !paymentId} className="w-full">
                Verificar Status
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Card de Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Testes</CardTitle>
            <CardDescription>Ferramentas de teste para o sistema de pagamentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/admin/teste-webhook'} 
              variant="outline" 
              className="w-full"
            >
              Teste de Webhook
            </Button>
            
            <Button 
              onClick={() => window.open(`${diagnosticData?.webhookUrl || ''}?test=true`, '_blank')} 
              variant="outline" 
              className="w-full"
            >
              Abrir URL do Webhook
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Transações */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Transações Recentes</TabsTrigger>
          <TabsTrigger value="pending">Transações Pendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="p-4 border rounded-md mt-2">
          {diagnosticData?.recentTransactions?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {diagnosticData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.payment_id || transaction.payment_external_reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' : 
                          transaction.status === 'pending' ? 'outline' : 
                          transaction.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {transaction.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(transaction.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">Nenhuma transação recente encontrada</p>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="p-4 border rounded-md mt-2">
          {diagnosticData?.pendingTransactions?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {diagnosticData.pendingTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.payment_id || transaction.payment_external_reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">{transaction.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {transaction.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(transaction.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPaymentId(transaction.payment_id || transaction.payment_external_reference);
                            checkPaymentStatus();
                          }}
                        >
                          Verificar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">Nenhuma transação pendente encontrada</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 