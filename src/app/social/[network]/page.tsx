'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { SocialIcon } from '@/components/ui/social-icon';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  slug: string;
}

interface Social {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export default function SocialNetworkPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [social, setSocial] = useState<Social | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, [params.network]);

  const fetchData = async () => {
    try {
      // Buscar rede social
      const { data: socialData, error: socialError } = await supabase
        .from('socials')
        .select('*')
        .eq('slug', params.network)
        .single();

      if (socialError) throw socialError;
      setSocial(socialData);

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('social_id', socialData.id)
        .eq('active', true)
        .order('order_position');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = () => {
    switch (params.network) {
      case 'instagram':
        return <SocialIcon name="instagram" className="text-4xl" />;
      case 'tiktok':
        return <SocialIcon name="tiktok" className="text-4xl" />;
      default:
        return null;
    }
  };

  const getHeaderStyle = () => {
    switch (params.network) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'tiktok':
        return 'bg-black text-white';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!social) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Rede social não encontrada</p>
      </div>
    );
  }

  return (
    <div>
      <div className={`py-12 ${getHeaderStyle()}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            {getIcon()}
            <h1 className="text-4xl font-bold mt-4">Serviços para {social.name}</h1>
            <p className="mt-2 text-lg opacity-90">
              Escolha a categoria de serviço que você precisa
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Input
          type="text"
          placeholder="Pesquisar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xl mx-auto mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <SocialIcon name={category.icon} className="text-2xl" />
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                </div>
                <p className="text-sm text-gray-500 flex-grow">{category.description}</p>
                <Link href={`/categoria/${category.slug}`} className="mt-4">
                  <Button className="w-full">
                    Ver Serviços
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhuma categoria encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
