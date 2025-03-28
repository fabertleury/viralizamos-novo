# Script para testar processamento de transação com log
# Uso: .\test-transaction-with-log.ps1 <transaction_id>

param(
    [Parameter(Mandatory=$true)]
    [string]$transactionId
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = ".\logs\transaction-test-$timestamp.log"

Write-Host "Iniciando teste da transação: $transactionId"
Write-Host "Log será salvo em: $logFile"

# Executa o comando e redireciona a saída para o arquivo de log
npx ts-node -r tsconfig-paths/register src/scripts/test-transaction-processing.ts $transactionId *> $logFile

# Exibe também no console
Get-Content $logFile

Write-Host ""
Write-Host "Teste concluído. Log salvo em: $logFile" 