'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ServiceVariation {
  id?: string;
  service_id?: string;
  quantidade: number;
  preco: number;
  status: boolean;
}

interface ServiceVariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  variation?: ServiceVariation | null;
  onSuccess: () => void;
}

export function ServiceVariationModal({ 
  isOpen, 
  onClose, 
  service, 
  variation, 
  onSuccess 
}: ServiceVariationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceVariation>({
    quantidade: 0,
    preco: 0,
    status: true
  });

  const supabase = createClient();

  useEffect(() => {
    if (variation) {
      setFormData({
        quantidade: variation.quantidade,
        preco: variation.preco,
        status: variation.status !== false
      });
    }
  }, [variation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantidade' || name === 'preco' 
        ? parseFloat(value) 
        : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!service || !service.id) {
        throw new Error('Serviço não encontrado');
      }

      const data = {
        service_id: service.id,
        quantidade: formData.quantidade,
        preco: formData.preco,
        status: formData.status
      };

      if (variation?.id) {
        // Atualizar variação existente
        const { error } = await supabase
          .from('service_variations')
          .update(data)
          .eq('id', variation.id);

        if (error) throw error;
        toast.success('Variação atualizada com sucesso!');
      } else {
        // Criar nova variação
        const { error } = await supabase
          .from('service_variations')
          .insert(data);

        if (error) throw error;
        toast.success('Variação criada com sucesso!');
      }

      onSuccess();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar variação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {variation ? 'Editar Variação de Serviço' : 'Nova Variação de Serviço'}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Serviço: {service?.name || 'Carregando...'}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Quantidade</Label>
            <Input 
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleInputChange}
              placeholder="Número de curtidas, seguidores, etc."
              min="1"
              required
            />
          </div>

          <div>
            <Label>Preço (R$)</Label>
            <Input 
              type="number"
              name="preco"
              value={formData.preco}
              onChange={handleInputChange}
              placeholder="Valor da variação"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label>Status</Label>
            <Switch 
              checked={formData.status}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                status: checked 
              }))}
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
