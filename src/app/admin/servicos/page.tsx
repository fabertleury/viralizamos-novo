'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ServiceFormModal } from './components/ServiceFormModal';
import { ServiceApiModal } from './components/ServiceApiModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { SocialIcon } from '@/components/ui/social-icon';

interface Service {
  id: string;
  name: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoria: string;
  status: boolean;
  delivery_time: string;
  featured: boolean;
  category: {
    id: string;
    name: string;
    icon: string;
    social: {
      id: string;
      name: string;
      icon: string;
    };
    subcategories: {
      id: string;
      name: string;
      category_id: string;
    }[];
  };
  subcategory_id: string;
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [featuredFilter, setFeaturedFilter] = useState('all'); // all, featured, not_featured
  const [sortBy, setSortBy] = useState('name'); // name, price-asc, price-desc, date-asc, date-desc
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClient();

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            *,
            social:social_id(
              id,
              name,
              icon
            )
          `)
          .eq('active', true)
          .order('name');

        if (categoriesError) throw categoriesError;

        // Transformar os dados para usar o ícone da rede social
        const categoriesWithIcon = categoriesData?.map(category => ({
          ...category,
          icon: category.social?.icon || category.icon
        })) || [];

        setCategories(categoriesWithIcon);

        // Buscar serviços
        const { data: servicesData, error } = await supabase
          .from('services')
          .select(`
            *,
            category:categories(
              id,
              name,
              icon,
              social:social_id(
                id,
                name,
                icon
              ),
              subcategories!inner(
                id,
                name,
                category_id
              )
            )
          `)
          .order('name');

        if (error) throw error;

        // Transformar os dados para usar o ícone da rede social
        const servicesWithSocialIcon = servicesData?.map(service => ({
          ...service,
          category: {
            ...service.category,
            icon: service.category?.social?.icon || service.category?.icon
          }
        })) || [];

        setServices(servicesWithSocialIcon);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleStatusToggle = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ status: !service.status })
        .eq('id', service.id);

      if (error) throw error;
      
      setServices(services.map(s => 
        s.id === service.id ? { ...s, status: !s.status } : s
      ));
      
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleToggleFeatured = async (service: Service) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ featured: !service.featured })
        .eq('id', service.id)
        .select()
        .single();

      if (error) {
        console.error('Error details:', error);
        if (error.code === '42703') {
          toast.error('O campo "featured" não existe na tabela. Por favor, execute a migração primeiro.');
        } else {
          toast.error(`Erro ao atualizar destaque: ${error.message}`);
        }
        return;
      }
      
      setServices(services.map(s => 
        s.id === service.id ? { ...s, featured: data.featured } : s
      ));
      
      toast.success('Destaque atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Erro ao atualizar destaque. Verifique o console para mais detalhes.');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Esta ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setServices(services.filter(s => s.id !== id));
        toast.success('Serviço deletado com sucesso!');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao deletar serviço');
      }
    }
  };

  const filteredAndSortedServices = services
    .filter(service => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.categoria.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || service.categoria === selectedCategory;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && service.status) ||
        (statusFilter === 'inactive' && !service.status);

      const matchesFeatured = featuredFilter === 'all' ||
        (featuredFilter === 'featured' && service.featured) ||
        (featuredFilter === 'not_featured' && !service.featured);

      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.preco - b.preco;
        case 'price-desc':
          return b.preco - a.preco;
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <div className="flex gap-4">
          <Button onClick={() => setShowApiModal(true)}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Adicionar via API
          </Button>
          <Button onClick={() => {
            setEditingService(null);
            setShowFormModal(true);
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Adicionar Manual
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Input
          type="text"
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
        >
          <option value="">Todas as Categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
        >
          <option value="all">Todos os Destaques</option>
          <option value="featured">Em Destaque</option>
          <option value="not_featured">Sem Destaque</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
        >
          <option value="name">Nome (A-Z)</option>
          <option value="price-asc">Menor Preço</option>
          <option value="price-desc">Maior Preço</option>
          <option value="date-asc">Mais Antigos</option>
          <option value="date-desc">Mais Recentes</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Categoria</th>
              <th className="p-4 text-left">Subcategoria</th>
              <th className="p-4 text-right">Preço</th>
              <th className="p-4 text-right">Quantidade</th>
              <th className="p-4 text-center">Tempo de Entrega</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Destaque</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedServices.map((service) => {
              // Encontra a subcategoria correspondente
              const subcategory = service.category?.subcategories?.find(
                sub => sub.id === service.subcategory_id
              );

              return (
                <tr key={service.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-500">{service.descricao}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <SocialIcon name={service.category.icon} className="text-xl" />
                      <span>{service.category.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span>{subcategory?.name || '-'}</span>
                  </td>
                  <td className="p-4 text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(service.preco)}
                  </td>
                  <td className="p-4 text-right">{service.quantidade}</td>
                  <td className="p-4 text-center">{service.delivery_time}</td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStatusToggle(service)}
                    >
                      <FontAwesomeIcon 
                        icon={service.status ? faToggleOn : faToggleOff}
                        className={`text-xl ${service.status ? "text-green-500" : "text-gray-400"}`}
                      />
                    </Button>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFeatured(service)}
                    >
                      <FontAwesomeIcon 
                        icon={faStar}
                        className={`text-xl ${service.featured ? "text-yellow-500" : "text-gray-400"}`}
                      />
                    </Button>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingService(service);
                          setShowFormModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faToggleOff} className="text-xl" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <ServiceFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingService(null);
          }}
          service={editingService}
          onSuccess={handleRefresh}
        />
      )}

      {showApiModal && (
        <ServiceApiModal
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
