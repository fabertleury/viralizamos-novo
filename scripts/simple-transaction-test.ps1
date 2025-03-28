# Script simples para testar processamento de transação
# Uso: .\simple-transaction-test.ps1 <transaction_id>

param(
    [Parameter(Mandatory=$true)]
    [string]$transactionId
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = ".\logs\simple-test-$timestamp.log"

Write-Host "Iniciando teste da transação: $transactionId"
Write-Host "Log será salvo em: $logFile"

# Criar cabeçalho do log
"=== TESTE DE TRANSAÇÃO ===" | Out-File -FilePath $logFile
"Data e hora: $(Get-Date)" | Out-File -FilePath $logFile -Append
"Transação ID: $transactionId" | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

# Executar o comando com debug
Write-Host "Executando teste..."
$env:DEBUG = "true"

# Testa se está procurando o serviço certo na transação
"=== DADOS DA TRANSAÇÃO ===" | Out-File -FilePath $logFile -Append
try {
    $output = npx ts-node -r tsconfig-paths/register -e "
    const { createClient } = require('@/lib/supabase/server');
    (async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('transactions')
            .select('*, service:service_id(*)')
            .eq('id', '$transactionId')
            .single();
        
        if (error) {
            console.error('Erro ao buscar transação:', error);
            process.exit(1);
        }
        
        console.log('Serviço associado à transação:');
        console.log(JSON.stringify(data.service, null, 2));
        console.log('\\nMetadados da transação:');
        console.log(JSON.stringify(data.metadata, null, 2));
    })();
    " *>&1

    $output | Out-File -FilePath $logFile -Append
    $output
} catch {
    "ERRO: $_" | Out-File -FilePath $logFile -Append
    Write-Host "Erro ao verificar transação: $_" -ForegroundColor Red
}

"" | Out-File -FilePath $logFile -Append
"=== PROCESSANDO TRANSAÇÃO ===" | Out-File -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

# Processar a transação e capturar a saída
try {
    $output = npx ts-node -r tsconfig-paths/register src/scripts/test-transaction-processing.ts $transactionId *>&1
    
    $output | Out-File -FilePath $logFile -Append
    # Mostrar no console também
    $output
    
    Write-Host "Processamento concluído. Verifique o log para mais detalhes." -ForegroundColor Green
} catch {
    "ERRO DURANTE PROCESSAMENTO: $_" | Out-File -FilePath $logFile -Append
    Write-Host "Erro durante o processamento: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Log completo salvo em: $logFile"
Write-Host "Use o comando 'notepad $logFile' para visualizar o log." 