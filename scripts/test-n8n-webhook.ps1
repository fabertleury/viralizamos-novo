# Script para testar o envio de pedidos para o webhook do n8n usando PowerShell
#
# Como usar:
# 1. Executar: .\test-n8n-webhook.ps1 [test|production]
#    - test: Envia para o ambiente de teste (padrão se não especificado)
#    - production: Envia para o ambiente de produção

# Obter o ambiente a partir dos argumentos da linha de comando
param(
    [string]$Env = "test"
)

# URLs dos webhooks
$TestUrl = "https://automacoes.traconegocios.com.br/webhook-test/order"
$ProdUrl = "https://n8nwebhook.traconegocios.com.br/webhook/order"

# Determinar a URL com base no ambiente
if ($Env -eq "production") {
    $WebhookUrl = $ProdUrl
    $EnvText = "PRODUÇÃO"
} else {
    $WebhookUrl = $TestUrl
    $EnvText = "TESTE"
}

# Chave de API para autenticação
$ApiKey = "n8n_viralizamos_2024"

# Gerar IDs únicos para o teste
$Timestamp = [int](Get-Date -UFormat %s)
$RandomNum = Get-Random -Minimum 1000 -Maximum 9999
$TransactionId = "test-$Timestamp"
$PostId = "post-$RandomNum"
$PostCode = "ABC${RandomNum}XYZ"

# Criar o objeto JSON para envio
$OrderData = @{
    order_id = "$TransactionId-$PostId"
    transaction_id = $TransactionId
    service_id = "1001"
    provider_id = "1"
    external_service_id = "1234"
    quantity = 1000
    target_url = "https://instagram.com/p/$PostCode/"
    target_username = "usuario_teste"
    metadata = @{
        post_id = $PostId
        post_code = $PostCode
        post_type = "post"
        service_type = "likes"
        payment_id = "payment-$Timestamp"
        customer_email = "teste@exemplo.com"
        customer_name = "Usuário de Teste"
    }
    webhook_timestamp = (Get-Date).ToUniversalTime().ToString("o")
}

# Converter para JSON
$JsonData = $OrderData | ConvertTo-Json -Depth 5

Write-Host "Enviando requisição de teste para o webhook do n8n (ambiente: $EnvText)"
Write-Host "URL: $WebhookUrl"
Write-Host "Dados do pedido:"
Write-Host $JsonData

Write-Host "`nEnviando requisição..."

# Configurar os cabeçalhos da requisição
$Headers = @{
    "Content-Type" = "application/json"
    "X-API-KEY" = $ApiKey
}

# Enviar a requisição usando Invoke-WebRequest
try {
    $Response = Invoke-WebRequest -Uri $WebhookUrl -Method POST -Headers $Headers -Body $JsonData -UseBasicParsing
    
    Write-Host "`nResposta recebida:"
    Write-Host "Status: $($Response.StatusCode)"
    Write-Host "Conteúdo:" 
    Write-Host $Response.Content
}
catch {
    Write-Host "`nErro ao enviar requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $StatusCode" -ForegroundColor Red
        
        $Stream = $_.Exception.Response.GetResponseStream()
        $Reader = New-Object System.IO.StreamReader($Stream)
        $ResponseBody = $Reader.ReadToEnd()
        if ($ResponseBody) {
            Write-Host "Resposta do servidor:" -ForegroundColor Red
            Write-Host $ResponseBody -ForegroundColor Red
        }
    }
} 