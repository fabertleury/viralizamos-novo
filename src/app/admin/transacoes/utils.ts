import { toast } from "sonner";

// Função para verificar o status de um pedido
export const handleCheckOrderStatus = async (orderId: string) => {
  try {
    toast.loading("Verificando status do pedido...");
    
    const response = await fetch('/api/admin/check-order-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId
      }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      if (result.status_changed) {
        toast.success("Status atualizado com sucesso!");
      } else {
        toast.success("Status verificado, sem alterações necessárias.");
      }
      return true;
    } else {
      toast.error(`Erro ao verificar status: ${result.error || "Erro desconhecido"}`);
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar status do pedido:", error);
    toast.error("Erro ao verificar status do pedido");
    return false;
  }
};

// Função para enviar um pedido manualmente para o provedor
export const handleSendManually = async (
  orderId: string, 
  transactionId: string, 
  username: string, 
  link: string, 
  quantity: number,
  setIsLoading: (value: boolean) => void,
  fetchTransactions: () => Promise<void>
) => {
  try {
    setIsLoading(true);
    toast.loading("Enviando pedido manualmente...");
    
    const response = await fetch('/api/admin/send-order-manually', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        transaction_id: transactionId,
        username,
        link,
        quantity
      }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      toast.success("Pedido enviado com sucesso! Atualizando dados...");
      await fetchTransactions(); // Atualizar lista de transações
      return true;
    } else {
      toast.error(`Erro ao enviar pedido: ${result.error || "Erro desconhecido"}`);
      return false;
    }
  } catch (error) {
    console.error("Erro ao enviar pedido manualmente:", error);
    toast.error("Erro ao enviar pedido");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Função para marcar um pedido como resolvido
export const handleMarkAsResolved = async (
  orderId: string,
  setIsLoading: (value: boolean) => void,
  fetchTransactions: () => Promise<void>
) => {
  try {
    setIsLoading(true);
    toast.loading("Atualizando status do pedido...");
    
    const response = await fetch('/api/admin/mark-order-resolved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId
      }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      toast.success("Pedido marcado como resolvido");
      await fetchTransactions(); // Atualizar lista de transações
      return true;
    } else {
      toast.error(`Erro: ${result.error || "Erro desconhecido"}`);
      return false;
    }
  } catch (error) {
    console.error("Erro ao marcar pedido como resolvido:", error);
    toast.error("Erro ao atualizar pedido");
    return false;
  } finally {
    setIsLoading(false);
  }
};

// Função para processar uma transação
export const handleProcessTransaction = async (
  transactionId: string,
  setProcessingOrder: (value: string | null) => void,
  fetchTransactions: () => Promise<void>
) => {
  if (!transactionId) return false;
  
  try {
    setProcessingOrder(transactionId);
    toast.loading("Processando transação...");

    const response = await fetch('/api/orders/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId: transactionId
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      let errorMessage = 'Erro ao processar pedido';
      
      if (response.status === 401) {
        errorMessage = 'Você precisa estar autenticado para processar pedidos';
      } else if (response.status === 403) {
        errorMessage = 'Você não tem permissão para processar pedidos. Apenas administradores podem fazer isso.';
      } else if (responseData.error) {
        errorMessage = responseData.error;
      }
      
      toast.error(errorMessage);
      return false;
    }

    // Atualizar os dados
    await fetchTransactions();
    
    toast.success('Pedido processado com sucesso!');
    return true;
  } catch (error: unknown) {
    console.error('Error processing order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    toast.error(errorMessage || 'Erro ao processar pedido');
    return false;
  } finally {
    setProcessingOrder(null);
  }
};

// Função para verificar o status de pagamento de uma transação
export const handleTransactionCheck = async (
  transaction: { id: string; metadata?: { payment?: { id?: string } } },
  setLoadingPayment: (value: string | null) => void,
  fetchTransactions: () => Promise<void>
) => {
  try {
    setLoadingPayment(transaction.id);
    toast.loading('Verificando status do pagamento...');

    const response = await fetch(`/api/payment/verify-status?id=${transaction.metadata?.payment?.id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar status do pagamento');
    }

    await fetchTransactions();
    
    toast.success('Status do pagamento verificado com sucesso!');
    return true;
  } catch (error: unknown) {
    console.error('Error checking payment status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    toast.error('Erro ao verificar status', {
      description: errorMessage
    });
    return false;
  } finally {
    setLoadingPayment(null);
  }
}; 