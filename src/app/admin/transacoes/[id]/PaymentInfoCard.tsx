'use client';

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RefreshCw, CheckCircle, Clock, AlertTriangle, Loader2, 
  ExternalLink, LinkIcon, Send 
} from "lucide-react";
import { toast } from "sonner";

interface PaymentInfoCardProps {
  transaction: {
    id: string;
    status: string;
    amount: number;
    amount_paid?: number;
    created_at?: string;
    payment_method?: string;
    customer_email?: string;
    delivered?: boolean;
    customer_links?: string[];
  };
  processingTransaction: boolean;
  setProcessingTransaction: (value: boolean) => void;
  fetchTransactionDetails: () => void;
}

export default function PaymentInfoCard({ 
  transaction, 
  processingTransaction, 
  setProcessingTransaction,
  fetchTransactionDetails 
}: PaymentInfoCardProps) {
  
  // Função para enviar manualmente para o cliente
  async function handleSendToCustomer() {
    setProcessingTransaction(true);
    try {
      toast.loading("Enviando manualmente para o cliente...");

      // Extrair todas as informações necessárias
      const { id, customer_email, customer_links } = transaction;
      
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
          transaction_id: id,
          customer_email,
          customer_links
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao enviar para o cliente');
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

  // Formatar status para exibição
  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pendente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">{getStatusBadge(transaction.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Valor do Serviço</dt>
            <dd className="mt-1 font-semibold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount / 100)}
            </dd>
          </div>
          {transaction.amount_paid && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Valor Pago</dt>
              <dd className="mt-1 font-semibold text-green-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount_paid / 100)}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Data</dt>
            <dd className="mt-1">
              {transaction.created_at 
                ? format(new Date(transaction.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                : 'N/A'}
            </dd>
          </div>
          {transaction.payment_method && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Método de Pagamento</dt>
              <dd className="mt-1 capitalize">{transaction.payment_method}</dd>
            </div>
          )}
          
          {/* Links adicionados pelo cliente */}
          {transaction.customer_links && transaction.customer_links.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <dt className="text-sm font-medium text-muted-foreground">Links do Cliente</dt>
              <dd className="mt-2">
                <div className="space-y-2">
                  {transaction.customer_links.map((link, index) => (
                    <div key={index} className="flex items-center bg-gray-50 p-2 rounded">
                      <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm truncate flex-1"
                      >
                        {link}
                      </a>
                      <ExternalLink className="h-4 w-4 ml-1 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </dd>
              
              {/* Botão para enviar manualmente para o cliente */}
              {transaction.status === 'approved' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-3 w-full"
                  onClick={handleSendToCustomer}
                  disabled={processingTransaction}
                >
                  {processingTransaction ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Manualmente para o Cliente
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
} 