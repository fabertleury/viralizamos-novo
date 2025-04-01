# Guia de Configuração da Integração com N8N

Este documento descreve como configurar e utilizar a integração com o N8N para processamento de pedidos.

## Introdução

O N8N é uma plataforma de automação de fluxos de trabalho (workflows) que permite integrar diversos serviços. No contexto do Viralizamos, utilizamos o N8N para gerenciar o processamento de pedidos, enviando-os para os provedores de serviço apropriados e recebendo atualizações de status.

## Requisitos

- Uma instância do N8N configurada e acessível pela internet
- Configuração de ambiente no projeto Viralizamos

## Configuração de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```
# URLs dos webhooks do N8N
N8N_WEBHOOK_URL=https://n8nwebhook.traconegocios.com.br/webhook/order
N8N_WEBHOOK_URL_TEST=https://automacoes.traconegocios.com.br/webhook-test/order

# Chave de API para autenticação
N8N_API_KEY=n8n_viralizamos_2024

# Segredo para callbacks da API
API_CALLBACK_SECRET=viraliza_n8n_callback_2024

# Habilitar integração com N8N
ENABLE_N8N_INTEGRATION=true
```

## Estrutura da Integração

### Componentes Principais

1. **N8NIntegrationService**: Serviço responsável por enviar pedidos para o N8N e processar callbacks.
2. **N8NOrderService**: Serviço responsável por gerenciar pedidos e integrar com a transação.
3. **API de Callback**: Endpoint que recebe notificações do N8N.
4. **API de Processamento**: Endpoints para processar transações manualmente.
5. **Cron Job**: Rota para processamento automático de pedidos pendentes.

### Banco de Dados

A integração utiliza as seguintes tabelas:

- `core_transactions_v2`: Tabela existente, com novas colunas para controle da integração com N8N
- `n8n_order_logs`: Registros de envios de pedidos e respostas do N8N
- `n8n_callbacks`: Registros de callbacks recebidos do N8N
- `n8n_order_status`: Controle de status dos pedidos no N8N

## Fluxo de Trabalho

1. **Criação da Transação**: O usuário seleciona serviços, realiza o pagamento e cria uma transação.
2. **Envio para o N8N**: 
   - Após a confirmação do pagamento, a transação é enviada para o N8N automaticamente.
   - O envio pode ser:
     - Automático por job periódico (`/api/n8n/cron/process-orders`)
     - Manual por API (`/api/n8n/process-transaction`)
3. **Processamento pelo N8N**:
   - O N8N recebe o pedido e o encaminha para o provedor apropriado.
   - O N8N atualiza o status do pedido conforme o processamento avança.
4. **Recebimento de Callbacks**:
   - O N8N envia callbacks para `/api/n8n/callback` para atualizar o status do pedido.
   - O sistema atualiza o status da transação com base nestes callbacks.
5. **Consulta de Status**:
   - O usuário pode consultar o status de seus pedidos.
   - O admin pode verificar o histórico completo do processamento.

## Configuração no N8N

### Criação do Fluxo de Trabalho

1. Crie um novo workflow no N8N.
2. Adicione um nó "Webhook" para receber os pedidos.
3. Configure os seguintes webhooks:
   - Produção: `https://n8nwebhook.traconegocios.com.br/webhook/order`
   - Teste: `https://automacoes.traconegocios.com.br/webhook-test/order`
4. Adicione nós para processamento conforme necessário:
   - Nós para diferentes provedores de serviço
   - Nós para atualizações de status
5. Adicione um nó para enviar callbacks para a API do Viralizamos:
   - URL: `https://seu-dominio.com/api/n8n/callback`
   - Headers: 
     ```
     Content-Type: application/json
     X-API-KEY: viraliza_n8n_callback_2024
     ```
   - Body: 
     ```json
     {
       "order_id": "{{$node["Webhook"].json.order_id}}",
       "status": "completed",
       "external_order_id": "123456",
       "message": "Pedido processado com sucesso"
     }
     ```

## Testes

Para testar a integração:

1. Use os scripts de teste em `scripts/` para enviar pedidos ao webhook de teste.
2. Verifique os logs na tabela `n8n_order_logs`.
3. Inspecione os callbacks recebidos na tabela `n8n_callbacks`.

## Operações Comuns

### Enviar Transação para o N8N

```
POST /api/n8n/process-transaction
Headers:
  Content-Type: application/json
  X-API-KEY: viraliza_n8n_callback_2024
Body:
  {
    "transaction_id": "uuid-da-transacao",
    "test_environment": true
  }
```

### Processar Pedidos Pendentes

```
POST /api/n8n/cron/process-orders
Headers:
  X-API-KEY: viraliza_n8n_callback_2024
```

## Solução de Problemas

1. **Pedido não chega ao N8N**:
   - Verifique a tabela `n8n_order_logs` para erros.
   - Confirme se as variáveis de ambiente estão corretas.
   - Teste a conectividade com o webhook usando os scripts de teste.

2. **Callback não atualiza o status**:
   - Verifique a tabela `n8n_callbacks` para ver se o callback foi recebido.
   - Confira se a chave API_CALLBACK_SECRET está correta. 