'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Heart, Eye, Users, MessageCircle } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon?: string;
  category_id: string;
  services?: { count: number };
}

// Mapeamento de categorias principais
const serviceCategoryMap: { [key: string]: string } = {
  'curtidas-brasileiras': 'curtidas',
  'curtidas-brasileiras-premium': 'curtidas',
  'curtidas-mundiais': 'curtidas',
  'seguidores-brasileiros': 'seguidores',
  'seguidores-mundiais': 'seguidores',
  'visualizacoes-reels': 'visualizacoes',
  'visualizacoes-stories': 'visualizacoes',
  'comentarios-brasileiros': 'comentarios',
  'comentarios-mundiais': 'comentarios',
};

// Configurações de ícones e descrições para cada categoria
const categoryConfig = {
  curtidas: {
    icon: <Heart className="w-6 h-6" />,
    name: 'Curtidas',
    description: 'Aumente o engajamento do seu perfil com curtidas de qualidade.'
  },
  seguidores: {
    icon: <Users className="w-6 h-6" />,
    name: 'Seguidores',
    description: 'Expanda seu alcance com seguidores reais e ativos.'
  },
  visualizacoes: {
    icon: <Eye className="w-6 h-6" />,
    name: 'Visualizações',
    description: 'Impulsione a visibilidade dos seus Reels e Stories.'
  },
  comentarios: {
    icon: <MessageCircle className="w-6 h-6" />,
    name: 'Comentários',
    description: 'Aumente a interação e o engajamento com comentários.'
  }
};

// Função para agrupar subcategorias por categoria principal
const groupSubcategoriesByCategory = (subcategories: Subcategory[]) => {
  const categories = new Map<string, Subcategory[]>();
  
  subcategories.forEach(sub => {
    let mainCategory = serviceCategoryMap[sub.slug];
    
    // Se não estiver no mapeamento, tente determinar a categoria pelo nome
    if (!mainCategory) {
      const name = sub.name.toLowerCase();
      if (name.includes('curtida')) {
        mainCategory = 'curtidas';
      } else if (name.includes('seguidor')) {
        mainCategory = 'seguidores';
      } else if (name.includes('visualiza')) {
        mainCategory = 'visualizacoes';
      } else if (name.includes('comentario') || name.includes('comentário')) {
        mainCategory = 'comentarios';
      } else {
        // Caso não se encaixe em nenhuma categoria, use a primeira parte do slug
        mainCategory = sub.slug.split('-')[0];
      }
    }
    
    if (!categories.has(mainCategory)) {
      categories.set(mainCategory, []);
    }
    categories.get(mainCategory)?.push(sub);
  });

  return Array.from(categories.entries()).map(([categorySlug, subs]) => {
    // Configurações padrão para categorias não mapeadas
    const defaultConfig = {
      icon: <Heart className="w-6 h-6" />,
      name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
      description: `Serviços de ${categorySlug}`
    };

    // Type guard para garantir que categorySlug é uma chave válida
    function isCategoryKey(key: string): key is keyof typeof categoryConfig {
      return key in categoryConfig;
    }

    const config = isCategoryKey(categorySlug) ? categoryConfig[categorySlug] : defaultConfig;

    return {
      slug: categorySlug,
      name: config.name,
      description: config.description,
      icon: config.icon,
      subcategories: subs
    };
  }).filter(category => category.subcategories.length > 0);
};

// Ordem personalizada para exibição dos cards
const getCategoryOrder = (slug: string): number => {
  const orderMap: { [key: string]: number } = {
    'curtidas': 1,
    'seguidores': 2,
    'visualizacoes': 3,
    'comentarios': 4,
    'reels': 5
  };
  
  return orderMap[slug] || 99; // Categorias não mapeadas vão para o final
};

// Definir ranges personalizados para cada categoria
const viewersRanges: { [key: string]: [number, number] } = {
  curtidas: [50, 90],
  seguidores: [10, 40],
  visualizacoes: [15, 50],
  comentarios: [5, 25],
};

// Definir tipo para subcategoria recebida do Supabase
interface SupabaseSubcategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon?: string;
  category_id: string;
  services: { count: number }[] | { count: number };
}

