import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      payment_external_reference, 
      external_reference, 
      payment_id,
      id
    } = body;

    console.log('Buscando transação com referências:', { 
      payment_external_reference, 
      external_reference, 
      payment_id,
      id
    });

    const supabase = createClient();

    // Verificar o esquema da tabela
    const { data: tableSchema, error: schemaError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);

    console.log('Esquema da tabela transactions:', {
      schema: Object.keys(tableSchema?.[0] || {}),
      schemaError
    });

    // Log de todas as transações para debug
    const { data: allTransactions, error: allTransactionsError } = await supabase
      .from('transactions')
      .select('*')
      .or(
        `payment_external_reference.eq.${payment_external_reference},` +
        `payment_external_reference.eq.${external_reference},` +
        `payment_external_reference.eq.${payment_id},` +
        `payment_external_reference.eq.${id}`
      );

    console.log('Todas as transações encontradas:', {
      count: allTransactions?.length,
      transactions: allTransactions,
      error: allTransactionsError
    });

    // Estratégias de busca múltiplas com log detalhado
    const searchStrategies = [
      async () => {
        console.log('Estratégia 1: Busca por payment_external_reference');
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('payment_external_reference', payment_external_reference || external_reference || payment_id || id)
          .limit(2);
        
        console.log('Resultado Estratégia 1:', { 
          dataCount: data?.length, 
          data,
          error 
        });

        return { data, error };
      },
      
      async () => {
        console.log('Estratégia 2: Busca por payment_id');
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('payment_id', payment_external_reference || external_reference || payment_id || id)
          .limit(2);
        
        console.log('Resultado Estratégia 2:', { 
          dataCount: data?.length, 
          data,
          error 
        });

        return { data, error };
      },
      
      async () => {
        console.log('Estratégia 3: Busca por id');
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', payment_external_reference || external_reference || payment_id || id)
          .limit(2);
        
        console.log('Resultado Estratégia 3:', { 
          dataCount: data?.length, 
          data,
          error 
        });

        return { data, error };
      },

      async () => {
        console.log('Estratégia 4: Busca flexível no metadata');
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .containedBy('metadata', {
            payment: {
              id: payment_external_reference || external_reference || payment_id || id
            }
          })
          .limit(2);
        
        console.log('Resultado Estratégia 4:', { 
          dataCount: data?.length, 
          data,
          error 
        });

        return { data, error };
      }
    ];

    let transaction = null;
    let error = null;

    // Tentar estratégias de busca
    for (const strategy of searchStrategies) {
      const result = await strategy();
      
      if (result.data && result.data.length === 1) {
        transaction = result.data[0];
        break;
      } else if (result.data && result.data.length > 1) {
        console.warn('Múltiplas transações encontradas:', result.data);
        // Escolher a transação mais recente
        transaction = result.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        break;
      }
      
      error = result.error;
    }

    console.log('Resultado final da busca:', { 
      transaction, 
      error 
    });

    // Se nenhuma estratégia funcionar
    if (!transaction) {
      console.error('Transação não encontrada:', error);
      return NextResponse.json({ 
        error: 'Transação não encontrada',
        details: error?.message || 'Nenhuma estratégia de busca funcionou',
        searchParams: { 
          payment_external_reference, 
          external_reference, 
          payment_id,
          id
        }
      }, { status: 404 });
    }

    console.log('Transação encontrada:', transaction);

    return NextResponse.json({
      transaction,
      status: 'found'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: String(error)
    }, { status: 500 });
  }
}
