'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { CustomerData } from '@/types/customer';
import Confetti from 'react-confetti';

interface TransactionType {
  id: string;
  external_id?: string;
  amount: number;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_id?: string;
  customers?: CustomerType;
  metadata?: any;
  order_created?: boolean;
  provider_request?: any;
  provider_response?: any;
  external_order_id?: string;
  status_provider?: string;
}

interface CustomerType {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default function AgradecimentoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AgradecimentoContent />
    </Suspense>
  );
}

function AgradecimentoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);

  // Configurar as dimensões da janela para o confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Definir dimensões iniciais
    handleResize();
    
    // Adicionar event listener
    window.addEventListener('resize', handleResize);
    
    // Configurar tempo para esconder confetti
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000); // 10 segundos
    
    // Limpar
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const fetchTransactionAndCustomer = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Obter ID da transação da URL
        const transactionId = searchParams.get('id');
        let emailParam = searchParams.get('email');
        
        // Armazenar o email para uso posterior
        setEmail(emailParam);
        
        if (!transactionId) {
          setError('ID da transação não encontrado');
          setLoading(false);
          return;
        }
          
        // Verificar se o ID é um UUID ou um número
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(transactionId);
        
        let transactionData = null;
        let fetchError = null;
        
        // Se for um número (como o ID do gateway de pagamento)
        if (!isUuid) {
          console.log('Buscando transação pelo payment_id:', transactionId);
          
          // Tentar buscar na tabela core_transactions_v2 primeiro
          const { data: v2Transaction, error: v2Error } = await supabase
            .from('core_transactions_v2')
            .select('*, customers:customer_id(*)')
            .eq('payment_id', transactionId)
            .maybeSingle();
            
          if (v2Error && v2Error.code !== 'PGRST116') {
            console.error('Erro ao buscar na tabela core_transactions_v2:', v2Error);
          }
          
          if (v2Transaction) {
            console.log('Transação encontrada na tabela core_transactions_v2');
            transactionData = v2Transaction;
          } else {
            console.log('Transação não encontrada na tabela core_transactions_v2, tentando na tabela core_transactions');
            
            // Tentar buscar na tabela core_transactions
            const { data: v1Transaction, error: v1Error } = await supabase
              .from('core_transactions')
              .select('*, customers:customer_id(*)')
              .eq('payment_id', transactionId)
              .maybeSingle();
              
            if (v1Error && v1Error.code !== 'PGRST116') {
              console.error('Erro ao buscar na tabela core_transactions:', v1Error);
              fetchError = v1Error;
            }
            
            if (v1Transaction) {
              console.log('Transação encontrada na tabela core_transactions');
              transactionData = v1Transaction;
            }
          }
          
          // Se ainda não encontrou, tentar outras estratégias
          if (!transactionData) {
            console.log('Tentando estratégias alternativas de busca');
            
            const searchStrategies = [
              // Buscar na tabela transactions original
              async () => {
                const { data, error } = await supabase
                  .from('transactions')
                  .select('*, customers(*)')
                  .eq('payment_id', transactionId)
                  .maybeSingle();
                return { data, error };
              },
              
              // Buscar pelo external_reference
              async () => {
                const { data: v2Data, error: v2Error } = await supabase
                  .from('core_transactions_v2')
                  .select('*, customers:customer_id(*)')
                  .eq('payment_external_reference', transactionId)
                  .maybeSingle();
                  
                if (v2Data) return { data: v2Data, error: null };
                
                const { data: v1Data, error: v1Error } = await supabase
                  .from('core_transactions')
                  .select('*, customers:customer_id(*)')
                  .eq('payment_external_reference', transactionId)
                  .maybeSingle();
                  
                return { data: v1Data, error: v1Error };
              },
              
              // Buscar pelo external_id
              async () => {
                const { data: v2Data, error: v2Error } = await supabase
                  .from('core_transactions_v2')
                  .select('*, customers:customer_id(*)')
                  .eq('external_id', transactionId)
                  .maybeSingle();
                  
                if (v2Data) return { data: v2Data, error: null };
                
                const { data: v1Data, error: v1Error } = await supabase
                  .from('core_transactions')
                  .select('*, customers:customer_id(*)')
                  .eq('external_id', transactionId)
                  .maybeSingle();
                  
                return { data: v1Data, error: v1Error };
              }
            ];
            
            // Tentar cada estratégia de busca
            for (const strategy of searchStrategies) {
              try {
                const { data: foundData, error } = await strategy();
                
                if (error && error.code !== 'PGRST116') {
                  console.warn('Erro em estratégia de busca:', error);
                  continue;
                }
                
                if (foundData) {
                  console.log('Transação encontrada com estratégia alternativa');
                  transactionData = foundData;
                  break;
                }
              } catch (error) {
                console.warn('Erro em estratégia de busca:', error);
              }
            }
          }
        } else {
          // Se for UUID, buscar diretamente pelo ID nas tabelas
          console.log('Buscando transação pelo UUID:', transactionId);
          
          // Primeiro na tabela core_transactions_v2
          const { data: v2Transaction, error: v2Error } = await supabase
            .from('core_transactions_v2')
            .select('*, customers:customer_id(*)')
            .eq('id', transactionId)
            .maybeSingle();
            
          if (v2Error && v2Error.code !== 'PGRST116') {
            console.error('Erro ao buscar na tabela core_transactions_v2 por UUID:', v2Error);
          }
          
          if (v2Transaction) {
            console.log('Transação encontrada na tabela core_transactions_v2 por UUID');
            transactionData = v2Transaction;
          } else {
            // Depois na tabela core_transactions
            const { data: v1Transaction, error: v1Error } = await supabase
              .from('core_transactions')
              .select('*, customers:customer_id(*)')
              .eq('id', transactionId)
              .maybeSingle();
              
            if (v1Error && v1Error.code !== 'PGRST116') {
              console.error('Erro ao buscar na tabela core_transactions por UUID:', v1Error);
              fetchError = v1Error;
            }
            
            if (v1Transaction) {
              console.log('Transação encontrada na tabela core_transactions por UUID');
              transactionData = v1Transaction;
            } else {
              // Por último, tentar na tabela transactions original
              const { data: originalTransaction, error: originalError } = await supabase
                .from('transactions')
                .select('*, customers(*)')
                .eq('id', transactionId)
                .maybeSingle();
                
              if (originalError && originalError.code !== 'PGRST116') {
                console.error('Erro ao buscar na tabela transactions original por UUID:', originalError);
                fetchError = originalError;
              }
              
              if (originalTransaction) {
                console.log('Transação encontrada na tabela transactions original por UUID');
                transactionData = originalTransaction;
              }
            }
          }
        }
        
        // Verificar se encontramos a transação
        if (!transactionData) {
          console.error('Transação não encontrada em nenhuma tabela:', fetchError);
          setError('Transação não encontrada em nenhuma tabela');
          setLoading(false);
          return;
        }
          
        setTransaction(transactionData);
        
        // Se a transação tem um cliente associado, definir o cliente
        if (transactionData.customers) {
          setCustomer(transactionData.customers);
        }
        
        // Rastrear evento de conclusão de compra com Facebook Pixel
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'CompleteRegistration', {
            content_name: 'Compra finalizada',
            status: 'success',
            transaction_id: transactionId,
            value: transactionData.amount,
            currency: 'BRL'
          });
        }
          
        // Se o email não estiver na URL, mas estiver na transação ou no cliente, atualizar a URL
        if (!emailParam) {
          let transactionEmail = null;
          
          if (transactionData.customers && transactionData.customers.email) {
            transactionEmail = transactionData.customers.email;
          } else if (transactionData.customer_email || transactionData.metadata?.customer?.email || transactionData.metadata?.email) {
            transactionEmail = transactionData.customer_email || transactionData.metadata?.customer?.email || transactionData.metadata?.email;
          }
          
          if (transactionEmail) {
            // Atualizar a URL sem recarregar a página
            const newUrl = `${window.location.pathname}?id=${transactionId}&email=${encodeURIComponent(transactionEmail)}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            emailParam = transactionEmail;
          }
        }

        // Se temos um email, criar ou atualizar o perfil e o customer
        if (emailParam) {
          try {
            // Verificar se temos dados da transação
            if (!transactionData) {
              console.error('Dados da transação não disponíveis para criar perfil');
              setLoading(false);
              return;
            }
            
            // Extrair nome do usuário
            const userName = transactionData.customer_name || 
                            transactionData.metadata?.customer?.name || 
                            transactionData.metadata?.profile?.full_name || 
                            transactionData.metadata?.profile?.username || 
                            (transactionData.customers ? transactionData.customers.name : null) || 
                            emailParam.split('@')[0];
            
            // Verificar se o usuário já existe na tabela profiles
            const { data: existingUser } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', emailParam)
              .single();
            
            if (!existingUser) {
              // Usuário não existe, criar novo
              await supabase
                .from('profiles')
                .insert({
                  email: emailParam,
                  name: userName,
                  role: 'customer',
                  active: true
                });
              
              console.log('Perfil do usuário criado com sucesso');
            }
            
            // Se a transação não tem cliente associado, verificar se o cliente existe e associar
            if (!transactionData.customers) {
              // Verificar se o cliente já existe na tabela customers
              const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('email', emailParam)
                .single();
              
              // Preparar dados do cliente
              const customerData = {
                email: emailParam,
                name: userName,
                metadata: {
                  ...transactionData.metadata,
                  last_transaction_id: transactionData.id,
                  last_transaction_date: transactionData.created_at
                }
              };
              
              // Adicionar telefone se disponível
              if (transactionData.customer_phone || transactionData.metadata?.customer?.phone || transactionData.metadata?.phone) {
                customerData.phone = transactionData.customer_phone || transactionData.metadata?.customer?.phone || transactionData.metadata?.phone;
              }
              
              // Adicionar username do Instagram se disponível
              if (transactionData.metadata?.instagram_username || transactionData.metadata?.customer?.instagram_username) {
                customerData.instagram_username = transactionData.metadata?.instagram_username || transactionData.metadata?.customer?.instagram_username;
              }
              
              let customerId;
              
              if (!existingCustomer) {
                // Cliente não existe, criar novo
                const { data: newCustomer } = await supabase
                  .from('customers')
                  .insert(customerData)
                  .select('id')
                  .single();
                
                if (newCustomer) {
                  customerId = newCustomer.id;
                  console.log('Cliente criado com sucesso');
                }
              } else {
                // Cliente existe, atualizar
                await supabase
                  .from('customers')
                  .update(customerData)
                  .eq('id', existingCustomer.id);
                
                customerId = existingCustomer.id;
                console.log('Cliente atualizado com sucesso');
              }
              
              // Atualizar a transação com o customer_id se for da tabela transactions original
              if (customerId) {
                try {
                  // Verificar em qual tabela a transação foi encontrada
                  const tableNames = ['transactions', 'core_transactions', 'core_transactions_v2'];
                  
                  for (const tableName of tableNames) {
                    const { error } = await supabase
                      .from(tableName)
                      .update({ customer_id: customerId })
                      .eq('id', transactionData.id);
                      
                    if (!error) {
                      console.log(`Transação atualizada com customer_id na tabela ${tableName}`);
                      break;
                    }
                  }
                } catch (updateError) {
                  console.error('Erro ao atualizar customer_id na transação:', updateError);
                }
              }
            }
          } catch (profileError) {
            console.error('Erro ao processar perfil do usuário:', profileError);
            // Não interromper o fluxo da página por erro no processamento do perfil
          }
        }
      } catch (err) {
        console.error('Erro:', err);
        setError('Ocorreu um erro ao processar sua solicitação');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionAndCustomer();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold text-center">Carregando...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link href="/" className="text-primary hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-gray-100">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.15}
          colors={['#FF92CD', '#FF3399', '#00CCFF', '#33FF99', '#FFFF00', '#FF9933']}
        />
      )}
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Pagamento Aprovado!
          </h1>
          
          <p className="text-center text-gray-600 mb-6">
            Seu pedido foi confirmado e está sendo processado.
          </p>
          
          {transaction && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Detalhes do Pedido</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID da Transação:</span>
                  <span className="font-medium">{transaction.external_id || transaction.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(transaction.amount)}
                  </span>
        </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data:</span>
                  <span className="font-medium">
                    {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-green-600">Aprovado</span>
                </div>
                {transaction.status_provider && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status no Provedor:</span>
                    <span className="font-medium">
                      {transaction.status_provider === 'completed' ? (
                        <span className="text-green-600">Completado</span>
                      ) : transaction.status_provider === 'processing' ? (
                        <span className="text-yellow-600">Em Processamento</span>
                      ) : transaction.status_provider === 'error' ? (
                        <span className="text-red-600">Erro</span>
                      ) : (
                        transaction.status_provider
                      )}
                    </span>
                  </div>
                )}
                {transaction.external_order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID do Pedido (Provedor):</span>
                    <span className="font-medium">{transaction.external_order_id}</span>
                  </div>
                )}
                {customer && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cliente:</span>
                    <span className="font-medium">{customer.name || customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {transaction && (transaction.provider_request || transaction.provider_response) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Comunicação com o Provedor</h2>
              
              {transaction.provider_request && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Enviado ao Provedor:</h3>
                  <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap break-words">
                      {typeof transaction.provider_request === 'string' 
                        ? transaction.provider_request 
                        : JSON.stringify(transaction.provider_request, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {transaction.provider_response && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Resposta do Provedor:</h3>
                  <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap break-words">
                      {typeof transaction.provider_response === 'string' 
                        ? transaction.provider_response 
                        : JSON.stringify(transaction.provider_response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              </div>
          )}
          
          <div className="text-center space-y-4">
            <p className="text-gray-600">
            </p>
            
            <div className="pt-4 space-y-3">
              <Link 
                href={`/acompanhar-pedido?email=${encodeURIComponent(email || (customer?.email || ''))}`}
                className="inline-block w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Acompanhar meu pedido
              </Link>
              
              <Link 
                href="/" 
                className="inline-block w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Voltar para a página inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
