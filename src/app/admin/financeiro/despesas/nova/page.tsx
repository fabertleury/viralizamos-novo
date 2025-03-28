'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const supabase = createClient();

export default function NovaDespesaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Carregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (categoriesError) {
        console.error('Erro ao carregar categorias:', categoriesError);
        toast({
          title: 'Erro ao carregar categorias',
          description: categoriesError.message,
          variant: 'destructive',
        });
      } else {
        setCategories(categoriesData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: 'Erro ao carregar categorias',
        description: 'Ocorreu um erro ao carregar as categorias. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory || !amount || !expenseDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const expenseData = {
        category: selectedCategory,
        description: description,
        amount: parseFloat(amount),
        expense_date: expenseDate,
        created_by: user.id,
      };
      
      // Criar nova despesa
      const { error } = await supabase
        .from('expenses')
        .insert(expenseData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Despesa adicionada com sucesso',
        description: 'A despesa foi adicionada com sucesso.',
      });
      
      // Redirecionar para a página de despesas
      router.push('/admin/financeiro/despesas');
    } catch (error: any) {
      console.error('Erro ao salvar despesa:', error);
      toast({
        title: 'Erro ao salvar despesa',
        description: error.message || 'Ocorreu um erro ao salvar a despesa.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Nova Despesa</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Adicionar Nova Despesa</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para adicionar uma nova despesa ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="category">
                Categoria*
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição detalhada da despesa"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">
                Valor*
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 100.00"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="expenseDate">
                Data*
              </Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/admin/financeiro/despesas')}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Despesa'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
