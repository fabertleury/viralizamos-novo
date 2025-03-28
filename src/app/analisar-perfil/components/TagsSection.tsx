import React, { useEffect, useState, useRef } from 'react';
import { useInstagramAPI } from '../../../hooks/useInstagramAPI';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';

interface TagsSectionProps {
  username: string;
}

interface TagItem {
  tag: string;
  count: number;
}

const TagsSection: React.FC<TagsSectionProps> = ({ username }) => {
  const [recentTags, setRecentTags] = useState<TagItem[]>([]);
  const [popularTags, setPopularTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestMadeRef = useRef(false);
  
  const { fetchUserTags } = useInstagramAPI();
  
  useEffect(() => {
    const loadTags = async () => {
      if (!username || requestMadeRef.current) return;
      
      requestMadeRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        console.log('Iniciando busca de tags para:', username);
        const tagsData = await fetchUserTags(username);
        console.log('Tags recebidas:', tagsData?.popular_tags?.length || 0, 'populares,', tagsData?.recent_tags?.length || 0, 'recentes');
        
        if (tagsData) {
          setRecentTags(tagsData.recent_tags);
          setPopularTags(tagsData.popular_tags);
        } else {
          setError('Não foi possível carregar as tags');
        }
      } catch (error: unknown) {
        console.error('Erro ao carregar tags:', error);
        setError('Erro ao carregar tags');
      } finally {
        setLoading(false);
      }
    };
    
    loadTags();
    
    // Limpeza ao desmontar o componente
    return () => {
      requestMadeRef.current = false;
    };
  }, [username, fetchUserTags]);
  
  const renderTags = (tags: TagItem[]) => {
    if (tags.length === 0) {
      return <p className="text-gray-500">Nenhuma tag encontrada</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div key={index} className="relative group">
            <div className="bg-gray-100 rounded-md px-3 py-1 text-sm">
              #{tag.tag}
              <span className="ml-1 inline-flex items-center justify-center bg-blue-500 text-white text-xs rounded-full w-5 h-5">
                {tag.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderLoading = () => (
    <div className="space-y-2">
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-4/5 h-10" />
      <Skeleton className="w-3/5 h-10" />
    </div>
  );
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-semibold">Hashtags</h3>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
        <h3 className="text-lg font-semibold">Hashtags</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-base mb-3">Tags Populares</h4>
          {loading ? renderLoading() : renderTags(popularTags)}
        </div>
        
        <div>
          <h4 className="font-medium text-base mb-3">Tags Recentes</h4>
          {loading ? renderLoading() : renderTags(recentTags)}
        </div>
      </div>
    </div>
  );
};

export default TagsSection; 