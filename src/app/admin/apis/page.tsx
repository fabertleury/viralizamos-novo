'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAPIConfiguration } from '@/hooks/useAPIConfiguration';
import { APIContext, APIConfig } from '@/types/api-configuration';
import { toast } from 'sonner';

export default function APIConfigurationPage() {
  const { 
    apiConfigurations, 
    isLoading, 
    error, 
    updateAPIConfiguration 
  } = useAPIConfiguration();

  const [selectedContext, setSelectedContext] = useState<APIContext | null>(null);
  const [editingConfig, setEditingConfig] = useState<Partial<APIConfig>>({});

  useEffect(() => {
    if (selectedContext && apiConfigurations[selectedContext]) {
      setEditingConfig(apiConfigurations[selectedContext] || {});
    }
  }, [selectedContext, apiConfigurations]);

  const handleContextChange = (context: APIContext) => {
    setSelectedContext(context);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContext) {
      toast.error('Selecione um contexto antes de salvar');
      return;
    }

    try {
      await updateAPIConfiguration(selectedContext, editingConfig);
      toast.success(`Configuração para ${selectedContext} atualizada com sucesso`);
    } catch (err) {
      toast.error('Erro ao atualizar configuração');
    }
  };

  if (isLoading) return <div>Carregando configurações...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configuração de APIs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seletor de Contexto */}
        <div>
          <label htmlFor="context-select" className="block mb-2">
            Selecione o Contexto
          </label>
          <select 
            id="context-select"
            className="w-full p-2 border rounded"
            value={selectedContext || ''}
            onChange={(e) => handleContextChange(e.target.value as APIContext)}
          >
            <option value="">Selecione um contexto</option>
            {Object.keys(apiConfigurations).map((context) => (
              <option key={context} value={context}>
                {context}
              </option>
            ))}
          </select>
        </div>

        {/* Formulário de Configuração */}
        {selectedContext && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">
              Configuração: {selectedContext}
            </h2>

            <div>
              <label htmlFor="name" className="block mb-2">Nome da API</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editingConfig.name || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="endpoint" className="block mb-2">Endpoint</label>
              <input
                type="text"
                id="endpoint"
                name="endpoint"
                value={editingConfig.endpoint || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="rapidApiKey" className="block mb-2">Chave RapidAPI</label>
              <input
                type="text"
                id="rapidApiKey"
                name="rapidApiKey"
                value={editingConfig.rapidApiKey || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="rapidApiHost" className="block mb-2">Host RapidAPI</label>
              <input
                type="text"
                id="rapidApiHost"
                name="rapidApiHost"
                value={editingConfig.rapidApiHost || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="pageLink" className="block mb-2">Link da Página</label>
              <input
                type="text"
                id="pageLink"
                name="pageLink"
                value={editingConfig.pageLink || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Ex: /checkout/curtidas"
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={editingConfig.description || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="type" className="block mb-2">Tipo de API</label>
              <select
                id="type"
                name="type"
                value={editingConfig.type || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione o tipo</option>
                <option value="profile_info">Informações de Perfil</option>
                <option value="posts">Posts</option>
                <option value="reels">Reels</option>
                <option value="followers">Seguidores</option>
                <option value="comments">Comentários</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Salvar Configuração
            </button>
          </form>
        )}
      </div>

      {/* Preview de Configuração */}
      {selectedContext && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold mb-2">Preview da Configuração</h3>
          <pre className="bg-white p-3 rounded overflow-x-auto">
            {JSON.stringify(apiConfigurations[selectedContext], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
