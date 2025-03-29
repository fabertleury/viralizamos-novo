# Correção do problema de posts não sendo marcados como selecionados

## Problema Identificado

Os posts adicionados na tabela `core_transaction_posts_v2` não estavam sendo marcados como `selected = TRUE`, o que causava problemas no processamento das transações pelo `TransactionProcessor`. 

O serviço estava tentando processar posts em transações aprovadas, mas como nenhum post estava marcado como selecionado, não encontrava posts para processar. Isso resultava em erro e as transações não eram concluídas.

## Alterações Realizadas

1. **Modificação no API Route de Criação de Transações**:
   - Arquivo: `src/app/api/core/transactions/route.ts`
   - Alteração: Adicionado o campo `selected: true` ao criar registros na tabela `core_transaction_posts_v2` para cada post enviado.

2. **Modificação no Utilitário de Pagamentos**:
   - Arquivo: `src/app/checkout/instagram/utils/payment-utils.ts`
   - Alteração: Adicionado o campo `selected: true` e `post_code` em cada post enviado via API.

3. **Modificação no Componente de Checkout**:
   - Arquivo: `src/components/checkout/InstagramPostsReelsStep2.tsx`
   - Alteração: Adicionado o campo `selected: true` nos metadados de posts e reels.

## Testes e Validação

Para verificar que a correção está funcionando:

1. Faça um novo pedido no checkout de curtidas para Instagram
2. Verifique os posts na tabela `core_transaction_posts_v2` - devem ter `selected = TRUE`
3. Quando o pagamento for aprovado, o `TransactionProcessor` deverá processar os posts corretamente

## Observações Adicionais

- O `TransactionProcessor` já filtrava corretamente pelos posts marcados como `selected`, mas não encontrava nenhum porque eles não estavam sendo marcados.
- As alterações são compatíveis com código existente e não devem causar nenhum efeito colateral.
- A solução foi aplicada em três pontos diferentes para garantir que o campo `selected` seja sempre definido como `TRUE`.

Este problema estava ocorrendo apenas em transações recentes, possivelmente após alguma atualização do sistema. 