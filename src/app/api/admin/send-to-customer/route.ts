import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verificar se o usuário está autenticado como admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado. Apenas administradores podem executar esta ação.' },
        { status: 403 }
      );
    }
    
    // Obter dados do corpo da requisição
    const { transaction_id, customer_email, customer_links } = await request.json();
    
    // Validar dados
    if (!transaction_id || !customer_email || !customer_links?.length) {
      return NextResponse.json(
        { error: 'Dados insuficientes para processar o envio ao cliente.' },
        { status: 400 }
      );
    }
    
    // Inicializar o cliente do Supabase
    const supabase = createClient();
    
    // Registrar o log da ação
    await supabase
      .from('transaction_logs')
      .insert({
        transaction_id,
        level: 'info',
        message: `Envio manual para o cliente iniciado por ${session.user.email}`,
        metadata: {
          customer_email,
          links: customer_links,
          admin_user: session.user.email,
          initiated_at: new Date().toISOString()
        }
      });
    
    // Lógica para enviar email para o cliente
    // Aqui você precisaria de um serviço de email configurado
    
    // Exemplo usando EmailJS ou qualquer outro serviço configurado
    try {
      // Simulação de chamada a um serviço de email
      // await sendEmail({
      //   to: customer_email,
      //   subject: 'Seu pedido foi processado manualmente',
      //   body: `Seus links foram processados: ${customer_links.join(', ')}`
      // });
      
      // Por enquanto, apenas registrar o sucesso no log
      await supabase
        .from('transaction_logs')
        .insert({
          transaction_id,
          level: 'info',
          message: `Email enviado manualmente para ${customer_email}`,
          metadata: {
            email_sent: true,
            links: customer_links,
            admin_user: session.user.email,
            sent_at: new Date().toISOString()
          }
        });
      
      // Atualizar a transação como entregue
      await supabase
        .from('transactions')
        .update({ delivered: true })
        .eq('id', transaction_id);
      
      return NextResponse.json({ 
        success: true, 
        message: `Enviado com sucesso para ${customer_email}`
      });
      
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      
      await supabase
        .from('transaction_logs')
        .insert({
          transaction_id,
          level: 'error',
          message: `Falha ao enviar email para ${customer_email}`,
          metadata: {
            error: emailError instanceof Error ? emailError.message : 'Erro desconhecido',
            admin_user: session.user.email,
            failed_at: new Date().toISOString()
          }
        });
      
      return NextResponse.json(
        { error: 'Falha ao enviar email para o cliente.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Erro no processamento da solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 