'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const supabase = createClient();

export default function CustosServicosPage() {
  const [loading, setLoading] = useState(true);
  const [serviceCosts, setServiceCosts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  
  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [costPer1000, setCostPer1000] = useState<string>('');
  const [fixedCost, setFixedCost] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  // Efeito para preencher automaticamente o custo com o preço base do serviço
  useEffect(() => {
    if (selectedServiceId) {
      const selectedService = services.find(service => service.id === selectedServiceId);
      if (selectedService) {
        // Usar o preço base do serviço como custo inicial
        setCostPer1000(selectedService.preco?.toString() || '');
      }
    }
  }, [selectedServiceId, services]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar serviços
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (servicesError) {
        console.error('Erro ao carregar serviços:', servicesError);
        toast({
          title: 'Erro ao carregar serviços',
          description: servicesError.message,
          variant: 'destructive',
        });
      } else {
        setServices(servicesData || []);
      }
      
      // Carregar custos de serviços
      const { data: costsData, error: costsError } = await supabase
        .from('service_costs')
        .select(`
          id,
          service_id,
          cost_per_1000,
          fixed_cost,
          currency,
          start_date,
          end_date,
          notes,
          created_at,
          updated_at,
          services:service_id (
            id,
            name,
            type
          )
        `)
        .is('end_date', null)
        .order('created_at', { ascending: false });
      
      if (costsError) {
        console.error('Erro ao carregar custos de serviços:', costsError);
        toast({
          title: 'Erro ao carregar custos de serviços',
          description: costsError.message,
          variant: 'destructive',
        });
      } else {
        setServiceCosts(costsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedServiceId || !costPer1000) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Se estiver editando, desativar o custo atual
      if (editingCost) {
        const { error: updateError } = await supabase
          .from('service_costs')
          .update({ end_date: new Date().toISOString() })
          .eq('id', editingCost.id);
        
        if (updateError) {
          throw updateError;
        }
      }
      
      // Verificar se já existe um custo ativo para este serviço
      const { data: existingCosts, error: checkError } = await supabase
        .from('service_costs')
        .select('id')
        .eq('service_id', selectedServiceId)
        .is('end_date', null);
      
      if (checkError) {
        throw checkError;
      }
      
      // Se existir, desativar
      if (existingCosts && existingCosts.length > 0) {
        const { error: deactivateError } = await supabase
          .from('service_costs')
          .update({ end_date: new Date().toISOString() })
          .eq('service_id', selectedServiceId)
          .is('end_date', null);
        
        if (deactivateError) {
          throw deactivateError;
        }
      }
      
      // Criar novo custo
      const newCost = {
        service_id: selectedServiceId,
        cost_per_1000: parseFloat(costPer1000),
        fixed_cost: fixedCost ? parseFloat(fixedCost) : 0,
        notes: notes,
        start_date: new Date().toISOString(),
      };
      
      const { error: insertError } = await supabase
        .from('service_costs')
        .insert(newCost);
      
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: 'Custo salvo com sucesso',
        description: 'O custo do serviço foi salvo com sucesso.',
      });
      
      // Resetar form
      setSelectedServiceId('');
      setCostPer1000('');
      setFixedCost('0');
      setNotes('');
      setEditingCost(null);
      setIsDialogOpen(false);
      
      // Recarregar dados
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar custo:', error);
      toast({
        title: 'Erro ao salvar custo',
        description: error.message || 'Ocorreu um erro ao salvar o custo do serviço.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cost: any) => {
    setEditingCost(cost);
    setSelectedServiceId(cost.service_id);
    setCostPer1000(cost.cost_per_1000.toString());
    setFixedCost(cost.fixed_cost?.toString() || '0');
    setNotes(cost.notes || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (costId: string) => {
    if (!confirm('Tem certeza que deseja excluir este custo?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('service_costs')
        .update({ end_date: new Date().toISOString() })
        .eq('id', costId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Custo desativado com sucesso',
        description: 'O custo do serviço foi desativado com sucesso.',
      });
      
      // Recarregar dados
      loadData();
    } catch (error: any) {
      console.error('Erro ao desativar custo:', error);
      toast({
        title: 'Erro ao desativar custo',
        description: error.message || 'Ocorreu um erro ao desativar o custo do serviço.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const resetForm = () => {
    setSelectedServiceId('');
    setCostPer1000('');
    setFixedCost('0');
    setNotes('');
    setEditingCost(null);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Custos de Serviços</h1>
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          Adicionar Custo
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Custos Atuais</CardTitle>
          <CardDescription>
            Custos por 1000 unidades para cada serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando custos de serviços...</p>
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de custos de serviços ativos</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Custo por 1000</TableHead>
                  <TableHead className="text-right">Custo Fixo</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceCosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhum custo de serviço cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  serviceCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.services?.name}</TableCell>
                      <TableCell>{cost.services?.type}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cost.cost_per_1000)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cost.fixed_cost || 0)}</TableCell>
                      <TableCell>{cost.notes}</TableCell>
                      <TableCell>{format(new Date(cost.start_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(cost)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(cost.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>{editingCost ? 'Editar Custo' : 'Adicionar Custo'}</DialogTitle>
            <DialogDescription>
              {editingCost 
                ? 'Edite os detalhes do custo do serviço. Isso criará um novo registro e desativará o anterior.'
                : 'Adicione um novo custo para um serviço. Se já existir um custo ativo para este serviço, ele será desativado.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service" className="text-right">
                Serviço*
              </Label>
              <Select
                value={selectedServiceId}
                onValueChange={setSelectedServiceId}
                disabled={loading || !!editingCost}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costPer1000" className="text-right">
                Custo por 1000*
              </Label>
              <Input
                id="costPer1000"
                type="number"
                step="0.0001"
                min="0"
                value={costPer1000}
                onChange={(e) => setCostPer1000(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 2.88"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fixedCost" className="text-right">
                Custo Fixo
              </Label>
              <Input
                id="fixedCost"
                type="number"
                step="0.01"
                min="0"
                value={fixedCost}
                onChange={(e) => setFixedCost(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Observações sobre este custo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
