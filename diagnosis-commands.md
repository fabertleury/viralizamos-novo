# Diagnóstico de Duplicação de Pedidos

Este documento contém instruções para diagnosticar problemas de duplicação de pedidos na aplicação Viralizai.

## Análise dos Logs no Railway

Para acessar os logs no Railway, recomendamos utilizar a interface web:

1. Acesse [https://railway.app](https://railway.app) e faça login
2. Navegue até o projeto "viralizai"
3. Selecione o serviço "viralizamos.com"
4. Clique na aba "Logs"
5. Use o filtro para encontrar logs relevantes, por exemplo:
   - `@deployment:9555b352-ad87-4511-9eca-5078d8e095f8`
   - `[OrderProcessor]`

## Console de Diagnóstico

Durante a execução do checkout, abra o Console do navegador (F12) e busque pelos seguintes logs:

1. Logs com prefixo `[OrderProcessor]` que mostram o processamento de pedidos
2. Verifique a distribuição de quantidades:
   ```
   [OrderProcessor] Quantidade original: 100, Quantidade base: 50, Resto: 0
   [OrderProcessor] Distribuição por post: [50, 50]
   ```
3. Identifique possíveis duplicações:
   ```
   [OrderProcessor] Processando post 1/2: {objeto do post}
   [OrderProcessor] Processando post 2/2: {objeto do post}
   ```

## Verificações no Banco de Dados

Para verificar duplicações no banco de dados, execute as seguintes consultas no SQL Editor do Supabase:

```sql
-- Encontrar transações recentes
SELECT id, created_at, status, user_id 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Encontrar pedidos para uma transação específica
SELECT id, created_at, target_link, quantity, status 
FROM orders 
WHERE transaction_id = 'ID_DA_TRANSACAO' 
ORDER BY created_at ASC;

-- Verificar pedidos duplicados (mesmo link na mesma transação)
SELECT transaction_id, target_link, COUNT(*) as count
FROM orders
GROUP BY transaction_id, target_link
HAVING COUNT(*) > 1
ORDER BY transaction_id, count DESC;
```

## Correções Implementadas Recentemente

1. **Distribuição com resto**: Implementamos uma lógica de distribuição que lida corretamente com o resto quando a quantidade não é divisível igualmente. Ex: 101 curtidas para 2 posts = 51 para o primeiro, 50 para o segundo.

2. **Deduplicação robusta**: Os métodos `processLikesOrder` e `processReelsOrder` agora verificam duplicações com base no código do post/reel, não apenas no link formatado.

3. **Verificação de pedidos existentes**: Antes de enviar um novo pedido, verificamos se já existe um pedido com o mesmo link para a mesma transação.

## Próximos Passos para Resolução

Se ainda ocorrerem duplicações, considere:

1. Implementar um mecanismo de trava (lock) na transação durante o processamento
2. Adicionar um mecanismo de idempotência baseado em ID único para cada pedido
3. Implementar um log transacional que registre cada etapa do processamento
4. Verificar race conditions que podem causar múltiplos processamentos da mesma transação 