'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { SocialIcon } from '@/components/ui/social-icon';
import { FeaturedServiceCard } from '@/components/featured-service-card';
import { Header } from '@/components/layout/header';

interface Social {
  id: string;
  name: string;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  description: string;
  social: Social;
  subcategories: {
    id: string;
    name: string;
    icon: string;
    slug: string;
  }[];
}

interface Service {
  id: string;
  name: string;
  preco: number;
  descricao: string;
  quantidade: number;
  min_order: number;
  max_order: number;
  delivery_time: string;
  success_rate: number;
  category: {
    id: string;
    name: string;
    icon: string;
    slug: string;
    social: Social;
  };
  subcategory: {
    id: string;
    name: string;
    icon: string;
    slug: string;
  };
  checkout: {
    id: string;
    slug: string;
  };
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [socials, setSocials] = useState<Social[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSocial, setSelectedSocial] = useState<string>(searchParams.get('rede') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoria') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategoria') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('name');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar redes sociais
        const { data: socialsData, error: socialsError } = await supabase
          .from('socials')
          .select('*')
          .eq('active', true)
          .order('order_position');

        if (socialsError) throw socialsError;
        setSocials(socialsData || []);

        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            *,
            social:social_id(
              id,
              name,
              icon
            ),
            subcategories(*)
          `)
          .eq('active', true)
          .order('order_position');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Buscar serviços
        let query = supabase
          .from('services')
          .select(`
            *,
            category:categories(
              id,
              name,
              icon,
              slug,
              social:social_id(
                id,
                name,
                icon
              )
            ),
            subcategory:subcategory_id(
              id,
              name,
              icon,
              slug
            ),
            checkout:checkout_type_id(
              id,
              slug
            )
          `)
          .eq('status', true);

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }
        if (selectedSubcategory) {
          query = query.eq('subcategory_id', selectedSubcategory);
        }
        if (selectedSocial && !selectedCategory) {
          query = query.eq('category.social_id', selectedSocial);
        }

        const { data: servicesData, error: servicesError } = await query.order('order_position');
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedSubcategory]);

  // Filtrar categorias baseado na rede social selecionada
  const filteredCategories = categories.filter(
    category => !selectedSocial || category.social?.id === selectedSocial
  );

  const filteredAndSortedServices = services
    .filter(service => 
      (service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descricao.toLowerCase().includes(searchTerm.toLowerCase())) &&
      service.preco >= priceRange[0] &&
      service.preco <= priceRange[1] &&
      (!deliveryFilter || service.delivery_time.includes(deliveryFilter)) &&
      (!selectedSocial || service.category.social?.id === selectedSocial)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.preco - b.preco;
        case 'price-desc':
          return b.preco - a.preco;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Nossos Serviços</h1>
            <p className="text-lg text-gray-600">
              Escolha o melhor serviço para aumentar sua presença nas redes sociais
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar com Filtros */}
            <div className="w-full lg:w-64 lg:flex-shrink-0">
              <div className="sticky top-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Filtros</h3>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pesquisar
                      </label>
                      <Input
                        type="text"
                        placeholder="Nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rede Social
                      </label>
                      <select
                        value={selectedSocial}
                        onChange={(e) => {
                          setSelectedSocial(e.target.value);
                          setSelectedCategory('');
                          setSelectedSubcategory('');
                        }}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Todas</option>
                        {socials.map((social) => (
                          <option key={social.id} value={social.id}>
                            {social.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubcategory('');
                        }}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Todas</option>
                        {filteredCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategoria
                      </label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Todas</option>
                        {filteredCategories.find(category => category.id === selectedCategory)?.subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ordenar por
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                      >
                        <option value="name">Nome (A-Z)</option>
                        <option value="price-asc">Menor Preço</option>
                        <option value="price-desc">Maior Preço</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tempo de Entrega
                      </label>
                      <select
                        value={deliveryFilter}
                        onChange={(e) => setDeliveryFilter(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Todos</option>
                        <option value="24h">Até 24h</option>
                        <option value="48h">Até 48h</option>
                        <option value="72h">Até 72h</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Lista de Serviços */}
            <div className="flex-1">
              <FeaturedServiceCard services={filteredAndSortedServices} gridCols="three" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
