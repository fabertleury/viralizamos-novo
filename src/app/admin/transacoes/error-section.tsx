import { Transaction } from "./transaction";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileX, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionsWithIssuesProps {
  transactions: Transaction[];
  onForceProcess: (transactionId: string) => Promise<void>;
  isProcessing: boolean;
}

export default function TransactionsWithIssues({ 
  transactions, 
  onForceProcess,
  isProcessing 
}: TransactionsWithIssuesProps) {
  // Filtrar transações com problemas
  const problemTransactions = transactions.filter(trans => 
    // Transações sem pedidos
    (trans.status === 'approved' && (!trans.orders || trans.orders.length === 0)) ||
    // Transações onde os pedidos não têm provedores válidos
    (trans.orders?.some(order => 
      !order.provider_id && 
      !order.metadata?.provider_id && 
      !order.metadata?.provider && 
      !order.metadata?.provider_name
    ))
  );
  
  if (problemTransactions.length === 0) {
    return null; // Não exibir nada se não houver transações com problemas
  }
  
  return (
    <Card className="mb-6 bg-amber-50 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-amber-800">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
          Transações com Problemas ({problemTransactions.length})
        </CardTitle>
        <CardDescription className="text-amber-700">
          Estas transações precisam de atenção pois apresentam problemas que podem impedir seu processamento adequado.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {problemTransactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="flex justify-between items-center p-3 border border-amber-200 rounded bg-white">
              <div className="flex-1">
                <div className="font-medium">
                  <span className="font-mono text-sm">#{transaction.id.substring(0, 8)}</span>
                  <span className="text-amber-600 ml-2">{getIssueType(transaction)}</span>
                </div>
                
                <div className="grid grid-cols-3 text-sm mt-1 text-gray-500">
                  <div>
                    <span className="text-gray-400">Cliente:</span> {transaction.metadata?.customer?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-400">Valor:</span> R${transaction.amount?.toFixed(2) || '0.00'}
                  </div>
                  <div>
                    <span className="text-gray-400">Data:</span> {new Date(transaction.created_at || new Date()).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => onForceProcess(transaction.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>Reprocessar</>
                  )}
                </Button>
                <Link href={`/admin/transacoes/${transaction.id}`}>
                  <Button size="sm" variant="outline">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                </Link>
              </div>
            </div>
          ))}
          
          {problemTransactions.length > 5 && (
            <div className="flex justify-center py-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/transacoes?tab=error">
                  Ver todas ({problemTransactions.length}) transações com problemas
                </Link>
              </Button>
            </div>
          )}
          
          {problemTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileX className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Não foram encontradas transações com problemas</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Função para determinar o tipo de problema
function getIssueType(transaction: Transaction): string {
  if (!transaction.orders || transaction.orders.length === 0) {
    return 'Sem pedidos associados';
  }
  
  if (transaction.orders.some(order => 
    !order.provider_id && 
    !order.metadata?.provider_id && 
    !order.metadata?.provider && 
    !order.metadata?.provider_name
  )) {
    return 'Pedidos sem provedores válidos';
  }
  
  return 'Problema desconhecido';
} 