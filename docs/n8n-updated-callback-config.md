# Guia de Configuração do Callback do N8N

Devido a problemas com a rota original (`/api/n8n/callback`), criamos uma rota alternativa que deve funcionar corretamente. Siga as instruções abaixo para configurar o N8N com a nova rota de callback.

## Nova URL de Callback

A nova URL para o callback do N8N é:

```
https://viralizamos.com/api/webhook/n8n-callback
```

## Configuração no N8N

1. Abra o nó "HTTP Request" (ou tipo similar) que você está usando para enviar callbacks

2. Configure os parâmetros da seguinte maneira:

   - **URL**: `https://viralizamos.com/api/webhook/n8n-callback`
   - **Método**: `POST`
   - **Autenticação**: `Header Auth`
   - **Nome do cabeçalho**: `X-API-KEY`
   - **Valor do cabeçalho**: `viraliza_n8n_callback_2024` (valor de API_CALLBACK_SECRET no .env)

3. Para o corpo (body) da requisição, use o seguinte formato:

```json
{
  "order_id": "{{$json.order}}",
  "status": "processing",
  "external_order_id": "{{$json.external_order_id}}",
  "message": "Pedido recebido pelo provedor e em processamento",
  "details": {
    "provider": "{{$json.provider_name}}",
    "provider_response": {
      "order_id": "{{$json.external_order_id}}"
    }
  },
  "callback_timestamp": "{{$now.setZone('America/Sao_Paulo').toISO()}}"
}
```

4. **Content-Type**: Certifique-se de definir o cabeçalho `Content-Type` como `application/json`

## Testando a Rota

Você pode testar se a rota está funcionando corretamente acessando:

```
https://viralizamos.com/api/webhook/test
```

Isso deve retornar uma resposta JSON com uma mensagem indicando que a API está funcionando.

## Campos Importantes no Callback

Os campos mais importantes para a atualização correta do pedido são:

1. **order_id**: Identificador do pedido, deve corresponder ao que foi enviado no webhook inicial
2. **status**: Estado atual do pedido (`processing`, `completed`, `error`, ou `cancelled`)
3. **external_order_id**: ID do pedido gerado pelo provedor externo

Quando o N8N envia um callback com esses campos, o sistema:

1. Atualiza o status da transação na tabela `core_transactions_v2`
2. Atualiza o ID externo e status na tabela `core_orders`
3. Registra o callback na tabela `n8n_callbacks`
4. Atualiza o registro na tabela `n8n_order_status`

## Solução de Problemas

Se o callback ainda não estiver funcionando, verifique:

1. Se a URL está correta, incluindo o caminho `/api/webhook/n8n-callback`
2. Se o cabeçalho de autenticação `X-API-KEY` está configurado corretamente
3. Se o formato do JSON está correto, especialmente os campos `order_id` e `status`
4. Se há algum erro nos logs do servidor que possa indicar um problema específico

## Testes Locais

Para testar localmente se o callback está funcionando, você pode usar o seguinte comando curl:

```bash
curl -X POST https://viralizamos.com/api/webhook/n8n-callback \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: viraliza_n8n_callback_2024" \
  -d '{
    "order_id": "test-123456",
    "status": "processing",
    "external_order_id": "provider-789012",
    "message": "Teste de callback",
    "details": {
      "provider": "TestProvider",
      "provider_response": {
        "order_id": "provider-789012"
      }
    }
  }'
``` 