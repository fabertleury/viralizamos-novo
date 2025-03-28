import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface GrowthAnalysisProps {
  data: {
    username: string;
    followers_count: number;
    posts: Array<{
      likes_count: number;
      comments_count: number;
      timestamp: number;
    }>;
  };
}

export function GrowthAnalysis({ data }: GrowthAnalysisProps) {
  const router = useRouter();

  if (!data?.posts || !Array.isArray(data.posts)) {
    return null;
  }

  // Preparar dados para o gráfico de crescimento
  const growthData = useMemo(() => {
    if (data.posts.length === 0) {
      return [];
    }

    const currentLikes = data.posts.map(post => ({
      data: new Date(post.timestamp * 1000).toLocaleDateString('pt-BR'),
      atual: post.likes_count || 0,
      projetado: Math.round((post.likes_count || 0) * 2.5) // Projeção com Viralizamos
    })).slice(0, 12); // Últimos 12 posts

    return currentLikes.reverse(); // Ordem cronológica
  }, [data.posts]);

  // Calcular médias para o gráfico de barras
  const averages = useMemo(() => {
    if (data.posts.length === 0) {
      return [
        { name: 'Curtidas', atual: 0, projetado: 0 },
        { name: 'Comentários', atual: 0, projetado: 0 }
      ];
    }

    const avgLikes = Math.round(
      data.posts.reduce((acc, post) => acc + (post.likes_count || 0), 0) / data.posts.length
    );
    const avgComments = Math.round(
      data.posts.reduce((acc, post) => acc + (post.comments_count || 0), 0) / data.posts.length
    );

    return [
      {
        name: 'Curtidas',
        atual: avgLikes,
        projetado: Math.round(avgLikes * 2.5),
      },
      {
        name: 'Comentários',
        atual: avgComments,
        projetado: Math.round(avgComments * 2),
      },
    ];
  }, [data.posts]);

  const handleBuyService = (service: 'likes' | 'comments') => {
    router.push(`/checkout/${service}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-6">Análise de Crescimento</h3>

      {/* Gráfico de Crescimento */}
      <div className="h-[400px] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="atual"
              name="Engajamento Atual"
              stroke="#9CA3AF"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="projetado"
              name="Com Viralizamos"
              stroke="#FF00C4"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Barras */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={averages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="atual" name="Atual" fill="#9CA3AF" />
            <Bar dataKey="projetado" name="Com Viralizamos" fill="#FF00C4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Button 
          onClick={() => handleBuyService('likes')}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          Aumentar Curtidas
        </Button>
        <Button 
          onClick={() => handleBuyService('comments')}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
        >
          Aumentar Comentários
        </Button>
      </div>
    </div>
  );
}
