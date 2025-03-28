'use client';

import { useEffect, useState } from 'react';
import packageJson from '../../../package.json';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

export function Footer() {
  const [productionVersion, setProductionVersion] = useState<string | null>(null);
  const localVersion = packageJson.version;

  useEffect(() => {
    // Buscar a versão em produção
    const fetchProductionVersion = async () => {
      try {
        const response = await fetch('/api/version');
        if (response.ok) {
          const data = await response.json();
          setProductionVersion(data.version);
        }
      } catch (error) {
        console.error('Erro ao buscar versão em produção:', error);
      }
    };

    // Só buscar a versão em produção se não estivermos em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      fetchProductionVersion();
    }
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e informações */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center mb-4">
              <img src="/images/viralizamos-color.png" alt="Viralizamos.com" className="h-8" />
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Impulsione sua presença no Instagram com nossos serviços de alta qualidade.
            </p>
            <div className="flex mt-2">
              <a 
                href="https://www.instagram.com/viralizamos.ia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-pink-500 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Menu</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/acompanhar-pedido" className="text-gray-400 hover:text-white transition-colors">
                  Acompanhar Pedido
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  Dúvidas Frequentes
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/5562999915390" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Suporte via WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Serviços para Instagram */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Serviços para Instagram</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/instagram/curtidas" className="text-gray-400 hover:text-white transition-colors">
                  Turbinar Curtidas
                </Link>
              </li>
              <li>
                <Link href="/instagram/seguidores" className="text-gray-400 hover:text-white transition-colors">
                  Turbinar Seguidores
                </Link>
              </li>
              <li>
                <Link href="/instagram/visualizacoes" className="text-gray-400 hover:text-white transition-colors">
                  Visualizações para Vídeos
                </Link>
              </li>
              <li>
                <Link href="/instagram/comentarios" className="text-gray-400 hover:text-white transition-colors">
                  Turbinar Comentários
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Termos e Política */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
            <Link href="/termos-de-uso" className="text-gray-400 hover:text-white transition-colors text-sm">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="text-gray-400 hover:text-white transition-colors text-sm">
              Política de Privacidade
            </Link>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Viralizamos.com. Todos os direitos reservados.
            {productionVersion && (
              <span className="ml-2">v{productionVersion}</span>
            )}
            {!productionVersion && process.env.NODE_ENV !== 'production' && (
              <span className="ml-2">v{localVersion} (dev)</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
