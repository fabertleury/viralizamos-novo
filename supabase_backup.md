# Guia de Backup do Supabase

## Instalação do Supabase CLI

Se você ainda não tem o Supabase CLI instalado:

```bash
# Usando npm
npm install -g supabase

# Ou usando yarn
yarn global add supabase
```

## Autenticação

Antes de fazer o backup, você precisa se autenticar:

```bash
supabase login
```

Isso abrirá uma página no navegador para você fazer login com sua conta do Supabase.

## Fazer Backup do Banco de Dados

### 1. Backup Completo do Banco de Dados

```bash
supabase db dump -p <seu-ref-id> > supabase_backup_$(date +%Y%m%d).sql
```

Substitua `<seu-ref-id>` pelo ID de referência do seu projeto Supabase.

### 2. Backup de Tabelas Específicas

```bash
supabase db dump -p <seu-ref-id> --table=orders,customers,providers > specific_tables_backup_$(date +%Y%m%d).sql
```

## Restauração do Backup

Para restaurar um backup:

```bash
supabase db restore -p <seu-ref-id> < supabase_backup_20250303.sql
```

## Backup Automático via Script PowerShell

Crie um arquivo `backup_supabase.ps1` com o seguinte conteúdo:

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

Você pode agendar este script para executar regularmente usando o Agendador de Tarefas do Windows.
