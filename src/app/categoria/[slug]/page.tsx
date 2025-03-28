'use client';

import { useState, useEffect, use } from 'react';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  social: {
    name: string;
    icon: string;
  };
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
    name: string;
    icon: string;
  };
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params: paramsPromise }: PageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const params = use(paramsPromise);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadCategory() {
      try {
        setLoading(true);
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select(`
            *,
            social:socials (
              name,
              icon
            )
          `)
          .eq('name', params.slug)
          .single();

        if (categoryError) throw categoryError;

        if (categoryData) {
          setCategory(categoryData);

          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('category_id', categoryData.id);

          if (servicesError) throw servicesError;

          setServices(servicesData || []);
        }
      } catch (error) {
        console.error('Error loading category:', error);
        toast.error('Erro ao carregar categoria');
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      loadCategory();
    }
  }, [params.slug, supabase]);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Categoria não encontrada</h1>
        <p className="text-gray-600 mt-2">Verifique o link e tente novamente</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">{category.icon}</span>
            <h1 className="text-4xl font-bold">{category.name}</h1>
          </div>
          <p className="text-lg text-gray-600">{category.description}</p>
          {category.social && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-2xl">{category.social.icon}</span>
              <span className="text-gray-600">{category.social.name}</span>
            </div>
          )}
        </div>

        {/* Filtro */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Pesquisar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Link key={service.id} href={`/servico/${service.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.social.icon}</span>
                    <h2 className="text-lg font-semibold text-gray-900">{service.name}</h2>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">{service.descricao}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Preço:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(service.preco)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Quantidade:</span>
                      <span className="font-semibold">{service.quantidade}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Taxa de Sucesso:</span>
                      <span className="font-semibold">{service.success_rate}%</span>
                    </div>
                  </div>

                  <Button className="w-full">Ver Detalhes</Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum serviço encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
