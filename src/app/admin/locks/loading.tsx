import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex items-center mb-4">
        <LockClosedIcon className="h-8 w-8 text-indigo-500 mr-3 animate-pulse" />
        <h2 className="text-2xl font-semibold text-gray-800">Carregando Locks</h2>
      </div>
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-600">Coletando informações sobre locks de transação...</p>
    </div>
  );
} 