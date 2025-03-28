# Script para testar requisição ao provedor com log
# Uso: .\test-provider-with-log.ps1 <transaction_id> [dry_run]

param(
    [Parameter(Mandatory=$true)]
    [string]$transactionId,
    
    [Parameter(Mandatory=$false)]
    [string]$dryRun = "true" # Padrão para true (simulação) para evitar envios acidentais
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = ".\logs\provider-test-$timestamp.log"

Write-Host "Iniciando teste de requisição ao provedor para transação: $transactionId"
Write-Host "Modo simulação (dry run): $dryRun"
Write-Host "Log será salvo em: $logFile"

# Executa o comando e redireciona a saída para o arquivo de log
npx ts-node -r tsconfig-paths/register src/scripts/test-provider-request.ts $transactionId $dryRun *> $logFile

# Exibe também no console
Get-Content $logFile

Write-Host ""
Write-Host "Teste concluído. Log salvo em: $logFile" 