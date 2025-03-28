import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da transação não fornecido' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Buscar transação pelo ID
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar transação:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar transação' },
        { status: 500 }
      );
    }
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }
    
    // Retornar os detalhes da transação
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
