'use client';

import { useEffect, useState } from 'react';
import { getProxiedImageUrl } from '../utils/proxy-image';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

interface Post {
  id: string;
  code: string;
  image_url: string;
  like_count: number;
  comment_count: number;
  caption?: string;
  timestamp: string;
  link: string;
}

interface PostSelectorProps {
  orderId: string;
  onSelectPosts: (posts: { id: string; code: string; link: string; caption?: string }[]) => void;
}

export default function PostSelector({ orderId, onSelectPosts }: PostSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/instagram/posts/${orderId}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar posts');
        }
        const data = await response.json();
        console.log('Posts carregados:', data);
        setPosts(data);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        toast.error('Erro ao carregar posts');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  // Atualiza os posts selecionados quando houver mudança na seleção
  useEffect(() => {
    console.log('IDs dos posts selecionados:', selectedPostIds);
    
    const selectedPostsData = posts
      .filter(post => selectedPostIds.includes(post.id))
      .map(post => {
        console.log('Post sendo selecionado:', JSON.stringify(post, null, 2));
        
        if (!post.code) {
          console.error('Post sem código:', post);
          throw new Error('Post sem código detectado');
        }

        const postData = {
          id: post.id,
          code: post.code,
          link: `https://instagram.com/p/${post.code}`,
          caption: typeof post.caption === 'string' ? post.caption : post.caption?.text || null,
          image_url: post.image_versions?.items?.[0]?.url || null,
          like_count: post.like_count,
          comment_count: post.comment_count
        };

        console.log('Dados do post formatados:', JSON.stringify(postData, null, 2));
        return postData;
      });

    console.log('Posts selecionados:', JSON.stringify(selectedPostsData, null, 2));
    onSelectPosts(selectedPostsData);
  }, [selectedPostIds, posts, onSelectPosts]);

  const handlePostSelect = (post: Post) => {
    console.log('Selecionando/Desselecionando post:', post.id);
    setSelectedPostIds(prevSelected => {
      const isSelected = prevSelected.includes(post.id);
      const newSelected = isSelected 
        ? prevSelected.filter(id => id !== post.id)
        : [...prevSelected, post.id];
      console.log('Nova lista de IDs selecionados:', newSelected);
      return newSelected;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
            selectedPostIds.includes(post.id) ? 'border-pink-500' : 'border-transparent'
          }`}
          onClick={() => handlePostSelect(post)}
        >
          {post.image_url && (
            <img
              src={getProxiedImageUrl(post.image_url)}
              alt="Post thumbnail"
              className="object-cover aspect-square"
            />
          )}
          {selectedPostIds.includes(post.id) && (
            <div className="absolute inset-0 bg-pink-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white rounded-full p-2">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
