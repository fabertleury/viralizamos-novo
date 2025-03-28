'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const supabase = createClient();

export default function NovoCustoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  
  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [costPer1000, setCostPer1000] = useState<string>('');
  const [fixedCost, setFixedCost] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
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
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast({
        title: 'Erro ao carregar serviços',
        description: 'Ocorreu um erro ao carregar os serviços. Tente novamente mais tarde.',
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
      
      // Redirecionar para a página de custos
      router.push('/admin/financeiro/custos');
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Novo Custo de Serviço</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Adicionar Novo Custo</CardTitle>
          <CardDescription>
            Defina o custo por 1000 unidades para um serviço. Se já existir um custo ativo para este serviço, ele será desativado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="service">
                Serviço*
              </Label>
              <Select
                value={selectedServiceId}
                onValueChange={setSelectedServiceId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="costPer1000">
                Custo por 1000 unidades*
              </Label>
              <Input
                id="costPer1000"
                type="number"
                step="0.0001"
                min="0"
                value={costPer1000}
                onChange={(e) => setCostPer1000(e.target.value)}
                placeholder="Ex: 2.88"
              />
              <p className="text-sm text-muted-foreground">
                Este é o valor que você paga ao provedor por 1000 unidades deste serviço.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fixedCost">
                Custo Fixo Adicional
              </Label>
              <Input
                id="fixedCost"
                type="number"
                step="0.01"
                min="0"
                value={fixedCost}
                onChange={(e) => setFixedCost(e.target.value)}
                placeholder="Ex: 0.00"
              />
              <p className="text-sm text-muted-foreground">
                Custo fixo adicional por pedido, se houver.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre este custo"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/admin/financeiro/custos')}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Custo'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
