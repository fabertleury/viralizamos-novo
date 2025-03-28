import React, { useState } from 'react';
import { FaInstagram, FaChartLine, FaThumbsUp, FaComment, FaVideo, FaImage } from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EngagementMetric {
  value: number;
  percentage: string;
  status: string;
  alert: {
    color: string;
    message: string;
  };
}

interface InstagramAnalyticsProps {
  profile: {
    username: string;
    fullName: string;
    profilePicUrl: string;
    followers: number;
    following: number;
    totalPosts: number;
  };
  engagement: {
    likes: EngagementMetric;
    comments: EngagementMetric;
    reels: EngagementMetric;
  };
  lastPosts: Array<{
    id: string;
    type: string;
    likes: number;
    comments: number;
    views: number;
    mediaUrl: string;
  }>;
  reels: {
    totalReels: number;
    totalViews: number;
    totalLikes: number;
    averageViewsPerReel: number;
    averageLikesPerReel: number;
    topReels: Array<{
      id: string;
      views: number;
      likes: number;
      mediaUrl: string;
    }>;
  };
  suggestions: string[];
}

const getAlertColor = (color: string) => {
  switch (color) {
    case 'red': return 'bg-red-100 text-red-800';
    case 'yellow': return 'bg-yellow-100 text-yellow-800';
    case 'green': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const InstagramAnalytics: React.FC<InstagramAnalyticsProps> = ({ 
  profile, 
  engagement, 
  lastPosts, 
  reels,
  suggestions 
}) => {
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');

  // Configuração dos gráficos de Reels
  const reelViewsData = {
    labels: ['Total de Visualizações', 'Média por Reel'],
    datasets: [{
      label: 'Visualizações de Reels',
      data: [reels.totalViews, reels.averageViewsPerReel],
      backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
    }]
  };

  const reelLikesData = {
    labels: ['Total de Curtidas', 'Média por Reel'],
    datasets: [{
      label: 'Curtidas em Reels',
      data: [reels.totalLikes, reels.averageLikesPerReel],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)']
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Métricas de Reels'
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center mb-6">
        <img 
          src={profile.profilePicUrl} 
          alt={`Foto de perfil de ${profile.username}`} 
          className="w-20 h-20 rounded-full mr-4 border-4 border-blue-500"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{profile.fullName}</h1>
          <p className="text-gray-600">@{profile.username}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FaInstagram className="mr-2 text-blue-600" />
            <span className="font-semibold">Seguidores</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{profile.followers.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FaChartLine className="mr-2 text-green-600" />
            <span className="font-semibold">Posts</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{profile.totalPosts}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FaInstagram className="mr-2 text-purple-600" />
            <span className="font-semibold">Seguindo</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{profile.following.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${getAlertColor(engagement.likes.alert.color)}`}>
          <div className="flex items-center mb-2">
            <FaThumbsUp className="mr-2" />
            <span className="font-semibold">Curtidas</span>
          </div>
          <p className="text-xl font-bold">{engagement.likes.value.toFixed(0)} ({engagement.likes.percentage}%)</p>
          <p className="text-sm">{engagement.likes.alert.message}</p>
        </div>

        <div className={`p-4 rounded-lg ${getAlertColor(engagement.comments.alert.color)}`}>
          <div className="flex items-center mb-2">
            <FaComment className="mr-2" />
            <span className="font-semibold">Comentários</span>
          </div>
          <p className="text-xl font-bold">{engagement.comments.value.toFixed(0)} ({engagement.comments.percentage}%)</p>
          <p className="text-sm">{engagement.comments.alert.message}</p>
        </div>

        <div className={`p-4 rounded-lg ${getAlertColor(engagement.reels.alert.color)}`}>
          <div className="flex items-center mb-2">
            <FaVideo className="mr-2" />
            <span className="font-semibold">Visualizações de Reels</span>
          </div>
          <p className="text-xl font-bold">{engagement.reels.value.toFixed(0)} ({engagement.reels.percentage}%)</p>
          <p className="text-sm">{engagement.reels.alert.message}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sugestões de Melhoria</h2>
        <ul className="list-disc list-inside space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="text-gray-700">{suggestion}</li>
          ))}
        </ul>
      </div>

      {/* Sistema de Abas */}
      <div className="mb-6">
        <div className="flex border-b-2 border-gray-200">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`
              flex items-center px-4 py-2 text-sm font-medium 
              ${activeTab === 'posts' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            <FaImage className="mr-2" /> Publicações
          </button>
          <button 
            onClick={() => setActiveTab('reels')}
            className={`
              flex items-center px-4 py-2 text-sm font-medium 
              ${activeTab === 'reels' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            <FaVideo className="mr-2" /> Reels
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Últimas Publicações</h2>
              <div className="grid md:grid-cols-5 gap-4">
                {lastPosts.map(post => (
                  <div key={post.id} className="bg-gray-100 rounded-lg p-2">
                    <img 
                      src={post.mediaUrl} 
                      alt={`Postagem ${post.id}`} 
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span>👍 {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>👀 {post.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reels' && (
            <div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Estatísticas de Reels */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-4">
                    <FaVideo className="mr-2 text-blue-600 text-2xl" />
                    <h3 className="text-xl font-semibold text-gray-700">Resumo de Reels</h3>
                  </div>
                  <div className="space-y-2">
                    <p>Total de Reels: <span className="font-bold">{reels.totalReels}</span></p>
                    <p>Total de Visualizações: <span className="font-bold">{reels.totalViews.toLocaleString()}</span></p>
                    <p>Total de Curtidas: <span className="font-bold">{reels.totalLikes.toLocaleString()}</span></p>
                    <p>Média de Visualizações: <span className="font-bold">{reels.averageViewsPerReel.toFixed(2)}</span></p>
                    <p>Média de Curtidas: <span className="font-bold">{reels.averageLikesPerReel.toFixed(2)}</span></p>
                  </div>
                </div>

                {/* Gráficos de Reels */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Bar data={reelViewsData} options={chartOptions} />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Bar data={reelLikesData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Top Reels */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Top 5 Reels</h3>
                <div className="grid md:grid-cols-5 gap-4">
                  {reels.topReels.map(reel => (
                    <div key={reel.id} className="bg-gray-100 rounded-lg p-2">
                      <img 
                        src={reel.mediaUrl} 
                        alt={`Reel ${reel.id}`} 
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span>👀 {reel.views}</span>
                        <span>👍 {reel.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstagramAnalytics;
