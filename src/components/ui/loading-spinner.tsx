'use client';

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  textClassName?: string;
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  textClassName,
}: LoadingSpinnerProps) {
  // Mapear tamanhos para classes
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 
        className={cn(
          "animate-spin text-primary", 
          sizeMap[size]
        )} 
      />
      {text && (
        <p className={cn("mt-3 text-muted-foreground text-center", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
} 