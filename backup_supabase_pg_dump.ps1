# Script PowerShell para backup do Supabase usando pg_dump
# Autor: Cascade AI
# Data: 03/03/2025

# Definir variáveis
$backupDir = "C:\Desenvolvimento\viralizai-an\backups"
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\supabase_backup_$date.sql"

# Criar diretório de backup se não existir
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
    Write-Host "Diretório de backup criado: $backupDir"
}

# Configurações do banco de dados
$host = "db.ijpwrspomqdnxavpjbzh.supabase.co"
$port = "5432"
$database = "postgres"
$user = "postgres"

# Solicitar senha
$securePassword = Read-Host "Digite a senha do banco de dados" -AsSecureString
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Configurar variável de ambiente para a senha
$env:PGPASSWORD = $password

try {
    # Verificar se pg_dump está instalado
    try {
        $pgDumpVersion = & pg_dump --version
        Write-Host "Usando $pgDumpVersion"
    } catch {
        Write-Host "ERRO: pg_dump não encontrado. Certifique-se de que o PostgreSQL está instalado e no PATH."
        exit 1
    }
    
    # Executar pg_dump
    Write-Host "Iniciando backup do banco de dados..."
    & pg_dump -h $host -p $port -U $user -d $database -f $backupFile
    
    # Verificar se o backup foi criado
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length / 1MB
        Write-Host "Backup concluído com sucesso: $backupFile (Tamanho: $($fileSize.ToString('0.00')) MB)"
        
        # Comprimir o arquivo
        Write-Host "Comprimindo arquivo de backup..."
        Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip" -Force
        
        # Remover arquivo SQL original
        Remove-Item $backupFile
        Write-Host "Arquivo SQL original removido. Backup compactado disponível em: $backupFile.zip"
    } else {
        Write-Host "ERRO: Falha ao criar arquivo de backup."
    }
} catch {
    Write-Host "ERRO: $($_.Exception.Message)"
} finally {
    # Limpar a variável de ambiente da senha
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Processo de backup finalizado."
