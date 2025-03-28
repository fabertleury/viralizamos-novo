import { 
  QuestionMarkCircledIcon, 
  Cross2Icon, 
  ExclamationTriangleIcon,
  FileTextIcon
} from "@radix-ui/react-icons";
import { AlertTriangle, Info, CheckCircle, HandHelping } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function AdminGuideButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <QuestionMarkCircledIcon className="h-4 w-4" />
          <span>Guia de Ajuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <HandHelping className="h-5 w-5" />
            Guia para Resolver Pedidos com Erro
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h3 className="text-lg font-medium flex items-center text-blue-800 mb-2">
              <Info className="h-5 w-5 mr-2" />
              Sobre Erros nos Pedidos
            </h3>
            <p className="text-sm text-blue-700">
              Quando um pedido apresenta erro, significa que houve um problema ao enviá-lo para o provedor, mesmo que o pagamento tenha sido aprovado. Nesta seção, você encontrará informações sobre como resolver esses erros manualmente.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="error-quantity">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Erro: Quantidade menor que o mínimo
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                  <p className="text-sm"><strong>Causa:</strong> O provedor exige uma quantidade mínima (geralmente 100) para realizar o pedido, mas o cliente solicitou uma quantidade menor.</p>
                </div>
                
                <h4 className="font-medium mt-2">Como resolver:</h4>
                <ol className="space-y-2 pl-5 list-decimal text-sm">
                  <li>Verifique na mensagem de erro qual é a quantidade mínima exigida pelo provedor.</li>
                  <li>Clique no botão <strong>"Enviar Manualmente"</strong> - o sistema já sugere automaticamente a quantidade mínima necessária.</li>
                  <li>Confirme o envio e o sistema atualizará o pedido com a nova quantidade.</li>
                  <li>Se necessário, notifique o cliente que a quantidade foi ajustada para atender aos requisitos do provedor.</li>
                </ol>
                
                <div className="bg-green-50 border border-green-200 p-3 rounded mt-2">
                  <p className="text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>O sistema cobrará apenas a quantidade solicitada pelo cliente, mesmo que o pedido tenha sido enviado com uma quantidade maior. A diferença será processada internamente.</span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="error-provider">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                  Erro: Falha na comunicação com o provedor
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <p className="text-sm"><strong>Causa:</strong> Houve uma falha temporária na comunicação com o provedor de serviços, ou o provedor retornou um erro específico.</p>
                </div>
                
                <h4 className="font-medium mt-2">Como resolver:</h4>
                <ol className="space-y-2 pl-5 list-decimal text-sm">
                  <li>Primeiro, clique em <strong>"Verificar Status"</strong> para ver se o pedido já foi processado pelo provedor mesmo com o erro.</li>
                  <li>Se o status não foi atualizado, tente clicar em <strong>"Reprocessar"</strong> na transação para enviar novamente todos os pedidos.</li>
                  <li>Se o erro persistir, clique em <strong>"Enviar Manualmente"</strong> - isso fará uma nova tentativa usando as mesmas informações.</li>
                  <li>Se nenhuma das opções acima funcionar, verifique diretamente no painel do provedor se o pedido foi recebido.</li>
                </ol>
                
                <div className="bg-amber-50 border border-amber-200 p-3 rounded mt-2">
                  <p className="text-sm flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Se o pedido já estiver sendo processado pelo provedor mas ainda consta com erro no nosso sistema, use a opção <strong>"Marcar como Resolvido"</strong> para atualizar o status.</span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="error-link">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center">
                  <FileTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Erro: Problema com o link/URL enviado
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded">
                  <p className="text-sm"><strong>Causa:</strong> O link fornecido pelo cliente é inválido, está formatado incorretamente ou não é aceito pelo provedor.</p>
                </div>
                
                <h4 className="font-medium mt-2">Como resolver:</h4>
                <ol className="space-y-2 pl-5 list-decimal text-sm">
                  <li>Verifique se o link existe e pode ser acessado (clique no link exibido na interface).</li>
                  <li>Se o link estiver acessível, verifique se está no formato correto exigido pelo provedor:</li>
                  <ul className="pl-5 list-disc mt-1 mb-2">
                    <li>Para Instagram: formato <code>https://www.instagram.com/p/CODIGO/</code> ou <code>https://www.instagram.com/reel/CODIGO/</code></li>
                    <li>Para TikTok: formato <code>https://www.tiktok.com/@usuario/video/CODIGO</code></li>
                  </ul>
                  <li>Se o link precisar de correção, abra a página de detalhes da transação, faça a alteração e depois use <strong>"Enviar Manualmente"</strong>.</li>
                  <li>Se não for possível corrigir o link, entre em contato com o cliente solicitando um novo link válido.</li>
                </ol>
                
                <div className="bg-green-50 border border-green-200 p-3 rounded mt-2">
                  <p className="text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Muitos erros de link são causados por URLs encurtados ou links compartilhados diretamente do aplicativo. Peça sempre links completos e originais ao cliente.</span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="marking-resolved">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Quando marcar um pedido como resolvido?
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="bg-green-50 border border-green-200 p-3 rounded">
                  <p className="text-sm"><strong>Quando usar:</strong> Use a opção "Marcar como Resolvido" quando você verificou manualmente que o problema foi resolvido, mas o sistema ainda mostra o erro.</p>
                </div>
                
                <h4 className="font-medium mt-2">Situações comuns:</h4>
                <ul className="space-y-2 pl-5 list-disc text-sm">
                  <li>Você verificou diretamente no painel do provedor que o pedido está sendo processado normalmente.</li>
                  <li>Você enviou o pedido manualmente fora do sistema e precisa atualizar o status.</li>
                  <li>O erro foi resolvido de outra forma (por exemplo, reembolso ao cliente) e você precisa limpar o alerta.</li>
                  <li>Após usar "Verificar Status" e confirmar que está tudo certo, mas o sistema ainda mostra o erro.</li>
                </ul>
                
                <div className="bg-amber-50 border border-amber-200 p-3 rounded mt-2">
                  <p className="text-sm flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Ao marcar como resolvido, o pedido será movido para o status "pendente" e não aparecerá mais na lista de erros. Use esta opção apenas quando tiver certeza que o problema foi de fato resolvido.</span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="bg-gray-50 border p-4 rounded-md mt-4">
            <h3 className="text-lg font-medium mb-2">Fluxograma recomendado para resolução</h3>
            <ol className="space-y-3 pl-5 list-decimal">
              <li className="text-sm">
                <strong>Verificar Status</strong> - Para ver se o pedido já foi processado pelo provedor
              </li>
              <li className="text-sm">
                <strong>Reprocessar</strong> - Se o pedido ainda não foi processado, tente reprocessar a transação
              </li>
              <li className="text-sm">
                <strong>Enviar Manualmente</strong> - Se o reprocessamento falhar, ajuste os parâmetros e envie manualmente
              </li>
              <li className="text-sm">
                <strong>Marcar como Resolvido</strong> - Se você resolveu o problema de outra forma ou confirmou que está correto
              </li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 