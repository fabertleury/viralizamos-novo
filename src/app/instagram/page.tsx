'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Heart, Eye, Users, MessageCircle, Users as UsersIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Definir ranges personalizados para cada categoria
const viewersRanges: { [key: string]: [number, number] } = {
  curtidas: [50, 90],
  seguidores: [10, 40],
  visualizacoes: [15, 50],
  comentarios: [5, 25],
};

export default function InstagramPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(30);
  const [viewers, setViewers] = useState<{ [key: string]: number }>({});
  const supabase = createClient();

  // Simular contador de usuários online
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 7) - 3; // Variação de -3 a +3
        let newValue = prev + change;
        if (newValue < 30) newValue = 30;
        if (newValue > 80) newValue = 80;
        return newValue;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

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
    <>
      <Header />
      {/* Banner de destaque revertido */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="container mx-auto px-4 mt-6 mb-8"
      >
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl overflow-hidden shadow-xl animate-gradient-x">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex items-center justify-center p-12 text-center">
            <div className="text-white max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-2">
                <span role='img' aria-label='foguete'>🚀</span>
                SERVIÇOS PARA INSTAGRAM
              </h2>
              <p className="text-xl md:text-2xl mb-0">
                Escolha o que você precisa para o seu perfil
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="min-h-screen bg-gray-50 py-12">
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
                    {groupedSubcategories.map((group, idx) => (
                      <Link 
                        key={group.slug} 
                        href={`/instagram/${group.slug}`}
                        className="transform transition-all duration-200 hover:scale-105 h-full"
                      >
                        <Card className={`p-6 cursor-pointer bg-white hover:shadow-lg transition-shadow duration-200 h-full flex flex-col relative ${idx === 0 ? 'ring-2 ring-yellow-400 shadow-xl' : ''}`}>
                          {/* Badge de Mais vendidos no primeiro card */}
                          {idx === 0 && (
                            <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md z-20 animate-pulse">
                              Mais vendidos
                            </span>
                          )}
                          {/* Bolinha verde de status online */}
                          <span className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full shadow-md animate-pulse border-2 border-white z-10" title="Serviço online"></span>
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-full ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 animate-bounce' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white`}>
                              {idx === 0 ? <span className="inline-block"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" strokeWidth=\"1.5\" stroke=\"currentColor\" className=\"w-6 h-6 text-white\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M12 17.25l6.16 3.24-1.18-6.88 5-4.87-6.91-1-3.09-6.26-3.09 6.26-6.91 1 5 4.87-1.18 6.88L12 17.25z\" /></svg></span> : group.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {group.name}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 flex-grow">
                            {group.description}
                          </p>
                          {/* Mensagem sutil de visualizações */}
                          <div className="flex items-center justify-center mt-4">
                            <span className="text-xs text-gray-500">
                              👀 {viewers[group.slug] || 0} pessoas estão de olho nesse serviço
                            </span>
                          </div>
                          {/* Botão Comprar Agora */}
                          <div className="flex items-center justify-center mt-2">
                            <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                              Comprar Agora
                            </button>
                          </div>
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

        {/* Banner de Prova Social abaixo dos serviços */}
        <div className="container mx-auto px-4 mt-12 mb-16">
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 rounded-xl shadow-lg p-6 text-center overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10 animate-pulse pointer-events-none" style={{ zIndex: 1 }}></div>
            <div className="relative z-10">
              <div className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2 mb-2">
                <span role="img" aria-label="foguete">🚀</span>
                Mais de <span className="text-yellow-300 drop-shadow">10.000</span> perfis já foram impulsionados com sucesso!
              </div>
              <div className="text-white text-lg md:text-xl font-medium opacity-90 mb-4">
                Junte-se a quem está crescendo de verdade no Instagram
              </div>
              <Link href="/instagram/seguidores">
                <button className="px-8 py-3 rounded-lg bg-white text-purple-700 font-bold text-lg shadow hover:bg-purple-100 transition-all duration-200">
                  Compre seguidores agora
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="container mx-auto px-4 mb-16">
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
      </main>
    </>
  );
}
