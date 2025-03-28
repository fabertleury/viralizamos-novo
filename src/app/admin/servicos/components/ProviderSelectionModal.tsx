'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  slug: string;
  api_key: string;
  api_url: string;
  status: boolean;
  metadata: {
    last_check?: string;
    balance?: string;
    api_status?: 'active' | 'inactive' | 'error';
    api_error?: string;
  };
}

interface ProviderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderSelect: (provider: Provider) => void;
}

export function ProviderSelectionModal({ isOpen, onClose, onProviderSelect }: ProviderSelectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProviders = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('status', true)
          .order('name');
          
        if (error) throw error;
        
        setProviders(data || []);
      } catch (error: any) {
        console.error("Erro ao carregar provedores:", error);
        toast.error(error.message || "Erro ao carregar provedores");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [isOpen, supabase]);

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProviderSelect = (provider: Provider) => {
    onProviderSelect(provider);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecione um Provedor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Buscar provedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Provedores Online */}
              {filteredProviders.filter(p => p.metadata?.api_status === 'active').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-green-700 mb-2">API Online</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProviders
                      .filter(p => p.metadata?.api_status === 'active')
                      .map((provider) => (
                        <div
                          key={provider.id}
                          className="border rounded-lg p-4 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
                          onClick={() => handleProviderSelect(provider)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-semibold">
                                {provider.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{provider.name}</h4>
                              <div className="flex items-center mt-1">
                                <span className="inline-flex rounded-full h-2 w-2 mr-2 bg-green-500"></span>
                                <span className="text-xs text-green-600">Ativo</span>
                              </div>
                            </div>
                          </div>
                          {provider.metadata?.balance && (
                            <div className="mt-2 text-sm text-gray-500">
                              Saldo: <span className="font-medium">{provider.metadata.balance}</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Provedores Offline ou com Erro */}
              {filteredProviders.filter(p => p.metadata?.api_status !== 'active').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">API Offline ou com Erro</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProviders
                      .filter(p => p.metadata?.api_status !== 'active')
                      .map((provider) => (
                        <div
                          key={provider.id}
                          className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
                          onClick={() => handleProviderSelect(provider)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-600 font-semibold">
                                {provider.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{provider.name}</h4>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex rounded-full h-2 w-2 mr-2 ${
                                  provider.metadata?.api_status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></span>
                                <span className={`text-xs ${
                                  provider.metadata?.api_status === 'error' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {provider.metadata?.api_status === 'error' ? 'Erro' : 'Inativo'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {provider.metadata?.balance && (
                            <div className="mt-2 text-sm text-gray-500">
                              Saldo: <span className="font-medium">{provider.metadata.balance}</span>
                            </div>
                          )}
                          {provider.metadata?.api_error && (
                            <div className="mt-2 text-xs text-red-500 truncate" title={provider.metadata.api_error}>
                              Erro: {provider.metadata.api_error}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {filteredProviders.length === 0 && (
                <div className="p-4 text-center text-gray-500 border rounded-md">
                  Nenhum provedor encontrado
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
