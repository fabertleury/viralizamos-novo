'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Footer } from '@/components/layout/footer';
import ServicesInitializer from '@/components/system/ServicesInitializer';

interface ClientLayoutProps {
  children: React.ReactNode;
  pathname: string;
  showFooter?: boolean;
}

/**
 * Layout do cliente que encapsula a lógica client-side
 * Isso evita misturar Server Components e Client Components diretamente
 */
export default function ClientLayout({ children, pathname, showFooter = true }: ClientLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <LanguageProvider>
        <main className="flex-grow">{children}</main>
      </LanguageProvider>
      
      {/* Renderizar o footer se necessário */}
      {showFooter && <Footer />}
      
      {/* Toast notifications */}
      <Toaster richColors position="top-right" />
      
      {/* Inicialização de serviços de background */}
      <ServicesInitializer />
    </div>
  );
} 