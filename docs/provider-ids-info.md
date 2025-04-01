# IDs dos Provedores no Sistema

Os provedores são os serviços externos que executam as ações solicitadas pelos usuários, como adicionar likes, seguidores, etc. Para utilizar corretamente os webhooks do n8n e testar os diferentes provedores, você precisa conhecer seus IDs.

## Como Funcionam os IDs dos Provedores

No sistema, cada provedor tem um ID único no formato UUID (um identificador único universal). Este ID é utilizado em todos os pedidos enviados para o webhook do n8n para determinar qual provedor deve processar o pedido.

## Como Obter os IDs dos Provedores

### 1. Através do Banco de Dados

O método mais confiável é consultar diretamente a tabela `providers` no banco de dados:

```sql
SELECT id, name, slug FROM providers WHERE status = true;
```

### 2. Através do Painel Admin

Você também pode visualizar os provedores ativos no painel administrativo em `/admin/servicos_v1`.

### 3. Através do Console da Aplicação

Se você estiver acessando a aplicação, pode inspecionar o console do navegador ao navegar pela interface de serviços. Os IDs dos provedores são frequentemente registrados no console durante a carga dos serviços.

## Estrutura do Provedor no Banco de Dados

Cada provedor no sistema tem os seguintes campos principais:

```typescript
interface Provider {
  id: string;         // UUID do provedor
  name: string;       // Nome do provedor 
  slug: string;       // Identificador amigável (ex: "fama")
  api_url: string;    // URL da API do provedor
  api_key: string;    // Chave de API para autenticação
  status: boolean;    // Se o provedor está ativo
  metadata?: {        // Dados adicionais
    last_check?: string;
    balance?: number;
    currency?: string;
    api_status?: 'online' | 'inactive' | 'error' | 'checking' | 'active';
    api_error?: string;
  };
}
```

## Como Testar Diferentes Provedores

Ao executar os scripts de teste, utilize os IDs dos provedores ativos no seu sistema. Por exemplo:

```bash
# Testando com o Provedor 1
node scripts/test-n8n-webhook.js test --providerId=<ID-DO-PROVEDOR-1>

# Testando com o Provedor 2 
node scripts/test-n8n-webhook.js test --providerId=<ID-DO-PROVEDOR-2>
```

## Relacionamento com Serviços

Cada serviço no sistema está vinculado a um provedor específico através do campo `provider_id`. Quando um usuário seleciona um serviço, o sistema utiliza o `provider_id` associado para determinar qual provedor deve processar o pedido.

## Provedores Padrão

Se os testes não especificarem um provedor, o sistema normalmente utiliza o provedor com o slug "fama" como padrão.

## Importante

Se você estiver testando com um ambiente separado (teste vs. produção), verifique se os mesmos provedores estão configurados em ambos os ambientes para garantir consistência nos resultados. 

## URL de Callback

O callback deve ser enviado para:
```
https://viralizamos.com.br/api/callback/order
```

## Autenticação
Para segurança, você deve incluir o segredo de callback no cabeçalho:

```
X-CALLBACK-SECRET: viraliza_n8n_callback_2024
```

Este é o valor que você configurou na variável de ambiente `API_CALLBACK_SECRET`.

## Formato da Resposta

A resposta deve ser enviada como um JSON com a seguinte estrutura:

```json
{
  "order_id": "f05337e3-1fac-41e5-b01b-df1abd740921-post123",
  "external_order_id": "12345678",
  "status": "processing", 
  "error": null,
  "metadata": {
    "provider_response": "Pedido recebido com sucesso",
    "estimated_time": "24h",
    "provider_name": "Fama"
  }
}
```

### Campos Obrigatórios:
- `order_id`: O mesmo ID recebido na requisição original
- `status`: Estado atual do pedido (valores possíveis: "pending", "processing", "completed", "failed", "cancelled")

### Campos Opcionais:
- `external_order_id`: ID do pedido no sistema do provedor
- `error`: Mensagem de erro (se houver)
- `metadata`: Informações adicionais que você queira armazenar

## Configuração no n8n:

No seu fluxo do n8n, após processar o pedido com o provedor, adicione um nó HTTP Request configurado assim:

1. Método: POST
2. URL: https://viralizamos.com.br/api/callback/order
3. Headers:
   - Content-Type: application/json
   - X-CALLBACK-SECRET: viraliza_n8n_callback_2024
4. Body: O JSON com a estrutura acima

## Ambiente de Teste

Para testes, você pode usar a URL:
```
https://viralizamos.com.br/api/callback/order-test
```

Isso garantirá que as respostas de teste não afetem dados reais.

O sistema Viralizamos está configurado para receber essas respostas e atualizar o status dos pedidos de acordo. 