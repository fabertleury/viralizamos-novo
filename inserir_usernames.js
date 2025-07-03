const fs = require('fs');
const { Pool } = require('pg');

// Configuração da conexão com o banco de dados
const pool = new Pool({
  connectionString: 'postgresql://postgres:zacEqGceWerpWpBZZqttjamDOCcdhRbO@shinkansen.proxy.rlwy.net:29036/railway'
});

// Função para ler o arquivo JSON e extrair os usernames únicos
async function extrairUsernames() {
  try {
    // Lê o arquivo de resultados
    const conteudo = fs.readFileSync('./resultados_compras.json', 'utf8');
    const dados = JSON.parse(conteudo);
    
    // Extrai os usernames únicos
    const usernames = [...new Set(dados.map(item => item.instagram_username))];
    
    console.log(`Foram encontrados ${usernames.length} usernames únicos.`);
    return usernames;
  } catch (error) {
    console.error('Erro ao ler o arquivo ou extrair usernames:', error);
    return [];
  }
}

// Função para inserir um username na tabela de bloqueio
async function bloquearPerfil(username) {
  try {
    const query = 'INSERT INTO instagram_blocked_profiles (username, reason) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING';
    const values = [username, 'Bloqueado automaticamente via importação'];
    const result = await pool.query(query, values);
    return result.rowCount > 0;
  } catch (error) {
    console.error(`Erro ao bloquear ${username}:`, error);
    return false;
  }
}

// Função principal
async function main() {
  try {
    // Extrai os usernames únicos
    const usernames = await extrairUsernames();
    
    if (usernames.length === 0) {
      console.log('Nenhum username encontrado para bloquear.');
      return;
    }
    
    console.log(`Iniciando bloqueio de ${usernames.length} perfis...`);
    
    // Contador de perfis bloqueados
    let bloqueados = 0;
    
    // Bloqueia cada perfil
    for (const username of usernames) {
      if (await bloquearPerfil(username)) {
        bloqueados++;
        console.log(`Perfil ${username} bloqueado com sucesso.`);
      }
    }
    
    console.log(`Processo concluído. ${bloqueados} perfis foram bloqueados.`);
  } catch (error) {
    console.error('Erro durante a execução:', error);
  } finally {
    // Fecha a conexão com o banco de dados
    await pool.end();
  }
}

// Executa o script
main(); 