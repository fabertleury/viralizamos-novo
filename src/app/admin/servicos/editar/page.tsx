'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function NovoServicoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('id');
  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [checkoutTypes, setCheckoutTypes] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<string>("");
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [providerServices, setProviderServices] = useState<any[]>([]);

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
    min_order: '20',
    max_order: '10000',
    global_reach: false,
    fast_delivery: false,
    guaranteed_security: false,
    provider_id: ''
  });

  const fetchProviderServices = async (providerSlug: string) => {
    try {
      const response = await fetch(`/api/providers/${providerSlug}/services`);
      const data = await response.json();
      
      if (data.services) {
        setProviderServices(data.services);
        toast.success(`Serviços do provedor ${providerSlug} carregados`);
      } else {
        toast.error('Não foi possível carregar os serviços do provedor');
      }
    } catch (error) {
      console.error('Erro ao buscar serviços do provedor:', error);
      toast.error('Erro ao buscar serviços do provedor');
    }
  };

  const handleProviderChange = (providerId: string) => {
    const selectedProviderData = providers.find(p => p.id === providerId);
    
    if (selectedProviderData) {
      setSelectedProvider(providerId);
      setFormData(prev => ({ ...prev, provider_id: providerId }));
      fetchProviderServices(selectedProviderData.slug);
    }
  };

  useEffect(() => {
    if (!serviceId) {
      toast.error('ID do serviço não fornecido');
      router.push('/admin/servicos');
    }
  }, [serviceId, router]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('Iniciando busca de providers');

        // Buscar todos os providers para log detalhado
        const allProvidersResponse = await supabase
          .from('providers')
          .select('*', { count: 'exact' });

        console.log('Todos os providers:', {
          count: allProvidersResponse.count,
          providers: allProvidersResponse.data?.map(p => ({
            id: p.id, 
            name: p.name, 
            status: p.status, 
            typeof_status: typeof p.status
          })),
          error: allProvidersResponse.error
        });

        // Buscar providers com verificação explícita de status
        const providersResponse = await supabase
          .from('providers')
          .select('*', { count: 'exact' })
          .filter('status', 'eq', true)  // Usar .filter em vez de .eq
          .order('name');

        console.log('Consulta de providers com status true:', {
          query: 'providers.select(*).filter(status, eq, true).order(name)',
          count: providersResponse.count,
          providers: providersResponse.data?.map(p => ({
            id: p.id, 
            name: p.name, 
            status: p.status, 
            typeof_status: typeof p.status
          })),
          error: providersResponse.error
        });

        if (providersResponse.error) {
          throw providersResponse.error;
        }

        if (providersResponse.data) {
          setProviders(providersResponse.data);
          
          if (providersResponse.data.length === 0) {
            toast.warning('Nenhum provedor ativo encontrado. Verifique o status dos provedores.');
          } else {
            toast.success(`${providersResponse.data.length} provedores ativos carregados`);
          }
        }

        const [socialsResponse, categoriesResponse, checkoutTypesResponse, subcategoriesResponse] = await Promise.all([
          supabase.from('socials').select('*').order('name'),
          supabase.from('categories').select(`
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
          supabase.from('checkout_types').select('*'),
          supabase.from('subcategories').select('*')
        ]);

        if (socialsResponse.data) setSocials(socialsResponse.data);
        if (categoriesResponse.data) setCategories(categoriesResponse.data);
        if (checkoutTypesResponse.data) setCheckoutTypes(checkoutTypesResponse.data);
        if (subcategoriesResponse.data) setSubcategories(subcategoriesResponse.data);

      } catch (error) {
        console.error('Erro completo ao buscar providers:', error);
        toast.error('Erro crítico ao carregar provedores');
      }
    };

    fetchInitialData();

    if (serviceId) {
      const fetchService = async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (data) {
          setFormData({
            name: data.name || '',
            descricao: data.descricao || '',
            preco: data.preco?.toString() || '',
            quantidade: data.quantidade?.toString() || '',
            category_id: data.category_id || '',
            subcategory_id: data.subcategory_id || '',
            checkout_type_id: data.checkout_type_id || '',
            featured: data.featured || false,
            status: data.status !== false,
            external_id: data.external_id || '',
            min_order: data.min_order?.toString() || '20',
            max_order: data.max_order?.toString() || '10000',
            global_reach: data.metadata?.service_details?.global_reach || false,
            fast_delivery: data.metadata?.service_details?.fast_delivery || false,
            guaranteed_security: data.metadata?.service_details?.guaranteed_security || false,
            provider_id: data.provider_id || ''
          });

          const category = categories.find(c => c.id === data.category_id);
          if (category) {
            setSelectedSocial(category.social_id);
          }

          if (data.provider_id) {
            const providerData = providers.find(p => p.id === data.provider_id);
            if (providerData) {
              setSelectedProvider(data.provider_id);
              fetchProviderServices(providerData.slug);
            }
          }
        }
      };

      fetchService();
    }
  }, [serviceId, categories, providers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        name: formData.name,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        quantidade: parseInt(formData.quantidade),
        featured: formData.featured,
        status: formData.status,
        external_id: formData.external_id,
        min_order: parseInt(formData.min_order) || 20,
        max_order: parseInt(formData.max_order) || 10000,
        metadata: {
          service_details: {
            global_reach: formData.global_reach,
            fast_delivery: formData.fast_delivery,
            guaranteed_security: formData.guaranteed_security
          }
        }
      };

      if (formData.category_id) data.category_id = formData.category_id;
      if (formData.subcategory_id && formData.subcategory_id.trim() !== '') {
        data.subcategory_id = formData.subcategory_id;
      }
      if (formData.checkout_type_id && formData.checkout_type_id.trim() !== '') {
        data.checkout_type_id = formData.checkout_type_id;
      }
      if (formData.provider_id) data.provider_id = formData.provider_id;

      if (serviceId) {
        const { error } = await supabase
          .from('services')
          .update(data)
          .eq('id', serviceId);

        if (error) throw error;
        toast.success('Serviço atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([data]);

        if (error) throw error;
        toast.success('Serviço criado com sucesso!');
      }

      router.push('/admin/servicos');
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao salvar o serviço');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.social_id === selectedSocial);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Editar Serviço
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block text-gray-700">Nome do Serviço</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Digite o nome do serviço"
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <Label className="mb-2 block text-gray-700">Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do serviço"
              rows={3}
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <Label className="mb-2 block text-gray-700">Preço</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
              required
              placeholder="Preço do serviço"
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <Label className="mb-2 block text-gray-700">Quantidade</Label>
            <Input
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
              required
              placeholder="Quantidade do serviço"
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <Label>Rede Social</Label>
            <Select 
              value={selectedSocial} 
              onValueChange={(value) => setSelectedSocial(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a rede social" />
              </SelectTrigger>
              <SelectContent>
                {socials.map((social) => (
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
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo de Checkout</Label>
            <Select 
              value={formData.checkout_type_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, checkout_type_id: value }))}
            >
              <SelectTrigger className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <SelectValue placeholder="Selecione o tipo de checkout" />
              </SelectTrigger>
              <SelectContent>
                {checkoutTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subcategoria</Label>
            <Select 
              value={formData.subcategory_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value }))}
            >
              <SelectTrigger className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <SelectValue placeholder="Selecione a subcategoria" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Provedor</Label>
            <Select 
              value={selectedProvider} 
              onValueChange={handleProviderChange}
            >
              <SelectTrigger className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Detalhes do Serviço</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="global_reach"
                  checked={formData.global_reach}
                  onChange={(e) => setFormData(prev => ({ ...prev, global_reach: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <Label htmlFor="global_reach">Alcance Global</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fast_delivery"
                  checked={formData.fast_delivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, fast_delivery: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <Label htmlFor="fast_delivery">Entrega Rápida</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="guaranteed_security"
                  checked={formData.guaranteed_security}
                  onChange={(e) => setFormData(prev => ({ ...prev, guaranteed_security: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <Label htmlFor="guaranteed_security">Segurança Garantida</Label>
              </div>
            </div>
          </div>
        </div>

        {providerServices.length > 0 && (
          <div className="col-span-2">
            <Label className="mb-2 block text-gray-700">Serviços do Provedor</Label>
            <div className="grid grid-cols-2 gap-4">
              {providerServices.map((service) => (
                <div 
                  key={service.id} 
                  className="border p-4 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      name: service.name,
                      descricao: service.description,
                      preco: service.price.toString(),
                      quantidade: service.max_order.toString(),
                      min_order: service.min_order.toString(),
                      max_order: service.max_order.toString()
                    }));
                  }}
                >
                  <h3 className="font-bold">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div className="flex justify-between mt-2">
                    <span>Min: {service.min_order}</span>
                    <span>Max: {service.max_order}</span>
                    <span>Preço: R$ {service.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/admin/servicos')}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Salvando...' : (serviceId ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </form>
    </div>
  );
}
