import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TransactionErrorProps {
  transaction: any;
  onResolve: (transactionId: string) => Promise<void>;
  onForceProcess: (transactionId: string) => Promise<void>;
  isProcessing: boolean;
}

export default function TransactionErrorDetails({
  transaction,
  onResolve,
  onForceProcess,
  isProcessing
}: TransactionErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Determinar o tipo de problema baseado nos dados
  const hasNoOrders = !transaction.orders || transaction.orders.length === 0;
  const hasInvalidProviders = transaction.orders?.some(
    (order: any) => !order.provider_id && !order.metadata?.provider_id
  );
  const hasPaymentIssues = transaction.status !== 'approved';
  
  // Extrair mensagens de erro relevantes
  const errorMessages = transaction.orders?.flatMap((order: any) => 
    order.metadata?.provider_error || order.metadata?.error_message || []
  ).filter(Boolean) || [];
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Transação com Problemas: #{transaction.id.substring(0, 8)}</span>
              <Badge variant={transaction.status === 'approved' ? 'success' : 'destructive'}>
                {transaction.status === 'approved' ? 'Pago' : transaction.status || 'Status Desconhecido'}
              </Badge>
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Detectados em: {new Date().toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ocultar Detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Ver Detalhes
                </>
              )}
            </Button>
            
            <Button 
              size="sm"
              variant="default"
              onClick={() => onForceProcess(transaction.id)}
              disabled={isProcessing}
            >
              Forçar Processamento
            </Button>
            
            <Button 
              size="sm"
              variant="outline"
              onClick={() => onResolve(transaction.id)}
              disabled={isProcessing}
            >
              Marcar Resolvido
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex gap-2 items-start">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800">Problemas Detectados:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                  {hasNoOrders && (
                    <li className="text-amber-700">
                      <strong>Sem pedidos associados</strong> - A transação foi paga mas nenhum pedido foi criado
                    </li>
                  )}
                  
                  {hasInvalidProviders && (
                    <li className="text-amber-700">
                      <strong>Provedores inválidos</strong> - Um ou mais pedidos não possuem um provedor válido associado
                    </li>
                  )}
                  
                  {hasPaymentIssues && (
                    <li className="text-amber-700">
                      <strong>Problemas de pagamento</strong> - A transação não está marcada como aprovada
                    </li>
                  )}
                  
                  {errorMessages.length > 0 && (
                    <li className="text-amber-700">
                      <strong>Erros reportados</strong> - Há mensagens de erro específicas nos pedidos
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          {showDetails && (
            <div className="space-y-3 mt-3">
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="orders">Pedidos ({transaction.orders?.length || 0})</TabsTrigger>
                  <TabsTrigger value="json">Dados Brutos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="p-3 border rounded-md mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Detalhes do Cliente</h4>
                      <div className="mt-1">
                        <div className="text-sm">Nome: {transaction.metadata?.customer?.name || 'N/A'}</div>
                        <div className="text-sm">Email: {transaction.metadata?.contact?.email || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Detalhes da Transação</h4>
                      <div className="mt-1">
                        <div className="text-sm">Data: {new Date(transaction.created_at).toLocaleString()}</div>
                        <div className="text-sm">Valor: R$ {transaction.amount?.toFixed(2) || '0.00'}</div>
                        <div className="text-sm">Método: {transaction.payment_method || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-500">Ações Recomendadas</h4>
                    <div className="mt-1 bg-blue-50 border border-blue-100 p-2 rounded">
                      <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                        {hasNoOrders && (
                          <li>Utilize <strong>Forçar Processamento</strong> para tentar criar os pedidos novamente</li>
                        )}
                        
                        {hasInvalidProviders && (
                          <li>Verifique se os serviços associados possuem provedores válidos configurados</li>
                        )}
                        
                        {hasPaymentIssues && (
                          <li>Verifique o status do pagamento diretamente na plataforma de pagamento</li>
                        )}
                        
                        <li>Se o problema não puder ser resolvido, use <strong>Marcar Resolvido</strong> para remover da lista</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="orders" className="p-3 border rounded-md mt-2">
                  {transaction.orders && transaction.orders.length > 0 ? (
                    <div className="divide-y">
                      {transaction.orders.map((order: any) => (
                        <div key={order.id} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">Pedido #{order.id.substring(0, 8)}</div>
                              <div className="text-sm">Status: <Badge>{order.status || 'Desconhecido'}</Badge></div>
                              <div className="text-sm">Quantidade: {order.quantity || 'N/A'}</div>
                            </div>
                            
                            <div>
                              {order.metadata?.provider_error && (
                                <div className="text-xs text-red-500 max-w-sm truncate">
                                  Erro: {order.metadata.provider_error}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>Nenhum pedido encontrado para esta transação</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="json" className="p-3 border rounded-md mt-2">
                  <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded-md max-h-64">
                    {JSON.stringify(transaction, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <div className="flex items-center justify-end mt-2 pt-2 border-t text-xs text-gray-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            ID Completo: {transaction.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 