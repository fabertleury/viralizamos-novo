import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { APIConfig, APIContext } from '@/types/api-configuration';

export function useAPIConfiguration() {
  const [apiConfigurations, setApiConfigurations] = useState<{[key in APIContext]?: APIConfig}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  const fetchAPIConfigurations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('api_configurations')
        .select('*');

      if (error) throw error;

      if (data) {
        const configMap = data.reduce((acc, config) => {
          acc[config.context as APIContext] = {
            id: config.id,
            context: config.context,
            name: config.name,
            type: config.type,
            endpoint: config.endpoint,
            rapidApiKey: config.rapid_api_key,
            rapidApiHost: config.rapid_api_host,
            description: config.description,
            pageLink: config.page_link,
            isActive: config.is_active,
            createdAt: config.created_at,
            updatedAt: config.updated_at
          };
          return acc;
        }, {} as {[key in APIContext]?: APIConfig});

        setApiConfigurations(configMap);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações de API:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Não foi possível carregar as configurações de API');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const updateAPIConfiguration = async (
    context: APIContext, 
    config: Partial<APIConfig>
  ) => {
    try {
      const { data, error } = await supabase
        .from('api_configurations')
        .update({
          name: config.name,
          type: config.type,
          endpoint: config.endpoint,
          rapid_api_key: config.rapidApiKey,
          rapid_api_host: config.rapidApiHost,
          description: config.description,
          page_link: config.pageLink,
          is_active: config.isActive ?? true
        })
        .eq('context', context)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setApiConfigurations(prev => ({
          ...prev,
          [context]: {
            ...prev[context],
            ...config
          }
        }));

        toast.success(`Configuração de API para ${context} atualizada com sucesso`);
      }
    } catch (err) {
      console.error(`Erro ao atualizar configuração de API para ${context}:`, err);
      toast.error(`Não foi possível atualizar a configuração de API para ${context}`);
    }
  };

  const getAPIConfigByContext = (context: APIContext) => {
    return apiConfigurations[context];
  };

  useEffect(() => {
    fetchAPIConfigurations();
  }, [fetchAPIConfigurations]);

  return {
    apiConfigurations,
    isLoading,
    error,
    fetchAPIConfigurations,
    updateAPIConfiguration,
    getAPIConfigByContext
  };
}
