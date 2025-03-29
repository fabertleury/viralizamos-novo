# Correção do problema de posts não sendo processados na tabela core_transaction_posts_v2

## Problema Identificado

Os posts adicionados na tabela `core_transaction_posts_v2` não estavam sendo marcados como `selected = TRUE`, e o `TransactionProcessor` estava filtrando apenas posts marcados como selecionados, resultando em erro de processamento com a mensagem "Nenhum post selecionado pelo usuário".

## Solução 1: Mudar o Comportamento do TransactionProcessor

A principal mudança foi atualizar o `TransactionProcessor` para considerar todos os posts da tabela `core_transaction_posts_v2` como selecionados, dispensando a verificação do campo `selected`. Esta abordagem se baseia no princípio de que se um post foi adicionado à tabela durante o checkout, ele foi explicitamente escolhido pelo usuário.

### Alterações Realizadas:

- Arquivo: `src/lib/services/payment/TransactionProcessor.ts`
- Alteração: Removida a filtragem por posts marcados como `selected`, considerando agora todos os posts da tabela.
- Benefício: Sistema agora processa todos os posts associados à transação, sem depender do campo `selected`.

## Solução 2: Corrigir Posts Existentes (Opcional)

Para as transações existentes que já têm posts não marcados como selecionados, foi criado um script SQL para atualizar esses registros:

### Script SQL de Correção (fix_selected_posts.sql):

```sql
-- Atualizar todos os posts não marcados para selecionados
UPDATE core_transaction_posts_v2
SET selected = true
WHERE (selected IS NULL OR selected = false)
AND transaction_id IN (
    SELECT id 
    FROM core_transactions_v2 
    WHERE status = 'approved'
);

-- Para uma transação específica
UPDATE core_transaction_posts_v2
SET selected = true
WHERE transaction_id = '4880a4e9-e4d6-49e4-bad6-a7204267cb64';
```

## Manter os Campos Selected em Atualizações Futuras

Embora a verificação não seja mais necessária, continuamos mantendo as atualizações dos campos `selected = true` em:

1. `src/app/api/core/transactions/route.ts`
2. `src/app/checkout/instagram/utils/payment-utils.ts`
3. `src/components/checkout/InstagramPostsReelsStep2.tsx`

Isso mantém consistência nos dados e possibilita voltarmos à verificação de seleção no futuro, se necessário.

## Conclusão

O problema foi resolvido de duas formas complementares:

1. Mudando o `TransactionProcessor` para não exigir o campo `selected`
2. Disponibilizando script SQL para corrigir dados existentes

Estas mudanças garantem que todas as transações aprovadas serão processadas corretamente, independentemente do estado do campo `selected`.

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