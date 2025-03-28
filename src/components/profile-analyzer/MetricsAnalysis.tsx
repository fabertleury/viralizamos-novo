import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatNumber } from '@/lib/utils';
import { FaHeart, FaComment, FaPlay, FaCalendar, FaChartLine, FaUsers, FaPercent, FaUser, FaTag, FaGlobe, FaCheckCircle, FaLink, FaPhone, FaEnvelope, FaImage, FaUserFriends } from 'react-icons/fa';
import { format, fromUnixTime, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricsAnalysisProps {
  profile: {
    username: string;
    full_name: string;
    biography: string;
    follower_count: number;
    following_count: number;
    is_private: boolean;
    is_verified: boolean;
    media_count: number;
    profile_pic_url: string;
    category?: string;
    external_url?: string;
    about?: {
      country?: string;
      date_joined?: string;
    };
    contact_phone_number?: string;
    public_email?: string;
  };
  posts: Array<{
    id: string;
    media_type: number;
    likes_count: number;
    comments_count: number;
    caption: string;
    is_video: boolean;
    view_count?: number;
    timestamp: number;
    hashtags: string[];
    carousel_media?: Array<{
      image_versions: {
        items: Array<{
          url: string;
          width: number;
          height: number;
        }>;
      };
    }>;
    image_versions?: {
      items: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    };
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function MetricsAnalysis({ profile, posts }: MetricsAnalysisProps) {
  // Função auxiliar para formatar data do post
  const formatPostTimestamp = (timestamp: number) => {
    try {
      // Verifica se o timestamp está em milissegundos (13 dígitos)
      const isMilliseconds = timestamp.toString().length === 13;
      
      // Se for em segundos, converte para milissegundos
      const dateInMillis = isMilliseconds ? timestamp : timestamp * 1000;
      
      // Verifica se a data é válida
      if (isNaN(dateInMillis) || dateInMillis < 0) {
        console.warn('Timestamp inválido:', timestamp);
        return 'Data indisponível';
      }

      const date = new Date(dateInMillis);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data do post:', error, 'Timestamp:', timestamp);
      return 'Data indisponível';
    }
  };

  // Função auxiliar para formatar hora
  const formatPostHour = (timestamp: number) => {
    try {
      // Verifica se o timestamp está em milissegundos (13 dígitos)
      const isMilliseconds = timestamp.toString().length === 13;
      
      // Se for em segundos, converte para milissegundos
      const dateInMillis = isMilliseconds ? timestamp : timestamp * 1000;
      
      // Verifica se a data é válida
      if (isNaN(dateInMillis) || dateInMillis < 0) {
        console.warn('Timestamp inválido:', timestamp);
        return '00:00';
      }

      const date = new Date(dateInMillis);
      return format(date, 'HH:00', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar hora:', error, 'Timestamp:', timestamp);
      return '00:00';
    }
  };

  // Cálculo das médias
  const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments_count, 0);
  const totalViews = posts.reduce((sum, post) => {
    if (post.is_video && post.view_count) {
      return sum + post.view_count;
    }
    return sum;
  }, 0);

  const videoCount = posts.filter(post => post.is_video).length;
  
  const averageLikes = totalLikes / posts.length;
  const averageComments = totalComments / posts.length;
  const averageViews = videoCount > 0 ? totalViews / videoCount : 0;
  const averageEngagement = profile.follower_count > 0 
    ? ((averageLikes + averageComments) / profile.follower_count) * 100 
    : 0;

  // Análise de métricas baseada nas regras
  const analyzeLikes = () => {
    const minExpected = Math.round(profile.follower_count * 0.01); // 1%
    const maxExpected = Math.round(profile.follower_count * 0.03); // 3%
    
    if (averageLikes < minExpected) {
      return {
        status: 'red',
        message: `Taxa de curtidas abaixo do esperado. Meta mínima: ${formatNumber(minExpected)} curtidas por post.`
      };
    } else if (averageLikes >= maxExpected) {
      return {
        status: 'green',
        message: `Excelente taxa de curtidas! Acima de ${formatNumber(maxExpected)} por post.`
      };
    }
    return {
      status: 'yellow',
      message: 'Taxa de curtidas dentro da média, mas pode melhorar.'
    };
  };

  const analyzeComments = () => {
    const minExpected = Math.round(profile.follower_count * 0.001); // 0.1%
    const maxExpected = Math.round(profile.follower_count * 0.003); // 0.3%
    
    if (averageComments < minExpected) {
      return {
        status: 'red',
        message: `Baixo engajamento nos comentários. Meta mínima: ${formatNumber(minExpected)} por post.`
      };
    } else if (averageComments >= maxExpected) {
      return {
        status: 'green',
        message: `Ótimo engajamento nos comentários! Acima de ${formatNumber(maxExpected)} por post.`
      };
    }
    return {
      status: 'yellow',
      message: 'Engajamento médio nos comentários, busque mais interações.'
    };
  };

  const analyzeViews = () => {
    if (videoCount === 0) {
      return {
        status: 'yellow',
        message: 'Nenhum vídeo/reels encontrado no período analisado.'
      };
    }

    const minExpected = Math.round(profile.follower_count * 0.1); // 10%
    const maxExpected = Math.round(profile.follower_count * 0.2); // 20%
    
    if (averageViews < minExpected) {
      return {
        status: 'red',
        message: `Visualizações abaixo do esperado. Meta: ${formatNumber(minExpected)} views por vídeo.`
      };
    } else if (averageViews >= maxExpected) {
      return {
        status: 'green',
        message: `Excelente alcance nos vídeos! Acima de ${formatNumber(maxExpected)} views.`
      };
    }
    return {
      status: 'yellow',
      message: 'Visualizações dentro da média para o seu número de seguidores.'
    };
  };

  const likesAnalysis = analyzeLikes();
  const commentsAnalysis = analyzeComments();
  const viewsAnalysis = analyzeViews();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red': return 'text-red-500';
      case 'yellow': return 'text-yellow-500';
      case 'green': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'red': return 'bg-red-100';
      case 'yellow': return 'bg-yellow-100';
      case 'green': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  // Cálculo das porcentagens
  const likesPercentage = profile.follower_count > 0 ? (averageLikes / profile.follower_count) * 100 : 0;
  const commentsPercentage = profile.follower_count > 0 ? (averageComments / profile.follower_count) * 100 : 0;
  const viewsPercentage = profile.follower_count > 0 ? (averageViews / profile.follower_count) * 100 : 0;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Informações do Perfil */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Informações do Perfil</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaUser className="text-purple-600 w-5 h-5" />
                <span className="font-medium text-lg">{profile.full_name}</span>
                {profile.is_verified && (
                  <FaCheckCircle className="text-blue-500 w-5 h-5" title="Verificado" />
                )}
              </div>
              {profile.category && (
                <div className="flex items-center gap-2">
                  <FaTag className="text-purple-600 w-5 h-5" />
                  <span className="text-base">{profile.category}</span>
                </div>
              )}
              {profile.about?.country && (
                <div className="flex items-center gap-2">
                  <FaGlobe className="text-purple-600 w-5 h-5" />
                  <span className="text-base">{profile.about.country}</span>
                </div>
              )}
              {profile.about?.date_joined && (
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-purple-600 w-5 h-5" />
                  <span className="text-base">Membro desde {profile.about.date_joined}</span>
                </div>
              )}
              {profile.external_url && (
                <div className="flex items-center gap-2">
                  <FaLink className="text-purple-600 w-5 h-5" />
                  <a href={profile.external_url} target="_blank" rel="noopener noreferrer" className="text-base text-blue-600 hover:underline">
                    {profile.external_url}
                  </a>
                </div>
              )}
              {profile.contact_phone_number && (
                <div className="flex items-center gap-2">
                  <FaPhone className="text-purple-600 w-5 h-5" />
                  <span className="text-base">{profile.contact_phone_number}</span>
                </div>
              )}
              {profile.public_email && (
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-purple-600 w-5 h-5" />
                  <a href={`mailto:${profile.public_email}`} className="text-base text-blue-600 hover:underline">
                    {profile.public_email}
                  </a>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(profile.follower_count)}
                </div>
                <div className="text-sm text-gray-600">Seguidores</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(profile.following_count)}
                </div>
                <div className="text-sm text-gray-600">Seguindo</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(profile.media_count)}
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(averageLikes + averageComments, 2)}%
                </div>
                <div className="text-sm text-gray-600">Engajamento</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Métricas principais com análise */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className={`p-6 ${getStatusBg(likesAnalysis.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaHeart className={`w-6 h-6 ${getStatusColor(likesAnalysis.status)}`} />
              <h3 className="text-lg font-semibold">Curtidas</h3>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusBg(likesAnalysis.status)}`}>
              {likesAnalysis.status === 'green' ? 'Ótimo' : likesAnalysis.status === 'yellow' ? 'Regular' : 'Atenção'}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold">{formatNumber(averageLikes)}</span>
              <span className="text-sm text-gray-500">média por post</span>
            </div>
            <div className="flex items-center gap-2">
              <FaPercent className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{formatNumber(likesPercentage, 2)}% dos seguidores</span>
            </div>
            <p className="text-sm">{likesAnalysis.message}</p>
          </div>
        </Card>

        <Card className={`p-6 ${getStatusBg(commentsAnalysis.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaComment className={`w-6 h-6 ${getStatusColor(commentsAnalysis.status)}`} />
              <h3 className="text-lg font-semibold">Comentários</h3>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusBg(commentsAnalysis.status)}`}>
              {commentsAnalysis.status === 'green' ? 'Ótimo' : commentsAnalysis.status === 'yellow' ? 'Regular' : 'Atenção'}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold">{formatNumber(averageComments)}</span>
              <span className="text-sm text-gray-500">média por post</span>
            </div>
            <div className="flex items-center gap-2">
              <FaPercent className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{formatNumber(commentsPercentage, 2)}% dos seguidores</span>
            </div>
            <p className="text-sm">{commentsAnalysis.message}</p>
          </div>
        </Card>

        <Card className={`p-6 ${getStatusBg(viewsAnalysis.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaPlay className={`w-6 h-6 ${getStatusColor(viewsAnalysis.status)}`} />
              <h3 className="text-lg font-semibold">Visualizações</h3>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusBg(viewsAnalysis.status)}`}>
              {viewsAnalysis.status === 'green' ? 'Ótimo' : viewsAnalysis.status === 'yellow' ? 'Regular' : 'Atenção'}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold">{formatNumber(averageViews)}</span>
              <span className="text-sm text-gray-500">média por post</span>
            </div>
            <div className="flex items-center gap-2">
              <FaPercent className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{formatNumber(viewsPercentage, 2)}% dos seguidores</span>
            </div>
            <p className="text-sm">{viewsAnalysis.message}</p>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Desempenho ao Longo do Tempo</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={posts
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(post => ({
                  data: formatPostTimestamp(post.timestamp),
                  likes: post.likes_count,
                  comments: post.comments_count,
                  views: post.view_count || 0,
                  engajamento: post.likes_count + post.comments_count
                }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="engajamento" stroke="#8884d8" name="Engajamento" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo de Mídia</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={posts.reduce((acc, post) => {
                    const type = post.is_video ? 'Vídeo' : post.carousel_media ? 'Carrossel' : 'Foto';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {Object.entries(posts.reduce((acc, post) => {
                    const type = post.is_video ? 'Vídeo' : post.carousel_media ? 'Carrossel' : 'Foto';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).map((entry, index) => (
                    <Cell key={entry[0]} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Grade de Posts */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Últimos Posts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {posts.map((post) => {
            const getPostImage = () => {
              try {
                if (post.carousel_media?.[0]?.image_versions?.items?.[0]?.url) {
                  return post.carousel_media[0].image_versions.items[0].url;
                } else if (post.image_versions?.items?.[0]?.url) {
                  return post.image_versions.items[0].url;
                }
                console.warn('Post sem imagem válida:', post.id);
                return '/placeholder-image.jpg';
              } catch (error) {
                console.error('Erro ao obter imagem do post:', error);
                return '/placeholder-image.jpg';
              }
            };

            return (
              <div key={post.id} className="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-md transition-all">
                <div className="relative aspect-square">
                  <img
                    src={getPostImage()}
                    alt={`Post do Instagram ${post.id}`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                  {post.is_video && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                      <FaPlay className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {post.carousel_media && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                      <FaImage className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-100 rounded p-2">
                      <div className="flex items-center gap-1">
                        <FaHeart className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-medium">{formatNumber(post.likes_count)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded p-2">
                      <div className="flex items-center gap-1">
                        <FaComment className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-medium">{formatNumber(post.comments_count)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaCalendar className="w-3 h-3" />
                      <span>{formatPostTimestamp(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estatísticas adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-2">Frequência de Postagem</h3>
            <p className="text-2xl font-bold mb-1">{formatNumber(posts.filter(post => {
              const postDate = new Date(post.timestamp * 1000).getTime();
              return postDate >= subDays(new Date(), 30).getTime();
            }).length / 30)} posts/dia</p>
            <p className="text-sm text-gray-500">Média nos últimos 30 dias</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-2">Taxa de Resposta</h3>
            <p className="text-2xl font-bold mb-1">{formatNumber(profile.follower_count > 0 ? (totalComments / profile.follower_count) * 100 : 0)}%</p>
            <p className="text-sm text-gray-500">Comentários por seguidor</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-2">Alcance Estimado</h3>
            <p className="text-2xl font-bold mb-1">{formatNumber(Math.round(profile.follower_count * 0.3))}</p>
            <p className="text-sm text-gray-500">Baseado no engajamento médio</p>
          </div>
        </Card>
      </div>

      {/* Melhores horários */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Melhores Horários para Postar</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(posts.reduce((acc, post) => {
            try {
              const hour = formatPostHour(post.timestamp);
              if (!acc[hour]) {
                acc[hour] = { posts: 0, likes: 0, comments: 0 };
              }
              acc[hour].posts++;
              acc[hour].likes += post.likes_count;
              acc[hour].comments += post.comments_count;
            } catch (error) {
              console.error('Erro ao processar horário do post:', error);
            }
            return acc;
          }, {} as Record<string, { posts: number; likes: number; comments: number; }>)
          ).map(([hour, data]) => ({
            hour,
            engajamento: data.posts > 0 ? Math.round((data.likes + data.comments) / data.posts) : 0
          }))
          .sort((a, b) => b.engajamento - a.engajamento)
          .slice(0, 5)
          .map(({ hour, engajamento }) => (
            <div key={hour} className="text-center">
              <p className="text-xl font-bold mb-1">{hour}</p>
              <p className="text-sm text-gray-500">{formatNumber(engajamento)} engajamentos</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumo e Recomendações */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo e Recomendações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Pontos Fortes</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Base de {formatNumber(profile.follower_count)} seguidores</li>
              {likesAnalysis.status === 'green' && (
                <li>Excelente taxa de curtidas por post</li>
              )}
              {commentsAnalysis.status === 'green' && (
                <li>Ótimo engajamento nos comentários</li>
              )}
              {viewsAnalysis.status === 'green' && (
                <li>Alcance excepcional nos Reels</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Recomendações</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {likesAnalysis.status !== 'green' && (
                <li>{likesAnalysis.message}</li>
              )}
              {commentsAnalysis.status !== 'green' && (
                <li>{commentsAnalysis.message}</li>
              )}
              {viewsAnalysis.status !== 'green' && (
                <li>{viewsAnalysis.message}</li>
              )}
              {profile.follower_count < 10000 && (
                <li>Perfis com 10.000 seguidores têm mais credibilidade. Considere aumentar seu número de seguidores para atingir esse marco.</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
