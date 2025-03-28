'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { useSupabase } from '@/lib/hooks/useSupabase';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  active: boolean;
  order_position: number;
  social_id: string;
}

export default function SocialPage() {
  const params = useParams();
  const { supabase } = useSupabase();
  const [social, setSocial] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados da rede social
        const { data: socialData } = await supabase
          .from('socials')
          .select('*')
          .eq('url', `/${params.social}`)
          .single();

        if (socialData) {
          setSocial(socialData);

          // Buscar categorias da rede social
          const { data: categoriesData } = await supabase
            .from('categories')
            .select('*')
            .eq('social_id', socialData.id)
            .eq('active', true)
            .order('order_position');

          if (categoriesData) {
            setCategories(categoriesData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.social) {
      fetchData();
    }
  }, [params.social, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </main>
      </div>
    );
  }

  if (!social) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Rede social não encontrada.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <i className={social.icon + " text-3xl text-white"}></i>
            </div>
            <h1 className="text-4xl font-bold mb-4">{social.name}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha uma categoria para ver os serviços disponíveis
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/servicos?categoria=${category.id}`}
                className="group"
              >
                <Card className="p-6 text-center transition-all hover:shadow-lg">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <i className={category.icon + " text-2xl text-white"}></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
