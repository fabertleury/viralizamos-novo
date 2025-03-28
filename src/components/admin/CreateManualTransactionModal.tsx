'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionCreated: () => void;
}

export function CreateManualTransactionModal({ 
  isOpen, 
  onClose, 
  onTransactionCreated 
}: CreateManualTransactionModalProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    username: '',
    link: '',
    quantity: 100,
    notes: ''
  });
  
  const supabase = createClient();
  
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching services:', error);
        return;
      }
      
      setServices(data || []);
    };
    
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen, supabase]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceId) {
      toast.error('Selecione um serviço');
      return;
    }
    
    if (!formData.username && !formData.link) {
      toast.error('Informe um nome de usuário ou link');
      return;
    }
    
    setLoading(true);
    
    try {
      // Encontrar o serviço selecionado para obter detalhes
      const selectedService = services.find(service => service.id === formData.serviceId);
      
      // Preparar os metadados da transação
      const metadata: any = {
        service: {
          id: selectedService.id,
          name: selectedService.name,
          quantity: formData.quantity,
          provider_id: selectedService.provider_id,
          type: selectedService.type
        },
        manual_transaction: true,
        notes: formData.notes,
        checkout_type: selectedService.type || 'generic'
      };
      
      // Adicionar dados específicos conforme o tipo de entrada
      if (formData.link) {
        metadata.target_link = formData.link;
        metadata.link = formData.link;
      }
      
      if (formData.username) {
        metadata.username = formData.username;
        metadata.profile = {
          username: formData.username
        };
      }
      
      // Calcular o preço (em centavos)
      const amount = selectedService.price * formData.quantity;
      
      // Criar a transação
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          status: 'approved', // Já aprovada por ser manual
          amount,
          service_id: formData.serviceId,
          payment_method: 'manual',
          metadata
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Erro ao criar transação: ${error.message}`);
      }
      
      // Notificar sucesso
      toast.success('Transação criada com sucesso');
      
      // Resetar o formulário
      setFormData({
        serviceId: '',
        username: '',
        link: '',
        quantity: 100,
        notes: ''
      });
      
      // Notificar o componente pai
      onTransactionCreated();
      
      // Fechar o modal
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao criar transação', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      as="div" 
      className="relative z-50" 
      onClose={onClose}
      open={isOpen}
    >
      <div className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 mb-4"
            >
              Criar Transação Manual
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceId">Serviço</Label>
                <Select 
                  value={formData.serviceId} 
                  onValueChange={(value) => handleSelectChange('serviceId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário Instagram</Label>
                <Input 
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="@usuário"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link (post, reel ou perfil)</Label>
                <Input 
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://www.instagram.com/p/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input 
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Transação'
                  )}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
} 