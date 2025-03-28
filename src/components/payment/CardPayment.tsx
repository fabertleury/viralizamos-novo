import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CardPaymentProps {
  onSubmit: (formData: any) => Promise<void>;
  amount: number;
}

export function CardPayment({ onSubmit, amount }: CardPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expirationDate: '',
    cvv: '',
    installments: '1'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formatação do número do cartão
    if (name === 'cardNumber') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    // Formatação da data de expiração
    if (name === 'expirationDate') {
      const formatted = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substr(0, 5);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calcula o valor das parcelas
  const getInstallmentValue = (installments: string) => {
    const value = amount / Number(installments);
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <h2 className="text-xl font-bold text-center">Pagamento com Cartão</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Número do Cartão</label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            maxLength={19}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nome no Cartão</label>
          <input
            type="text"
            name="cardHolder"
            value={formData.cardHolder}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Nome como está no cartão"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Validade</label>
            <input
              type="text"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              maxLength={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="MM/AA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CVV</label>
            <input
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              maxLength={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="123"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Parcelas</label>
          <select
            name="installments"
            value={formData.installments}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(number => (
              <option key={number} value={number}>
                {number}x de {getInstallmentValue(String(number))}
                {number === 1 ? ' à vista' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {isLoading ? 'Processando...' : 'Finalizar Pagamento'}
      </button>
    </form>
  );
}
