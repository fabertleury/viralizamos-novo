import React from 'react';
import { 
  FaChartBar, 
  FaCalendarAlt, 
  FaClock, 
  FaHashtag, 
  FaUsers, 
  FaCommentDots,
  FaChartPie,
  FaPercentage
} from 'react-icons/fa';

interface AdvancedMetricsProps {
  profileData: {
    followers_count?: number;
    following_count?: number;
  };
  contentData: Array<{
    type: string;
    likes: number;
    comments: number;
    timestamp: number;
  }>;
}

export function AdvancedMetrics({ profileData, contentData }: AdvancedMetricsProps) {
  // Calcular métricas avançadas
  const calculateAdvancedMetrics = () => {
    // Distribuição de tipos de conteúdo
    const contentTypeDistribution = contentData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Engagement Rate
    const totalLikes = contentData.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = contentData.reduce((sum, item) => sum + item.comments, 0);
    const engagementRate = profileData.followers_count 
      ? ((totalLikes + totalComments) / (profileData.followers_count * contentData.length)) * 100 
      : 0;

    // Horários de postagem mais frequentes
    const postTimestamps = contentData.map(item => new Date(item.timestamp * 1000));
    const postHours = postTimestamps.map(date => date.getHours());
    const mostFrequentPostHour = getMostFrequentValue(postHours);

    // Dias da semana mais frequentes
    const postDays = postTimestamps.map(date => date.getDay());
    const mostFrequentPostDay = getMostFrequentValue(postDays);
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return {
      contentTypeDistribution,
      engagementRate: engagementRate.toFixed(2),
      mostFrequentPostHour,
      mostFrequentPostDay: dayNames[mostFrequentPostDay],
      totalPosts: contentData.length,
      averageLikesPerPost: (totalLikes / contentData.length).toFixed(2),
      averageCommentsPerPost: (totalComments / contentData.length).toFixed(2)
    };
  };

  // Função auxiliar para encontrar o valor mais frequente
  const getMostFrequentValue = (arr: number[]) => {
    const frequencyMap = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Number(Object.keys(frequencyMap).reduce((a, b) => 
      frequencyMap[Number(a)] > frequencyMap[Number(b)] ? a : b
    ));
  };

  const metrics = calculateAdvancedMetrics();

  // Função para gerar sugestões com base nos dados do perfil
  const getSuggestion = (profileData: { followers_count?: number; following_count?: number }) => {
    const followersCount = profileData.followers_count || 0;
    
    // Verificar padrões específicos e gerar sugestões
    if (followersCount < 1000) {
      return "Para aumentar sua visibilidade, foque em publicar conteúdo consistente e de qualidade. Use hashtags relevantes para sua audiência.";
    } else if (followersCount >= 1000 && followersCount < 5000) {
      return "Seu perfil está crescendo! Considere colaborações com outros criadores de conteúdo para expandir seu alcance.";
    } else if (followersCount >= 5000 && followersCount < 10000) {
      return "Você está próximo de um marco importante! Continue engajando com sua comunidade e considere criar conteúdo exclusivo para seus seguidores mais ativos.";
    } else if (followersCount >= 10000 && followersCount < 50000) {
      return "Com mais de 10k seguidores, você pode acessar recursos como links em stories. Considere parcerias com marcas relevantes para seu nicho.";
    } else if (followersCount >= 50000 && followersCount < 100000) {
      return "Seu alcance é significativo! Diversifique seu conteúdo e considere expandir para outras plataformas para criar uma presença digital mais robusta.";
    } else {
      return "Com sua grande base de seguidores, você tem influência significativa. Foque em conteúdo de alta qualidade e considere monetizar sua presença através de parcerias estratégicas.";
    }
  };

  // Obter sugestão com base no perfil
  const suggestion = getSuggestion(profileData);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <FaChartBar className="mr-3 text-blue-500" /> 
        Métricas Avançadas
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Distribuição de Conteúdo */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <FaChartPie className="mr-2" /> Distribuição de Conteúdo
          </h4>
          {Object.entries(metrics.contentTypeDistribution).map(([type, count]) => (
            <div key={type} className="flex justify-between text-sm">
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>

        {/* Taxa de Engajamento */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <FaPercentage className="mr-2" /> Taxa de Engajamento
          </h4>
          <p className="text-2xl font-bold text-green-600">{metrics.engagementRate}%</p>
          <p className="text-sm text-gray-600">Interações por seguidor</p>
        </div>

        {/* Horário de Postagem */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <FaClock className="mr-2" /> Melhor Horário
          </h4>
          <p className="text-xl font-bold">{metrics.mostFrequentPostHour}h</p>
          <p className="text-sm text-gray-600">Horário mais frequente de postagem</p>
        </div>

        {/* Dia da Semana */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <FaCalendarAlt className="mr-2" /> Melhor Dia
          </h4>
          <p className="text-xl font-bold">{metrics.mostFrequentPostDay}</p>
          <p className="text-sm text-gray-600">Dia mais frequente de postagem</p>
        </div>

        {/* Total de Posts */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center">
            <FaHashtag className="mr-2" /> Total de Posts
          </h4>
          <p className="text-2xl font-bold">{metrics.totalPosts}</p>
        </div>

        {/* Média de Curtidas */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
            <FaUsers className="mr-2" /> Média de Curtidas
          </h4>
          <p className="text-xl font-bold">{metrics.averageLikesPerPost}</p>
          <p className="text-sm text-gray-600">Curtidas por post</p>
        </div>

        {/* Média de Comentários */}
        <div className="bg-pink-50 p-4 rounded-lg">
          <h4 className="font-semibold text-pink-800 mb-2 flex items-center">
            <FaCommentDots className="mr-2" /> Média de Comentários
          </h4>
          <p className="text-xl font-bold">{metrics.averageCommentsPerPost}</p>
          <p className="text-sm text-gray-600">Comentários por post</p>
        </div>
      </div>

      {/* Sugestão Geral */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
        <h4 className="font-bold text-lg mb-2">Sugestão Geral</h4>
        <p className="text-gray-800">{suggestion}</p>
      </div>
    </div>
  );
}
