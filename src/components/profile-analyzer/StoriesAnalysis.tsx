import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaHeart, FaComment, FaClock, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface StoryMention {
  username: string;
  full_name: string;
  profile_pic_url: string;
}

interface StoryItem {
  id: string;
  taken_at: number;
  media_type: number;
  code: string;
  caption?: string | null;
  image_url: string;
  video_url?: string;
  mentions: StoryMention[];
  expiring_at: number;
}

interface StoriesData {
  items: StoryItem[];
  user: {
    pk: string | number;
    username: string;
    full_name: string;
    profile_pic_url: string;
  };
}

interface StoriesAnalysisProps {
  storiesData: StoriesData | null;
  isLoading: boolean;
}

export function StoriesAnalysis({ storiesData, isLoading }: StoriesAnalysisProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold mb-4 text-center">Análise de Stories</h3>
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C43582]"></div>
        </div>
      </div>
    );
  }

  if (!storiesData || !storiesData.items || storiesData.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold mb-4 text-center">Análise de Stories</h3>
        <div className="text-center text-gray-500 p-6">
          <p>Nenhum story disponível neste momento.</p>
          <p className="mt-2 text-sm">O usuário não possui stories ativos ou não foi possível acessá-los.</p>
        </div>
      </div>
    );
  }

  const stories = storiesData.items;
  const currentStory = stories[currentStoryIndex];
  
  const handlePrevStory = () => {
    setCurrentStoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextStory = () => {
    setCurrentStoryIndex((prev) => (prev < stories.length - 1 ? prev + 1 : prev));
  };

  // Formatação de data relativa
  const formatRelativeTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (error) {
      return 'Tempo desconhecido';
    }
  };

  // Calcula tempo restante até a expiração
  const calculateTimeRemaining = (expiryTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = expiryTimestamp - now;
    
    if (secondsRemaining <= 0) return 'Expirado';
    
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    
    return `${hours}h ${minutes}m restantes`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-2xl font-bold mb-4 text-center">Análise de Stories</h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Visualizador de Story */}
        <div className="md:w-1/2 relative">
          <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative">
            <img 
              src={currentStory.image_url} 
              alt="Story" 
              className="w-full h-full object-cover"
            />
            
            {/* Indicador de progresso */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
              {stories.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1 flex-1 rounded-full ${index === currentStoryIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
            
            {/* Navegação */}
            {stories.length > 1 && (
              <>
                <button 
                  onClick={handlePrevStory}
                  disabled={currentStoryIndex === 0}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white ${currentStoryIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/50'}`}
                >
                  <FaChevronLeft />
                </button>
                <button 
                  onClick={handleNextStory}
                  disabled={currentStoryIndex === stories.length - 1}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white ${currentStoryIndex === stories.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/50'}`}
                >
                  <FaChevronRight />
                </button>
              </>
            )}
            
            {/* Informação do usuário */}
            <div className="absolute top-4 left-2 right-2 flex items-center mt-2 text-white">
              <img 
                src={storiesData.user.profile_pic_url} 
                alt={storiesData.user.username} 
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div className="ml-2">
                <p className="font-semibold">{storiesData.user.username}</p>
                <p className="text-xs">{formatRelativeTime(currentStory.taken_at)}</p>
              </div>
            </div>
            
            {/* Tempo restante */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <FaClock className="mr-1" />
              {calculateTimeRemaining(currentStory.expiring_at)}
            </div>
          </div>
        </div>
        
        {/* Informações e Análise */}
        <div className="md:w-1/2">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-lg mb-2">Informações do Story</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{currentStory.media_type === 1 ? 'Imagem' : 'Vídeo'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Publicado:</span>
                <span className="font-medium">{formatRelativeTime(currentStory.taken_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expira:</span>
                <span className="font-medium">{calculateTimeRemaining(currentStory.expiring_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Menções */}
          {currentStory.mentions && currentStory.mentions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-lg mb-2">Usuários Mencionados</h4>
              <div className="grid grid-cols-1 gap-2">
                {currentStory.mentions.map((mention, index) => (
                  <div key={index} className="flex items-center">
                    <img 
                      src={mention.profile_pic_url} 
                      alt={mention.username} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <p className="font-medium">@{mention.username}</p>
                      <p className="text-xs text-gray-500">{mention.full_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Insights */}
          <div className="bg-[#f0e6f0] rounded-lg p-4">
            <h4 className="font-bold text-lg mb-2">Insights</h4>
            <p className="text-sm text-gray-700 mb-4">
              Stories são ótimos para aumentar o engajamento e manter uma conexão constante com seus seguidores.
            </p>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded">
                <p className="font-medium">Dica 1:</p>
                <p className="text-sm">Stories com menções aumentam o alcance em até 30%</p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="font-medium">Dica 2:</p>
                <p className="text-sm">Use stickers interativos para aumentar o engajamento</p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="font-medium">Dica 3:</p>
                <p className="text-sm">Poste stories regularmente para manter sua audiência engajada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 