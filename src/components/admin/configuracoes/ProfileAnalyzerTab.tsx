import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ProfileAnalyzerStats {
  id: number;
  requestCount: number;
  createdAt: string;
}

interface ProfileAnalyzerConfig {
  id: number;
  isEnabled: boolean;
}

export function ProfileAnalyzerTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ProfileAnalyzerStats[]>([]);
  const [config, setConfig] = useState<ProfileAnalyzerConfig | null>(null);

  // Buscar configurações e estatísticas
  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/configuracoes/profile-analyzer');
      const data = await response.json();
      
      setStats(data.stats);
      setConfig(data.config);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar configuração
  const handleToggle = async (checked: boolean) => {
    try {
      const response = await fetch('/api/admin/configuracoes/profile-analyzer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled: checked,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      
      toast.success(checked ? 'Análise de perfil ativada!' : 'Análise de perfil desativada!');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Preparar dados para o gráfico
  const chartData = stats.map(stat => ({
    data: new Date(stat.createdAt).toLocaleDateString('pt-BR'),
    requisicoes: stat.requestCount,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Análise de Perfil</h3>
            <p className="text-sm text-gray-500">
              Habilitar ou desabilitar a funcionalidade de análise de perfil
            </p>
          </div>
          <Switch
            checked={config?.isEnabled || false}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        <div className="mt-8">
          <h4 className="text-md font-medium mb-4">Requisições nos últimos 30 dias</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="data"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requisicoes"
                  name="Requisições"
                  stroke="#FF00C4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-500">Total de Requisições</h5>
              <p className="text-2xl font-bold mt-1">
                {stats.reduce((acc, stat) => acc + stat.requestCount, 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-500">Média Diária</h5>
              <p className="text-2xl font-bold mt-1">
                {stats.length > 0
                  ? Math.round(
                      stats.reduce((acc, stat) => acc + stat.requestCount, 0) / stats.length
                    ).toLocaleString('pt-BR')
                  : '0'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-500">Requisições Hoje</h5>
              <p className="text-2xl font-bold mt-1">
                {(stats[0]?.requestCount || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
