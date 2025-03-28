import { createClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRefillStatus } from '@/lib/transactions/transactionProcessor';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const cookieStore = cookies();
    const url = new URL(request.url);
    const refillId = url.searchParams.get('refillId');

    // Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!refillId) {
      return Response.json({ error: 'ID da reposição é obrigatório' }, { status: 400 });
    }

    // Buscar reposição
    const { data: refill, error: refillError } = await supabase
      .from('refills')
      .select('*')
      .eq('id', refillId)
      .eq('user_id', session.user.id)
      .single();

    if (refillError) throw refillError;
    if (!refill) {
      return Response.json({ error: 'Reposição não encontrada' }, { status: 404 });
    }

    // Verificar status na API do Fama
    const refillStatus = await checkRefillStatus(refill.external_refill_id);

    // Atualizar status no banco
    const { data: updatedRefill, error: updateError } = await supabase
      .from('refills')
      .update({
        status: refillStatus.status.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', refillId)
      .select()
      .single();

    if (updateError) throw updateError;

    return Response.json(updatedRefill);
  } catch (error) {
    console.error('Erro ao verificar status da reposição:', error);
    return Response.json(
      { error: 'Erro ao verificar status da reposição' },
      { status: 500 }
    );
  }
}
