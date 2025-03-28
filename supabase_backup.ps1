# Script PowerShell para backup automático do Supabase
# Autor: Cascade AI
# Data: 03/03/2025

# Definir variáveis
$backupDir = "C:\Desenvolvimento\viralizai-an\backups"
$projectRef = "seu-ref-id" # Substitua pelo seu Project Reference ID do Supabase
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\supabase_backup_$date.sql"
$logFile = "$backupDir\backup_log.txt"

# Função para registrar logs
function Write-Log {
    param (
        [string]$Message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -Append -FilePath $logFile
    Write-Host "$timestamp - $Message"
}

# Criar diretório de backup se não existir
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
    Write-Log "Diretório de backup criado: $backupDir"
}

try {
    # Verificar se o Supabase CLI está instalado
    $supabaseVersion = supabase --version
    Write-Log "Usando Supabase CLI versão: $supabaseVersion"
    
    # Verificar login no Supabase
    Write-Log "Verificando login no Supabase..."
    supabase projects list | Out-Null
    
    # Fazer backup
    Write-Log "Iniciando backup do projeto $projectRef..."
    supabase db dump -p $projectRef > $backupFile
    
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length / 1MB
        Write-Log "Backup concluído: $backupFile (Tamanho: $($fileSize.ToString('0.00')) MB)"
        
        # Comprimir o arquivo
        Write-Log "Comprimindo arquivo de backup..."
        Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip" -Force
        
        # Remover arquivo SQL original
        Remove-Item $backupFile
        Write-Log "Arquivo SQL original removido. Backup compactado disponível em: $backupFile.zip"
        
        # Manter apenas os últimos 7 backups
        $oldBackups = Get-ChildItem -Path $backupDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 7
        if ($oldBackups) {
            foreach ($oldBackup in $oldBackups) {
                Remove-Item $oldBackup.FullName -Force
                Write-Log "Backup antigo removido: $($oldBackup.Name)"
            }
        }
    } else {
        Write-Log "ERRO: Falha ao criar arquivo de backup!"
    }
} catch {
    Write-Log "ERRO: $($_.Exception.Message)"
    
    # Instruções em caso de erro
    Write-Log "Verifique se:"
    Write-Log "1. O Supabase CLI está instalado (npm install -g supabase)"
    Write-Log "2. Você está logado no Supabase (supabase login)"
    Write-Log "3. O Project Reference ID está correto"
    Write-Log "4. Você tem permissões para acessar o projeto"
}

Write-Log "Processo de backup finalizado."
