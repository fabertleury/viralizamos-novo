import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function LocksPage() {
  const supabase = createClient();
  
  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login-admin');
  }
  
  // Verificar se é administrador
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    redirect('/admin');
  }
  
  // Buscar locks atuais
  const { data: locks, error } = await supabase
    .from('order_locks')
    .select('*')
    .order('locked_at', { ascending: false });
    
  // Separar locks ativos e expirados
  const now = new Date();
  const activeLocks = locks?.filter(lock => new Date(lock.expires_at) > now) || [];
  const expiredLocks = locks?.filter(lock => new Date(lock.expires_at) <= now) || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Locks de Transações</h1>
      
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <a 
            href="/api/admin/locks/unlock?action=clear_expired" 
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            target="_blank"
          >
            Limpar Locks Expirados
          </a>
          
          <a 
            href="/api/admin/locks/unlock?action=clear_all" 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={(e) => {
              const confirmed = window.confirm('ATENÇÃO: Esta ação vai remover TODOS os locks, incluindo os ativos. Isso pode causar processamento duplicado. Tem certeza?');
              if (!confirmed) {
                e.preventDefault();
              }
            }}
            target="_blank"
          >
            Limpar TODOS os Locks (CUIDADO!)
          </a>
        </div>
        
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h2 className="font-semibold text-amber-800 mb-2">Instruções</h2>
          <ul className="list-disc pl-5 text-amber-700">
            <li>Os locks são usados para prevenir processamento duplicado de transações</li>
            <li>Um lock expirado significa que o processamento não foi concluído corretamente</li>
            <li>Locks ativos por mais de 30 minutos podem indicar um problema</li>
            <li>Use as ações com cuidado para não causar processamento duplicado</li>
          </ul>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Locks Ativos ({activeLocks.length})</h2>
        {activeLocks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Transaction ID</th>
                  <th className="px-4 py-2 border">Locked By</th>
                  <th className="px-4 py-2 border">Locked At</th>
                  <th className="px-4 py-2 border">Expires At</th>
                  <th className="px-4 py-2 border">Duração</th>
                  <th className="px-4 py-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {activeLocks.map((lock) => {
                  const lockedAt = new Date(lock.locked_at);
                  const expiresAt = new Date(lock.expires_at);
                  const now = new Date();
                  const durationMinutes = Math.round((now.getTime() - lockedAt.getTime()) / (60 * 1000));
                  
                  // Destacar locks de longa duração (possivelmente presos)
                  const isLongRunning = durationMinutes > 15;
                  
                  return (
                    <tr key={lock.id} className={isLongRunning ? "bg-red-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-2 border font-mono text-sm">{lock.transaction_id}</td>
                      <td className="px-4 py-2 border">{lock.locked_by || 'desconhecido'}</td>
                      <td className="px-4 py-2 border">{lockedAt.toLocaleString()}</td>
                      <td className="px-4 py-2 border">{expiresAt.toLocaleString()}</td>
                      <td className={`px-4 py-2 border ${isLongRunning ? "text-red-600 font-bold" : ""}`}>
                        {durationMinutes} minutos
                      </td>
                      <td className="px-4 py-2 border">
                        <a 
                          href={`/api/admin/locks/unlock?action=force_unlock&transaction_id=${lock.transaction_id}`} 
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          onClick={(e) => {
                            const confirmed = window.confirm(`Tem certeza que deseja forçar a liberação do lock para a transação ${lock.transaction_id}?`);
                            if (!confirmed) {
                              e.preventDefault();
                            }
                          }}
                          target="_blank"
                        >
                          Forçar Liberação
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhum lock ativo encontrado</p>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Locks Expirados ({expiredLocks.length})</h2>
        {expiredLocks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Transaction ID</th>
                  <th className="px-4 py-2 border">Locked By</th>
                  <th className="px-4 py-2 border">Locked At</th>
                  <th className="px-4 py-2 border">Expired At</th>
                  <th className="px-4 py-2 border">Expirado há</th>
                </tr>
              </thead>
              <tbody>
                {expiredLocks.map((lock) => {
                  const lockedAt = new Date(lock.locked_at);
                  const expiresAt = new Date(lock.expires_at);
                  const now = new Date();
                  const expiredMinutesAgo = Math.round((now.getTime() - expiresAt.getTime()) / (60 * 1000));
                  
                  return (
                    <tr key={lock.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border font-mono text-sm">{lock.transaction_id}</td>
                      <td className="px-4 py-2 border">{lock.locked_by || 'desconhecido'}</td>
                      <td className="px-4 py-2 border">{lockedAt.toLocaleString()}</td>
                      <td className="px-4 py-2 border">{expiresAt.toLocaleString()}</td>
                      <td className="px-4 py-2 border">{expiredMinutesAgo} minutos</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhum lock expirado encontrado</p>
        )}
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Histórico de Liberações Forçadas</h2>
        <LockActionLogs />
      </div>
    </div>
  );
}

// Componente para buscar e exibir logs de ações em locks
async function LockActionLogs() {
  const supabase = createClient();
  
  // Buscar logs relacionados a locks
  const { data: lockLogs, error } = await supabase
    .from('logs')
    .select('*')
    .in('action', ['force_unlock', 'auto_unlock_stale', 'clear_all_locks'])
    .order('created_at', { ascending: false })
    .limit(30);
    
  if (error || !lockLogs || lockLogs.length === 0) {
    return <p className="text-gray-500">Nenhum log de ação em locks encontrado</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Ação</th>
            <th className="px-4 py-2 border">Transaction ID</th>
            <th className="px-4 py-2 border">Data/Hora</th>
            <th className="px-4 py-2 border">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {lockLogs.map((log) => {
            const createdAt = new Date(log.created_at);
            
            // Mapear ações para nomes mais amigáveis
            const actionMap: Record<string, string> = {
              'force_unlock': 'Liberação Forçada',
              'auto_unlock_stale': 'Liberação Automática (Preso)',
              'clear_all_locks': 'Limpeza Total de Locks'
            };
            
            return (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">
                  <span className={
                    log.action === 'force_unlock' ? "bg-orange-100 text-orange-800 px-2 py-1 rounded" :
                    log.action === 'auto_unlock_stale' ? "bg-blue-100 text-blue-800 px-2 py-1 rounded" :
                    "bg-red-100 text-red-800 px-2 py-1 rounded"
                  }>
                    {actionMap[log.action] || log.action}
                  </span>
                </td>
                <td className="px-4 py-2 border font-mono text-sm">{log.transaction_id || '-'}</td>
                <td className="px-4 py-2 border">{createdAt.toLocaleString()}</td>
                <td className="px-4 py-2 border">
                  {log.metadata ? (
                    <details>
                      <summary className="cursor-pointer">Ver detalhes</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  ) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
