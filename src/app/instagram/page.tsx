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
  services?: {
    count: number;
  };
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

    const config = (categoryConfig as any)[categorySlug] || defaultConfig;

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

export default function InstagramPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
        const instagramSubcategories = allSubcategories.filter(sub => {
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
            : allSubcategories
        );
      } catch (error) {
        console.error('Erro ao carregar subcategorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedSubcategories = groupSubcategoriesByCategory(subcategories)
    .sort((a, b) => getCategoryOrder(a.slug) - getCategoryOrder(b.slug));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        {/* Banner de destaque */}
        <div className="container mx-auto px-4 mb-12">
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl overflow-hidden shadow-xl animate-gradient-x">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10 flex items-center justify-center p-12 text-center">
              <div className="text-white max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Serviços para Instagram
                </h2>
                <p className="text-xl md:text-2xl mb-0">
                  Escolha o serviço que você precisa para impulsionar seu perfil no Instagram
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 animate-pulse h-full">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {groupedSubcategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedSubcategories.map((group) => (
                      <Link 
                        key={group.slug} 
                        href={`/instagram/${group.slug}`}
                        className="transform transition-all duration-200 hover:scale-105 h-full"
                      >
                        <Card className="p-6 cursor-pointer bg-white hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              {group.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {group.name}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 flex-grow">
                            {group.description}
                          </p>
                          <p className="text-gray-600 text-sm mt-auto">
                            {(() => {
                              // Contar o número total de serviços para esta categoria
                              const totalServices = group.subcategories.reduce((total, sub) => 
                                total + (sub.services?.count || 0), 0);
                              
                              if (totalServices > 0) {
                                return totalServices > 1 
                                  ? `${totalServices} serviços disponíveis` 
                                  : '1 serviço disponível';
                              } else {
                                return group.subcategories.length > 1 
                                  ? `${group.subcategories.length} opções disponíveis` 
                                  : '1 opção disponível';
                              }
                            })()}
                          </p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-100 rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                      Nenhum serviço encontrado
                    </h2>
                    <p className="text-gray-600">
                      Não há serviços disponíveis no momento.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
