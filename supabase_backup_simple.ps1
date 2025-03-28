# Script PowerShell simples para backup do Supabase
# Autor: Cascade AI
# Data: 03/03/2025

# Definir variáveis
$backupDir = "C:\Desenvolvimento\viralizai-an\backups"
$date = Get-Date -Format "yyyyMMdd_HHmmss"
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

# Método 1: Tentar usar o comando supabase db dump
Write-Log "Tentando método 1: supabase db dump..."
try {
    $projectRef = "ijpwrspomqdnxavpjbzh"
    $backupFile1 = "$backupDir\supabase_dump_$date.sql"
    
    # Executar o comando
    supabase db dump > $backupFile1
    
    if (Test-Path $backupFile1) {
        Write-Log "Método 1 bem-sucedido! Arquivo salvo em: $backupFile1"
    } else {
        Write-Log "Método 1 falhou: arquivo não foi criado."
    }
} catch {
    Write-Log "Método 1 falhou com erro: $($_.Exception.Message)"
}

# Método 2: Usar o comando supabase db remote commit
Write-Log "Tentando método 2: supabase db remote commit..."
try {
    $backupDir2 = "$backupDir\supabase_schema_$date"
    New-Item -ItemType Directory -Path $backupDir2 -ErrorAction SilentlyContinue
    
    # Mudar para o diretório de backup
    Push-Location $backupDir2
    
    # Executar o comando
    supabase db remote commit
    
    # Voltar ao diretório original
    Pop-Location
    
    if (Test-Path "$backupDir2\supabase") {
        Write-Log "Método 2 bem-sucedido! Esquema salvo em: $backupDir2"
        
        # Comprimir o diretório
        $zipFile = "$backupDir2.zip"
        Compress-Archive -Path $backupDir2 -DestinationPath $zipFile -Force
        Write-Log "Esquema comprimido em: $zipFile"
    } else {
        Write-Log "Método 2 falhou: esquema não foi baixado."
    }
} catch {
    Write-Log "Método 2 falhou com erro: $($_.Exception.Message)"
}

# Método 3: Usar o script Node.js para exportar dados via API
Write-Log "Tentando método 3: exportação via API..."
try {
    $scriptPath = "C:\Desenvolvimento\viralizai-an\supabase_export_data.js"
    
    if (Test-Path $scriptPath) {
        # Executar o script Node.js
        node $scriptPath
        Write-Log "Método 3 iniciado. Verifique a saída do Node.js para detalhes."
    } else {
        Write-Log "Método 3 falhou: script $scriptPath não encontrado."
    }
} catch {
    Write-Log "Método 3 falhou com erro: $($_.Exception.Message)"
}

Write-Log "Processo de backup finalizado. Verifique os logs para detalhes."
Write-Log "Diretório de backup: $backupDir"
