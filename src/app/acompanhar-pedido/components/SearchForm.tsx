import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SearchFormProps {
  handleSearch: (email: string) => void;
  isSearching: boolean;
  userProfile: any;
}

export function SearchForm({ handleSearch, isSearching, userProfile }: SearchFormProps) {
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(email);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      {userProfile && (
        <p className="text-sm text-gray-600">
          Olá, {userProfile.name || userProfile.email}
        </p>
      )}
      <div className="flex items-center text-sm text-gray-600 mt-1">
        <RefreshCw className="h-4 w-4 mr-1 animate-spin [animation-duration:4000ms]" />
        <span className="inline-flex items-center">Atualização a cada 4 min</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button 
          onClick={onSubmit}
          disabled={isSearching || !email}
          className="whitespace-nowrap"
        >
          {isSearching ? 'Buscando...' : 'Buscar Pedidos'}
        </Button>
      </div>
    </div>
  );
}
