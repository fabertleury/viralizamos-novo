'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; 
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ServiceFormModal } from './components/ServiceFormModal';
import { ServiceVariationModal } from './components/ServiceVariationModal';
import { ServiceApiModal } from './components/ServiceApiModal';
import { ProviderSelectionModal } from './components/ProviderSelectionModal';
import { ServiceSelectionModal } from './components/ServiceSelectionModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faToggleOn, 
  faToggleOff, 
  faStar, 
  faPlus, 
  faLayerGroup,
  faTrash, 
  faExternalLinkAlt,
  faChevronUp,
  faChevronDown,
  faServer,
  faArrowUp,
  faArrowDown,
  faTrophy,
  faAward,
  faRibbon,
  faMedal
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { SocialIcon } from '@/components/ui/social-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Service {
  id: string;
  name: string;
  type: string;
  category_id: string;
  subcategory_id?: string;
  description: string;
  preco: number;
  quantidade: number;
  min_order: number;
  max_order: number;
  delivery_time: string;
  success_rate: number;
  status: boolean;
  provider_id: string;
  checkout_type_id?: string;
  fama_service_id?: string;
  isbestseller: string;
  featured: boolean;
  external_id?: string;
  created_at?: string;
  updated_at?: string;
  provider?: {
    id: string;
    name: string;
    slug: string;
  }
  category?: {
    id: string;
    name: string;
    icon: string;
    social?: {
      id: string;
      name: string;
      icon: string;
    }
  }
  subcategory?: {
    id: string;
    name: string;
  }
  service_variations?: any[];
  metadata?: any;
  service_details?: any;
  animating?: boolean;
  order?: number;
}

// Interface para o provedor
interface Provider {
  id: string;
  name: string;
  api_key?: string;
  api_url?: string;
  status: boolean;
  metadata?: {
    last_check?: string;
    balance?: number;
    currency?: string;
    api_status?: 'online' | 'inactive' | 'error' | 'checking' | 'active';
    api_error?: string;
  };
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  social?: {
    id: string;
    name: string;
    icon: string;
  }
}

