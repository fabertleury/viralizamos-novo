# Scripts de Manutenção

Este diretório contém scripts para manutenção e administração do sistema.

## clean_transactions.sql

Este script SQL permite limpar transações do banco de dados, lidando automaticamente com as restrições de chave estrangeira.

### O que o script faz

1. Modifica a restrição de chave estrangeira `orders_transaction_id_fkey` para adicionar o comportamento `ON DELETE CASCADE`
2. Permite excluir transações específicas ou em lote com base em diferentes critérios
3. Garante que todos os registros relacionados nas tabelas dependentes sejam excluídos automaticamente

### Como usar

1. Abra o arquivo `clean_transactions.sql` em um editor de texto
2. Descomente a opção de exclusão desejada (há 4 opções diferentes no script)
3. Execute o script no seu cliente SQL (pgAdmin, DBeaver, etc.) conectado ao banco de dados Supabase

### Opções de exclusão

O script oferece quatro opções de exclusão:

1. **Excluir transações específicas por ID**
   ```sql
   DELETE FROM transactions WHERE id IN ('id1', 'id2', 'id3');
   ```

2. **Excluir transações com base em critérios de data**
   ```sql
   DELETE FROM transactions WHERE created_at < NOW() - INTERVAL '30 days';
   ```

3. **Excluir transações com status específico**
   ```sql
   DELETE FROM transactions WHERE status = 'failed';
   ```

4. **Excluir todas as transações**
   ```sql
   DELETE FROM transactions;
   ```

### Reverter as alterações

Se você precisar reverter a alteração da restrição de chave estrangeira, execute o código comentado no final do script:

```sql
BEGIN;
ALTER TABLE orders DROP CONSTRAINT orders_transaction_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_transaction_id_fkey
    FOREIGN KEY (transaction_id)
    REFERENCES transactions (id);
COMMIT;
```

### Observações importantes

- **Faça backup do banco de dados antes de executar este script**
- A exclusão de transações é permanente e não pode ser desfeita
- Todas as ordens associadas às transações excluídas também serão excluídas devido ao comportamento `ON DELETE CASCADE`
