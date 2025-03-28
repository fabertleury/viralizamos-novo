'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "sonner";
import { ServiceFormModal } from "./ServiceFormModal";
import { ProviderSelectionModal } from "./ProviderSelectionModal";

interface Provider {
  id: string;
  name: string;
  slug: string;
  api_key: string;
  api_url: string;
  status: boolean;
  metadata: {
    last_check?: string;
    balance?: number;
    api_status?: 'active' | 'inactive' | 'error';
    api_error?: string;
  };
}

interface ApiService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  social?: {
    icon: string;
  };
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Social {
  id: string;
  name: string;
  icon: string;
}

interface ServiceApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ServiceApiModal({ isOpen, onClose, onSuccess }: ServiceApiModalProps) {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedProviderData, setSelectedProviderData] = useState<Provider | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(true);
  const [socials, setSocials] = useState<Social[]>([]);
  const [selectedSocial, setSelectedSocial] = useState<string>("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen) {
      setShowProviderModal(true);
      setShowSelectionModal(false);
    } else {
      setShowProviderModal(false);
      setShowSelectionModal(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providersResponse, socialsResponse, categoriesResponse] = await Promise.all([
          supabase
            .from('providers')
            .select('*')
            .order('name'),
          supabase
            .from('socials')
            .select('*')
            .order('name'),
          supabase
            .from('categories')
            .select(`
              id, 
              name,
              social_id,
              subcategories (
                id,
                name,
                category_id
              )
            `)
            .eq('active', true)
            .order('order_position')
        ]);

        if (providersResponse.error) throw providersResponse.error;
        if (socialsResponse.error) throw socialsResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;

        setProviders(providersResponse.data || []);
        setSocials(socialsResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const filteredCategories = categories.filter(cat => cat.social_id === selectedSocial);

  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedProvider) return;

      setLoading(true);
      try {
        const provider = providers.find(p => p.id === selectedProvider);
        if (!provider) return;

        const response = await fetch('/api/providers/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ provider })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Falha ao carregar serviços do provedor');
        }

        const { services } = await response.json();
        setServices(services);
      } catch (error: any) {
        console.error("Erro ao carregar serviços:", error);
        toast.error(error.message || "Erro ao carregar serviços");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedProvider]);

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProviderData(provider);
    setSelectedProvider(provider.id);
    setShowProviderModal(false);
    setShowSelectionModal(true);
  };

  const handleServiceSelect = (service: ApiService) => {
    if (!selectedCategory) {
      toast.error("Selecione uma categoria primeiro");
      return;
    }
    if (!selectedSubcategory) {
      toast.error("Selecione uma subcategoria primeiro");
      return;
    }
    setSelectedService(service);
    setShowSelectionModal(false);
  };

  useEffect(() => {
    if (selectedService && !showSelectionModal) {
      const timer = setTimeout(() => {
        setIsConfigModalOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedService, showSelectionModal]);

  const handleConfigModalClose = () => {
    setIsConfigModalOpen(false);
    setSelectedService(null);
    onClose();
  };

  const handleConfigSuccess = () => {
    setIsConfigModalOpen(false);
    setSelectedService(null);
    if (onSuccess) onSuccess();
    onClose();
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ProviderSelectionModal 
        isOpen={showProviderModal && isOpen} 
        onClose={onClose}
        onProviderSelect={handleProviderSelect}
      />

      <Dialog open={showSelectionModal} onOpenChange={(open) => {
        if (!open) onClose();
      }}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Serviços via API</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Seleção de Rede Social */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Rede Social
              </label>
              <Select
                value={selectedSocial}
                onValueChange={(value) => {
                  setSelectedSocial(value);
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma rede social" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {socials.map((social) => (
                    <SelectItem key={social.id} value={social.id}>
                      {social.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Categoria */}
            {selectedSocial && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecione a Categoria
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedSubcategory('');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Seleção de Subcategoria */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecione a Subcategoria
                </label>
                <Select
                  value={selectedSubcategory}
                  onValueChange={setSelectedSubcategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories
                      .find(cat => cat.id === selectedCategory)
                      ?.subcategories?.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Busca de Serviços */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Buscar Serviços
              </label>
              <Input
                type="text"
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de Serviços */}
            <div className="border rounded-md">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 font-medium">
                <div>Nome</div>
                <div>Categoria Original</div>
                <div>Preço</div>
                <div>Min/Max</div>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {filteredServices.map((service) => (
                  <div
                    key={service.service}
                    className="grid grid-cols-4 gap-4 p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div>{service.name}</div>
                    <div>{service.category}</div>
                    <div>{service.rate}</div>
                    <div>
                      {service.min} - {service.max}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedService && (
        <ServiceFormModal
          isOpen={isConfigModalOpen}
          onClose={handleConfigModalClose}
          onSuccess={handleConfigSuccess}
          service={{
            name: selectedService.name,
            descricao: `${selectedService.name} - ${selectedService.type}`,
            preco: selectedService.rate,
            quantidade: selectedService.min,
            min_order: selectedService.min,
            max_order: selectedService.max,
            provider_id: selectedProvider,
            external_id: selectedService.service.toString(),
            category_id: selectedCategory,
            subcategory_id: selectedSubcategory || null, // Garante que string vazia vira null
            type: selectedService.type,
            metadata: {
              refill: selectedService.refill
            },
            status: true,
            featured: false,
            checkout_type_id: selectedService.type === 'curtidas' ? 'b21896eb-b402-4cc6-85ce-6a11dc093e71' : 
                            selectedService.type === 'seguidores' ? 'b6e07550-e410-4105-98e1-b9c7010e18f6' : 
                            '24edf957-1cad-4f3a-8e2b-cd2113008f1b'
          }}
        />
      )}
    </>
  );
}
