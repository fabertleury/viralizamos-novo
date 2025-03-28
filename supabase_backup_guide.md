# Guia Completo de Backup do Supabase

## 1. Backup usando o Supabase CLI

### Pré-requisitos
- Supabase CLI instalado
- Acesso ao projeto Supabase

### Instalação do Supabase CLI
```bash
# Usando npm
npm install -g supabase

# Ou usando yarn
yarn global add supabase
```

### Autenticação
```bash
supabase login
```

### Fazer Backup
```bash
# Backup completo
supabase db dump -p <seu-ref-id> > supabase_backup_$(date +%Y%m%d).sql

# Backup de tabelas específicas
supabase db dump -p <seu-ref-id> --table=orders,customers,providers > specific_tables_backup_$(date +%Y%m%d).sql
```

### Restauração
```bash
supabase db restore -p <seu-ref-id> < supabase_backup_20250303.sql
```

## 2. Backup via Interface Web do Supabase

### Passo a passo
1. Faça login no [dashboard do Supabase](https://app.supabase.io)
2. Selecione seu projeto
3. Vá para "Database" > "Backups"
4. Clique em "Create Backup" para criar um backup manual
5. Para restaurar, selecione o backup desejado e clique em "Restore"

**Nota**: Os backups automáticos são feitos diariamente e mantidos por 7 dias no plano gratuito.

## 3. Backup usando pg_dump (PostgreSQL)

O Supabase é baseado em PostgreSQL, então você pode usar as ferramentas nativas do PostgreSQL.

### Pré-requisitos
- PostgreSQL instalado localmente
- Credenciais de conexão do banco de dados

### Obter Credenciais de Conexão
1. No dashboard do Supabase, vá para "Settings" > "Database"
2. Copie a Connection String

### Fazer Backup
```bash
pg_dump -h db.xxxxxxxxxxxx.supabase.co -p 5432 -U postgres -d postgres -f supabase_backup_$(date +%Y%m%d).sql
```

Quando solicitado, insira a senha do banco de dados.

### Restauração
```bash
psql -h db.xxxxxxxxxxxx.supabase.co -p 5432 -U postgres -d postgres -f supabase_backup_20250303.sql
```

## 4. Script PowerShell para Backup Automático

Crie um arquivo `backup_supabase.ps1`:

```powershell
# Definir variáveis
$backupDir = "C:\Backups\Supabase"
$projectRef = "seu-ref-id"
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\supabase_backup_$date.sql"

# Criar diretório de backup se não existir
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

# Fazer backup
supabase db dump -p $projectRef > $backupFile

# Comprimir o arquivo
Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip"

# Remover arquivo SQL original (opcional)
Remove-Item $backupFile

Write-Host "Backup concluído: $backupFile.zip"
```

### Agendar Backup Automático
1. Abra o Agendador de Tarefas do Windows
2. Crie uma nova tarefa
3. Configure para executar o script PowerShell periodicamente
4. Defina o comando: `powershell.exe -File "C:\caminho\para\backup_supabase.ps1"`

## 5. Exportação de Dados via API

Para casos específicos, você pode exportar dados via API do Supabase:

```javascript
const { data, error } = await supabase
  .from('orders')
  .select('*')

if (data) {
  // Salvar dados em um arquivo
  const jsonData = JSON.stringify(data, null, 2)
  fs.writeFileSync('orders_backup.json', jsonData)
}
```

## Melhores Práticas

1. **Faça backups regularmente**: Estabeleça uma rotina de backup (diária, semanal)
2. **Armazene em múltiplos locais**: Não mantenha todos os backups em um único lugar
3. **Teste seus backups**: Verifique periodicamente se é possível restaurar a partir dos backups
4. **Documente o processo**: Mantenha instruções claras sobre como fazer e restaurar backups
5. **Monitore o espaço**: Certifique-se de ter espaço suficiente para armazenar os backups

## Solução de Problemas

- **Erro de conexão**: Verifique se as credenciais estão corretas e se o IP tem permissão para acessar o banco
- **Timeout**: Para bancos grandes, aumente o timeout da conexão
- **Permissões**: Certifique-se de que o usuário tem permissões suficientes para fazer backup
