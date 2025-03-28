// Script para verificar a tabela orders no Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersTable() {
  try {
    console.log('Verificando tabela orders...');
    
    // Verificar se a tabela orders existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'orders');
    
    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.error('Tabela orders não encontrada!');
      return;
    }
    
    console.log('✅ Tabela orders existe');
    
    // Verificar estrutura da tabela
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'orders');
    
    if (columnsError) {
      console.error('Erro ao verificar colunas:', columnsError);
      return;
    }
    
    console.log('Colunas da tabela orders:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Verificar registros existentes
    const { data: orders, error: ordersError, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (ordersError) {
      console.error('Erro ao buscar pedidos:', ordersError);
      return;
    }
    
    console.log(`Total de pedidos: ${count}`);
    
    if (orders && orders.length > 0) {
      console.log('Últimos pedidos:');
      orders.forEach(order => {
        console.log(`- ID: ${order.id}, Status: ${order.status}, Transaction: ${order.transaction_id}`);
      });
    } else {
      console.log('Nenhum pedido encontrado na tabela');
    }
  } catch (error) {
    console.error('Erro ao verificar tabela orders:', error);
  }
}

checkOrdersTable();
