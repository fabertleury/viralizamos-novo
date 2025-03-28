# Configuração de Cron Jobs para o Sistema de Processamento de Transações

Este documento descreve os cron jobs necessários para manter o sistema de processamento de transações funcionando corretamente.

## Job 1: Limpar Locks Expirados

- **Descrição**: Limpa locks expirados no sistema de processamento, garantindo que transações presas sejam liberadas para reprocessamento.
- **Endpoint**: `POST /api/system/clean-expired-locks`
- **Frequência recomendada**: A cada 10 minutos
- **Cabeçalhos**:
  - `Content-Type: application/json`
  - `x-api-key: ${TRANSACTION_PROCESSING_API_KEY}`
- **Corpo da requisição**:
```json
{
  "statusFilter": ["processing"],
  "dryRun": false
}
```

## Job 2: Processar Transações Pendentes

- **Descrição**: Processa um lote de transações pendentes, útil para garantir que transações pendentes não fiquem presas.
- **Endpoint**: `POST /api/system/process-pending-transactions`
- **Frequência recomendada**: A cada 15 minutos
- **Cabeçalhos**:
  - `Content-Type: application/json`
  - `x-api-key: ${TRANSACTION_PROCESSING_API_KEY}`
- **Corpo da requisição**:
```json
{
  "batchSize": 10,
  "maxAttempts": 3
}
```

## Job 3: Processar Transações com Pagamento Aprovado

- **Descrição**: Processa transações que estão com pagamento aprovado mas ainda não foram enviadas para os provedores.
- **Endpoint**: `POST /api/system/process-approved-transactions`
- **Frequência recomendada**: A cada 20 minutos
- **Cabeçalhos**:
  - `Content-Type: application/json`
  - `x-api-key: ${TRANSACTION_PROCESSING_API_KEY}`
- **Corpo da requisição**:
```json
{
  "batchSize": 5,
  "maxAttempts": 3,
  "dryRun": false
}
```

## Configuração no provedor de Cron (exemplo usando Vercel Cron Jobs)

Para configurar no Vercel, adicione ao arquivo `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/system/clean-expired-locks",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/system/process-pending-transactions",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/system/process-approved-transactions",
      "schedule": "*/20 * * * *"
    }
  ]
}
```

## Configuração usando GitHub Actions (alternativa)

Crie um arquivo `.github/workflows/cron-jobs.yml`:

```yaml
name: Transaction Processing Cron Jobs

on:
  schedule:
    - cron: '*/10 * * * *' # Limpar locks expirados a cada 10 minutos
    - cron: '*/15 * * * *' # Processar transações pendentes a cada 15 minutos
    - cron: '*/20 * * * *' # Processar transações com pagamento aprovado a cada 20 minutos

jobs:
  run-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Limpar locks expirados
        if: github.event.schedule == '*/10 * * * *'
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "x-api-key: ${{ secrets.TRANSACTION_PROCESSING_API_KEY }}" \
            -d '{"statusFilter":["processing"],"dryRun":false}' \
            ${{ secrets.API_BASE_URL }}/api/system/clean-expired-locks
      
      - name: Processar transações pendentes
        if: github.event.schedule == '*/15 * * * *'
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "x-api-key: ${{ secrets.TRANSACTION_PROCESSING_API_KEY }}" \
            -d '{"batchSize":10,"maxAttempts":3}' \
            ${{ secrets.API_BASE_URL }}/api/system/process-pending-transactions
            
      - name: Processar transações com pagamento aprovado
        if: github.event.schedule == '*/20 * * * *'
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "x-api-key: ${{ secrets.TRANSACTION_PROCESSING_API_KEY }}" \
            -d '{"batchSize":5,"maxAttempts":3,"dryRun":false}' \
            ${{ secrets.API_BASE_URL }}/api/system/process-approved-transactions
```

## Monitoramento

Para monitorar o status dos cron jobs, uma recomendação é configurar um dashboard que consulte a API de status do sistema:

```
GET /api/system/transaction-processing?action=status
GET /api/system/transaction-processing?action=health
```

Estas APIs retornam estatísticas detalhadas sobre o sistema de processamento, incluindo transações pendentes, falhas e localizadas. 