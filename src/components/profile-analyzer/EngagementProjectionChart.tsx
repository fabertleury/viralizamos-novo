import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FaChartLine, FaRocket } from 'react-icons/fa';

interface EngagementData {
  followers: number;
  likes: number;
  comments: number;
  reelViews?: number;
}

interface EngagementProjectionChartProps {
  currentData: EngagementData;
  projectedData: EngagementData;
}

export function EngagementProjectionChart({ 
  currentData, 
  projectedData 
}: EngagementProjectionChartProps) {
  // Preparar dados para o gráfico
  const chartData = [
    {
      name: 'Atual',
      seguidores: currentData.followers,
      curtidas: currentData.likes,
      comentarios: currentData.comments,
      visualizacoes: currentData.reelViews || 0
    },
    {
      name: 'Com Viralizamos',
      seguidores: projectedData.followers,
      curtidas: projectedData.likes,
      comentarios: projectedData.comments,
      visualizacoes: projectedData.reelViews || 0
    }
  ];

  // Calcular porcentagens de crescimento
  const calculateGrowthPercentage = (current: number, projected: number) => {
    return ((projected - current) / current * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center">
          <FaChartLine className="mr-3 text-blue-500" />
          Projeção de Engajamento
        </h3>
        <div className="flex items-center text-green-600">
          <FaRocket className="mr-2" />
          Potencializado por Viralizamos.com
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de Projeção */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="seguidores" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Seguidores"
              />
              <Line 
                type="monotone" 
                dataKey="curtidas" 
                stroke="#82ca9d" 
                name="Curtidas"
              />
              <Line 
                type="monotone" 
                dataKey="comentarios" 
                stroke="#ffc658" 
                name="Comentários"
              />
              <Line 
                type="monotone" 
                dataKey="visualizacoes" 
                stroke="#ff7300" 
                name="Visualizações"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhes de Crescimento */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Seguidores</h4>
            <div className="flex justify-between items-center">
              <span className="text-lg">{currentData.followers} → {projectedData.followers}</span>
              <span className="text-green-600 font-bold">
                +{calculateGrowthPercentage(currentData.followers, projectedData.followers)}%
              </span>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Curtidas</h4>
            <div className="flex justify-between items-center">
              <span className="text-lg">{currentData.likes} → {projectedData.likes}</span>
              <span className="text-green-600 font-bold">
                +{calculateGrowthPercentage(currentData.likes, projectedData.likes)}%
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Comentários</h4>
            <div className="flex justify-between items-center">
              <span className="text-lg">{currentData.comments} → {projectedData.comments}</span>
              <span className="text-green-600 font-bold">
                +{calculateGrowthPercentage(currentData.comments, projectedData.comments)}%
              </span>
            </div>
          </div>

          {currentData.reelViews && projectedData.reelViews && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Visualizações de Reels</h4>
              <div className="flex justify-between items-center">
                <span className="text-lg">{currentData.reelViews} → {projectedData.reelViews}</span>
                <span className="text-green-600 font-bold">
                  +{calculateGrowthPercentage(currentData.reelViews, projectedData.reelViews)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-purple-50 p-4 rounded-lg text-center">
        <p className="text-purple-800 font-semibold">
          Com os serviços da Viralizamos, seu perfil pode crescer significativamente em engajamento e visibilidade!
        </p>
      </div>
    </div>
  );
}
