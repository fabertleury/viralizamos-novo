import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar a chave secreta para garantir que apenas chamadas autorizadas executem este código
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.ADMIN_API_KEY || 'admin_sql_migrate_key';
    
    if (apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const supabase = createClient();
    
    // SQL para remover a restrição de chave estrangeira da tabela core_processing_logs
    await supabase.rpc('sql_execute', {
      sql_query: `
        -- Remover a restrição de chave estrangeira se existir
        ALTER TABLE core_processing_logs 
        DROP CONSTRAINT IF EXISTS core_processing_logs_transaction_id_fkey;
        
        -- Certificar-se de que o índice ainda existe
        CREATE INDEX IF NOT EXISTS idx_processing_logs_transaction_id 
        ON core_processing_logs(transaction_id);
        
        -- Comentário na tabela
        COMMENT ON TABLE core_processing_logs IS 'Armazena logs de processamento de transações e pedidos (sem restrição de chave estrangeira)';
      `
    });
    
    return NextResponse.json({
      success: true,
      message: 'Restrição de chave estrangeira removida com sucesso da tabela core_processing_logs'
    });
  } catch (error) {
    console.error('Erro ao executar migração SQL:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao executar migração SQL', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
} 