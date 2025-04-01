# Guia de Configuração do Callback do n8n para Viralizamos

Este guia explica como configurar o n8n para processar pedidos recebidos do sistema Viralizamos e enviar callbacks com o status de processamento.

## Requisitos

- Acesso ao servidor n8n
- As variáveis de ambiente configuradas no n8n para as chaves de API dos provedores
- Webhook configurado para receber pedidos do Viralizamos

## Estrutura do Fluxo

O fluxo de trabalho completo no n8n consiste em:

1. **Recebimento de Pedidos**: Um webhook que recebe pedidos do sistema Viralizamos
2. **Processamento**: Código que valida e prepara os dados para o provedor específico
3. **Envio para o Provedor**: Requisição HTTP para a API do provedor
4. **Callback para o Viralizamos**: Envio do resultado de volta para o sistema Viralizamos

## Configuração Passo a Passo

### 1. Criar o Webhook de Entrada

1. Adicione um nó **Webhook** no n8n
2. Configure o webhook com:
   - **Método HTTP**: POST
   - **Caminho**: `/webhook/order`
   - **Opções**: Habilite "Aceitar Raw Body" para processar o corpo da requisição corretamente
   - **Modo de Resposta**: Escolha "Responder usando outro nó"

### 2. Validar o Provider ID

1. Adicione um nó **IF** após o webhook
2. Configure a condição: `$json.body.provider_id` não está vazio
3. Isso filtrará as requisições sem um ID de provedor válido

### 3. Preparar o Pedido

1. Adicione um nó **Code** conectado à saída "true" do nó IF
2. Copie o código do arquivo `docs/n8n-workflow-exemplo.json` para este nó
3. Certifique-se de substituir os IDs e chaves de API dos provedores pelos valores reais
4. Este código:
   - Valida os dados recebidos
   - Identifica o provedor correto
   - Mapeia IDs de serviço internos para IDs externos do provedor
   - Prepara o payload para enviar à API do provedor

### 4. Enviar para a API do Provedor

1. Adicione um nó **HTTP Request** após o nó Code
2. Configure-o para enviar o pedido ao provedor:
   - **URL**: `={{ $node["Preparar Pedido"].json["providerInfo"]["apiUrl"] }}/api/order`
   - **Método**: POST
   - **Cabeçalhos**:
     - Content-Type: application/json
     - api-key: `={{ $node["Preparar Pedido"].json["providerInfo"]["apiKey"] }}`
   - **Corpo**: `={{ JSON.stringify($node["Preparar Pedido"].json["providerRequestData"]) }}`
   - **Opções**: Habilite retentativas em caso de falha

### 5. Configurar o Callback para o Viralizamos

1. Adicione um nó **HTTP Request** para o callback após o nó da API do provedor
2. Utilize a seguinte configuração:

```json
{
  "name": "Enviar Callback",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 1,
  "parameters": {
    "authentication": "none",
    "url": "=https://viralizamos.com.br/api/callback/order",
    "method": "POST",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "X-CALLBACK-SECRET",
          "value": "viraliza_n8n_callback_2024"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"order_id\": \"{{ $node[\"Preparar Pedido\"].json[\"orderData\"][\"order_id\"] }}\",\n  \"external_order_id\": \"{{ $node[\"Provedor API\"].json[\"order\"] }}\",\n  \"status\": \"processing\",\n  \"error\": null,\n  \"metadata\": {\n    \"provider_response\": \"{{ $node[\"Provedor API\"].json[\"message\"] }}\",\n    \"estimated_time\": \"24h\",\n    \"provider_name\": \"{{ $node[\"Preparar Pedido\"].json[\"providerInfo\"][\"name\"] }}\",\n    \"processing_details\": \"Pedido enviado com sucesso para o provedor\"\n  }\n}",
    "options": {
      "redirect": {
        "redirect": {
          "followRedirects": true,
          "maxRedirects": 5
        }
      },
      "response": {
        "response": {
          "fullResponse": true,
          "responseFormat": "json"
        }
      },
      "retry": {
        "retry": {
          "maxRetries": 3,
          "retryDelay": 3000,
          "retryOnResponseCodes": [
            500,
            502,
            503,
            504
          ]
        }
      }
    }
  }
}
```

### 6. Responder ao Webhook Original

1. Adicione um nó **Respond to Webhook** após o nó de callback
2. Configure a resposta:
   - **Tipo de Resposta**: JSON
   - **Corpo da Resposta**:
   ```json
   {
     "success": true,
     "message": "Pedido recebido com sucesso",
     "order_id": "{{ $node['Preparar Pedido'].json['orderData']['order_id'] }}"
   }
   ```

## Tratamento de Erros

1. Conecte um nó **Respond to Webhook** à saída "false" do nó IF
2. Configure-o para retornar um erro quando o provider_id for inválido:
   - **Tipo de Resposta**: JSON
   - **Código de Status**: 400
   - **Corpo da Resposta**:
   ```json
   {
     "success": false,
     "message": "Provider ID inválido ou não encontrado",
     "error": "INVALID_PROVIDER"
   }
   ```

## Status do Pedido no Callback

O campo `status` no callback pode ter os seguintes valores:

- `pending`: Pedido recebido mas ainda não processado
- `processing`: Pedido em processamento pelo provedor
- `completed`: Pedido concluído com sucesso
- `failed`: Falha no processamento do pedido
- `cancelled`: Pedido cancelado

## Testes

Para testar o fluxo, utilize os scripts de teste fornecidos:

```bash
# Testando com um provedor específico
node scripts/test-n8n-webhook.js test --providerId=a1b2c3d4-5678-90ab-cdef-ghijklmnopqr

# OU usando o script Python
python scripts/test-n8n-webhook-python.py test --providerId=a1b2c3d4-5678-90ab-cdef-ghijklmnopqr
```

## Importação do Fluxo Completo

Para importar o fluxo de exemplo completo:

1. Acesse seu n8n
2. Navegue até "Workflows" e clique em "Import from File"
3. Selecione o arquivo `docs/n8n-workflow-exemplo.json`
4. Ajuste os IDs dos provedores e as chaves de API no nó "Preparar Pedido"

## Solução de Problemas

Se o callback não estiver funcionando:

1. Verifique os logs do n8n para identificar erros
2. Certifique-se de que a URL de callback está acessível
3. Verifique se o segredo do callback está configurado corretamente
4. Valide o formato do JSON enviado no callback

Para ambientes de teste, utilize a URL:
```
https://viralizamos.com.br/api/callback/order-test
``` 