import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 Iniciando aplicação de funções administrativas ao banco de dados...');
  
  const prisma = new PrismaClient();
  
  try {
    // Caminho para o arquivo SQL
    const sqlFilePath = path.join(process.cwd(), 'prisma', 'migrations', 'manual', '20250402_add_admin_functions.sql');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o SQL diretamente no banco de dados
    console.log('📦 Aplicando funções SQL ao banco de dados...');
    
    // Usar $queryRawUnsafe para executar o SQL diretamente
    await prisma.$queryRawUnsafe(sqlContent);
    
    console.log('✅ Funções administrativas aplicadas com sucesso!');
    
    // Verificar se as tabelas existem
    console.log('🔍 Verificando tabelas...');
    
    // Verificar tabela admin_notifications
    const adminNotificationsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'admin_notifications'
      );
    `;
    
    console.log(`📋 Tabela admin_notifications: ${JSON.stringify(adminNotificationsExists)}`);
    
    // Verificar tabela order_queue
    const orderQueueExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'order_queue'
      );
    `;
    
    console.log(`📋 Tabela order_queue: ${JSON.stringify(orderQueueExists)}`);
    
    // Verificar função admin_get_order_queue
    const functionExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM pg_proc
        JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
        WHERE proname = 'admin_get_order_queue'
        AND nspname = 'public'
      );
    `;
    
    console.log(`📋 Função admin_get_order_queue: ${JSON.stringify(functionExists)}`);
    
  } catch (error) {
    console.error('❌ Erro ao aplicar funções administrativas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('🎉 Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no processo principal:', error);
    process.exit(1);
  }); 