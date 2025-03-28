'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faSave, faCoffee, faLemon, faCar, faHeart, faStar, faClock, faCheck, 
  faShield, faRocket, faGlobe, faUsers, faThumbsUp, faEye, faComment, 
  faBolt, faMedal, faTrophy, faGem, faCrown, faFire, faSmile, faLock, faUnlock 
} from '@fortawesome/free-solid-svg-icons';
import { EmojiSelector } from '@/components/emoji-picker';

interface ServiceQuantityPrice {
  quantidade: number;
  preco: number;
  preco_original?: number;
}

interface ServiceDetail {
  title: string;
  emoji: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
  social_id: string;
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
  url: string;
  active: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
  icon_url: string;
}

interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
  api_key: string;
  api_url: string;
  status: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface CheckoutType {
  id: string;
  name: string;
}

export default function CriarServicoPage() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('id');

  // Estados para o formulário
  const [formData, setFormData] = useState({
    name: '',
    descricao: '',
    min_order: '0',
    max_order: '0',
    quantidade: '0',
    preco: '0',
    category_id: '',
    subcategory_id: '',
    provider_id: '',
    external_id: '',
    external_data_temp: {},
    delivery_time: '',
    success_rate: '',
    checkout_type_id: '',
    status: true,
    type: '', // Adicionado o campo type
    social_id: '', // Adicionado o campo social_id
  });
  
  // Estado para refill (será usado apenas no metadata)
  const [refill, setRefill] = useState(false);

  // Estados para opções de seleção
  const [socials, setSocials] = useState<Social[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [checkoutTypes, setCheckoutTypes] = useState<CheckoutType[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estado para quantidades e preços
  const [quantityPrices, setQuantityPrices] = useState<ServiceQuantityPrice[]>([
    { quantidade: 50, preco: 10.00, preco_original: undefined }
  ]);
  
  // Estado para detalhes do serviço
  const [serviceDetails, setServiceDetails] = useState<ServiceDetail[]>([
    { title: '', emoji: '' }
  ]);

  // Funções para manipular quantidades e preços
  const addQuantityPriceRow = () => {
    setQuantityPrices([
      ...quantityPrices, 
      { quantidade: 0, preco: 0, preco_original: undefined }
    ]);
  };

  const removeQuantityPriceRow = (index: number) => {
    if (quantityPrices.length > 1) {
      const newRows = [...quantityPrices];
      newRows.splice(index, 1);
      setQuantityPrices(newRows);
    }
  };

  const updateQuantityPrice = (
    index: number, 
    field: 'quantidade' | 'preco' | 'preco_original', 
    value: string
  ) => {
    const newRows = [...quantityPrices];
    const parsedValue = field === 'quantidade' 
      ? parseInt(value) || 0
      : parseFloat(value) || 0;
    
    newRows[index][field] = parsedValue;
    setQuantityPrices(newRows);
  };

  // Funções para manipular detalhes do serviço
  const addServiceDetail = () => {
    setServiceDetails([...serviceDetails, { title: '', emoji: '' }]);
  };

  const updateServiceDetail = (index: number, field: 'title' | 'emoji', value: string) => {
    const newDetails = [...serviceDetails];
    newDetails[index][field] = value;
    setServiceDetails(newDetails);
  };

  const removeServiceDetail = (index: number) => {
    if (serviceDetails.length > 1) {
      const newDetails = [...serviceDetails];
      newDetails.splice(index, 1);
      setServiceDetails(newDetails);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar redes sociais
        const { data: socialsData, error: socialsError } = await supabase
          .from('socials')
          .select('*');

        if (socialsError) throw socialsError;
        setSocials(socialsData || []);

        // Buscar categorias com subcategorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            *,
            subcategories (*)
          `);

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Buscar tipos de checkout
        const { data: checkoutTypesData, error: checkoutTypesError } = await supabase
          .from('checkout_types')
          .select('*');

        if (checkoutTypesError) throw checkoutTypesError;
        setCheckoutTypes(checkoutTypesData || []);

        // Verificar se há um provedor selecionado no localStorage
        const providerJson = localStorage.getItem('selectedProvider');
        if (providerJson) {
          try {
            const provider = JSON.parse(providerJson);
            console.log('Provedor carregado do localStorage:', provider);
            
            // Garantir que o objeto provider tenha todos os campos necessários
            if (provider && provider.id) {
              setSelectedProvider(provider);
            } else {
              console.error('Provedor inválido no localStorage:', provider);
            }
            
            // Opcional: Limpar o localStorage após carregar
            // localStorage.removeItem('selectedProvider');
          } catch (e) {
            console.error('Erro ao carregar provedor do localStorage:', e);
          }
        }

        // Verificar se há um serviço selecionado no localStorage
        const serviceJson = localStorage.getItem('selectedService');
        if (serviceJson) {
          try {
            const service = JSON.parse(serviceJson);
            console.log('Serviço carregado do localStorage:', service);
            
            // Preencher o formulário com os dados do serviço
            if (service) {
              setFormData({
                ...formData,
                name: service.name || '',
                descricao: service.description || '',
                min_order: service.min || '0',
                max_order: service.max || '0',
                quantidade: service.min || '0',
                preco: service.rate || '0',
                external_id: service.service || '',
                external_data_temp: service,
                delivery_time: '',
                success_rate: '',
                checkout_type_id: '',
                status: true,
              });
            }
          } catch (e) {
            console.error('Erro ao carregar serviço do localStorage:', e);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    fetchData();
  }, []);

  // Efeito para sugerir automaticamente o tipo de checkout com base no tipo de serviço
  useEffect(() => {
    if (formData.type && checkoutTypes.length > 0) {
      // Sugerir o tipo de checkout com base no tipo de serviço
      let checkoutTypeToSuggest = null;
      
      switch (formData.type) {
        case 'curtidas':
          checkoutTypeToSuggest = checkoutTypes.find(ct => ct.name === 'Mostrar Posts');
          break;
        case 'seguidores':
          checkoutTypeToSuggest = checkoutTypes.find(ct => ct.name === 'Apenas Link do Usuário');
          break;
        case 'visualizacoes':
          checkoutTypeToSuggest = checkoutTypes.find(ct => ct.name === 'Mostrar Posts');
          break;
        case 'comentarios':
          checkoutTypeToSuggest = checkoutTypes.find(ct => ct.name === 'Mostrar Posts');
          break;
        case 'reels':
          checkoutTypeToSuggest = checkoutTypes.find(ct => ct.name === 'Mostrar Posts');
          break;
        default:
          break;
      }
      
      if (checkoutTypeToSuggest) {
        setFormData(prev => ({
          ...prev,
          checkout_type_id: checkoutTypeToSuggest.id
        }));
      }
    }
  }, [formData.type, checkoutTypes]);

  const handleSocialChange = (socialId: string) => {
    setFormData(prev => ({
      ...prev,
      social_id: socialId,
    }));
    const categoriesBySocial = categories.filter(c => c.social_id === socialId);
    setCategories(categoriesBySocial);
    setSubcategories([]);
    setFormData(prev => ({
      ...prev,
      category_id: '',
      subcategory_id: '',
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(c => c.id === categoryId);
    const subcategories = selectedCategory?.subcategories || [];
    
    setSubcategories(subcategories);
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      subcategory_id: '',
    }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      if (!formData.name || !formData.category_id) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Preparar os dados para envio
      const dataToSubmit = {
        name: formData.name,
        descricao: formData.descricao,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        quantidade: parseInt(formData.quantidade) || 0,
        preco: parseFloat(formData.preco) || 0,
        min_order: parseInt(formData.min_order) || 0,
        max_order: parseInt(formData.max_order) || 0,
        delivery_time: formData.delivery_time,
        success_rate: formData.success_rate ? parseFloat(formData.success_rate) || 0 : null,
        checkout_type_id: formData.checkout_type_id || null,
        provider_id: formData.provider_id || selectedProvider?.id || null,
        external_id: formData.external_id || null,
        metadata: {
          ...(formData.external_data_temp || {}),
          refill,
          social_id: formData.social_id, // Movendo para metadata
        },
        service_variations: quantityPrices,
        service_details: serviceDetails,
        type: 'service',
        status: formData.status,
      };

      // Enviar os dados para o Supabase
      const { data, error } = await supabase
        .from('services')
        .insert([dataToSubmit])
        .select();

      if (error) {
        throw new Error(`Erro ao criar serviço: ${error.message}`);
      }

      // Limpar o localStorage se houver dados de serviço
      localStorage.removeItem('selectedService');
      localStorage.removeItem('selectedProvider');

      toast.success('Serviço criado com sucesso!');
      router.push('/admin/servicos_v1');
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast.error(`Erro ao criar serviço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {serviceId ? 'Editar Serviço' : 'Criar Novo Serviço'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedProvider && (
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <Label className="font-bold">Provedor Selecionado</Label>
            <div className="mt-2">
              <span className="font-medium">{selectedProvider.name}</span>
              {selectedProvider.metadata?.balance !== undefined && (
                <span className="ml-2 text-sm text-gray-600">
                  (Saldo: {selectedProvider.metadata.currency || ''} {
                    typeof selectedProvider.metadata.balance === 'number' 
                      ? selectedProvider.metadata.balance.toFixed(2) 
                      : selectedProvider.metadata.balance
                  })
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {selectedProvider && (
            <div className="bg-blue-50 p-4 rounded-md">
              <Label className="font-bold">Provedor Selecionado</Label>
              <div className="mt-2">
                <span className="font-medium">{selectedProvider.name}</span>
                {selectedProvider.metadata?.balance !== undefined && (
                  <span className="ml-2 text-sm text-gray-600">
                    (Saldo: {selectedProvider.metadata.currency || ''} {
                      typeof selectedProvider.metadata.balance === 'number' 
                        ? selectedProvider.metadata.balance.toFixed(2) 
                        : selectedProvider.metadata.balance
                    })
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <Label>Nome do Serviço</Label>
            <Input
              placeholder="Nome do serviço"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-white"
              required
            />
          </div>

          <div>
            <Label>Rede Social</Label>
            <Select 
              value={formData.social_id} 
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
              disabled={!formData.social_id}
              required
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subcategories.length > 0 && (
            <div>
              <Label>Subcategoria</Label>
              <Select 
                value={formData.subcategory_id} 
                onValueChange={(value) => handleInputChange('subcategory_id', value)}
                disabled={!formData.category_id}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {subcategories.map(subcategory => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tipo de Checkout */}
          <div>
            <Label>Tipo de Checkout</Label>
            <Select 
              value={formData.checkout_type_id} 
              onValueChange={(value) => handleInputChange('checkout_type_id', value)}
              required
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o tipo de checkout" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {checkoutTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Serviço */}
          <div>
            <Label>Tipo de Serviço</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
              required
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="curtidas">Curtidas</SelectItem>
                <SelectItem value="seguidores">Seguidores</SelectItem>
                <SelectItem value="visualizacoes">Visualizações</SelectItem>
                <SelectItem value="comentarios">Comentários</SelectItem>
                <SelectItem value="reels">Reels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mínimo, Máximo, Quantidade e Preço */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label>Pedido Mínimo</Label>
              <Input
                type="number"
                value={formData.min_order || ''}
                onChange={(e) => handleInputChange('min_order', e.target.value)}
                className="bg-white"
                min="1"
              />
            </div>
            <div>
              <Label>Pedido Máximo</Label>
              <Input
                type="number"
                value={formData.max_order || ''}
                onChange={(e) => handleInputChange('max_order', e.target.value)}
                className="bg-white"
                min="1"
              />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formData.quantidade || ''}
                onChange={(e) => handleInputChange('quantidade', e.target.value)}
                className="bg-white"
                min="1"
                required
              />
            </div>
            <div>
              <Label>Preço Base (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco || ''}
                onChange={(e) => handleInputChange('preco', e.target.value)}
                className="bg-white"
                min="0.01"
                required
              />
            </div>
          </div>

          {/* Tempo de Entrega */}
          <div>
            <Label>Tempo de Entrega</Label>
            <Input
              type="text"
              value={formData.delivery_time}
              onChange={(e) => handleInputChange('delivery_time', e.target.value)}
              className="bg-white"
              placeholder="Ex: 1-2 horas"
            />
          </div>

          {/* Taxa de Sucesso */}
          <div>
            <Label>Taxa de Sucesso (%)</Label>
            <Input
              type="number"
              value={formData.success_rate || ''}
              onChange={(e) => handleInputChange('success_rate', e.target.value)}
              className="bg-white"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descrição do serviço"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className="bg-white"
              rows={3}
            />
          </div>

          {/* Detalhes do Serviço */}
          <div>
            <h2 className="text-lg font-bold mb-4">Detalhes do Serviço</h2>
            {serviceDetails.map((detail, index) => (
              <div key={index} className="flex items-center mb-4">
                <div className="w-1/2 mr-2">
                  <Label className="block text-sm font-medium mb-1">Emoji</Label>
                  <EmojiSelector
                    value={detail.emoji}
                    onChange={(emoji) => updateServiceDetail(index, 'emoji', emoji)}
                  />
                </div>
                
                <div className="w-1/2">
                  <Label className="block text-sm font-medium mb-1">Título</Label>
                  <Input
                    type="text"
                    placeholder="Título"
                    value={detail.title}
                    onChange={(e) => updateServiceDetail(index, 'title', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="ml-2 flex items-end">
                  <Button 
                    type="button" 
                    onClick={addServiceDetail} 
                    className="mb-1 bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    +
                  </Button>
                  {serviceDetails.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeServiceDetail(index)} 
                      className="mb-1 ml-1 bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      -
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Seção de Quantidades e Preços */}
          <div>
            <h2 className="text-lg font-bold mb-4">Quantidades e Preços</h2>
            <div className="space-y-2">
              {quantityPrices.map((qp, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Label className="block mb-1">Quantidade</Label>
                    <Input
                      type="number"
                      value={qp.quantidade || ''}
                      onChange={(e) => updateQuantityPrice(index, 'quantidade', e.target.value)}
                      className="bg-white"
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="block mb-1">Preço Original (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={qp.preco_original || ''}
                      onChange={(e) => updateQuantityPrice(index, 'preco_original', e.target.value)}
                      className="bg-white"
                      min="0.01"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="block mb-1">Preço Final (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={qp.preco || ''}
                      onChange={(e) => updateQuantityPrice(index, 'preco', e.target.value)}
                      className="bg-white"
                      min="0.01"
                      required
                    />
                  </div>
                  {quantityPrices.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeQuantityPriceRow(index)}
                      className="mt-6 bg-red-500 text-white hover:bg-red-600"
                      size="sm"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addQuantityPriceRow}
                className="mt-2 bg-green-500 text-white hover:bg-green-600"
              >
                Adicionar Quantidade/Preço
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.status}
              onChange={(e) => handleInputChange('status', e.target.checked)}
              className="mr-2"
            />
            <Label>Serviço Ativo</Label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={refill}
              onChange={(e) => setRefill(e.target.checked)}
              className="mr-2"
            />
            <Label>Refill</Label>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="mr-2">Salvando...</span>
                <FontAwesomeIcon icon={faPlus} className="animate-spin" />
              </>
            ) : (
              <>
                <span className="mr-2">Salvar Serviço</span>
                <FontAwesomeIcon icon={faSave} />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
