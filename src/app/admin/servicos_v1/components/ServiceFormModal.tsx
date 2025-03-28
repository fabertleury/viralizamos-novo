'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
  social_id: string;
}

interface Social {
  id: string;
  name: string;
  icon: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Service {
  id: string;
  name: string;
  descricao?: string;
  description?: string;
  type: string;
  quantidade: number;
  preco: number;
  category_id: string;
  subcategory_id?: string;
  checkout_type_id?: string;
  status: boolean;
  delivery_time: string;
  min_order: number;
  max_order: number;
  featured: boolean;
  external_id?: string;
  provider_id: string;
  success_rate: number;
  metadata?: any;
  isbestseller?: string;
  order?: number;
  service_variations?: any[];
  service_details?: any;
  category?: {
    id: string;
    name: string;
    icon: string;
    social?: {
      id: string;
      name: string;
      icon: string;
    }
  };
  subcategory?: {
    id: string;
    name: string;
  };
  provider?: {
    id: string;
    name: string;
    slug: string;
  };
  animating?: boolean;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingService: Service | null;
}

export function ServiceFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingService
}: ServiceFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<string>("");
  const [formData, setFormData] = useState({
    name: '',
    descricao: '',
    description: '',
    type: '',
    quantidade: 0,
    preco: 0,
    category_id: '',
    subcategory_id: '',
    checkout_type_id: '',
    status: true,
    delivery_time: '',
    min_order: 20,
    max_order: 10000,
    featured: false,
    external_id: '',
    provider_id: '',
    success_rate: 0,
    metadata: {}
  });

  const supabase = createClient();

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name || '',
        type: editingService.type || '',
        quantidade: editingService.quantidade || 0,
        preco: editingService.preco || 0,
        descricao: editingService.descricao || editingService.description || '',
        category_id: editingService.category_id || '',
        subcategory_id: editingService.subcategory_id || '',
        checkout_type_id: editingService.checkout_type_id || '',
        status: editingService.status !== undefined ? editingService.status : true,
        delivery_time: editingService.delivery_time || '',
        min_order: editingService.min_order || 0,
        max_order: editingService.max_order || 0,
        provider_id: editingService.provider_id || '',
        external_id: editingService.external_id || '',
        success_rate: editingService.success_rate || 0,
        featured: editingService.featured || false,
        metadata: editingService.metadata || {}
      });
      
      console.log('Editando serviço:', editingService);
      console.log('Provider ID:', editingService.provider_id);
    }
  }, [editingService]);

  useEffect(() => {
    const fetchData = async () => {
      const [socialsResponse, categoriesResponse, providersResponse] = await Promise.all([
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
          .order('order_position'),
        supabase
          .from('providers')
          .select('*')
          .order('name')
      ]);

      if (socialsResponse.data) {
        setSocials(socialsResponse.data);
      }

      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      if (providersResponse.data) {
        setProviders(providersResponse.data);
      }

      // Se estiver editando, buscar a rede social da categoria
      if (editingService?.category_id) {
        const category = categoriesResponse.data?.find(c => c.id === editingService.category_id);
        if (category) {
          setSelectedSocial(category.social_id);
        }
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, editingService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (socialId: string) => {
    setSelectedSocial(socialId);
    // Reset category and subcategory when social changes
    setFormData(prev => ({ 
      ...prev, 
      category_id: '', 
      subcategory_id: '' 
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category_id: categoryId,
      subcategory_id: '' 
    }));
  };

  const filteredCategories = categories.filter(cat => cat.social_id === selectedSocial);
  const filteredSubcategories = filteredCategories
    .find(cat => cat.id === formData.category_id)?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        descricao: formData.descricao || formData.description,
        type: formData.type,
        quantidade: formData.quantidade,
        preco: formData.preco,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || null,
        checkout_type_id: formData.checkout_type_id || null,
        status: formData.status,
        delivery_time: formData.delivery_time,
        min_order: formData.min_order,
        max_order: formData.max_order,
        featured: formData.featured,
        external_id: formData.external_id,
        provider_id: formData.provider_id,
        success_rate: formData.success_rate,
        metadata: formData.metadata
      };

      if (editingService?.id) {
        // Atualizar serviço existente
        const { error } = await supabase
          .from('services')
          .update(data)
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('Serviço atualizado com sucesso!');
      } else {
        // Criar novo serviço
        const { error } = await supabase
          .from('services')
          .insert(data);

        if (error) throw error;
        toast.success('Serviço criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      metadata: { ...prev.metadata, [key]: value } 
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rede Social</Label>
            <Select 
              value={selectedSocial} 
              onValueChange={handleSocialChange}
              required
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione a rede social" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {socials.map(social => (
                  <SelectItem key={social.id} value={social.id}>
                    {social.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Categoria</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={handleCategoryChange}
              disabled={!selectedSocial}
              required
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredSubcategories.length > 0 && (
            <div>
              <Label>Subcategoria</Label>
              <Select 
                value={formData.subcategory_id || ''} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  subcategory_id: value 
                }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {filteredSubcategories.map(subcategory => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Nome do Serviço</Label>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Curtidas Instagram"
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea 
              name="descricao"
              value={formData.descricao || formData.description}
              onChange={handleInputChange}
              placeholder="Descrição do serviço"
            />
          </div>

          <div>
            <Label>Tipo</Label>
            <Input 
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="Ex: Curtidas"
              required
            />
          </div>

          <div>
            <Label>Quantidade</Label>
            <Input 
              name="quantidade"
              value={formData.quantidade}
              onChange={handleInputChange}
              type="number"
              required
            />
          </div>

          <div>
            <Label>Preço</Label>
            <Input 
              name="preco"
              value={formData.preco}
              onChange={handleInputChange}
              type="number"
              required
            />
          </div>

          <div>
            <Label>Tempo de Entrega</Label>
            <Input 
              name="delivery_time"
              value={formData.delivery_time}
              onChange={handleInputChange}
              placeholder="Ex: 24 horas"
              required
            />
          </div>

          <div>
            <Label>Ordem Mínima</Label>
            <Input 
              name="min_order"
              value={formData.min_order}
              onChange={handleInputChange}
              type="number"
              required
            />
          </div>

          <div>
            <Label>Ordem Máxima</Label>
            <Input 
              name="max_order"
              value={formData.max_order}
              onChange={handleInputChange}
              type="number"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label>Destaque</Label>
            <Switch 
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                featured: checked 
              }))}
            />
          </div>

          <div>
            <Label>ID Externo</Label>
            <Input 
              name="external_id"
              value={formData.external_id}
              onChange={handleInputChange}
              placeholder="Ex: ID do serviço no provedor"
              required
            />
          </div>

          <div>
            <Label>Provedor</Label>
            <Select 
              value={formData.provider_id} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                provider_id: value 
              }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Taxa de Sucesso</Label>
            <Input 
              name="success_rate"
              value={formData.success_rate}
              onChange={handleInputChange}
              type="number"
              required
            />
          </div>

          <div className="mb-4">
            <Label>Entrega Imediata</Label>
            <Input 
              type="text"
              value={formData.metadata?.immediateDelivery || ''}
              onChange={(e) => handleMetadataChange('immediateDelivery', e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label>Perfil Seguro</Label>
            <Input 
              type="text"
              value={formData.metadata?.secureProfile || ''}
              onChange={(e) => handleMetadataChange('secureProfile', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
