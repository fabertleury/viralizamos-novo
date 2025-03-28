import React from 'react';
import Image from 'next/image';

interface ContentGridProps {
  contentData: any[];
  username: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ contentData, username }) => {
  if (!contentData || contentData.length === 0) {
    return (
      <div className="text-center py-10">
        <p>Nenhum conteúdo encontrado para @{username}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-6">
      {contentData.map((item, index) => (
        <div 
          key={index} 
          className="relative aspect-square overflow-hidden rounded-md group"
        >
          <Image 
            src={item.media_url || item.thumbnail_url} 
            alt={`Post ${index + 1}`} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <span>♥ {item.likes_count || 0}</span>
            <span>💬 {item.comments_count || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
