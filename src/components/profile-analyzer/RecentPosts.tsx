import Image from 'next/image';
import { FaHeart, FaComment, FaHashtag, FaPlay, FaChartLine, FaUser, FaCalendar, FaShare } from 'react-icons/fa';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentPostsProps {
  posts: Array<{
    id: string;
    media_type: number;
    media_url: string;
    like_count: number;
    comment_count: number;
    caption: string;
    is_video: boolean;
    view_count?: number;
    timestamp: number;
    carousel_media?: any[];
    tagged_users?: any[];
    coauthor_producers?: any[];
  }>;
}

export function RecentPosts({ posts }: RecentPostsProps) {
  if (!posts || !Array.isArray(posts)) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    try {
      if (!timestamp || isNaN(timestamp)) {
        console.warn('Timestamp inválido:', timestamp);
        return 'Data indisponível';
      }

      // Verifica se o timestamp já está em milissegundos (13 dígitos)
      const isMilliseconds = timestamp.toString().length === 13;
      const milliseconds = isMilliseconds ? timestamp : timestamp * 1000;

      // Verifica se a data é válida
      const date = new Date(milliseconds);
      if (isNaN(date.getTime())) {
        console.warn('Data inválida para timestamp:', timestamp);
        return 'Data indisponível';
      }

      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Timestamp:', timestamp);
      return 'Data indisponível';
    }
  };

  const extractHashtags = (caption: string) => {
    const regex = /#[\w\u0590-\u05ff]+/g;
    return caption.match(regex) || [];
  };

  // Calcula médias
  const averageLikes = posts.length > 0 ? posts.reduce((acc, post) => acc + (post.like_count || 0), 0) / posts.length : 0;
  const averageComments = posts.length > 0 ? posts.reduce((acc, post) => acc + (post.comment_count || 0), 0) / posts.length : 0;
  const averageViews = posts.length > 0 ? posts.reduce((acc, post) => acc + (post.view_count || 0), 0) / posts.filter(p => p.is_video).length : 0;

  // Função para analisar o desempenho do post
  const analyzePostPerformance = (post: any) => {
    const likePerformance = post.like_count / averageLikes;
    const commentPerformance = post.comment_count / averageComments;
    const viewPerformance = post.is_video && post.view_count ? post.view_count / averageViews : 1;
    const overallPerformance = post.is_video 
      ? (likePerformance + commentPerformance + viewPerformance) / 3
      : (likePerformance + commentPerformance) / 2;

    return {
      isAboveAverage: overallPerformance > 1.1,
      isBelowAverage: overallPerformance < 0.9,
      performance: overallPerformance,
      metrics: {
        likes: likePerformance,
        comments: commentPerformance,
        views: viewPerformance
      }
    };
  };

  const getPerformanceIcon = (value: number, average: number) => {
    if (value > average) {
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    } else {
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    }
  };

  const getPerformanceColor = (value: number, average: number) => {
    if (value > average) {
      return 'text-green-500';
    } else {
      return 'text-red-500';
    }
  };

  const getPerformancePercentage = (value: number, average: number) => {
    return `${Math.round(((value - average) / average) * 100)}%`;
  };

  const getOverallPerformanceClass = (post: any, averages: any) => {
    const performance = analyzePostPerformance(post);
    if (performance.isAboveAverage) {
      return 'bg-green-50 text-green-600';
    } else if (performance.isBelowAverage) {
      return 'bg-red-50 text-red-600';
    } else {
      return 'bg-gray-50 text-gray-600';
    }
  };

  const getOverallPerformanceIcon = (post: any, averages: any) => {
    const performance = analyzePostPerformance(post);
    if (performance.isAboveAverage) {
      return <CheckCircle2 className="h-3 w-3" />;
    } else if (performance.isBelowAverage) {
      return <AlertTriangle className="h-3 w-3" />;
    } else {
      return null;
    }
  };

  const getOverallPerformanceText = (post: any, averages: any) => {
    const performance = analyzePostPerformance(post);
    if (performance.isAboveAverage) {
      return 'Acima da média';
    } else if (performance.isBelowAverage) {
      return 'Abaixo da média';
    } else {
      return 'Média';
    }
  };

  const averages = { likes: averageLikes, comments: averageComments };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-8 w-full mx-auto">
      <h3 className="text-xl font-bold mb-4">Últimos Posts</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {posts.slice(0, 12).map((post, index) => (
          <div key={post.id} className="bg-gray-50 rounded overflow-hidden shadow hover:shadow-md transition-all">
            {/* Imagem/Vídeo do Post */}
            <div className="relative aspect-square">
              <Image
                src={`/api/proxy/image?url=${encodeURIComponent(post.media_url)}`}
                alt="Post do Instagram"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {post.media_type === 2 && (
                <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              )}
              {post.media_type === 8 && (
                <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="p-2">
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                <div className="bg-gray-100 rounded p-1.5">
                  <div className="flex items-center gap-1">
                    <FaHeart className="w-3 h-3 text-red-500" />
                    <span className="text-xs font-medium">{post.like_count}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {getPerformanceIcon(post.like_count, averages.likes)}
                    <span className={getPerformanceColor(post.like_count, averages.likes)}>
                      {getPerformancePercentage(post.like_count, averages.likes)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded p-1.5">
                  <div className="flex items-center gap-1">
                    <FaComment className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-medium">{post.comment_count}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {getPerformanceIcon(post.comment_count, averages.comments)}
                    <span className={getPerformanceColor(post.comment_count, averages.comments)}>
                      {getPerformancePercentage(post.comment_count, averages.comments)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data */}
              <div className="post-info">
                <div className="post-stat">
                  <FaCalendar className="icon" />
                  <span>{formatDate(post.timestamp)}</span>
                </div>
              </div>

              {/* Status de Performance */}
              <div className={`text-[10px] p-1 rounded text-center ${getOverallPerformanceClass(post, averages)}`}>
                <div className="flex items-center justify-center gap-1">
                  {getOverallPerformanceIcon(post, averages)}
                  <span>{getOverallPerformanceText(post, averages)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
