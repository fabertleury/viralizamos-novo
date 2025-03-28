# Guia de Diagnóstico do Sistema

Este documento contém instruções para utilizar as ferramentas de diagnóstico do sistema de processamento de transações.

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Verificação de Transação | `npm run test:process-transaction <transaction_id>` | Processa uma transação específica |
| Processamento em Lote | `npm run test:process-batch` | Processa todas as transações pendentes |
| Formatação de Links | `npm run test:link-formatter [link] [providerId]` | Testa a formatação de links para provedores |
| Simulação de Requisições | `npm run test:provider-request <transaction_id> [dry_run]` | Simula envio de requisições aos provedores |
| Verificação de Duplicações | `npm run check:duplicate-orders [days_to_check]` | Verifica pedidos duplicados no banco de dados |
| Monitoramento do Sistema | `npm run monitor:system [interval_minutes]` | Monitora o sistema em intervalos regulares |

## Detalhes de Uso

### Processamento de Transações

Para testar o processamento de uma transação específica:

```bash
npm run test:process-transaction 123e4567-e89b-12d3-a456-426614174000
```

Este comando irá:
1. Carregar a transação específica do banco de dados
2. Executar o fluxo de processamento
3. Atualizar o status da transação conforme necessário

Para processar todas as transações pendentes:

```bash
npm run test:process-batch
```

### Formatação de Links

Para testar a formatação de links:

```bash
# Teste com exemplos predefinidos
npm run test:link-formatter

# Teste com um link específico
npm run test:link-formatter https://www.instagram.com/p/ABC123/ 1
```

Este script verifica se os links estão sendo corretamente formatados para os diferentes provedores.

### Verificação de Requisições ao Provedor

Para testar o envio de requisições a um provedor:

```bash
# Modo de simulação (não envia realmente ao provedor)
npm run test:provider-request 123e4567-e89b-12d3-a456-426614174000 true

# Modo real (envia ao provedor)
npm run test:provider-request 123e4567-e89b-12d3-a456-426614174000
```

Este script permite verificar se:
- Os dados da transação estão corretos
- Os links estão formatados corretamente
- Existe duplicação de pedidos

### Verificação de Pedidos Duplicados

Para verificar se existem pedidos duplicados no banco de dados:

```bash
# Verifica os últimos 7 dias (padrão)
npm run check:duplicate-orders

# Verifica um período específico (em dias)
npm run check:duplicate-orders 30
```

O script irá gerar um relatório detalhado em formato Markdown e CSV na pasta `reports/`.

### Monitoramento do Sistema

Para iniciar o monitoramento contínuo do sistema:

```bash
# Intervalo de 30 minutos (padrão)
npm run monitor:system

# Intervalo personalizado (em minutos)
npm run monitor:system 15
```

O monitoramento verifica:
- Uso de CPU e memória
- Transações pendentes e em processamento
- Locks expirados ou órfãos
- Falhas em callbacks
- Erros recentes

Relatórios são gerados na pasta `reports/monitoring/` a cada verificação.

## Verificação via API

Além dos scripts, é possível verificar o status do sistema via API:

```bash
# Verificar status geral
curl https://viralizai.com/api/system/transaction-processing?key=SUA_API_KEY

# Verificar uma transação específica
curl https://viralizai.com/api/system/transaction-processing?key=SUA_API_KEY&action=check&transaction_id=123e4567-e89b-12d3-a456-426614174000

# Liberar um lock (requer chave de admin)
curl https://viralizai.com/api/system/transaction-processing?key=SUA_API_KEY&action=release&transaction_id=123e4567-e89b-12d3-a456-426614174000&admin_key=CHAVE_ADMIN
```

## Resolução de Problemas Comuns

### Locks Expirados

Se detectar locks expirados:

1. Verifique se a transação está realmente bloqueada:
   ```bash
   npm run test:process-transaction <transaction_id>
   ```

2. Se confirmar que está bloqueada, libere o lock via API:
   ```bash
   curl https://viralizai.com/api/system/transaction-processing?key=SUA_API_KEY&action=release&transaction_id=123e4567-e89b-12d3-a456-426614174000&admin_key=CHAVE_ADMIN
   ```

### Duplicação de Pedidos

Se detectar pedidos duplicados:

1. Verifique o relatório gerado em `reports/`
2. Analise os padrões de duplicação (mesmo link, mesmo provider_order_id)
3. Verifique a lógica de prevenção de duplicação no código

### Erros de Processamento

Se transações ficarem presas em status "processing":

1. Verifique os logs de erro mais recentes:
   ```bash
   npm run monitor:system
   ```

2. Teste o processamento manual da transação:
   ```bash
   npm run test:process-transaction <transaction_id>
   ```

3. Verifique se o link está sendo formatado corretamente:
   ```bash
   npm run test:link-formatter <link> <provider_id>
   ```

## Notas Adicionais

- Os relatórios são salvos em formato Markdown para fácil visualização
- Os dados de duplicação também são exportados em CSV para análise em planilhas
- O monitoramento pode ser deixado rodando em segundo plano em servidores de teste
- Para diagnósticos mais detalhados, combine os resultados de múltiplos scripts 