export default function ServicosV1Page() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedServiceVariations, setSelectedServiceVariations] = useState<Service | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [showServiceSelectionModal, setShowServiceSelectionModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'curtidas': true,
    'seguidores': true,
    'visualizacoes': true,
    'comentarios': true,
    'reels': true,
    'inativos': true
  });
  const supabase = createClient();
  const router = useRouter();

  // Estado para controlar quais serviços têm variações expandidas
  const [expandedServiceVariations, setExpandedServiceVariations] = useState<{ [key: string]: boolean }>({});

  // Estado para pesquisa
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado para armazenar o mapa de provedores
  const [providersMap, setProvidersMap] = useState<Record<string, Provider>>({});

  // Função para buscar provedores
  const fetchProviders = async () => {
    try {
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('*')
        .eq('status', true); // Filtrar provedores com status TRUE
        
      if (providersError) {
        console.error('Erro ao buscar provedores:', providersError);
        throw providersError;
      }
      
      // Criar um mapa de provedores para fácil acesso por ID
      const providersMap = (providersData || []).reduce((map, provider) => {
        map[provider.id] = provider;
        return map;
      }, {});

      setProvidersMap(providersMap);
      
      console.log('Provedores carregados:', providersData?.length);
      if (providersData?.length > 0) {
        console.log('Exemplo de provedor:', providersData[0]);
      }
      return providersMap;
    } catch (error) {
      console.error('Erro ao buscar provedores:', error);
      toast.error('Erro ao carregar provedores');
      return {};
    }
  };

  // Função para obter o nome do provedor
  const getProviderName = (providerId: string) => {
    // Primeiro tenta buscar do mapa de provedores carregado do banco
    if (providersMap[providerId]) {
      return providersMap[providerId].name;
    }
    
    // Se não encontrar, assume que está ativo
    return `Provedor ${providerId.substring(0, 8)}`;
  };

  // Função para obter o status do provedor
  const getProviderStatus = (providerId: string) => {
    // Primeiro tenta buscar do mapa de provedores carregado do banco
    if (providersMap[providerId]) {
      return providersMap[providerId].status;
    }
    
    // Se não encontrar, assume que está ativo
    return true;
  };

  // Função para alternar a expansão das variações de um serviço
  const toggleServiceVariations = (serviceId: string) => {
    setExpandedServiceVariations(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Função para adicionar nova variação
  const handleAddVariation = async (service: any) => {
    try {
      // Abrir modal ou prompt para adicionar variação
      const novaQuantidade = prompt('Digite a quantidade:');
      const novoPreco = prompt('Digite o preço:');

      if (!novaQuantidade || !novoPreco) {
        toast.error('Quantidade e preço são obrigatórios');
        return;
      }

      const quantidade = parseInt(novaQuantidade);
      const preco = parseFloat(novoPreco);

      if (isNaN(quantidade) || isNaN(preco)) {
        toast.error('Quantidade e preço devem ser números válidos');
        return;
      }

      // Recuperar variações atuais
      const currentVariations = service.metadata?.quantidade_preco || [];
      
      // Verificar se já existe uma variação com essa quantidade
      const existingVariationIndex = currentVariations.findIndex(
        (v: any) => v.quantidade === quantidade
      );

      let updatedVariations;
      if (existingVariationIndex !== -1) {
        // Substituir variação existente
        updatedVariations = [
          ...currentVariations.slice(0, existingVariationIndex),
          { quantidade, preco },
          ...currentVariations.slice(existingVariationIndex + 1)
        ];
      } else {
        // Adicionar nova variação
        updatedVariations = [...currentVariations, { quantidade, preco }];
      }

      // Atualizar serviço no Supabase
      const { error } = await supabase
        .from('services')
        .update({ 
          metadata: { 
            ...service.metadata, 
            quantidade_preco: updatedVariations 
          } 
        })
        .eq('id', service.id);

      if (error) {
        console.error('Erro ao atualizar variações:', error);
        toast.error('Falha ao adicionar variação');
        return;
      }

      // Atualizar lista de serviços
      fetchServices();
      toast.success('Variação adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar variação:', error);
      toast.error('Erro ao processar variação');
    }
  };

  // Função para remover variação
  const handleRemoveVariation = async (service: any, variacaoIndex: number) => {
    try {
      const currentVariations = service.metadata?.quantidade_preco || [];
      
      // Remover variação específica
      const updatedVariations = [
        ...currentVariations.slice(0, variacaoIndex),
        ...currentVariations.slice(variacaoIndex + 1)
      ];

      // Atualizar serviço no Supabase
      const { error } = await supabase
        .from('services')
        .update({ 
          metadata: { 
            ...service.metadata, 
            quantidade_preco: updatedVariations 
          } 
        })
        .eq('id', service.id);

      if (error) {
        console.error('Erro ao remover variação:', error);
        toast.error('Falha ao remover variação');
        return;
      }

      // Atualizar lista de serviços
      fetchServices();
      toast.success('Variação removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover variação:', error);
      toast.error('Erro ao processar remoção');
    }
  };

  // Função para abrir modal de variações
  const openVariationsModal = (service: any) => {
    setSelectedServiceVariations(service);
  };

  // Função para adicionar nova variação no modal
  const handleAddVariationInModal = async () => {
    try {
      if (!selectedServiceVariations) return;

      const novaQuantidade = prompt('Digite a quantidade:');
      const novoPreco = prompt('Digite o preço:');

      if (!novaQuantidade || !novoPreco) {
        toast.error('Quantidade e preço são obrigatórios');
        return;
      }

      const quantidade = parseInt(novaQuantidade);
      const preco = parseFloat(novoPreco);

      if (isNaN(quantidade) || isNaN(preco)) {
        toast.error('Quantidade e preço devem ser números válidos');
        return;
      }

      // Recuperar variações atuais
      const currentVariations = selectedServiceVariations.metadata?.quantidade_preco || [];
      
      // Verificar se já existe uma variação com essa quantidade
      const existingVariationIndex = currentVariations.findIndex(
        (v: any) => v.quantidade === quantidade
      );

      let updatedVariations;
      if (existingVariationIndex !== -1) {
        // Substituir variação existente
        updatedVariations = [
          ...currentVariations.slice(0, existingVariationIndex),
          { quantidade, preco },
          ...currentVariations.slice(existingVariationIndex + 1)
        ];
      } else {
        // Adicionar nova variação
        updatedVariations = [...currentVariations, { quantidade, preco }];
      }

      // Atualizar serviço no Supabase
      const { error } = await supabase
        .from('services')
        .update({ 
          metadata: { 
            ...selectedServiceVariations.metadata, 
            quantidade_preco: updatedVariations 
          } 
        })
        .eq('id', selectedServiceVariations.id);

      if (error) {
        console.error('Erro ao atualizar variações:', error);
        toast.error('Falha ao adicionar variação');
        return;
      }

      // Atualizar lista de serviços
      fetchServices();
      toast.success('Variação adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar variação:', error);
      toast.error('Erro ao processar variação');
    }
  };

  // Função para remover variação no modal
  const handleRemoveVariationInModal = async (variacaoIndex: number) => {
    try {
      if (!selectedServiceVariations) return;

      const currentVariations = selectedServiceVariations.metadata?.quantidade_preco || [];
      
      // Remover variação específica
      const updatedVariations = [
        ...currentVariations.slice(0, variacaoIndex),
        ...currentVariations.slice(variacaoIndex + 1)
      ];

      // Atualizar serviço no Supabase
      const { error } = await supabase
        .from('services')
        .update({ 
          metadata: { 
            ...selectedServiceVariations.metadata, 
            quantidade_preco: updatedVariations 
          } 
        })
        .eq('id', selectedServiceVariations.id);

      if (error) {
        console.error('Erro ao remover variação:', error);
        toast.error('Falha ao remover variação');
        return;
      }

      // Atualizar lista de serviços
      fetchServices();
      toast.success('Variação removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover variação:', error);
      toast.error('Erro ao processar remoção');
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      console.log('Buscando serviços...');
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:provider_id(*),
          category:category_id(*,social:social_id(*)),
          subcategory:subcategory_id(*)
        `)
        .order('order', { ascending: true });

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        throw error;
      }

      console.log('Serviços encontrados:', data.length);
      
      // Verificar se há serviços com isbestseller definido
      const bestsellers = data.filter(s => s.isbestseller === 'TRUE' || s.isbestseller === 'true');
      console.log('Serviços marcados como Mais Vendido:', bestsellers.length);
      if (bestsellers.length > 0) {
        console.log('Exemplo de serviço Mais Vendido:', bestsellers[0].name, 'isbestseller:', bestsellers[0].isbestseller);
      }

      // Transformar os dados para o formato esperado
      const formattedServices: Service[] = data.map((service: any) => ({
        id: service.id,
        name: service.name,
        type: service.type,
        category_id: service.category_id,
        subcategory_id: service.subcategory_id,
        description: service.description,
        preco: service.preco,
        quantidade: service.quantidade,
        min_order: service.min_order,
        max_order: service.max_order,
        delivery_time: service.delivery_time,
        success_rate: service.success_rate,
        status: service.status,
        provider_id: service.provider_id,
        checkout_type_id: service.checkout_type_id,
        fama_service_id: service.fama_service_id,
        isbestseller: service.isbestseller,
        featured: service.featured,
        external_id: service.external_id,
        created_at: service.created_at,
        updated_at: service.updated_at,
        provider: service.provider,
        category: service.category,
        subcategory: service.subcategory,
        service_variations: service.service_variations,
        metadata: service.metadata,
        service_details: service.service_details,
        order: service.order
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
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
      console.error('Erro:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Esta ação irá desativar o serviço!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desativar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('services')
          .update({ status: false })
          .eq('id', id);

        if (error) throw error;

        setServices(services.map(s => s.id === id ? { ...s, status: false } : s));
        toast.success('Serviço desativado com sucesso!');
      } catch (error) {
        console.error('Erro:', error);
        toast.error('Erro ao desativar serviço');
      }
    }
  };

  const handleToggleFeatured = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ featured: !service.featured })
        .eq('id', service.id);

      if (error) throw error;
      
      setServices(services.map(s => 
        s.id === service.id ? { ...s, featured: !s.featured } : s
      ));
      
      toast.success('Destaque atualizado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar destaque');
    }
  };

  const handleToggleBestSeller = async (serviceId: string, currentStatus: boolean) => {
    try {
      console.log('ID do serviço:', serviceId);
      console.log('Status atual:', currentStatus);
      
      // Garantir que o valor seja sempre 'TRUE' ou 'FALSE' em maiúsculo
      const newStatus = currentStatus ? 'FALSE' : 'TRUE';
      
      console.log('Novo status a ser salvo:', newStatus);
      
      // Atualizar o status no banco de dados
      const { error } = await supabase
        .from('services')
        .update({ isbestseller: newStatus })
        .eq('id', serviceId);

      if (error) {
        console.error('Erro ao atualizar no Supabase:', error);
        throw error;
      }
      
      console.log('Status atualizado no banco para:', newStatus);
      
      // Forçar um refresh completo dos serviços
      await fetchServices();
      
      toast.success(`Serviço ${!currentStatus ? 'marcado' : 'desmarcado'} como Mais Vendido!`);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status de Mais Vendido:', error);
      toast.error('Erro ao atualizar status de Mais Vendido');
      return false;
    }
  };

  const openEditService = (service: Service) => {
    console.log('Editando serviço:', service);
    // Redirecionar para a página de edição de serviço
    router.push(`/admin/servicos_v1/importar/editar/${service.id}`);
  };

  const openAddVariation = (service: Service) => {
    setEditingService(service);
    setShowVariationModal(true);
  };

  // Filtrar serviços com base na pesquisa
  const filteredServices = services.filter(service => {
    // Filtro por termo de pesquisa
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        service.name.toLowerCase().includes(searchTermLower) ||
        service.id.toLowerCase().includes(searchTermLower) ||
        (service.external_id && service.external_id.toLowerCase().includes(searchTermLower)) ||
        (service.provider?.name && service.provider.name.toLowerCase().includes(searchTermLower)) ||
        (service.category?.name && service.category.name.toLowerCase().includes(searchTermLower))
      );
    }
    
    return true;
  });

  const handleOpenApiModal = () => {
    console.log('Abrindo modal de importação via API');
    setShowProviderModal(true);
  };

  // Agrupar serviços por tipo
  const groupServicesByType = (services: Service[]) => {
    const grouped: Record<string, Service[]> = {
      'curtidas': [],
      'seguidores': [],
      'visualizacoes': [],
      'comentarios': [],
      'reels': [],
      'inativos': []
    };

    services.forEach(service => {
      if (!service.status) {
        grouped['inativos'].push(service);
      } else if (service.type === 'curtidas') {
        grouped['curtidas'].push(service);
      } else if (service.type === 'seguidores') {
        grouped['seguidores'].push(service);
      } else if (service.type === 'visualizacoes') {
        grouped['visualizacoes'].push(service);
      } else if (service.type === 'comentarios') {
        grouped['comentarios'].push(service);
      } else if (service.type === 'reels') {
        grouped['reels'].push(service);
      } else {
        // Se não se encaixar em nenhuma categoria específica, colocar na categoria do tipo
        const type = service.type || 'outros';
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(service);
      }
    });

    return grouped;
  };

  // Função para alternar a expansão de uma categoria
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Função para mover um serviço para cima na ordem
  const moveServiceUp = async (categoryType: string, serviceIndex: number) => {
    if (serviceIndex <= 0) return; // Já está no topo
    
    try {
      const groupedServices = groupServicesByType(filteredServices);
      const categoryServices = [...groupedServices[categoryType]];
      
      const serviceToMoveUp = categoryServices[serviceIndex];
      const serviceToMoveDown = categoryServices[serviceIndex - 1];
      
      console.log('Movendo para cima:', serviceToMoveUp.name, 'índice', serviceIndex);
      console.log('Movendo para baixo:', serviceToMoveDown.name, 'índice', serviceIndex - 1);
      
      // Usar valores temporários para evitar conflitos
      const tempOrderUp = serviceToMoveUp.order !== undefined ? serviceToMoveUp.order : 1000 + serviceIndex;
      const tempOrderDown = serviceToMoveDown.order !== undefined ? serviceToMoveDown.order : 1000 + serviceIndex - 1;
      
      // Primeiro, definir valores temporários para evitar conflitos de chave única
      await supabase
        .from('services')
        .update({ order: -tempOrderUp })
        .eq('id', serviceToMoveUp.id);
        
      await supabase
        .from('services')
        .update({ order: -tempOrderDown })
        .eq('id', serviceToMoveDown.id);
      
      // Agora, definir os valores finais
      await supabase
        .from('services')
        .update({ order: tempOrderDown })
        .eq('id', serviceToMoveUp.id);
        
      await supabase
        .from('services')
        .update({ order: tempOrderUp })
        .eq('id', serviceToMoveDown.id);
      
      // Animar o serviço que está sendo movido
      const updatedServices = [...services];
      const serviceToAnimate = updatedServices.find(s => s.id === serviceToMoveUp.id);
      
      if (serviceToAnimate) {
        serviceToAnimate.animating = true;
        setTimeout(() => {
          setServices(prevServices => 
            prevServices.map(s => s.id === serviceToAnimate.id ? { ...s, animating: false } : s)
          );
        }, 500);
      }
      
      // Recarregar os serviços para garantir que a ordem seja atualizada
      await fetchServices();
      
      toast.success('Ordem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao reordenar serviços:', error);
      toast.error('Erro ao atualizar ordem dos serviços');
    }
  };
  
  // Função para mover um serviço para baixo na ordem
  const moveServiceDown = async (categoryType: string, serviceIndex: number) => {
    const groupedServices = groupServicesByType(filteredServices);
    const categoryServices = [...groupedServices[categoryType]];
    
    if (serviceIndex >= categoryServices.length - 1) return; // Já está no final
    
    try {
      const serviceToMoveDown = categoryServices[serviceIndex];
      const serviceToMoveUp = categoryServices[serviceIndex + 1];
      
      console.log('Movendo para baixo:', serviceToMoveDown.name, 'índice', serviceIndex);
      console.log('Movendo para cima:', serviceToMoveUp.name, 'índice', serviceIndex + 1);
      
      // Usar valores temporários para evitar conflitos
      const tempOrderDown = serviceToMoveDown.order !== undefined ? serviceToMoveDown.order : 1000 + serviceIndex;
      const tempOrderUp = serviceToMoveUp.order !== undefined ? serviceToMoveUp.order : 1000 + serviceIndex + 1;
      
      // Primeiro, definir valores temporários para evitar conflitos de chave única
      await supabase
        .from('services')
        .update({ order: -tempOrderDown })
        .eq('id', serviceToMoveDown.id);
        
      await supabase
        .from('services')
        .update({ order: -tempOrderUp })
        .eq('id', serviceToMoveUp.id);
      
      // Agora, definir os valores finais
      await supabase
        .from('services')
        .update({ order: tempOrderUp })
        .eq('id', serviceToMoveDown.id);
        
      await supabase
        .from('services')
        .update({ order: tempOrderDown })
        .eq('id', serviceToMoveUp.id);
      
      // Animar o serviço que está sendo movido
      const updatedServices = [...services];
      const serviceToAnimate = updatedServices.find(s => s.id === serviceToMoveDown.id);
      
      if (serviceToAnimate) {
        serviceToAnimate.animating = true;
        setTimeout(() => {
          setServices(prevServices => 
            prevServices.map(s => s.id === serviceToAnimate.id ? { ...s, animating: false } : s)
          );
        }, 500);
      }
      
      // Recarregar os serviços para garantir que a ordem seja atualizada
      await fetchServices();
      
      toast.success('Ordem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao reordenar serviços:', error);
      toast.error('Erro ao atualizar ordem dos serviços');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Serviços</h1>
        <div className="flex space-x-2">
          <Button onClick={handleOpenApiModal}>
            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
            Cadastrar Serviço Via Provedores
          </Button>
          <Button onClick={() => router.push('/admin/servicos_v1/criar')}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar serviços..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Estilo para a animação */}
      <style jsx global>{`
        @keyframes moveCard {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredServices.length > 0 ? (
            <div className="space-y-6">
              {/* Serviços agrupados por tipo */}
              {Object.entries(groupServicesByType(filteredServices)).map(([type, typeServices]) => (
                typeServices.length > 0 && (
                  <div key={type} className="border rounded-lg overflow-hidden">
                    <div 
                      className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleCategoryExpansion(type)}
                    >
                      <h2 className="text-lg font-semibold capitalize">
                        {type === 'curtidas' ? 'Curtidas' : 
                         type === 'seguidores' ? 'Seguidores' : 
                         type === 'visualizacoes' ? 'Visualizações' : 
                         type === 'comentarios' ? 'Comentários' : 
                         type === 'reels' ? 'Reels' : 
                         type === 'inativos' ? 'Inativos' : type}
                        <span className="ml-2 text-gray-500 text-sm">({typeServices.length})</span>
                      </h2>
                      <FontAwesomeIcon 
                        icon={expandedCategories[type] ? faChevronUp : faChevronDown} 
                        className="text-gray-500"
                      />
                    </div>
                    
                    {expandedCategories[type] && (
                      <div className="p-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {typeServices
                            .sort((a, b) => {
                              // Ordenar primeiro por ordem, depois por ID como fallback
                              if (a.order !== undefined && b.order !== undefined) {
                                return a.order - b.order;
                              } else if (a.order !== undefined) {
                                return -1; // a tem ordem definida, b não tem
                              } else if (b.order !== undefined) {
                                return 1; // b tem ordem definida, a não tem
                              }
                              return a.id.localeCompare(b.id);
                            })
                            .map((service, index) => (
                              <div 
                                key={service.id} 
                                className="border rounded-lg p-4 flex flex-col relative transition-all duration-300 ease-in-out transform hover:shadow-md"
                                style={{
                                  animation: service.animating ? 'moveCard 0.5s ease-in-out' : 'none'
                                }}
                              >
                                {/* Botões de ordenação */}
                                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                                  <button 
                                    onClick={() => moveServiceUp(type, index)}
                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    disabled={index === 0}
                                  >
                                    <FontAwesomeIcon icon={faArrowUp} size="sm" />
                                  </button>
                                  <button 
                                    onClick={() => moveServiceDown(type, index)}
                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    disabled={index === typeServices.length - 1}
                                  >
                                    <FontAwesomeIcon icon={faArrowDown} size="sm" />
                                  </button>
                                </div>
                                
                                <div className="flex flex-col">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <SocialIcon 
                                        name={service.category?.social?.name || 'default'} 
                                        className="w-6 h-6" 
                                      />
                                      <span className="font-semibold text-sm">{service.name}</span>
                                      
                                      {/* Badge de Mais Vendido */}
                                      {(service.isbestseller === 'TRUE' || service.isbestseller === 'true') && (
                                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                                          <FontAwesomeIcon icon={faMedal} className="mr-1" />
                                          Mais Vendido
                                        </span>
                                      )}
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs ${
                                      service.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {service.status ? 'Ativo' : 'Inativo'}
                                    </div>
                                  </div>

                                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-gray-50 p-2 rounded">
                                      <div className="font-medium text-gray-600">Preço Base</div>
                                      <div className="font-bold text-blue-700">
                                        R$ {service.preco.toFixed(2)}
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                      <div className="font-medium text-gray-600">Categoria</div>
                                      <div>{service.category?.name || 'Não definida'}</div>
                                    </div>
                                  </div>

                                  {/* Informação do provedor */}
                                  <div className="mt-2 bg-purple-50 p-2 rounded text-xs">
                                    <div className="font-medium text-gray-600">Provedor</div>
                                    <div className="font-semibold text-purple-700 flex items-center">
                                      {service.provider?.name || 'Não definido'}
                                      {service.provider?.metadata?.api_status && (
                                        <span className={`ml-2 w-2 h-2 rounded-full ${
                                          service.provider.metadata.api_status === 'online' || service.provider.metadata.api_status === 'active' 
                                            ? 'bg-green-500' 
                                            : service.provider.metadata.api_status === 'error' 
                                              ? 'bg-red-500' 
                                              : 'bg-yellow-500'
                                        }`}></span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-4 flex justify-between">
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => openEditService(service)}
                                      >
                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                        Editar
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => openAddVariation(service)}
                                      >
                                        <FontAwesomeIcon icon={faLayerGroup} className="mr-1" />
                                        Variações
                                      </Button>
                                    </div>

                                    <div className="flex space-x-2">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button 
                                              onClick={() => handleToggleBestSeller(service.id, service.isbestseller === 'TRUE' || service.isbestseller === 'true')}
                                              className={`text-sm p-1 rounded-full ${service.isbestseller === 'TRUE' || service.isbestseller === 'true' ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                            >
                                              <FontAwesomeIcon icon={faMedal} size="lg" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{service.isbestseller === 'TRUE' || service.isbestseller === 'true' ? 'Remover' : 'Marcar'} como Mais Vendido</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button 
                                              onClick={() => handleStatusToggle(service)}
                                              className={`text-sm p-1 rounded-full ${service.status ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                            >
                                              <FontAwesomeIcon icon={service.status ? faToggleOn : faToggleOff} size="lg" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{service.status ? 'Desativar' : 'Ativar'} serviço</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button 
                                              onClick={() => handleDelete(service.id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Desativar Serviço</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">Nenhum serviço encontrado</p>
          )}
        </div>
      )}
      
      {/* Modal de Formulário */}
      <ServiceFormModal 
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
          setShowFormModal(false);
        }}
        editingService={editingService}
      />

      {/* Modal de Variações */}
      <ServiceVariationModal 
        isOpen={showVariationModal}
        onClose={() => {
          setShowVariationModal(false);
          setEditingService(null);
        }}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
          setShowVariationModal(false);
          setEditingService(null);
        }}
        service={editingService || null}
      />

      {/* Modal de API */}
      <ServiceApiModal 
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
          setShowApiModal(false);
        }}
        selectedProvider={selectedProvider}
      />

      {/* Modal de Seleção de Provedor */}
      <ProviderSelectionModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        onSelectProvider={(provider) => {
          // Salvar o provedor selecionado
          setSelectedProvider(provider);
          // Fechar o modal de seleção de provedores
          setShowProviderModal(false);
          // Abrir o modal de seleção de serviços
          setShowServiceSelectionModal(true);
        }}
      />

      {/* Modal de Seleção de Serviços */}
      <ServiceSelectionModal
        isOpen={showServiceSelectionModal}
        onClose={() => setShowServiceSelectionModal(false)}
        selectedProvider={selectedProvider}
      />

      {/* Modal de Variações */}
      {selectedServiceVariations && (
        <Dialog open={!!selectedServiceVariations} onOpenChange={() => setSelectedServiceVariations(null)}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Variações de Preço - {selectedServiceVariations.name}</DialogTitle>
              <DialogDescription>
                Gerencie as variações de preço para este serviço
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedServiceVariations.metadata?.quantidade_preco?.length > 0 ? (
                <div className="space-y-2">
                  {selectedServiceVariations.metadata.quantidade_preco.map((variacao: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Quantidade:</span> {variacao.quantidade} un
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Preço:</span> R$ {variacao.preco.toFixed(2)}
                      </div>
                      <button 
                        onClick={() => handleRemoveVariationInModal(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">Nenhuma variação de preço cadastrada</p>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedServiceVariations(null)}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleAddVariationInModal}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Adicionar Variação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
