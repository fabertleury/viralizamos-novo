import { AlertTriangle, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorData {
  error: string;
  description: string;
  solution: string[];
}

const errorTypes: Record<string, ErrorData> = {
  "error_min_quantity": {
    error: "Quantidade menor que o mínimo",
    description: "O provedor exige uma quantidade mínima para este serviço.",
    solution: [
      "Use o botão 'Enviar Manualmente' para reenviar com a quantidade mínima exigida.",
      "O sistema já sugere automaticamente a quantidade mínima necessária.",
      "O cliente será cobrado apenas pela quantidade original solicitada."
    ]
  },
  "error_provider": {
    error: "Falha na comunicação com o provedor",
    description: "Houve um problema ao se comunicar com o serviço do provedor.",
    solution: [
      "Primeiro, use o botão 'Verificar Status' para checar se o pedido já foi processado.",
      "Tente o botão 'Reprocessar' para enviar novamente todos os pedidos da transação.",
      "Como última opção, use 'Enviar Manualmente' para tentar com os mesmos parâmetros."
    ]
  },
  "error_link": {
    error: "Link ou URL inválido",
    description: "O link fornecido pelo cliente é inválido ou não é aceito pelo provedor.",
    solution: [
      "Verifique se o link existe e pode ser acessado.",
      "Certifique-se que o formato está correto conforme exigências do provedor.",
      "Caso necessário, solicite um novo link ao cliente e use 'Enviar Manualmente'."
    ]
  },
  "error_target": {
    error: "Usuário de destino inválido",
    description: "O nome de usuário de destino não é válido ou não foi encontrado.",
    solution: [
      "Verifique se o nome de usuário existe e está correto.",
      "Remova caracteres especiais ou '@' no início do nome de usuário.",
      "Certifique-se que a conta do usuário não está privada ou bloqueada."
    ]
  },
};

export function ErrorHelper({ errorType, errorMessage }: { errorType: string; errorMessage: string }) {
  // Remover prefixo "error_" se existir
  const normalizedErrorType = errorType.replace('error_', '');
  
  // Tentar encontrar o tipo de erro no nosso dicionário
  const errorInfo = Object.entries(errorTypes).find(([key]) => 
    key.includes(normalizedErrorType) || normalizedErrorType.includes(key.replace('error_', ''))
  );

  const errorData = errorInfo ? errorInfo[1] : null;

  if (!errorData) {
    return (
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro não categorizado</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Este erro não foi categorizado em nosso sistema. Veja a mensagem original:</p>
          <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">{errorMessage}</pre>
          <p className="mt-2 text-sm">
            Tente utilizar as ações disponíveis para resolver o problema ou contate o suporte técnico.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4" variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{errorData.error}</AlertTitle>
      <AlertDescription>
        <p className="mt-1 mb-2">{errorData.description}</p>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Como resolver:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {errorData.solution.map((step, index) => (
              <li key={index} className="text-sm">{step}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-3 text-xs flex items-center">
          <Info className="h-3 w-3 mr-1" />
          <span>Consulte o <a href="#" className="underline inline-flex items-center">guia completo <ExternalLink className="h-3 w-3 ml-0.5" /></a> para mais detalhes sobre a resolução de erros.</span>
        </div>
      </AlertDescription>
    </Alert>
  );
} 