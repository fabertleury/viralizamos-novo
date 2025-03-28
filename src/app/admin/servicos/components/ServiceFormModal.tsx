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

interface CheckoutType {
  id: string;
  name: string;
  slug: string;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: any;
  onSuccess: () => void;
}

export function ServiceFormModal({ isOpen, onClose, service, onSuccess }: ServiceFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [checkoutTypes, setCheckoutTypes] = useState<CheckoutType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<string>("");
  const [formData, setFormData] = useState({
    name: '',
    descricao: '',
    preco: '',
    quantidade: '',
    category_id: '',
    subcategory_id: '',
    checkout_type_id: '',
    featured: false,
    status: true,
    external_id: '',
    min_order: '',
    max_order: '',
    global_reach: false,
    fast_delivery: false,
    guaranteed_security: false,
    service_details: [
      { icon: '⚡', title: 'Entrega Gradual' },
      { icon: '👥', title: 'Seguidores de Qualidade' },
      { icon: '🔒', title: 'Suporte 24/7' }
    ],
    price_variations: [] as { quantidade: number; preco: number; preco_original: number | null }[],
    type: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (service) {
      // Verificar e parsear as variações de preço
      let priceVariations = [];
      try {
        if (service.metadata?.quantidade_preco) {
          priceVariations = service.metadata.quantidade_preco.map((variation: any) => ({
            quantidade: variation.quantidade,
            preco: variation.preco,
            preco_original: variation.preco_original || null
          }));
        }
      } catch (error) {
        console.error('Erro ao parsear variações de preço:', error);
      }

      setFormData({
        name: service.name || '',
        descricao: service.descricao || '',
        preco: service.preco?.toString() || '',
        quantidade: service.quantidade?.toString() || '',
        category_id: service.category_id || '',
        subcategory_id: service.subcategory_id || '',
        checkout_type_id: service.checkout_type_id || '',
        featured: service.featured || false,
        status: service.status !== false,
        external_id: service.external_id || '',
        min_order: service.min_order?.toString() || '20',
        max_order: service.max_order?.toString() || '10000',
        global_reach: service.metadata?.service_details?.global_reach || false,
        fast_delivery: service.metadata?.service_details?.fast_delivery || false,
        guaranteed_security: service.metadata?.service_details?.guaranteed_security || false,
        service_details: service.metadata?.service_details || [],
        price_variations: priceVariations,
        type: service.type || ''
      });
    }
  }, [service]);

  useEffect(() => {
    const fetchData = async () => {
      const [socialsResponse, categoriesResponse, checkoutTypesResponse] = await Promise.all([
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
          .from('checkout_types')
          .select('id, name, slug')
          .order('name')
      ]);

      if (socialsResponse.data) {
        setSocials(socialsResponse.data);
      }

      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      if (checkoutTypesResponse.data) {
        setCheckoutTypes(checkoutTypesResponse.data);
      }

      // Se estiver editando, buscar a rede social da categoria
      if (service?.category_id) {
        const category = categoriesResponse.data?.find(c => c.id === service.category_id);
        if (category) {
          setSelectedSocial(category.social_id);
        }
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, service]);

  useEffect(() => {
    if (formData.type && checkoutTypes.length > 0) {
      // Se o tipo for curtidas, sugerir "Mostrar Posts"
      // Se o tipo for seguidores, sugerir "Apenas Link do Usuário"
      const checkoutTypeToSuggest = formData.type === 'curtidas' 
        ? checkoutTypes.find(type => type.name === 'Mostrar Posts')
        : formData.type === 'seguidores'
          ? checkoutTypes.find(type => type.name === 'Apenas Link do Usuário')
          : null;
      
      if (checkoutTypeToSuggest) {
        setFormData(prev => ({
          ...prev,
          checkout_type_id: checkoutTypeToSuggest.id
        }));
      }
    }
  }, [formData.type, checkoutTypes]);

  const filteredCategories = categories.filter(cat => cat.social_id === selectedSocial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        name: formData.name,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        quantidade: parseInt(formData.quantidade),
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        checkout_type_id: formData.checkout_type_id,
        featured: formData.featured,
        status: formData.status,
        external_id: formData.external_id,
        min_order: parseInt(formData.min_order),
        max_order: parseInt(formData.max_order),
        metadata: {
          service_details: {
            global_reach: formData.global_reach,
            fast_delivery: formData.fast_delivery,
            guaranteed_security: formData.guaranteed_security,
            ...formData.service_details.reduce((acc, detail, index) => {
              acc[`detail_${index + 1}`] = detail;
              return acc;
            }, {})
          },
          quantidade_preco: formData.price_variations
        },
        type: formData.type
      };

      // Tratar campos UUID para evitar strings vazias
      if (formData.category_id) {
        serviceData.category_id = formData.category_id;
      }

      if (formData.subcategory_id && formData.subcategory_id.trim() !== '') {
        serviceData.subcategory_id = formData.subcategory_id;
      } else {
        serviceData.subcategory_id = null;
      }

      if (formData.checkout_type_id && formData.checkout_type_id.trim() !== '') {
        serviceData.checkout_type_id = formData.checkout_type_id;
      } else {
        serviceData.checkout_type_id = null;
      }

      if (service?.id) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);

        if (error) {
          console.error('Detailed error:', error);
          throw error;
        }
        toast.success('Serviço atualizado com sucesso!');
      } else {
        // Verificar se o serviço já existe antes de inserir
        const { data: existingService } = await supabase
          .from('services')
          .select('*')
          .eq('external_id', serviceData.external_id)
          .single();

        if (existingService) {
          toast.error('Serviço já existe!');
          return;
        }

        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) {
          console.error('Detailed error:', error);
          throw error;
        }
        toast.success('Serviço criado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Full error object:', error);
      toast.error(error.message || 'Erro ao salvar o serviço');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {service ? 'Editar' : 'Novo'} Serviço
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preço</label>
            <Input
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantidade</label>
            <Input
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID do Serviço na FAMA</label>
            <Input
              value={formData.external_id}
              onChange={(e) => setFormData({ ...formData, external_id: e.target.value })}
              required
              placeholder="Ex: 123456"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantidade Mínima</label>
              <Input
                type="number"
                value={formData.min_order}
                onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                min="20"
                max="10000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantidade Máxima</label>
              <Input
                type="number"
                value={formData.max_order}
                onChange={(e) => setFormData({ ...formData, max_order: e.target.value })}
                min="20"
                max="10000"
                required
              />
            </div>
          </div>

          {/* Seleção de Rede Social */}
          <div>
            <label className="block text-sm font-medium mb-1">Rede Social</label>
            <Select
              value={selectedSocial}
              onValueChange={(value) => {
                setSelectedSocial(value);
                setFormData({
                  ...formData,
                  category_id: '',
                  subcategory_id: ''
                });
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
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    category_id: value,
                    subcategory_id: '' // Limpa a subcategoria quando muda a categoria
                  });
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
          {formData.category_id && (
            <div>
              <label className="block text-sm font-medium mb-1">Subcategoria</label>
              <Select
                value={formData.subcategory_id}
                onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma subcategoria" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories
                    .find(cat => cat.id === formData.category_id)
                    ?.subcategories?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Serviço</label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um tipo de serviço" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="curtidas">Curtidas</SelectItem>
                <SelectItem value="seguidores">Seguidores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Checkout</label>
            <Select
              value={formData.checkout_type_id}
              onValueChange={(value) => setFormData({ ...formData, checkout_type_id: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um tipo de checkout" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {checkoutTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <Label>Alcance Global</Label>
            <input
              type="checkbox"
              checked={formData.global_reach}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, global_reach: e.target.checked }))
              }
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            
            <Label>Entrega Rápida</Label>
            <input
              type="checkbox"
              checked={formData.fast_delivery}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, fast_delivery: e.target.checked }))
              }
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            
            <Label>Segurança Garantida</Label>
            <input
              type="checkbox"
              checked={formData.guaranteed_security}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, guaranteed_security: e.target.checked }))
              }
              className="form-checkbox h-5 w-5 text-purple-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="featured" className="text-sm font-medium">
              Destaque
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="status" className="text-sm font-medium">
              Ativo
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Detalhes do Serviço</label>
            {formData.service_details.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  type="text"
                  value={detail.icon}
                  onChange={(e) => {
                    const newServiceDetails = [...formData.service_details];
                    newServiceDetails[index].icon = e.target.value;
                    setFormData({ ...formData, service_details: newServiceDetails });
                  }}
                  className="w-16"
                  placeholder="Emoji"
                />
                <Input
                  type="text"
                  value={detail.title}
                  onChange={(e) => {
                    const newServiceDetails = [...formData.service_details];
                    newServiceDetails[index].title = e.target.value;
                    setFormData({ ...formData, service_details: newServiceDetails });
                  }}
                  placeholder="Título do detalhe"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    const newServiceDetails = [...formData.service_details];
                    newServiceDetails.splice(index, 1);
                    setFormData({ ...formData, service_details: newServiceDetails });
                  }}
                  className="px-2 py-1"
                >
                  X
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newServiceDetails = [...formData.service_details, { icon: '✅', title: 'Novo detalhe' }];
                setFormData({ ...formData, service_details: newServiceDetails });
              }}
              className="mt-2"
            >
              Adicionar Detalhe
            </Button>
          </div>

          {/* Variações de Preço */}
          <div>
            <label className="block text-sm font-medium mb-1">Variações de Preço</label>
            <div className="space-y-3 mt-2 p-3 border rounded-md">
              {formData.price_variations.map((variation, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                  <div>
                    <label className="text-xs font-medium">Quantidade</label>
                    <Input
                      type="number"
                      value={variation.quantidade}
                      onChange={(e) => {
                        const newVariations = [...formData.price_variations];
                        newVariations[index].quantidade = parseInt(e.target.value);
                        setFormData({ ...formData, price_variations: newVariations });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Preço Original (opcional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variation.preco_original || ''}
                      onChange={(e) => {
                        const newVariations = [...formData.price_variations];
                        newVariations[index].preco_original = e.target.value ? parseFloat(e.target.value) : null;
                        setFormData({ ...formData, price_variations: newVariations });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Preço Final</label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        step="0.01"
                        value={variation.preco}
                        onChange={(e) => {
                          const newVariations = [...formData.price_variations];
                          newVariations[index].preco = parseFloat(e.target.value);
                          setFormData({ ...formData, price_variations: newVariations });
                        }}
                        required
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          const newVariations = [...formData.price_variations];
                          newVariations.splice(index, 1);
                          setFormData({ ...formData, price_variations: newVariations });
                        }}
                        className="ml-2 px-2 py-1"
                      >
                        X
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newVariations = [
                    ...formData.price_variations,
                    { quantidade: 100, preco: parseFloat(formData.preco) || 0, preco_original: null }
                  ];
                  setFormData({ ...formData, price_variations: newVariations });
                }}
                className="mt-2"
              >
                Adicionar Variação
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
