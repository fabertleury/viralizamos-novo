import { Header } from '@/components/layout/header';

interface AdminLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function AdminLayout({ 
  children, 
  showHeader = false 
}: AdminLayoutProps) {
  return (
    <>
      {showHeader && <Header />}
      <main className="container mx-auto py-8">
        {children}
      </main>
    </>
  );
}
