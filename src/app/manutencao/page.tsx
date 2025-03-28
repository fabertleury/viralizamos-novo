import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaginaManutencao() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <Image 
            src="/manutencao.svg" 
            alt="Modo Manutenção" 
            width={300} 
            height={300} 
            className="mb-6"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">
          Modo de Manutenção Ativado
        </h1>
        
        <p className="text-gray-600 mb-6">
          Nosso sistema está temporariamente em modo de manutenção. 
          Estamos trabalhando para melhorar sua experiência.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/">Página Inicial</Link>
          </Button>
          
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Para mais informações, entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}
