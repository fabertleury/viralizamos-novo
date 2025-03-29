# Correção do problema de seleção de posts no frontend

## Problema identificado

Os posts estão sendo salvos na tabela `core_transaction_posts_v2` com `selected = FALSE` mesmo quando o usuário os seleciona na interface. Isso causa um problema no sistema de processamento que corretamente filtra apenas os posts marcados como selecionados, mas acaba não encontrando nenhum.

## Solução temporária

Para resolver o problema imediatamente, execute o script SQL `fix_selected_posts.sql` que:
1. Adiciona a coluna `selected` à tabela se ela não existir
2. Marca como `selected = TRUE` os posts da transação específica

Esta é uma solução paliativa para permitir o processamento imediato da transação.

## Solução permanente

Para resolver o problema definitivamente, é necessário corrigir o frontend para garantir que os posts sejam salvos com `selected = TRUE` quando o usuário os seleciona:

1. **Identificar o componente que lida com seleção de posts**:
   - Verifique o componente React/Vue/Angular que gerencia a seleção de posts
   - Normalmente está em arquivos como `PostSelector.jsx`, `PostSelection.tsx` ou similar

2. **Verificar como o valor do campo `selected` está sendo definido**:
   - O problema provavelmente está no envio dos dados para a API
   - Talvez o valor não esteja sendo convertido corretamente para boolean
   - Ou talvez a propriedade `selected` não esteja sendo incluída nos dados enviados

3. **Corrigir o mapeamento na chamada de API**:
   ```javascript
   // Exemplo de código incorreto
   const postsToSave = selectedPosts.map(post => ({
     post_code: post.code,
     post_url: post.url,
     // selected está faltando ou incorreto
   }));
   
   // Código correto
   const postsToSave = selectedPosts.map(post => ({
     post_code: post.code,
     post_url: post.url,
     selected: true // Explicitamente definir como true
   }));
   ```

4. **Verificar o endpoint da API que recebe os dados**:
   - Certifique-se de que o backend está tratando corretamente o campo `selected`
   - Pode ser necessário ajustar o parsing/validação no controlador da API

5. **Adicionar logs para depuração**:
   - No frontend, adicione logs antes do envio da API:
     ```javascript
     console.log('Posts sendo enviados:', postsToSave);
     ```
   - No backend, adicione logs no controlador que recebe os dados:
     ```typescript
     console.log('Posts recebidos na API:', request.body.posts);
     ```

## Verificação da correção

Após aplicar a correção no frontend:

1. Teste o fluxo de seleção de posts manualmente
2. Verifique no banco de dados se os posts estão sendo salvos com `selected = TRUE`
3. Confirme que as transações estão sendo processadas automaticamente sem necessidade de intervenção manual

## Mitigação para o período de transição

Até que a correção seja implementada, você pode criar um job para corrigir automaticamente os posts:

```sql
-- Job para executar periodicamente
UPDATE public.core_transaction_posts_v2
SET 
    selected = TRUE
WHERE 
    transaction_id IN (
        SELECT id 
        FROM public.core_transactions_v2 
        WHERE status = 'approved' AND (order_created IS NULL OR order_created = FALSE)
    )
    AND (selected IS NULL OR selected = FALSE);
```

Este job pode ser executado a cada hora ou conforme necessário para garantir que todos os posts sejam processados corretamente. 