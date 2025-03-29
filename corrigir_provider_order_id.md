# Correção do Problema de IDs de Ordem não Salvos Corretamente

## Problema Identificado

Ao enviar pedidos ao provedor de serviços, o sistema recebe uma resposta que contém um ID de ordem (geralmente no formato `{ "order": 23501 }`). Este ID precisa ser armazenado nos campos `provider_order_id` e `external_order_id` na tabela `core_orders` para rastreamento e consulta de status.

Identificamos dois problemas principais:
1. A conversão do valor numérico para string não estava sendo tratada adequadamente
2. Em alguns casos, o campo `provider_order_id` não estava sendo atualizado mesmo quando `external_order_id` continha o valor correto

## Solução Implementada

### 1. Melhorias no ProviderOrderService.ts

Modificamos o arquivo `src/lib/core/services/providerOrderService.ts` para:

- Adicionar logs detalhados da resposta do provedor para facilitar a depuração
- Implementar um tratamento robusto para a extração do ID da ordem:
  - Verificação explícita dos campos `order` e `id` na resposta
  - Conversão forçada para string usando `String()`
  - Feedback nos logs sobre a origem exata do ID extraído

### 2. Melhorias no OrderProcessor.ts

No arquivo `src/lib/services/order/OrderProcessor.ts`:

- Adicionamos verificação de tipo para o ID externo recebido
- Implementamos conversão explícita para string quando necessário
- Incluímos logs adicionais mostrando o tipo e valor do ID
- Armazenamos a resposta completa do provedor nos metadados para referência

### 3. Script SQL para Correção de Dados Existentes

Criamos o script `verificar_orders_sem_provider_id.sql` para:

- Identificar ordens que têm `external_order_id` mas não têm `provider_order_id`
- Identificar ordens que têm o ID na estrutura de metadados mas não nos campos principais
- Atualizar `provider_order_id` com o valor correto de diversas fontes possíveis
- Corrigir o status dessas ordens para "processing" quando aplicável

## Como Verificar a Solução

1. Execute o script SQL para corrigir dados existentes
2. Verifique em novas ordens se tanto `provider_order_id` quanto `external_order_id` estão sendo salvos corretamente
3. Observe os logs para confirmar que os IDs estão sendo extraídos e convertidos corretamente

## Impacto da Correção

Com esta solução, o sistema agora:
- Processa corretamente qualquer formato de resposta do provedor (número ou string)
- Garante que ambos `provider_order_id` e `external_order_id` sejam preenchidos
- Mantém um histórico completo da resposta original nos metadados
- Facilita o diagnóstico de problemas com logs detalhados

Isso garante que todas as ordens enviadas ao provedor possam ser rastreadas adequadamente e que o status seja atualizado corretamente durante o ciclo de vida da ordem. 