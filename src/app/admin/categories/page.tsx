'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { Database } from '@/lib/database.types';
import { SocialIcon } from '@/components/ui/social-icon';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  active: boolean;
  order_position: number;
  social_id: string;
  social?: {
    id: string;
    name: string;
  };
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  active: boolean;
  order_position: number;
  category_id: string;
}

interface Social {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const supabase = createClientComponentClient<Database>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar redes sociais
      const { data: socialsData, error: socialsError } = await supabase
        .from('socials')
        .select('id, name')
        .eq('active', true);

      if (socialsError) throw socialsError;

      if (socialsData) {
        setSocials(socialsData);
      }

      // Buscar categorias com subcategorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          social:socials(id, name),
          subcategories(*)
        `)
        .order('order_position');

      if (categoriesError) throw categoriesError;

      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (file: File, type: 'category' | 'subcategory') => {
    try {
      setUploadingIcon(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}${Date.now()}.${fileExt}`;
      const filePath = `/icons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      if (type === 'category' && editingCategory) {
        setEditingCategory({ ...editingCategory, icon: publicUrl });
      } else if (type === 'subcategory' && editingSubcategory) {
        setEditingSubcategory({ ...editingSubcategory, icon: publicUrl });
      }

      toast.success('Ícone enviado com sucesso');
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast.error('Erro ao enviar ícone');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const { name, description, icon, slug, active, order_position, social_id } = editingCategory;
      
      if (editingCategory.id) {
        // Atualizar categoria existente
        const { error } = await supabase
          .from('categories')
          .update({
            name,
            description,
            icon,
            slug,
            active,
            order_position,
            social_id
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Categoria atualizada com sucesso');
      } else {
        // Criar nova categoria
        const { error } = await supabase
          .from('categories')
          .insert({
            name,
            description,
            icon,
            slug,
            active,
            order_position,
            social_id
          });

        if (error) throw error;
        toast.success('Categoria criada com sucesso');
      }

      setEditingCategory(null);
      setShowNewCategoryForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory || !selectedCategoryId) return;

    try {
      const { name, description, icon, slug, active, order_position } = editingSubcategory;
      
      if (editingSubcategory.id) {
        // Atualizar subcategoria existente
        const { error } = await supabase
          .from('subcategories')
          .update({
            name,
            description,
            icon,
            slug,
            active,
            order_position
          })
          .eq('id', editingSubcategory.id);

        if (error) throw error;
        toast.success('Subcategoria atualizada com sucesso');
      } else {
        // Criar nova subcategoria
        const { error } = await supabase
          .from('subcategories')
          .insert({
            name,
            description,
            icon,
            slug,
            active,
            order_position,
            category_id: selectedCategoryId
          });

        if (error) throw error;
        toast.success('Subcategoria criada com sucesso');
      }

      setEditingSubcategory(null);
      setShowNewSubcategoryForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error('Erro ao salvar subcategoria');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Primeiro, excluir todas as subcategorias
      const { error: subcategoriesError } = await supabase
        .from('subcategories')
        .delete()
        .eq('category_id', categoryId);

      if (subcategoriesError) throw subcategoriesError;

      // Depois, excluir a categoria
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (categoryError) throw categoryError;

      toast.success('Categoria excluída com sucesso');
      setDeletingCategory(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);

      if (error) throw error;

      toast.success('Subcategoria excluída com sucesso');
      setDeletingSubcategory(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Erro ao excluir subcategoria');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
        <Button onClick={() => {
          setEditingCategory({
            id: '',
            name: '',
            description: '',
            icon: '',
            slug: '',
            active: true,
            order_position: categories.length,
            social_id: ''
          });
          setShowNewCategoryForm(true);
        }}>
          Nova Categoria
        </Button>
      </div>

      {/* Lista de Categorias */}
      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                    <SocialIcon name={category.icon} className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <p className="text-sm text-gray-500">Rede: {category.social?.name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setEditingCategory(category)}>
                    Editar
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedCategoryId(category.id);
                    setEditingSubcategory({
                      id: '',
                      name: '',
                      description: '',
                      icon: '',
                      slug: '',
                      active: true,
                      order_position: category.subcategories?.length || 0,
                      category_id: category.id
                    });
                    setShowNewSubcategoryForm(true);
                  }}>
                    Nova Subcategoria
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => setDeletingCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Lista de Subcategorias */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Subcategorias</h4>
                  <div className="space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                            <SocialIcon name={subcategory.icon} className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">{subcategory.name}</p>
                            <p className="text-sm text-gray-600">{subcategory.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" onClick={() => {
                            setSelectedCategoryId(category.id);
                            setEditingSubcategory(subcategory);
                          }}>
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeletingSubcategory(subcategory.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Edição de Categoria */}
      {(editingCategory || showNewCategoryForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 bg-white">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory?.id ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={editingCategory?.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory!, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingCategory?.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory!, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="icon">Ícone</Label>
                <div className="flex items-center space-x-2">
                  {editingCategory?.icon && (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                      <SocialIcon name={editingCategory.icon} className="w-6 h-6" />
                    </div>
                  )}
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="w-5 h-5 mr-2" />
                    Selecionar Ícone
                    <select
                      className="hidden"
                      value={editingCategory?.icon || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory!, icon: e.target.value })}
                    >
                      <option value="">Selecione um ícone</option>
                      <option value="folder">Pasta</option>
                      <option value="image">Imagem</option>
                      <option value="video">Vídeo</option>
                      <option value="music">Música</option>
                      <option value="heart">Coração</option>
                      <option value="star">Estrela</option>
                      <option value="users">Usuários</option>
                      <option value="comment">Comentário</option>
                      <option value="thumbs-up">Like</option>
                      <option value="views">Visualizações</option>
                      <option value="plays">Reproduções</option>
                      <option value="shares">Compartilhamentos</option>
                    </select>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={editingCategory?.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory!, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="social">Rede Social</Label>
                <select
                  id="social"
                  className="w-full p-2 border rounded"
                  value={editingCategory?.social_id}
                  onChange={(e) => setEditingCategory({ ...editingCategory!, social_id: e.target.value })}
                >
                  <option value="">Selecione uma rede social</option>
                  {socials.map((social) => (
                    <option key={social.id} value={social.id}>
                      {social.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  type="number"
                  value={editingCategory?.order_position}
                  onChange={(e) => setEditingCategory({ ...editingCategory!, order_position: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingCategory?.active}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory!, active: checked })}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setEditingCategory(null);
                  setShowNewCategoryForm(false);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal de Edição de Subcategoria */}
      {(editingSubcategory || showNewSubcategoryForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 bg-white">
            <h2 className="text-xl font-bold mb-4">
              {editingSubcategory?.id ? 'Editar Subcategoria' : 'Nova Subcategoria'}
            </h2>
            <form onSubmit={handleSaveSubcategory} className="space-y-4">
              <div>
                <Label htmlFor="subName">Nome</Label>
                <Input
                  id="subName"
                  value={editingSubcategory?.name}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory!, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subDescription">Descrição</Label>
                <Input
                  id="subDescription"
                  value={editingSubcategory?.description}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory!, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subIcon">Ícone</Label>
                <div className="flex items-center space-x-2">
                  {editingSubcategory?.icon && (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                      <SocialIcon name={editingSubcategory.icon} className="w-6 h-6" />
                    </div>
                  )}
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="w-5 h-5 mr-2" />
                    Selecionar Ícone
                    <select
                      className="hidden"
                      value={editingSubcategory?.icon || ''}
                      onChange={(e) => setEditingSubcategory({ ...editingSubcategory!, icon: e.target.value })}
                    >
                      <option value="">Selecione um ícone</option>
                      <option value="folder">Pasta</option>
                      <option value="image">Imagem</option>
                      <option value="video">Vídeo</option>
                      <option value="music">Música</option>
                      <option value="heart">Coração</option>
                      <option value="star">Estrela</option>
                      <option value="users">Usuários</option>
                      <option value="comment">Comentário</option>
                      <option value="thumbs-up">Like</option>
                      <option value="views">Visualizações</option>
                      <option value="plays">Reproduções</option>
                      <option value="shares">Compartilhamentos</option>
                    </select>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="subSlug">Slug</Label>
                <Input
                  id="subSlug"
                  value={editingSubcategory?.slug}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory!, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subOrder">Ordem</Label>
                <Input
                  id="subOrder"
                  type="number"
                  value={editingSubcategory?.order_position}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory!, order_position: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="subActive"
                  checked={editingSubcategory?.active}
                  onCheckedChange={(checked) => setEditingSubcategory({ ...editingSubcategory!, active: checked })}
                />
                <Label htmlFor="subActive">Ativo</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setEditingSubcategory(null);
                  setShowNewSubcategoryForm(false);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Categoria */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta categoria? Esta ação também excluirá todas as subcategorias associadas e não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingCategory(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteCategory(deletingCategory)}
              >
                Excluir
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Subcategoria */}
      {deletingSubcategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta subcategoria? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingSubcategory(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteSubcategory(deletingSubcategory)}
              >
                Excluir
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
