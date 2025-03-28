'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
}

export function CountdownTimer({ initialSeconds, onComplete }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  // Reiniciar o timer quando initialSeconds mudar
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <span className="font-mono font-bold text-pink-600">
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </span>
  );
}
