import { useState, useEffect } from 'react';
import { FaInstagram, FaSearch } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

interface ProfileInputProps {
  onAnalyze: (username: string) => void;
  isLoading: boolean;
  initialUsername?: string;
}

export function ProfileInput({ onAnalyze, isLoading, initialUsername = '' }: ProfileInputProps) {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState('');

  const attractiveTexts = [
    "Descubra como melhorar seu perfil no Instagram!",
    "Auditoria grátis para seu perfil: veja o que você precisa para bombar nas redes!",
    "Análise completa do seu Instagram em segundos!",
    "Quer saber o verdadeiro potencial do seu perfil?",
    "Transforme seus seguidores em fãs com nossa análise!"
  ];

  // Usar um texto fixo para evitar problemas de hidratação
  const [currentText] = useState(
    "Auditoria grátis para seu perfil: veja o que você precisa para bombar nas redes!"
  );

  useEffect(() => {
    if (initialUsername && !isLoading) {
      onAnalyze(initialUsername.replace('@', '').trim());
    }
  }, [initialUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remover @ do início do username, se existir
    const cleanUsername = username.replace(/^@/, '').trim();
    
    if (!cleanUsername) {
      setError('Por favor, insira um nome de usuário válido');
      return;
    }

    // Limpar erro
    setError('');
    
    // Chamar função de análise
    onAnalyze(cleanUsername);
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-2xl p-8 mb-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-4">
            <FaInstagram className="text-4xl text-white mr-3" />
            <h2 className="text-3xl font-bold text-white">
              Análise de Perfil do Instagram
            </h2>
          </div>
          <p className="text-xl text-white/80 animate-pulse">
            {currentText}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaInstagram className="text-gray-400" />
            </div>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o @username do Instagram"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando...
              </>
            ) : (
              <>
                <FaSearch className="mr-2" /> Analisar Agora
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
