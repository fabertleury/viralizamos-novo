'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, CheckCircle, XCircle, ArrowUp, ArrowDown, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface ApiOrder {
  id: number;
  name: string;
  enabled: boolean;
  order: number;
  max_requests: number;
  current_requests: number;
}

interface ProfileResult {
  username: string;
  full_name: string;
  is_private: boolean;
  follower_count: number;
  following_count: number;
  profile_pic_url: string;
  source: string;
}

export default function VerificacaoInstagramPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiOrder, setApiOrder] = useState<ApiOrder[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState(true);
  const supabase = createClientComponentClient();

  // Carregar a ordem das APIs ao iniciar a página
  useEffect(() => {
    loadApiOrder();
  }, []);

  // Função para carregar a ordem das APIs do Supabase
  const loadApiOrder = async () => {
    setIsLoadingApis(true);
    try {
      // Usar a nova rota de API que criamos
      const response = await fetch('/admin/verificacao-instagram/api');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar APIs');
      }
      
      const data = await response.json();
      
      if (data.apis) {
        setApiOrder(data.apis || []);
      } else {
        // Fallback para o método anterior caso necessário
        const { data: apisData, error } = await supabase
          .from('api_order')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          console.error('Erro ao carregar ordem das APIs:', error);
          toast.error('Erro ao carregar ordem das APIs');
        } else {
          setApiOrder(apisData || []);
        }
      }
    } catch (error) {
      console.error('Erro ao acessar o Supabase:', error);
      toast.error('Erro ao acessar o banco de dados');
    } finally {
      setIsLoadingApis(false);
    }
  };

  // Função para verificar um perfil do Instagram
  const handleVerifyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Por favor, insira um nome de usuário');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`/api/instagram/graphql-check?username=${username}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar perfil');
      }
      
      setResult(data);
      
      // Recarregar a ordem das APIs para atualizar os contadores
      loadApiOrder();
    } catch (error: any) {
      console.error('Erro ao verificar perfil:', error);
      setError(error.message || 'Erro ao verificar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alternar o estado de habilitado/desabilitado de uma API
  const toggleApiEnabled = async (id: number, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('api_order')
        .update({ enabled: !enabled })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar estado da API:', error);
        toast.error('Erro ao atualizar estado da API');
      } else {
        toast.success(`API ${enabled ? 'desabilitada' : 'habilitada'} com sucesso`);
        loadApiOrder();
      }
    } catch (error) {
      console.error('Erro ao acessar o Supabase:', error);
      toast.error('Erro ao acessar o banco de dados');
    }
  };

  // Função para mover uma API para cima na ordem
  const moveApiUp = async (id: number, currentOrder: number) => {
    // Encontrar a API acima
    const apiAbove = apiOrder.find(api => api.order === currentOrder - 1);
    
    if (!apiAbove) return;
    
    try {
      // Atualizar a ordem da API atual
      await supabase
        .from('api_order')
        .update({ order: currentOrder - 1 })
        .eq('id', id);
      
      // Atualizar a ordem da API acima
      await supabase
        .from('api_order')
        .update({ order: currentOrder })
        .eq('id', apiAbove.id);
      
      toast.success('Ordem atualizada com sucesso');
      loadApiOrder();
    } catch (error) {
      console.error('Erro ao atualizar ordem das APIs:', error);
      toast.error('Erro ao atualizar ordem das APIs');
    }
  };

  // Função para mover uma API para baixo na ordem
  const moveApiDown = async (id: number, currentOrder: number) => {
    // Encontrar a API abaixo
    const apiBelow = apiOrder.find(api => api.order === currentOrder + 1);
    
    if (!apiBelow) return;
    
    try {
      // Atualizar a ordem da API atual
      await supabase
        .from('api_order')
        .update({ order: currentOrder + 1 })
        .eq('id', id);
      
      // Atualizar a ordem da API abaixo
      await supabase
        .from('api_order')
        .update({ order: currentOrder })
        .eq('id', apiBelow.id);
      
      toast.success('Ordem atualizada com sucesso');
      loadApiOrder();
    } catch (error) {
      console.error('Erro ao atualizar ordem das APIs:', error);
      toast.error('Erro ao atualizar ordem das APIs');
    }
  };

  // Função para resetar o contador de requisições de uma API
  const resetApiCounter = async (id: number) => {
    try {
      const { error } = await supabase
        .from('api_order')
        .update({ current_requests: 0 })
        .eq('id', id);

      if (error) {
        console.error('Erro ao resetar contador da API:', error);
        toast.error('Erro ao resetar contador da API');
      } else {
        toast.success('Contador resetado com sucesso');
        loadApiOrder();
      }
    } catch (error) {
      console.error('Erro ao acessar o Supabase:', error);
      toast.error('Erro ao acessar o banco de dados');
    }
  };

  // Função para formatar o nome da API para exibição
  const formatApiName = (name: string) => {
    switch (name) {
      case 'rocketapi_get_info':
        return 'RocketAPI (Get Info)';
      case 'instagram_scraper':
        return 'Instagram Scraper API';
      case 'realtime_instagram_scraper':
        return 'Real-Time Instagram Scraper';
      default:
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verificação de Perfis do Instagram</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário de verificação */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Verificar Perfil</h2>
          
          <form onSubmit={handleVerifyProfile} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nome de usuário do Instagram
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="neymarjr"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verificando...
                </span>
              ) : (
                'Verificar Perfil'
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {result && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Resultado para @{result.username}</h3>
              
              <div className="flex items-center space-x-4">
                {result.profile_pic_url && (
                  <img 
                    src={result.profile_pic_url} 
                    alt={result.username} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/64';
                      target.alt = 'Imagem indisponível';
                    }}
                  />
                )}
                
                <div>
                  <div className="font-medium">{result.full_name || result.username}</div>
                  <div className="text-sm text-gray-500">@{result.username}</div>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${result.is_private ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {result.is_private ? 'Privado' : 'Público'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      via {formatApiName(result.source)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Seguidores</div>
                  <div className="font-medium">{result.follower_count?.toLocaleString() || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Seguindo</div>
                  <div className="font-medium">{result.following_count?.toLocaleString() || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Gerenciamento de APIs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">APIs Configuradas</h2>
            <button 
              onClick={loadApiOrder}
              className="text-indigo-600 hover:text-indigo-800"
              title="Atualizar lista"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
          
          {isLoadingApis ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : apiOrder.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma API configurada
            </div>
          ) : (
            <div className="space-y-4">
              {apiOrder.map((api) => (
                <div key={api.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{formatApiName(api.name)}</h3>
                      <div className="text-sm text-gray-500">Ordem: {api.order}</div>
                      <div className="text-sm mt-1">
                        Requisições: {api.current_requests} / {api.max_requests}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <button
                        onClick={() => toggleApiEnabled(api.id, api.enabled)}
                        className={`mb-2 ${api.enabled ? 'text-green-600' : 'text-gray-400'}`}
                        title={api.enabled ? 'Habilitada' : 'Desabilitada'}
                      >
                        {api.enabled ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </button>
                      
                      <div className="text-sm">
                        {api.enabled ? 'Habilitada' : 'Desabilitada'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3 space-x-2">
                    <button
                      onClick={() => moveApiUp(api.id, api.order)}
                      disabled={api.order === 1}
                      className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveApiDown(api.id, api.order)}
                      disabled={api.order === apiOrder.length}
                      className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => resetApiCounter(api.id)}
                      className="p-1 text-gray-600 hover:text-indigo-600"
                      title="Resetar contador"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Sobre o sistema de verificação:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>As APIs são testadas na ordem configurada até que uma retorne com sucesso</li>
              <li>Cada API tem um limite mensal de requisições</li>
              <li>O sistema evita usar a mesma API consecutivamente para o mesmo usuário</li>
              <li>Você pode habilitar/desabilitar APIs e alterar sua ordem de prioridade</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
