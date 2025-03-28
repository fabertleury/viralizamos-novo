'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/viralizamos-color.png"
                alt="Viralizamos"
                width={150}
                height={40}
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Button asChild variant="ghost" className="font-medium">
                <Link href="/analisar-perfil">
                  Analisar Perfil
                </Link>
              </Button>
              <Button asChild variant="ghost" className="font-medium">
                <Link href="/servicos">
                  Serviços
                </Link>
              </Button>
              <Button asChild variant="ghost" className="font-medium">
                <Link href="/contato">
                  Contato
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="font-medium">
              <Link href="/entrar">
                Entrar
              </Link>
            </Button>
            <Button variant="primary" className="font-medium">
              Cadastre-se
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
