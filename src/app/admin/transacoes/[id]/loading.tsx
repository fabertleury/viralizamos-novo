import { Loader2 } from "lucide-react";

export default function TransactionDetailsLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-medium">Carregando detalhes da transação...</h2>
          <p className="text-muted-foreground mt-2">Buscando informações da transação e seus pedidos</p>
        </div>
      </div>
    </div>
  );
} 