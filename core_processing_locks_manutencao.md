# Manutenção da Tabela core_processing_locks

Este documento descreve as alterações feitas na tabela `core_processing_locks` para corrigir problemas de estrutura e garantir o correto funcionamento do sistema de bloqueio de processamento.

## Problema Encontrado

A tabela `core_processing_locks` possuía uma restrição única na coluna `transaction_id`, o que impedia o correto funcionamento do sistema quando vários posts de uma mesma transação precisavam ser processados separadamente.

## Alterações Realizadas

1. **Remoção da Restrição Única em `transaction_id`**
   - Removemos a restrição única na coluna `transaction_id` para permitir que múltiplos posts de uma mesma transação possam ser processados individualmente
   - Mantivemos o índice não único nesta coluna para garantir bom desempenho nas consultas

2. **Uso de `lock_key` como Identificador Único**
   - Confirmamos que a coluna `lock_key` está usando o formato `post_{post_code}_service_{service_id}`
   - Mantivemos o índice único na coluna `lock_key` para evitar processamento duplicado do mesmo post+serviço
   - Atualizamos o código para usar este padrão consistentemente

3. **Estrutura Final da Tabela**
   - A tabela possui as seguintes colunas principais:
     - `id`: Identificador único do registro (UUID)
     - `transaction_id`: ID da transação (UUID, não único)
     - `lock_key`: Chave única que identifica o post+serviço (TEXT, único)
     - `locked_by`: Identificador do processo que criou o bloqueio
     - `locked_at`: Data/hora em que o bloqueio foi criado
     - `order_id`: ID do pedido associado ao bloqueio
     - `expires_at`: Data/hora em que o bloqueio expira
     - `metadata`: Dados adicionais em formato JSONB, incluindo post_code e service_id

## Scripts de Manutenção

Os seguintes scripts foram criados para auxiliar na manutenção da tabela:

1. **fix_core_processing_locks_constraints.sql**
   - Remove a restrição única da coluna `transaction_id`
   - Mantém índices apropriados para performance

2. **verify_core_processing_locks.sql**
   - Verifica a estrutura da tabela e cria índices necessários
   - Exibe estatísticas gerais e identifica potenciais problemas

3. **fix_inconsistent_locks.sql**
   - Corrige locks sem `lock_key` definida
   - Identifica locks com formato inconsistente
   - Detecta locks duplicados ou com metadata incompleta

4. **cleanup_expired_locks.sql**
   - Identifica e remove locks expirados
   - Faz backup dos registros removidos (opcional)

5. **create_test_lock.sql**
   - Cria locks de teste para verificar o funcionamento correto
   - Testa as restrições de unicidade

## Código Atualizado

As seguintes alterações foram feitas no código:

1. **OrderProcessor.ts**
   - Atualizado para usar corretamente o formato padronizado de `lock_key`
   - Adaptado para usar a estrutura atual da tabela, incluindo `transaction_id`

2. **providerOrderService.ts**
   - Atualizado o método `registerLock` para usar a estrutura correta da tabela
   - Corrigido o método `verifyDuplicateOrder` para verificar locks de maneira adequada

## Recomendações

1. **Verificações Periódicas**
   - Execute o script `verify_core_processing_locks.sql` periodicamente para identificar problemas
   - Monitore o crescimento da tabela com o tempo

2. **Limpeza de Locks Expirados**
   - Execute o script `cleanup_expired_locks.sql` periodicamente para remover locks expirados
   - Considere implementar um job automatizado para esta tarefa

3. **Evitar Duplicidade**
   - O código deve sempre verificar se existe um lock antes de processar um pedido
   - Use o formato padronizado `post_{post_code}_service_{service_id}` para criar locks 