import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  provider?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    api_key: string;
    api_url: string;
    status: boolean;
    metadata: any;
  };
}

export default function ProviderFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  provider 
}: ProviderFormModalProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    api_key: '',
    api_url: '',
    status: true,
    metadata: {}
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        slug: provider.slug || '',
        description: provider.description || '',
        api_key: provider.api_key || '',
        api_url: provider.api_url || '',
        status: provider.status ?? true,
        metadata: provider.metadata || {}
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        api_key: '',
        api_url: '',
        status: true,
        metadata: {}
      });
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? value === 'true' : value
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.api_url) {
        setError('Nome e URL da API são obrigatórios');
        setLoading(false);
        return;
      }

      // Gerar slug se estiver vazio
      if (!formData.slug) {
        formData.slug = formData.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }

      // Preparar os metadados
      const metadata = {
        ...provider?.metadata,
        api_status: provider?.metadata?.api_status || 'inactive',
        last_check: provider?.metadata?.last_check || new Date().toISOString(),
        balance: provider?.metadata?.balance || 0,
        currency: provider?.metadata?.currency || 'BRL'
      };

      const dataToSave = {
        ...formData,
        metadata
      };

      if (provider) {
        // Atualizar provedor existente
        const { error: updateError } = await supabase
          .from('providers')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', provider.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo provedor
        const { error: insertError } = await supabase
          .from('providers')
          .insert([{
            ...dataToSave,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  {provider ? 'Editar Provedor' : 'Novo Provedor'}
                </h3>

                <div className="mt-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                        Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div>
                      <label htmlFor="api_url" className="block text-sm font-medium leading-6 text-gray-900">
                        URL da API
                      </label>
                      <input
                        type="url"
                        name="api_url"
                        id="api_url"
                        value={formData.api_url}
                        onChange={handleChange}
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div>
                      <label htmlFor="api_key" className="block text-sm font-medium leading-6 text-gray-900">
                        API Key
                      </label>
                      <input
                        type="text"
                        name="api_key"
                        id="api_key"
                        value={formData.api_key}
                        onChange={handleChange}
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                        Status
                      </label>
                      <select
                        name="status"
                        id="status"
                        value={formData.status.toString()}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                        Descrição
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                      >
                        {loading ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
