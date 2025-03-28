# Script para testar e depurar detalhadamente o fluxo de transação
# Uso: .\test-transaction-debug.ps1 <transaction_id>

param(
    [Parameter(Mandatory=$true)]
    [string]$transactionId
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = ".\logs\transaction-debug-$timestamp.log"

Write-Host "Iniciando depuração detalhada da transação: $transactionId"
Write-Host "Log será salvo em: $logFile"
Write-Host ""

# Criar arquivo de log
"=== INÍCIO DA DEPURAÇÃO DE TRANSAÇÃO ===" | Out-File -FilePath $logFile
"Data e hora: $(Get-Date)" | Out-File -FilePath $logFile -Append
"Transação ID: $transactionId" | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

# Buscar dados da transação
Write-Host "Buscando dados da transação..."
$transactionQuery = "SELECT * FROM transactions WHERE id = '$transactionId'"
$transactionCommand = "node -e `"const { createClient } = require('@next/third-parties/.next/server/app/api/[[...slug]]/route.js'); const supabase = createClient(); (async () => { const { data, error } = await supabase.from('transactions').select('*, service:service_id(*)').eq('id', '$transactionId').single(); console.log(JSON.stringify(data, null, 2)); process.exit(0); })().catch(e => { console.error(e); process.exit(1); })`""

Write-Host "Executando: $transactionCommand"
try {
    $transactionData = Invoke-Expression $transactionCommand
    "=== DADOS DA TRANSAÇÃO ===" | Out-File -FilePath $logFile -Append
    $transactionData | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    Write-Host "Dados da transação obtidos com sucesso"
} catch {
    "ERRO AO BUSCAR DADOS DA TRANSAÇÃO: $_" | Out-File -FilePath $logFile -Append
    Write-Host "Erro ao buscar dados da transação: $_" -ForegroundColor Red
}

# Executar o teste de transação com debug detalhado
Write-Host "Executando processamento da transação com debug ativado..."
"=== PROCESSAMENTO DA TRANSAÇÃO ===" | Out-File -FilePath $logFile -Append

$env:DEBUG_TRANSACTION = "true"
$env:DEBUG_LEVEL = "verbose"

# Executa o comando e adiciona saída ao log
try {
    npx ts-node -r tsconfig-paths/register src/scripts/test-transaction-processing.ts $transactionId *>> $logFile
    Write-Host "Processamento concluído" -ForegroundColor Green
} catch {
    "ERRO DURANTE O PROCESSAMENTO: $_" | Out-File -FilePath $logFile -Append
    Write-Host "Erro durante o processamento: $_" -ForegroundColor Red
}

# Verificar pedidos criados
Write-Host "Verificando pedidos criados..."
$ordersCommand = "node -e `"const { createClient } = require('@next/third-parties/.next/server/app/api/[[...slug]]/route.js'); const supabase = createClient(); (async () => { const { data, error } = await supabase.from('orders').select('*').eq('transaction_id', '$transactionId'); console.log(JSON.stringify(data, null, 2)); process.exit(0); })().catch(e => { console.error(e); process.exit(1); })`""

try {
    $ordersData = Invoke-Expression $ordersCommand
    "=== PEDIDOS CRIADOS ===" | Out-File -FilePath $logFile -Append
    $ordersData | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    Write-Host "Dados dos pedidos obtidos com sucesso"
} catch {
    "ERRO AO BUSCAR PEDIDOS: $_" | Out-File -FilePath $logFile -Append
    Write-Host "Erro ao buscar pedidos: $_" -ForegroundColor Red
}

# Verificar logs de transação
Write-Host "Verificando logs de transação..."
$logsCommand = "node -e `"const { createClient } = require('@next/third-parties/.next/server/app/api/[[...slug]]/route.js'); const supabase = createClient(); (async () => { const { data, error } = await supabase.from('transaction_logs').select('*').eq('transaction_id', '$transactionId').order('created_at', {ascending: false}); console.log(JSON.stringify(data, null, 2)); process.exit(0); })().catch(e => { console.error(e); process.exit(1); })`""

try {
    $logsData = Invoke-Expression $logsCommand
    "=== LOGS DE TRANSAÇÃO ===" | Out-File -FilePath $logFile -Append
    $logsData | Out-File -FilePath $logFile -Append
    "" | Out-File -FilePath $logFile -Append
    Write-Host "Logs de transação obtidos com sucesso"
} catch {
    "ERRO AO BUSCAR LOGS: $_" | Out-File -FilePath $logFile -Append
    Write-Host "Erro ao buscar logs: $_" -ForegroundColor Red
}

# Conclusão
"=== FIM DA DEPURAÇÃO ===" | Out-File -FilePath $logFile -Append
"Data e hora de conclusão: $(Get-Date)" | Out-File -FilePath $logFile -Append

Write-Host ""
Write-Host "Depuração concluída. Log completo salvo em: $logFile" -ForegroundColor Green
Write-Host "Use o comando 'notepad $logFile' para visualizar o log." 