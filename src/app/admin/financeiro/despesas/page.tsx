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
import { cn } from '@/lib/utils';
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
import Swal from 'sweetalert2';

const supabase = createClient();

export default function DespesasPage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  // Modal de categorias
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      
      // Carregar despesas
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          category,
          description,
          amount,
          expense_date,
          created_by,
          created_at,
          updated_at,
          users:created_by (
            id,
            name,
            email
          )
        `)
        .order('expense_date', { ascending: false });
      
      if (expensesError) {
        console.error('Erro ao carregar despesas:', expensesError);
        toast({
          title: 'Erro ao carregar despesas',
          description: expensesError.message,
          variant: 'destructive',
        });
      } else {
        setExpenses(expensesData || []);
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
        expense_date: format(expenseDate, 'yyyy-MM-dd'),
        created_by: user.id,
      };
      
      if (editingExpense) {
        // Atualizar despesa existente
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Despesa atualizada com sucesso',
          description: 'A despesa foi atualizada com sucesso.',
        });
      } else {
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
      }
      
      // Resetar form
      setSelectedCategory('');
      setDescription('');
      setAmount('');
      setExpenseDate(new Date());
      setEditingExpense(null);
      setIsDialogOpen(false);
      
      // Recarregar dados
      loadData();
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

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setSelectedCategory(expense.category);
    setDescription(expense.description || '');
    setAmount(expense.amount.toString());
    setExpenseDate(new Date(expense.expense_date));
    setIsDialogOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Despesa excluída com sucesso',
        description: 'A despesa foi excluída com sucesso.',
      });
      
      // Recarregar dados
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir despesa:', error);
      toast({
        title: 'Erro ao excluir despesa',
        description: error.message || 'Ocorreu um erro ao excluir a despesa.',
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
    setSelectedCategory('');
    setDescription('');
    setAmount('');
    setExpenseDate(new Date());
    setEditingExpense(null);
  };

  // Funções para gerenciar categorias
  const handleAddCategory = async () => {
    if (!categoryName) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('expense_categories')
        .insert({
          name: categoryName,
          description: categoryDescription,
        });

      if (error) throw error;

      toast.success('Categoria adicionada com sucesso');
      
      // Recarregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Limpar formulário
      setCategoryName('');
      setCategoryDescription('');
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
  };

  const handleUpdateCategory = async () => {
    if (!categoryName || !editingCategory) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('expense_categories')
        .update({
          name: categoryName,
          description: categoryDescription,
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      toast.success('Categoria atualizada com sucesso');
      
      // Recarregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Limpar formulário
      setCategoryName('');
      setCategoryDescription('');
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Esta ação irá desativar a categoria!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desativar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('expense_categories')
          .update({ is_active: false })
          .eq('id', categoryId);

        if (error) throw error;

        toast.success('Categoria desativada com sucesso');
        
        // Recarregar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('expense_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Erro ao desativar categoria:', error);
        toast.error('Erro ao desativar categoria');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Despesas</h1>
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          Nova Despesa
        </Button>
        <Button onClick={() => {
          setIsCategoryDialogOpen(true);
        }}>
          Gerenciar Categorias
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Despesas</CardTitle>
          <CardDescription>
            Todas as despesas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando despesas...</p>
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de despesas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhuma despesa cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(new Date(expense.expense_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{expense.users?.name || 'Sistema'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(expense)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(expense.id)}>
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
            <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
            <DialogDescription>
              {editingExpense 
                ? 'Edite os detalhes da despesa.'
                : 'Adicione uma nova despesa ao sistema.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria*
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={loading}
              >
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Descrição da despesa"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor*
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 100.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expenseDate" className="text-right">
                Data*
              </Label>
              <Input
                id="expenseDate"
                type="date"
                value={format(expenseDate, 'yyyy-MM-dd')}
                onChange={(e) => setExpenseDate(new Date(e.target.value))}
                className="col-span-3"
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
      
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogDescription>
              Adicione, edite ou exclua categorias de despesas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Nome da Categoria*
              </Label>
              <Input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Alimentação"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryDescription" className="text-right">
                Descrição da Categoria
              </Label>
              <Textarea
                id="categoryDescription"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="col-span-3"
                placeholder="Descrição da categoria"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Categorias existentes:</Label>
              <div className="col-span-3">
                <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-center text-gray-500 py-2">Nenhuma categoria cadastrada</p>
                  ) : (
                    <ul className="space-y-2">
                      {categories.map((category) => (
                        <li key={category.id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-medium">{category.name}</span>
                            {category.description && (
                              <p className="text-sm text-gray-500">{category.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon" onClick={() => handleEditCategory(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={editingCategory ? handleUpdateCategory : handleAddCategory} disabled={loading}>
              {loading ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
