'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
  api_key: string;
  api_url: string;
  status: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface ProviderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (provider: Provider) => void;
}

export function ProviderSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectProvider 
}: ProviderSelectionModalProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    slug: '',
    description: '',
    api_key: '',
    api_url: '',
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      // Buscar apenas provedores ativos
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', true)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      console.log('Provedores ativos encontrados:', data);
      
      // Mostrar todos os provedores ativos, independente do status da API
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao buscar provedores:', error);
      toast.error('Erro ao buscar provedores');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultProvider = async () => {
    try {
      // Dados do provedor padrão
      const defaultProvider = {
        name: 'Fama nas Redes',
        slug: 'fama-redes',
        description: 'Provedor de serviços para redes sociais',
        api_key: '', // Será preenchido pelo administrador depois
        api_url: 'https://famanasredes.com.br/api/v2',
        status: true,
        metadata: {
          api_status: 'inactive',
          last_check: new Date().toISOString(),
          request_format: 'form',
          response_format: 'json'
        }
      };
      
      console.log('Criando provedor padrão:', defaultProvider);
      
      const { data, error } = await supabase
        .from('providers')
        .insert([defaultProvider])
        .select();
      
      if (error) {
        console.error('Erro ao criar provedor padrão:', error);
        throw error;
      }
      
      console.log('Provedor padrão criado:', data);
      
      if (data && data.length > 0) {
        setProviders(data);
        toast.success('Provedor padrão criado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar provedor padrão:', error);
      toast.error('Erro ao criar provedor padrão');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProvider(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Gerar slug automaticamente a partir do nome
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      setNewProvider(prev => ({
        ...prev,
        slug
      }));
    }
  };
  
  const handleAddProvider = async () => {
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      if (!newProvider.name || !newProvider.api_url) {
        toast.error('Nome e URL da API são obrigatórios');
        setLoading(false);
        return;
      }
      
      // Criar o provedor no Supabase
      const { data, error } = await supabase
        .from('providers')
        .insert([
          {
            name: newProvider.name,
            slug: newProvider.slug,
            description: newProvider.description,
            api_key: newProvider.api_key,
            api_url: newProvider.api_url,
            status: true,
            metadata: {
              api_status: 'inactive',
              last_check: new Date().toISOString(),
              request_format: 'form',
              response_format: 'json'
            }
          }
        ])
        .select();
      
      if (error) {
        console.error('Erro ao criar provedor:', error);
        throw error;
      }
      
      console.log('Provedor criado:', data);
      
      if (data && data.length > 0) {
        setProviders([...providers, ...data]);
        setShowAddForm(false);
        setNewProvider({
          name: '',
          slug: '',
          description: '',
          api_key: '',
          api_url: '',
        });
        toast.success('Provedor criado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar provedor:', error);
      toast.error('Erro ao criar provedor');
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
          ) : providers.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Provedores Disponíveis</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="text-xs"
                >
                  + Adicionar Novo
                </Button>
              </div>
              
              {/* Provedores Online */}
              {providers.filter(p => 
                p.metadata?.api_status === 'active' || 
                p.metadata?.api_status === 'online'
              ).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-600 mt-2 mb-2">API Online</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                    {providers
                      .filter(p => 
                        p.metadata?.api_status === 'active' || 
                        p.metadata?.api_status === 'online'
                      )
                      .map((provider) => (
                        <div
                          key={provider.id}
                          className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                          onClick={() => onSelectProvider(provider)}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-semibold">
                                  {provider.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-medium text-gray-900">{provider.name}</p>
                              <p className="truncate text-sm text-gray-500">{provider.description || provider.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center mt-auto">
                            <span className="inline-flex rounded-full h-2 w-2 mr-2 bg-green-500"></span>
                            <span className="text-xs text-green-600">API Online</span>
                            {provider.metadata?.balance !== undefined && (
                              <span className="text-xs text-gray-500 ml-2">
                                Saldo: <span className="font-medium">
                                  {provider.metadata.currency || ''} {
                                    typeof provider.metadata.balance === 'number' 
                                      ? provider.metadata.balance.toFixed(2) 
                                      : provider.metadata.balance
                                  }
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Provedores Offline */}
              {providers.filter(p => 
                p.metadata?.api_status !== 'active' && 
                p.metadata?.api_status !== 'online'
              ).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mt-2 mb-2">API Offline ou Status Desconhecido</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {providers
                      .filter(p => 
                        p.metadata?.api_status !== 'active' && 
                        p.metadata?.api_status !== 'online'
                      )
                      .map((provider) => (
                        <div
                          key={provider.id}
                          className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => onSelectProvider(provider)}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-600 font-semibold">
                                  {provider.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-medium text-gray-900">{provider.name}</p>
                              <p className="truncate text-sm text-gray-500">{provider.description || provider.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center mt-auto">
                            <span className="inline-flex rounded-full h-2 w-2 mr-2 bg-gray-300"></span>
                            <span className="text-xs text-gray-500">
                              {provider.metadata?.api_status === 'error' ? 'API com Erro' : 'Status Desconhecido'}
                            </span>
                            {provider.metadata?.balance !== undefined && (
                              <span className="text-xs text-gray-500 ml-2">
                                Saldo: <span className="font-medium">
                                  {provider.metadata.currency || ''} {
                                    typeof provider.metadata.balance === 'number' 
                                      ? provider.metadata.balance.toFixed(2) 
                                      : provider.metadata.balance
                                  }
                                </span>
                              </span>
                            )}
                          </div>
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
            </>
          ) : (
            <div className="text-center py-4">
              {showAddForm ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Adicionar Novo Provedor</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Provedor</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newProvider.name}
                      onChange={handleInputChange}
                      placeholder="Ex: SMM Panel"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={newProvider.slug}
                      onChange={handleInputChange}
                      placeholder="Ex: smm-panel"
                    />
                    <p className="text-xs text-gray-500">Identificador único para o provedor (gerado automaticamente)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      name="description"
                      value={newProvider.description}
                      onChange={handleInputChange}
                      placeholder="Ex: Provedor de serviços para redes sociais"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api_url">URL da API</Label>
                    <Input
                      id="api_url"
                      name="api_url"
                      value={newProvider.api_url}
                      onChange={handleInputChange}
                      placeholder="Ex: https://exemplo.com/api/v2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api_key">Chave da API</Label>
                    <Input
                      id="api_key"
                      name="api_key"
                      value={newProvider.api_key}
                      onChange={handleInputChange}
                      placeholder="Chave de acesso à API"
                      type="password"
                    />
                  </div>
                  
                  <div className="flex space-x-2 justify-end mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAddProvider}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {loading ? 'Salvando...' : 'Salvar Provedor'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-4">
                    {providers.length === 0 
                      ? "Nenhum provedor ativo encontrado. Adicione um provedor ou verifique o status da API na página de provedores."
                      : "Nenhum provedor com API online encontrado. Verifique o status da API na página de provedores."}
                  </p>
                  <Button 
                    variant="default"
                    onClick={() => setShowAddForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Adicionar Novo Provedor
                  </Button>
                  <p className="mt-4 text-sm text-gray-500">
                    Ou acesse a página de configuração de provedores para mais opções.
                  </p>
                  <div className="mt-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/admin/provedores'}
                      className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                    >
                      Ir para Configurações de Provedores
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
