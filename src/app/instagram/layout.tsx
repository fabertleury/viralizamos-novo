import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram | Viralizamos',
};

export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 