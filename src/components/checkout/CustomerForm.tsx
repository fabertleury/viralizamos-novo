'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormData } from '@/app/checkout/instagram/types';

interface CustomerFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  className?: string;
}

export function CustomerForm({ formData, onChange, className = '' }: CustomerFormProps) {
  const [localForm, setLocalForm] = useState<FormData>(formData);

  // Atualiza o estado local quando as props mudam
  useEffect(() => {
    setLocalForm(formData);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...localForm, [name]: value };
    setLocalForm(updatedForm);
    onChange(updatedForm);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          name="name"
          value={localForm.name}
          onChange={handleChange}
          placeholder="Seu nome completo"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={localForm.email}
          onChange={handleChange}
          placeholder="Seu e-mail"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Telefone (WhatsApp)</Label>
        <Input
          id="phone"
          name="phone"
          value={localForm.phone}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
          required
        />
      </div>
    </div>
  );
}
