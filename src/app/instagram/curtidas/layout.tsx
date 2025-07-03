import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comprar Curtidas no Instagram Brasileiras - A partir de 0.99 centavos',
  description: 'Dê mais visibilidade aos seus posts! Compre curtidas brasileiras no Instagram a partir de R$0,99 com entrega imediata e qualidade garantida.',
};

export default function CurtidasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 