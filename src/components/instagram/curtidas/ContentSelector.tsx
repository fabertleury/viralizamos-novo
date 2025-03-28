'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostSelector from './PostSelector';
import ReelSelector from './ReelSelector';
import { Post } from '@/app/checkout/instagram/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ContentSelectorProps {
  posts: Post[];
  reels: Post[];
  maxSelections?: number;
  onSelectionChange: (selectedContent: Post[]) => void;
  initialSelectedPosts?: Post[];
  initialSelectedReels?: Post[];
}

export default function ContentSelector({
  posts,
  reels,
  maxSelections = 5,
  onSelectionChange,
  initialSelectedPosts = [],
  initialSelectedReels = []
}: ContentSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>('posts');
  const [selectedPosts, setSelectedPosts] = useState<Post[]>(initialSelectedPosts);
  const [selectedReels, setSelectedReels] = useState<Post[]>(initialSelectedReels);

  // Atualizar a seleção quando as props mudarem
  useEffect(() => {
    setSelectedPosts(initialSelectedPosts);
  }, [initialSelectedPosts]);

  useEffect(() => {
    setSelectedReels(initialSelectedReels);
  }, [initialSelectedReels]);

  // Notificar o componente pai sobre mudanças na seleção
  useEffect(() => {
    const allSelected = [...selectedPosts, ...selectedReels];
    onSelectionChange(allSelected);
  }, [selectedPosts, selectedReels, onSelectionChange]);

  // Função para selecionar um post
  const handleSelectPost = (post: Post) => {
    const isAlreadySelected = selectedPosts.some(p => p.id === post.id);
    
    if (isAlreadySelected) {
      // Remover o post da seleção
      setSelectedPosts(selectedPosts.filter(p => p.id !== post.id));
      return;
    }
    
    // Verificar se já atingiu o limite de seleções
    const totalSelected = selectedPosts.length + selectedReels.length;
    if (totalSelected >= maxSelections) {
      toast.warning(`Você pode selecionar no máximo ${maxSelections} itens entre posts e reels`);
      return;
    }
    
    // Adicionar o post à seleção
    setSelectedPosts([...selectedPosts, post]);
  };

  // Função para selecionar um reel
  const handleSelectReel = (reel: Post) => {
    const isAlreadySelected = selectedReels.some(r => r.id === reel.id);
    
    if (isAlreadySelected) {
      // Remover o reel da seleção
      setSelectedReels(selectedReels.filter(r => r.id !== reel.id));
      return;
    }
    
    // Verificar se já atingiu o limite de seleções
    const totalSelected = selectedPosts.length + selectedReels.length;
    if (totalSelected >= maxSelections) {
      toast.warning(`Você pode selecionar no máximo ${maxSelections} itens entre posts e reels`);
      return;
    }
    
    // Adicionar o reel à seleção
    setSelectedReels([...selectedReels, reel]);
  };

  // Função para limpar todas as seleções
  const handleClearSelections = () => {
    setSelectedPosts([]);
    setSelectedReels([]);
  };

  return (
    <div className="space-y-4">
      {/* Resumo da seleção */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">
            {selectedPosts.length + selectedReels.length} de {maxSelections} selecionados
          </h3>
          <p className="text-sm text-gray-500">
            {selectedPosts.length} posts e {selectedReels.length} reels
          </p>
        </div>
        
        {(selectedPosts.length > 0 || selectedReels.length > 0) && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearSelections}
          >
            Limpar seleção
          </Button>
        )}
      </div>
      
      {/* Abas de seleção */}
      <Tabs 
        defaultValue="posts" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="posts" className="relative">
            Posts
            {selectedPosts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reels" className="relative">
            Reels
            {selectedReels.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedReels.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-0">
          <PostSelector
            posts={posts}
            selectedPosts={selectedPosts}
            onSelectPost={handleSelectPost}
          />
        </TabsContent>
        
        <TabsContent value="reels" className="mt-0">
          <ReelSelector
            reels={reels}
            selectedReels={selectedReels}
            onSelectReel={handleSelectReel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
