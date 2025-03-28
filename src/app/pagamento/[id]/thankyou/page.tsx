import React from 'react';
import Link from 'next/link';
import { Confetti } from '@neoconfetti/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Metadata } from 'next';

interface ThankYouPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Obrigado pelo seu pedido - ViralIzai',
  description: 'Seu pedido foi confirmado e está sendo processado.',
};

export default function ThankYouPage({ params }: ThankYouPageProps) {
  const { id } = params;
  
  // Simulando uma transação aprovada para demonstração
  const isApproved = true;
  const serviceName = "Serviço ViralIzai";
  
  return (
    <div className="container max-w-md py-8 flex flex-col min-h-[90vh]">
      {isApproved && (
        <div className="fixed top-0 left-0 w-full h-screen pointer-events-none">
          <Confetti
            duration={3000}
            particleCount={100}
          />
        </div>
      )}
      
      <Link href="/transacoes" className="inline-flex items-center text-sm mb-4 hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Voltar para minhas transações
      </Link>
      
      <Card className="flex-grow">
        <CardHeader className="text-center pb-4">
          {isApproved ? (
            <div className="mx-auto bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="mx-auto bg-amber-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
            </div>
          )}
          
          <CardTitle className="text-xl">
            {isApproved ? 'Recebemos seu pagamento!' : 'Pagamento em processamento'}
          </CardTitle>
          
          <CardDescription>
            {isApproved 
              ? 'Seu pagamento foi confirmado e seu pedido está sendo processado.' 
              : 'Estamos aguardando a confirmação do seu pagamento.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <div className="text-sm space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Serviço:</span>
              <span className="font-medium">{serviceName}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{id.slice(0, 8)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">
                {isApproved ? 'Confirmado' : 'Aguardando confirmação'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium">
                {(199.90).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mt-6">
            {isApproved ? (
              <p>
                Obrigado por escolher nossos serviços! Em breve você receberá atualizações sobre o seu pedido.
              </p>
            ) : (
              <p>
                Assim que recebermos a confirmação do seu pagamento, processaremos seu pedido.
                Isso pode levar alguns minutos.
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full" variant={isApproved ? "default" : "outline"}>
            <Link href="/transacoes">
              {isApproved ? 'Ver minhas transações' : 'Atualizar status'}
            </Link>
          </Button>
          
          {!isApproved && (
            <Button asChild variant="ghost" className="w-full">
              <Link href={`/pagamento/${id}`}>
                Voltar para página de pagamento
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 