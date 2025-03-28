import { Loader2 } from "lucide-react";

export default function TransacoesLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transações</h1>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm h-[600px] flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium mb-2">Carregando transações...</p>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Estamos buscando todas as suas transações e pedidos associados. Isso pode levar alguns segundos.
        </p>
      </div>
    </div>
  );
} 