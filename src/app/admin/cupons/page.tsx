'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Search, RefreshCw, Info, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CouponFormModal from './components/CouponFormModal';

type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
  service_restrictions?: { service_id: string; service: { name: string } }[];
  customer_assignments?: { customer_id: string; customer: { email: string } }[];
};

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [tab, setTab] = useState('all');
  const [couponUsage, setCouponUsage] = useState<{[key: string]: {email: string, date: string}[]}>({});
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          service_restrictions:coupon_service_restrictions(
            service_id,
            service:services(name)
          ),
          customer_assignments:coupon_customer_assignments(
            customer_id,
            customer:customers(email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCoupons(data || []);
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponUsage = async (couponId: string) => {
    setLoadingUsage(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          customer:customers(email)
        `)
        .eq('coupon_id', couponId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const usageData = data?.map(order => ({
        email: order.customer?.email || 'N/A',
        date: order.created_at
      })) || [];
      
      setCouponUsage({
        ...couponUsage,
        [couponId]: usageData
      });
      
      setSelectedCouponId(couponId);
    } catch (error) {
      console.error('Erro ao buscar uso do cupom:', error);
      toast.error('Erro ao carregar uso do cupom');
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      
      setCoupons(coupons.map(c => 
        c.id === coupon.id ? { ...c, is_active: !coupon.is_active } : c
      ));
      
      toast.success(`Cupom ${coupon.is_active ? 'desativado' : 'ativado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao atualizar status do cupom:', error);
      toast.error('Erro ao atualizar status do cupom');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
    
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      
      setCoupons(coupons.filter(c => c.id !== couponId));
      toast.success('Cupom excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      toast.error('Erro ao excluir cupom');
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    // Filtrar por termo de busca
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por status
    const matchesStatus = showInactive || coupon.is_active;
    
    // Filtrar por tab
    const isExpired = new Date(coupon.end_date) < new Date();
    const matchesTab = 
      tab === 'all' || 
      (tab === 'active' && coupon.is_active && !isExpired) ||
      (tab === 'expired' && isExpired) ||
      (tab === 'inactive' && !coupon.is_active);
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getCouponStatusBadge = (coupon: Coupon) => {
    if (!coupon.is_active) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">Inativo</Badge>;
    }
    
    if (isExpired(coupon.end_date)) {
      return <Badge variant="outline" className="bg-red-100 text-red-600">Expirado</Badge>;
    }
    
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-600">Esgotado</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-100 text-green-600">Ativo</Badge>;
  };

  return (
    <>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Cupons de Desconto</h1>
          <Button onClick={handleCreateCoupon} className="bg-pink-600 hover:bg-pink-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Como funcionam os cupons</AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Visibilidade:</strong> Os cupons são exibidos na página de checkout para os clientes aplicarem aos novos pedidos.</li>
              <li><strong>Restrições de serviço:</strong> Se configurado, o cupom só funcionará para os serviços especificados.</li>
              <li><strong>Utilização:</strong> O cliente insere o código do cupom na página de checkout para aplicar o desconto antes de finalizar a compra.</li>
              <li><strong>Validação:</strong> O sistema verifica automaticamente se o cupom é válido, considerando data de validade, limite de uso e restrições.</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código ou descrição"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={() => setShowInactive(!showInactive)}
                  className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50 mr-2"
                />
                <span>Mostrar inativos</span>
              </label>
              <Button 
                variant="outline" 
                size="icon" 
                className="ml-2"
                onClick={fetchCoupons}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="expired">Expirados</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredCoupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desconto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validade
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uso
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{coupon.code}</div>
                        <div className="text-sm text-gray-500">{coupon.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {coupon.discount_type === 'percentage' ? (
                          <div>{coupon.discount_value}%</div>
                        ) : (
                          <div>{formatCurrency(coupon.discount_value)}</div>
                        )}
                        {coupon.max_discount_amount && (
                          <div className="text-xs text-gray-500">
                            Máx: {formatCurrency(coupon.max_discount_amount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>De: {formatDate(coupon.start_date)}</div>
                        <div>Até: {formatDate(coupon.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{coupon.usage_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''}</div>
                        {coupon.service_restrictions?.length ? (
                          <div className="text-xs text-gray-500">
                            {coupon.service_restrictions.length} serviço(s)
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCouponStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(coupon)}
                          >
                            {coupon.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchCouponUsage(coupon.id)}
                            title="Ver utilizações"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhum cupom encontrado
            </div>
          )}
        </div>
      </div>

      {selectedCouponId && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Utilizações do Cupom</h2>
            <Button variant="outline" size="sm" onClick={() => setSelectedCouponId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {loadingUsage ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : couponUsage[selectedCouponId]?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email do Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Utilização
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {couponUsage[selectedCouponId].map((usage, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usage.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(usage.date)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Este cupom ainda não foi utilizado por nenhum cliente
            </div>
          )}
        </div>
      )}

      {showModal && (
        <CouponFormModal
          coupon={editingCoupon}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchCoupons();
          }}
        />
      )}
    </>
  );
}
