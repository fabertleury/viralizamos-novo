'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface SimpleProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (provider: Provider) => void;
}

export function SimpleProviderModal({ 
  isOpen, 
  onClose, 
  onSelectProvider 
}: SimpleProviderModalProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    console.log('SimpleProviderModal - isOpen:', isOpen);
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      // Criar provedores de teste
      const testProviders = [
        { id: '1', name: 'Provedor 1', slug: 'provedor-1', description: 'Descrição do provedor 1' },
        { id: '2', name: 'Provedor 2', slug: 'provedor-2', description: 'Descrição do provedor 2' },
        { id: '3', name: 'Fama nas Redes', slug: 'fama-redes', description: 'Provedor de serviços para redes sociais' }
      ];
      
      setProviders(testProviders);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar provedores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Selecione um Provedor</DialogTitle>
          <DialogDescription>
            Escolha um provedor para importar serviços via API
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 mt-4">
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            providers.map(provider => (
              <div 
                key={provider.id}
                className="border p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectProvider(provider)}
              >
                <h3 className="font-medium">{provider.name}</h3>
                <p className="text-sm text-gray-500">{provider.description}</p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
