'use client';

import { useState } from 'react';
import { checkInstagramProfilePublic, ProfileCheckResult } from '@/lib/instagram/profileScraper';
import { Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

export default function TestScraperPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scraperResult, setScraperResult] = useState<ProfileCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [testHistory, setTestHistory] = useState<Array<{
    username: string;
    timestamp: string;
    scraperResult: ProfileCheckResult | null;
    error: string | null;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Por favor, insira um nome de usuário');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setScraperResult(null);
    setShowHtml(false);
    
    const testEntry = {
      username,
      timestamp: new Date().toISOString(),
      scraperResult: null as ProfileCheckResult | null,
      error: null as string | null
    };
    
    try {
      // Testar o scraper próprio
      console.log('Testando scraper com username:', username);
      const result = await checkInstagramProfilePublic(username);
      setScraperResult(result);
      testEntry.scraperResult = result;
      
      if (result.error) {
        setError(`Aviso: ${result.error}`);
        testEntry.error = result.error;
      }
    } catch (scraperError: any) {
      console.error('Erro no scraper:', scraperError);
      setError(`Erro no scraper: ${scraperError.message || 'Erro desconhecido'}`);
      testEntry.error = `Erro no scraper: ${scraperError.message || 'Erro desconhecido'}`;
    } finally {
      setIsLoading(false);
      setTestHistory(prev => [testEntry, ...prev]);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Teste de Scraper de Perfil do Instagram</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
            
            <div>
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
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <strong>Como funciona:</strong> Este teste verifica se um perfil do Instagram é público ou privado usando nosso scraper personalizado. 
              O scraper faz uma requisição ao servidor, que por sua vez consulta a página do perfil no Instagram e analisa o HTML para determinar o status.
            </p>
          </div>
        </div>
        
        {scraperResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Resultados para @{username}</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Resultado do Scraper */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Scraper Próprio</h3>
                
                {scraperResult && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">Status:</span>
                      <span className={`px-2 py-1 rounded text-sm ${scraperResult.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {scraperResult.isPublic ? 'Público' : 'Privado'}
                      </span>
                    </div>
                    
                    {scraperResult.profilePicUrl && (
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">Foto de Perfil:</span>
                        <img 
                          src={scraperResult.profilePicUrl} 
                          alt={username} 
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/40';
                            target.alt = 'Imagem indisponível';
                          }}
                        />
                      </div>
                    )}
                    
                    {scraperResult.fullName && (
                      <div>
                        <span className="font-semibold mr-2">Nome Completo:</span>
                        {scraperResult.fullName}
                      </div>
                    )}
                    
                    {/* Indicadores de perfil privado encontrados */}
                    {scraperResult.foundIndicators && scraperResult.foundIndicators.length > 0 && (
                      <div>
                        <div className="font-semibold mb-2">Indicadores de perfil privado encontrados:</div>
                        <ul className="list-disc pl-5 space-y-1 text-sm bg-gray-50 p-3 rounded">
                          {scraperResult.foundIndicators.map((indicator, index) => (
                            <li key={index} className="text-gray-700">
                              <code className="bg-gray-100 px-1 py-0.5 rounded">{indicator}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Contexto específico do texto "Essa conta é privada" */}
                    {scraperResult.privateTextContext && (
                      <div className="mt-4">
                        <div className="font-semibold mb-2">Contexto do texto "Essa conta é privada":</div>
                        <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                          {scraperResult.privateTextContext}
                        </pre>
                      </div>
                    )}
                    
                    {/* Trecho do HTML para análise */}
                    {scraperResult.htmlSnippet && (
                      <div className="mt-4">
                        <button 
                          onClick={() => setShowHtml(!showHtml)}
                          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {showHtml ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Ocultar HTML
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver trecho do HTML
                            </>
                          )}
                        </button>
                        
                        {showHtml && (
                          <div className="mt-2 relative">
                            <pre className="text-xs bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                              {scraperResult.htmlSnippet}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {scraperResult.error && (
                      <div className="text-red-600">
                        <span className="font-semibold mr-2">Erro:</span>
                        {scraperResult.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Histórico de Testes */}
        {testHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Histórico de Testes</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scraper
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicadores
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erro
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testHistory.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        @{entry.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.scraperResult ? (
                          <span className={`px-2 py-1 rounded text-xs ${entry.scraperResult.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {entry.scraperResult.isPublic ? 'Público' : 'Privado'}
                          </span>
                        ) : (
                          <span className="text-red-500">Erro</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.scraperResult?.foundIndicators?.length ? (
                          <span className="text-xs text-gray-600">
                            {entry.scraperResult.foundIndicators.length} encontrados
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.error ? (
                          <span className="text-red-500">{entry.error}</span>
                        ) : (
                          <span className="text-green-500">Nenhum</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
