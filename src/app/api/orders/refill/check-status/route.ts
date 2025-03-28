import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRefillStatus } from '@/lib/transactions/transactionProcessor';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient();
    
    // Verificar se o usuário é admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    // Extrair dados do request
    const { refillId, externalRefillId } = await request.json();
    
    if (!refillId) {
      return NextResponse.json(
        { error: 'ID da reposição é obrigatório' },
        { status: 400 }
      );
    }

    if (!externalRefillId) {
      return NextResponse.json(
        { error: 'ID externo da reposição é obrigatório' },
        { status: 400 }
      );
    }

    console.log('[CheckRefillStatus] Verificando status da reposição:', refillId, 'ID externo:', externalRefillId);

    // Buscar reposição
    const { data: refill, error: refillError } = await supabase
      .from('refills')
      .select('*')
      .eq('id', refillId)
      .single();

    if (refillError || !refill) {
      console.error('[CheckRefillStatus] Reposição não encontrada:', refillError);
      return NextResponse.json(
        { error: 'Reposição não encontrada' },
        { status: 404 }
      );
    }

    // Verificar status da reposição no provedor
    try {
      const statusResponse = await checkRefillStatus(externalRefillId);
      console.log('[CheckRefillStatus] Status da reposição no provedor:', statusResponse);

      // Mapear status do provedor para status interno
      let newStatus = refill.status;
      if (statusResponse.status === 'Completed') {
        newStatus = 'completed';
      } else if (statusResponse.status === 'In progress') {
        newStatus = 'processing';
      } else if (statusResponse.status === 'Pending') {
        newStatus = 'pending';
      } else if (statusResponse.status === 'Canceled') {
        newStatus = 'canceled';
      } else if (statusResponse.status === 'Partial') {
        newStatus = 'partial';
      }

      // Atualizar metadata da reposição
      const newMetadata = {
        ...refill.metadata,
        provider_status: statusResponse.status,
        last_check: new Date().toISOString()
      };

      // Atualizar reposição no banco de dados
      const { data: updatedRefill, error: updateError } = await supabase
        .from('refills')
        .update({
          status: newStatus,
          metadata: newMetadata
        })
        .eq('id', refillId)
        .select()
        .single();

      if (updateError) {
        console.error('[CheckRefillStatus] Erro ao atualizar reposição:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar reposição' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'success',
        data: updatedRefill
      });
    } catch (error) {
      console.error('[CheckRefillStatus] Erro ao verificar status da reposição no provedor:', error);
      
      // Atualizar metadata com o erro
      const newMetadata = {
        ...refill.metadata,
        error: error.message,
        last_check: new Date().toISOString()
      };

      await supabase
        .from('refills')
        .update({
          metadata: newMetadata
        })
        .eq('id', refillId);

      return NextResponse.json(
        { 
          error: 'Erro ao verificar status da reposição no provedor',
          details: error.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[CheckRefillStatus] Erro geral:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
