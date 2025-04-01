# Guia de Solução de Problemas da Integração com N8N

Este documento apresenta soluções para problemas comuns na integração com o N8N.

## Erro de Autorização ao Testar o Webhook

Se você receber o erro `403 Forbidden` com a mensagem "Authorization data is wrong!" ao testar o webhook, siga estes passos:

1. **Verifique a chave de API**:
   - Confirme se a chave API configurada no arquivo `.env` é a mesma que está configurada no N8N
   - Utilize o script `scripts/test-n8n-webhook.js` para testar com diferentes chaves:
     ```
     node scripts/test-n8n-webhook.js test "chave_api_correta"
     ```

2. **Verifique a URL do webhook**:
   - Confirme se a URL está correta no arquivo `.env`
   - Para o ambiente de teste: `N8N_WEBHOOK_URL_TEST=https://automacoes.traconegocios.com.br/webhook-test/order`
   - Para produção: `N8N_WEBHOOK_URL=https://n8nwebhook.traconegocios.com.br/webhook/order`

3. **Entre em contato com o administrador do N8N**:
   - Peça a chave de API correta para o ambiente que você está testando
   - Confirme se o webhook está ativo e aceita solicitações

## Erros na Estrutura do JSON

Se o webhook aceitar a autenticação, mas retornar um erro sobre a estrutura do JSON, verifique:

1. **Formato do payload**:
   - Compare seu payload com o exemplo em `docs/n8n-webhook-example.json`
   - Confirme se todos os campos obrigatórios estão presentes
   - Verifique se a estrutura dos campos, especialmente `metadata` e `posts`, está correta

2. **Validação de JSON**:
   - Use ferramentas online para validar seu JSON
   - Certifique-se de que não há caracteres inválidos ou problemas de formatação

## O Pedido não é Processado pelo N8N

Se o pedido for aceito pelo webhook (código 200), mas não for processado corretamente:

1. **Verifique os logs**:
   - No N8N, verifique os logs de execução do fluxo de trabalho
   - Na aplicação, verifique a tabela `n8n_order_logs` para erros de processamento

2. **Verifique o fluxo de trabalho no N8N**:
   - Confirme se o trigger do webhook está funcionando
   - Verifique se cada nó do fluxo está processando os dados corretamente
   - Teste o fluxo manualmente com dados de exemplo

3. **Verifique os callbacks**:
   - Confirme se o N8N está configurado para enviar callbacks para sua aplicação
   - Verifique a tabela `n8n_callbacks` para ver se os callbacks estão sendo recebidos

## Chaves de API Incorretas em Banco de Dados

Se você precisar atualizar as chaves de API no banco de dados:

1. **Atualize a chave de API do N8N**:
   ```sql
   -- Defina a nova chave de API
   INSERT INTO system_settings (key, value, description)
   VALUES ('n8n_api_key', 'nova_chave_api', 'Chave de API para integração com o N8N')
   ON CONFLICT (key) DO UPDATE SET value = 'nova_chave_api';
   ```

## Migrações de Banco de Dados

Se você precisar executar as migrações para criar as tabelas necessárias:

1. **Execute o endpoint de migrações**:
   ```
   curl -X POST https://seu-dominio.com/api/sql-migrate -H "X-API-KEY: sua_chave_service_role"
   ```

2. **Ou execute o script SQL diretamente**:
   - Use o arquivo `docs/n8n-migrations.sql` no Supabase Studio ou qualquer cliente SQL

## Testando a Integração

Para testar a integração completa:

1. Crie uma transação de teste
2. Use o endpoint para processar a transação:
   ```
   curl -X POST https://seu-dominio.com/api/n8n/process-transaction \
     -H "Content-Type: application/json" \
     -H "X-API-KEY: viraliza_n8n_callback_2024" \
     -d '{"transaction_id": "uuid-da-transacao", "test_environment": true}'
   ```

3. Verifique os logs na tabela `n8n_order_logs`
4. Confirme se o N8N recebeu e processou o pedido 