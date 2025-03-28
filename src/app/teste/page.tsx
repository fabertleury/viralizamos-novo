'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Interface para a ordem das APIs
interface ApiOrder {
  id: number;
  name: string;
  enabled: boolean;
  order: number;
  max_requests: number;
  current_requests: number;
}

export default function TestePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiOrder, setApiOrder] = useState<ApiOrder[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState(true);
  const [activeTab, setActiveTab] = useState('verificar');

  // Inicializar o cliente do Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Carregar a ordem das APIs do Supabase
  useEffect(() => {
    const fetchApiOrder = async () => {
      setIsLoadingApis(true);
      try {
        const { data, error } = await supabase
          .from('api_order')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          console.error('Erro ao obter ordem das APIs:', error);
          toast.error('Erro ao carregar configurações de APIs');
          // Usar valores padrão se não conseguir carregar do banco
          setApiOrder([
            { id: 1, name: 'rocketapi_get_info', enabled: true, order: 1, max_requests: 100, current_requests: 0 },
            { id: 2, name: 'instagram_scraper', enabled: true, order: 2, max_requests: 50, current_requests: 0 },
            { id: 3, name: 'instagram360', enabled: true, order: 3, max_requests: 50, current_requests: 0 },
            { id: 4, name: 'instagram_scraper_ai', enabled: true, order: 4, max_requests: 30, current_requests: 0 },
            { id: 5, name: 'realtime_instagram_scraper', enabled: true, order: 5, max_requests: 50, current_requests: 0 },
            { id: 6, name: 'instagram_public_api', enabled: true, order: 6, max_requests: 1000, current_requests: 0 },
            { id: 7, name: 'instagram_web_profile_api', enabled: true, order: 7, max_requests: 1000, current_requests: 0 },
            { id: 8, name: 'instagram_dimensions_api', enabled: true, order: 8, max_requests: 1000, current_requests: 0 },
            { id: 9, name: 'html_scraping', enabled: true, order: 9, max_requests: 1000, current_requests: 0 }
          ]);
        } else if (data && data.length > 0) {
          setApiOrder(data);
        } else {
          // Se não houver dados, inserir valores padrão
          const defaultApis = [
            { id: 1, name: 'rocketapi_get_info', enabled: true, order: 1, max_requests: 100, current_requests: 0 },
            { id: 2, name: 'instagram_scraper', enabled: true, order: 2, max_requests: 50, current_requests: 0 },
            { id: 3, name: 'instagram360', enabled: true, order: 3, max_requests: 50, current_requests: 0 },
            { id: 4, name: 'instagram_scraper_ai', enabled: true, order: 4, max_requests: 30, current_requests: 0 },
            { id: 5, name: 'realtime_instagram_scraper', enabled: true, order: 5, max_requests: 50, current_requests: 0 },
            { id: 6, name: 'instagram_public_api', enabled: true, order: 6, max_requests: 1000, current_requests: 0 },
            { id: 7, name: 'instagram_web_profile_api', enabled: true, order: 7, max_requests: 1000, current_requests: 0 },
            { id: 8, name: 'instagram_dimensions_api', enabled: true, order: 8, max_requests: 1000, current_requests: 0 },
            { id: 9, name: 'html_scraping', enabled: true, order: 9, max_requests: 1000, current_requests: 0 }
          ];
          
          // Inserir valores padrão no banco
          for (const api of defaultApis) {
            await supabase
              .from('api_order')
              .insert(api);
          }
          
          setApiOrder(defaultApis);
        }
      } catch (err) {
        console.error('Erro ao acessar o Supabase:', err);
        toast.error('Erro ao carregar configurações de APIs');
      } finally {
        setIsLoadingApis(false);
      }
    };

    fetchApiOrder();
  }, []);

  // Função para verificar o perfil do Instagram
  const checkProfile = async () => {
    if (!username) {
      toast.error('Por favor, digite um nome de usuário');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Fazendo a requisição para a API GraphQL do Instagram
      const response = await fetch(`/api/instagram/graphql-check?username=${username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar o perfil');
      }

      setResult(data);
      toast.success('Perfil verificado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao verificar perfil:', err);
      setError(err.message || 'Ocorreu um erro ao verificar o perfil');
      toast.error(err.message || 'Ocorreu um erro ao verificar o perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar a ordem de uma API
  const moveApi = async (id: number, direction: 'up' | 'down') => {
    const apiIndex = apiOrder.findIndex(api => api.id === id);
    if (apiIndex === -1) return;

    const newApiOrder = [...apiOrder];
    
    if (direction === 'up' && apiIndex > 0) {
      // Trocar com o item acima
      const temp = newApiOrder[apiIndex].order;
      newApiOrder[apiIndex].order = newApiOrder[apiIndex - 1].order;
      newApiOrder[apiIndex - 1].order = temp;
      
      // Atualizar no Supabase
      try {
        await supabase
          .from('api_order')
          .update({ order: newApiOrder[apiIndex].order })
          .eq('id', newApiOrder[apiIndex].id);
        
        await supabase
          .from('api_order')
          .update({ order: newApiOrder[apiIndex - 1].order })
          .eq('id', newApiOrder[apiIndex - 1].id);
        
        // Reordenar a lista
        newApiOrder.sort((a, b) => a.order - b.order);
        setApiOrder(newApiOrder);
        toast.success('Ordem atualizada com sucesso');
      } catch (err) {
        console.error('Erro ao atualizar ordem:', err);
        toast.error('Erro ao atualizar ordem');
      }
    } else if (direction === 'down' && apiIndex < newApiOrder.length - 1) {
      // Trocar com o item abaixo
      const temp = newApiOrder[apiIndex].order;
      newApiOrder[apiIndex].order = newApiOrder[apiIndex + 1].order;
      newApiOrder[apiIndex + 1].order = temp;
      
      // Atualizar no Supabase
      try {
        await supabase
          .from('api_order')
          .update({ order: newApiOrder[apiIndex].order })
          .eq('id', newApiOrder[apiIndex].id);
        
        await supabase
          .from('api_order')
          .update({ order: newApiOrder[apiIndex + 1].order })
          .eq('id', newApiOrder[apiIndex + 1].id);
        
        // Reordenar a lista
        newApiOrder.sort((a, b) => a.order - b.order);
        setApiOrder(newApiOrder);
        toast.success('Ordem atualizada com sucesso');
      } catch (err) {
        console.error('Erro ao atualizar ordem:', err);
        toast.error('Erro ao atualizar ordem');
      }
    }
  };

  // Função para habilitar/desabilitar uma API
  const toggleApiEnabled = async (id: number) => {
    const apiIndex = apiOrder.findIndex(api => api.id === id);
    if (apiIndex === -1) return;

    const newApiOrder = [...apiOrder];
    newApiOrder[apiIndex].enabled = !newApiOrder[apiIndex].enabled;
    
    // Atualizar no Supabase
    try {
      await supabase
        .from('api_order')
        .update({ enabled: newApiOrder[apiIndex].enabled })
        .eq('id', newApiOrder[apiIndex].id);
      
      setApiOrder(newApiOrder);
      toast.success(`API ${newApiOrder[apiIndex].enabled ? 'habilitada' : 'desabilitada'} com sucesso`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  // Função para resetar o contador de requisições
  const resetRequestCount = async (id: number) => {
    const apiIndex = apiOrder.findIndex(api => api.id === id);
    if (apiIndex === -1) return;

    const newApiOrder = [...apiOrder];
    newApiOrder[apiIndex].current_requests = 0;
    
    // Atualizar no Supabase
    try {
      await supabase
        .from('api_order')
        .update({ current_requests: 0 })
        .eq('id', newApiOrder[apiIndex].id);
      
      setApiOrder(newApiOrder);
      toast.success('Contador resetado com sucesso');
    } catch (err) {
      console.error('Erro ao resetar contador:', err);
      toast.error('Erro ao resetar contador');
    }
  };

  // Função para obter o nome amigável da API
  const getApiName = (name: string) => {
    switch (name) {
      case 'rocketapi_get_info':
        return 'RocketAPI (Get Info)';
      case 'instagram_scraper':
        return 'Instagram Scraper API';
      case 'instagram360':
        return 'Instagram360 API';
      case 'instagram_scraper_ai':
        return 'Instagram Scraper AI';
      case 'realtime_instagram_scraper':
        return 'Real-Time Instagram Scraper';
      case 'instagram_public_api':
        return 'Instagram Public API';
      case 'instagram_web_profile_api':
        return 'Instagram Web Profile API';
      case 'instagram_dimensions_api':
        return 'Instagram Dimensions API';
      case 'html_scraping':
        return 'HTML Scraping';
      default:
        return name;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Teste de Verificação de Perfil do Instagram</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="verificar">Verificar Perfil</TabsTrigger>
          <TabsTrigger value="configurar">Configurar APIs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verificar">
          <Card>
            <CardHeader>
              <CardTitle>Verificar Perfil do Instagram</CardTitle>
              <CardDescription>
                Digite o nome de usuário do Instagram para verificar se o perfil é público ou privado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Nome de usuário do Instagram"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="max-w-md"
                />
                <Button 
                  onClick={checkProfile}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Verificar Perfil'}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
                  <p className="font-semibold">Erro:</p>
                  <p>{error}</p>
                </div>
              )}

              {result && (
                <div className="p-4 bg-gray-100 rounded-md">
                  <h2 className="text-xl font-semibold mb-2">Resultado:</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Nome de usuário:</p>
                      <p>{result.username}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Nome completo:</p>
                      <p>{result.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status do perfil:</p>
                      <p className={result.is_private ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                        {result.is_private ? 'Privado' : 'Público'}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">API utilizada:</p>
                      <p>{getApiName(result.source)}</p>
                    </div>
                    {result.follower_count && (
                      <div>
                        <p className="font-semibold">Seguidores:</p>
                        <p>{result.follower_count.toLocaleString()}</p>
                      </div>
                    )}
                    {result.following_count && (
                      <div>
                        <p className="font-semibold">Seguindo:</p>
                        <p>{result.following_count.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold">Dados brutos:</p>
                    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-auto mt-2 text-sm">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configurar">
          <Card>
            <CardHeader>
              <CardTitle>Configurar APIs</CardTitle>
              <CardDescription>
                Configure a ordem e o status das APIs utilizadas para verificar perfis do Instagram
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApis ? (
                <div className="text-center py-4">Carregando configurações...</div>
              ) : (
                <div className="space-y-4">
                  {apiOrder.map((api) => (
                    <div key={api.id} className="p-4 border rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{getApiName(api.name)}</h3>
                        <p className="text-sm text-gray-500">Ordem: {api.order}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${api.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <p className="text-sm">{api.enabled ? 'Habilitada' : 'Desabilitada'}</p>
                        </div>
                        <p className="text-sm mt-1">
                          Requisições: {api.current_requests} / {api.max_requests}
                        </p>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`api-switch-${api.id}`}
                            checked={api.enabled}
                            onCheckedChange={() => toggleApiEnabled(api.id)}
                          />
                          <Label htmlFor={`api-switch-${api.id}`}>
                            {api.enabled ? 'Habilitada' : 'Desabilitada'}
                          </Label>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveApi(api.id, 'up')}
                            disabled={api.order === 1}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveApi(api.id, 'down')}
                            disabled={api.order === apiOrder.length}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetRequestCount(api.id)}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                As APIs serão utilizadas na ordem definida acima. Se uma API falhar, a próxima será utilizada.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
