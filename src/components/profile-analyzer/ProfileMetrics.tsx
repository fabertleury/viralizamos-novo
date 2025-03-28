import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ProfileMetricsProps {
  contentData: {
    id: string;
    type: string;
    likes: number;
    comments: number;
    timestamp: number;
  }[];
}

export function ProfileMetrics({ contentData }: ProfileMetricsProps) {
  // Agregar dados por tipo de conteúdo
  const contentTypeMetrics = {
    images: {
      total: 0,
      totalLikes: 0,
      totalComments: 0
    },
    videos: {
      total: 0,
      totalLikes: 0,
      totalComments: 0
    },
    carousels: {
      total: 0,
      totalLikes: 0,
      totalComments: 0
    }
  };

  contentData.forEach(item => {
    switch (item.type) {
      case 'image':
        contentTypeMetrics.images.total++;
        contentTypeMetrics.images.totalLikes += item.likes;
        contentTypeMetrics.images.totalComments += item.comments;
        break;
      case 'video':
        contentTypeMetrics.videos.total++;
        contentTypeMetrics.videos.totalLikes += item.likes;
        contentTypeMetrics.videos.totalComments += item.comments;
        break;
      case 'carousel':
        contentTypeMetrics.carousels.total++;
        contentTypeMetrics.carousels.totalLikes += item.likes;
        contentTypeMetrics.carousels.totalComments += item.comments;
        break;
    }
  });

  // Preparar dados para gráfico
  const chartData = [
    {
      name: 'Imagens',
      total: contentTypeMetrics.images.total,
      likes: contentTypeMetrics.images.totalLikes,
      comments: contentTypeMetrics.images.totalComments
    },
    {
      name: 'Vídeos',
      total: contentTypeMetrics.videos.total,
      likes: contentTypeMetrics.videos.totalLikes,
      comments: contentTypeMetrics.videos.totalComments
    },
    {
      name: 'Carrosséis',
      total: contentTypeMetrics.carousels.total,
      likes: contentTypeMetrics.carousels.totalLikes,
      comments: contentTypeMetrics.carousels.totalComments
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Métricas de Conteúdo</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <h4 className="font-semibold text-gray-700">Total de Posts</h4>
          <p className="text-2xl font-bold text-blue-600">
            {contentData.length}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <h4 className="font-semibold text-gray-700">Total de Likes</h4>
          <p className="text-2xl font-bold text-green-600">
            {contentData.reduce((sum, item) => sum + item.likes, 0)}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <h4 className="font-semibold text-gray-700">Total de Comentários</h4>
          <p className="text-2xl font-bold text-red-600">
            {contentData.reduce((sum, item) => sum + item.comments, 0)}
          </p>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Total de Posts" />
            <Bar dataKey="likes" fill="#82ca9d" name="Total de Likes" />
            <Bar dataKey="comments" fill="#ffc658" name="Total de Comentários" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