export default function InstagramPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [viewers, setViewers] = useState<{ [key: string]: number }>({});
  const supabase = createClient();

  // Simular visualizações por serviço
  useEffect(() => {
    // Inicializa viewers para cada serviço
    if (subcategories.length > 0 && Object.keys(viewers).length === 0) {
      const initial: { [key: string]: number } = {};
      subcategories.forEach(sub => {
        initial[sub.slug] = Math.floor(Math.random() * 43) + 38; // 38 a 80
      });
      setViewers(initial);
    }
  }, [subcategories]);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const updated: { [key: string]: number } = { ...prev };
        Object.keys(updated).forEach(slug => {
          const change = Math.floor(Math.random() * 7) - 3; // -3 a +3
          let newValue = updated[slug] + change;
          if (newValue < 38) newValue = 38;
          if (newValue > 80) newValue = 80;
          updated[slug] = newValue;
        });
        return updated;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [viewers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar todas as subcategorias ativas
        const { data: allSubcategories, error } = await supabase
          .from('subcategories')
          .select(`
            id, 
            name, 
            description, 
            slug, 
            icon, 
            category_id,
            services(count)
          `)
          .eq('active', true)
          .order('order_position', { ascending: true });
        
        if (error) {
          console.error('Erro ao buscar subcategorias:', error);
          throw error;
        }

        console.log('Todas as subcategorias:', allSubcategories);
        
        // Filtrar subcategorias relacionadas ao Instagram
        const instagramSubcategories = (allSubcategories as SupabaseSubcategory[]).map((sub) => ({
          ...sub,
          services: Array.isArray(sub.services) ? sub.services[0] : sub.services
        })).filter(sub => {
          const name = sub.name.toLowerCase();
          return (
            name.includes('curtida') || 
            name.includes('seguidor') || 
            name.includes('visualizacao') || 
            name.includes('visualização') || 
            name.includes('comentario') || 
            name.includes('comentário') || 
            name.includes('instagram')
          );
        });

        console.log('Subcategorias de Instagram filtradas:', instagramSubcategories);
        
        // Se não encontrar nada, usa todas as subcategorias ativas
        setSubcategories(
          instagramSubcategories.length > 0 
            ? instagramSubcategories 
            : (allSubcategories as SupabaseSubcategory[]).map((sub) => ({
                ...sub,
                services: Array.isArray(sub.services) ? sub.services[0] : sub.services
              }))
        );
      } catch (error) {
        console.error('Erro ao carregar subcategorias:', error);
      }
    };

    fetchData();
  }, []);

  const groupedSubcategories = groupSubcategoriesByCategory(subcategories)
    .sort((a, b) => getCategoryOrder(a.slug) - getCategoryOrder(b.slug));

  // Inicializar viewers para cada categoria exibida
  useEffect(() => {
    if (groupedSubcategories.length > 0 && Object.keys(viewers).length === 0) {
      const initial: { [key: string]: number } = {};
      groupedSubcategories.forEach(group => {
        const [min, max] = viewersRanges[group.slug] || [10, 40];
        initial[group.slug] = Math.floor(Math.random() * (max - min + 1)) + min;
      });
      setViewers(initial);
    }
  }, [groupedSubcategories]);

  // Atualizar viewers animadamente
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const updated: { [key: string]: number } = { ...prev };
        Object.keys(updated).forEach(slug => {
          const [min, max] = viewersRanges[slug] || [10, 40];
          const change = Math.floor(Math.random() * 7) - 3; // -3 a +3
          let newValue = updated[slug] + change;
          if (newValue < min) newValue = min;
          if (newValue > max) newValue = max;
          updated[slug] = newValue;
        });
        return updated;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [viewers]);

  return (
    <div>
      <main className="home-v3">
        <Header />
        
        {/* Banner Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl overflow-hidden shadow-xl animate-gradient-x">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10 flex items-center justify-center p-12 text-center">
                <div className="text-white max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    Serviços para Instagram
                  </h1>
                  <p className="text-xl md:text-2xl mb-0">
                    Escolha o que você precisa para o seu perfil 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupSubcategoriesByCategory(subcategories)
                .sort((a, b) => getCategoryOrder(a.slug) - getCategoryOrder(b.slug))
                .map((category) => (
                  <div key={category.slug}>
                    <Card className="p-6 h-full flex flex-col">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full">
                          {category.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-center mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-center mb-4">{category.description}</p>
                      <div className="mt-auto space-y-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/instagram/${category.slug}/${sub.slug}`}
                            className="block w-full py-2 px-4 text-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {sub.name}
                            {viewers[sub.slug] && (
                              <div className="text-xs text-gray-500 mt-1">
                                👥 {viewers[sub.slug]} pessoas visualizando
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
