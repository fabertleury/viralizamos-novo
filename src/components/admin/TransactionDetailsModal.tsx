'use client';

import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog 
      as="div" 
      className="relative z-50" 
      onClose={onClose}
      open={isOpen}
    >
      <div className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 mb-4"
            >
              Detalhes da Transação
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Informações Básicas</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">ID:</span> {transaction.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Data:</span>{' '}
                    {transaction.created_at
                      ? format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Valor:</span>{' '}
                    {transaction.amount ? formatCurrency(transaction.amount) : 'N/A'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'approved' ? 'Aprovado' :
                         transaction.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </span>
                    </p>
                    {transaction.metadata?.payment?.id && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/payment/check-payment', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                payment_id: transaction.metadata.payment.id
                              }),
                            });

                            if (!response.ok) {
                              throw new Error('Erro ao verificar pagamento');
                            }

                            const data = await response.json();
                            toast.success('Status do pagamento atualizado');
                            
                            // Recarregar a página para atualizar os dados
                            window.location.reload();
                          } catch (error) {
                            console.error('Error checking payment:', error);
                            toast.error('Erro ao verificar pagamento');
                          }
                        }}
                        className="text-xs text-pink-600 hover:text-pink-700"
                      >
                        Verificar Status
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Dados do Cliente</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Nome:</span> {transaction.customer_name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {transaction.customer_email || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Telefone:</span> {transaction.customer_phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Dados do Instagram</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Usuário Instagram:</span> {transaction.target_username || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Nome Completo:</span> {transaction.target_full_name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Link do Perfil:</span>{' '}
                    {transaction.target_profile_link ? (
                      <a
                        href={transaction.target_profile_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        {transaction.target_profile_link}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Dados do Serviço</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Serviço:</span> {transaction.metadata?.service?.name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Quantidade:</span> {transaction.metadata?.service?.quantity || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">ID do Provedor:</span> {transaction.metadata?.service?.provider_id || transaction.metadata?.service?.fama_id || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Posts Selecionados</h4>
                <div className="mt-2 space-y-2">
                  {transaction.metadata?.posts?.map((post: any) => {
                    console.log('Post data:', JSON.stringify(post, null, 2));
                    
                    // Construir a URL do post corretamente usando o código do post
                    const postCode = post.code || post.id || post.shortcode;
                    const postUrl = postCode ? `https://instagram.com/p/${postCode}` : post.link;
                    console.log('Post URL:', postUrl);
                    
                    const postKey = post.id || Math.random().toString(36).substring(7);
                    const imageUrl = post.image_url || (post.image_versions?.items?.[0]?.url);

                    return (
                      <div key={postKey} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <div className="relative w-12 h-12 bg-gray-100 rounded">
                            {imageUrl && (
                              <img
                                src={`/api/proxy/image?url=${encodeURIComponent(imageUrl)}`}
                                alt="Post do Instagram"
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {typeof post.caption === 'object' && post.caption !== null && 'text' in post.caption 
                                ? post.caption.text 
                                : (typeof post.caption === 'string' 
                                    ? post.caption 
                                    : 'Sem legenda')}
                            </p>
                            <div className="flex items-center space-x-2">
                              {postUrl ? (
                                <a
                                  href={postUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-500 hover:text-pink-600 text-sm"
                                >
                                  Ver no Instagram
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">Link indisponível</span>
                              )}
                              {postUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(postUrl);
                                    toast.success('Link copiado!');
                                  }}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!transaction.metadata?.posts || transaction.metadata.posts.length === 0) && (
                    <p className="text-sm text-gray-500">Nenhum post selecionado</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={onClose}
                className="w-full justify-center"
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
