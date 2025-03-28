'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Declaração de tipo para o módulo canvas-confetti
declare module 'canvas-confetti';

interface PaymentSuccessAnimationProps {
  onComplete?: () => void;
  autoRedirect?: boolean;
}

export function PaymentSuccessAnimation({ 
  onComplete, 
  autoRedirect = true 
}: PaymentSuccessAnimationProps) {
  useEffect(() => {
    // Disparar confetti quando o componente montar
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Usando NodeJS.Timeout como tipo específico para intervalo
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Disparar confetti de ambos os lados
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
      <div className="w-24 h-24 mb-6 text-green-500">
        <CheckCircle className="w-full h-full" />
      </div>
      <h3 className="text-2xl font-bold text-green-600 mb-4">Pagamento Aprovado!</h3>
      <p className="text-gray-600 mb-6 text-center">
        Seu pedido foi recebido e está sendo processado.
      </p>
      {autoRedirect && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
          <p className="text-sm text-gray-500">Redirecionando para a página de agradecimento...</p>
        </div>
      )}
    </div>
  );
}
