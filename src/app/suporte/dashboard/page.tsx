'use client';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard do Suporte</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card de Tickets */}
        <div 
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => router.push('/suporte/tickets')}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Gerenciar Tickets
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Visualize e gerencie os tickets de suporte
            </p>
          </div>
        </div>

        {/* Card de Pedidos */}
        <div 
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => router.push('/suporte/pedidos')}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Gerenciar Pedidos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Visualize e gerencie os pedidos dos clientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
