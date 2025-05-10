'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Heart, Eye, Users, MessageCircle, Users as UsersIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [onlineUsers, setOnlineUsers] = useState(0);
  const supabase = createClient();

  // Simular contador de usuários online
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return Math.max(5, Math.min(25, newValue)); // Mantém entre 5 e 25 usuários
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
                  Escolha o que você precisa para o seu perfil
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Oferta por Tempo Limitado */}
        <div className="container mx-auto px-4 mb-12">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-2">
              OFERTA ESPECIAL POR TEMPO LIMITADO!
            </h3>
            <p className="text-white text-lg">
              Ganhe 20% de desconto em todos os serviços. Válido apenas hoje!
            </p>
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
                          <div className="flex items-center justify-center mt-2 mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                              Online
                            </span>
                          </div>
                          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
                            COMPRAR AGORA
                          </button>
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

        {/* Seção de Depoimentos */}
        <div className="container mx-auto px-4 mt-16 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">O que nossos clientes dizem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">JD</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">João Dias</h4>
                  <p className="text-sm text-gray-500">@joaodias</p>
                </div>
              </div>
              <p className="text-gray-600">"Aumentei meus seguidores em 5k em apenas uma semana! O serviço é incrível e superou minhas expectativas."</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold">MS</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Maria Silva</h4>
                  <p className="text-sm text-gray-500">@mariasilva</p>
                </div>
              </div>
              <p className="text-gray-600">"As curtidas e comentários aumentaram muito meu engajamento. Agora meu conteúdo está chegando a muito mais pessoas!"</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">PL</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Pedro Lima</h4>
                  <p className="text-sm text-gray-500">@pedrolima</p>
                </div>
              </div>
              <p className="text-gray-600">"Meus Reels estão bombando! As visualizações aumentaram 300% depois que comecei a usar o serviço."</p>
            </div>
          </div>
        </div>

        {/* Preview de Resultados */}
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Veja a transformação</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Antes */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-gray-600 rounded"></div>
                    <div className="h-2 w-16 bg-gray-700 rounded mt-1"></div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-3 w-24 bg-gray-100 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <Heart className="w-5 h-5" />
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-semibold">50</span> curtidas
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
                <span className="text-gray-600 font-medium">Antes</span>
              </div>
            </motion.div>

            {/* Seta de transição */}
            <div className="hidden lg:flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white"
              >
                <ArrowRight className="w-8 h-8" />
              </motion.div>
            </div>

            {/* Depois */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20"></div>
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-white/20 rounded"></div>
                    <div className="h-2 w-16 bg-white/10 rounded mt-1"></div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                        <div className="h-3 w-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
                      <div className="h-4 w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4 text-purple-600">
                      <Heart className="w-5 h-5" />
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-purple-600">
                      <span className="font-semibold">500</span> curtidas
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full shadow-lg">
                <span className="text-white font-medium">Depois</span>
              </div>
            </motion.div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-purple-600 mb-2">10x</div>
              <div className="text-gray-600">mais engajamento</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-purple-600 mb-2">500%</div>
              <div className="text-gray-600">mais alcance</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white p-6 rounded-xl shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-purple-600 mb-2">24h</div>
              <div className="text-gray-600">resultados visíveis</div>
            </motion.div>
          </div>
        </div>

        {/* Contador de Pessoas Online */}
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">
            <span className="text-green-500">{onlineUsers}</span> pessoas online
          </span>
        </div>
      </main>
    </>
  );
}
