# Processamento de Transações - Documentação Técnica

## Visão Geral
O sistema de processamento de transações gerencia o fluxo de pagamentos, distribuição de likes e interação com provedores externos. Este documento descreve as melhorias implementadas para garantir o processamento correto e confiável das transações.

## Componentes Principais

### 1. OrderProcessor
Responsável pelo processamento de pedidos e distribuição de likes para posts. Principais características:
- Respeita a quantidade específica de likes definida para cada post
- Utiliza um sistema de lock para evitar processamento duplicado
- Gerencia o ciclo de vida completo do pedido desde a criação até o status final

### 2. DatabaseService
Gerencia a interação com o banco de dados para:
- Criar ordens no banco de dados com a quantidade correta de likes
- Rastrear o status das ordens
- Manter o registro de transações e seus detalhes associados

### 3. ProviderService
Comunica-se com provedores externos para:
- Enviar pedidos de likes com a quantidade correta
- Verificar o status de pedidos existentes
- Gerenciar erros e respostas dos provedores

### 4. TransactionLockMaintenance
Novo componente que gerencia a limpeza de locks expirados:
- Remove automaticamente locks expirados para evitar bloqueios permanentes
- Executa periodicamente em segundo plano
- Pode ser acionado manualmente quando necessário

## Melhorias Implementadas

### 1. Correção da Tabela Transaction_Locks
- Substituição do campo `created_at` por `expires_at` para controle mais preciso
- Implementação de limpeza automática de locks expirados
- Adição de trigger SQL para limpeza antes de novas inserções

### 2. Endpoints de Administração
Novos endpoints para diagnóstico e manutenção:

#### Gerenciamento de Locks `/api/admin/locks`
- `GET /api/admin/locks` - Lista todos os locks existentes
- `GET /api/admin/locks?action=clear_expired` - Remove locks expirados
- `GET /api/admin/locks?action=delete&transaction_id=UUID` - Remove um lock específico
- `GET /api/admin/locks?action=view&transaction_id=UUID` - Visualiza detalhes de um lock

#### Manutenção de Serviços `/api/admin/maintenance`
- `GET /api/admin/maintenance` - Status dos serviços de manutenção
- `GET /api/admin/maintenance?action=start&interval=30` - Inicia serviço (intervalo em minutos)
- `GET /api/admin/maintenance?action=stop` - Para serviço de manutenção
- `GET /api/admin/maintenance?action=clean` - Executa limpeza imediata

### 3. Funções SQL de Suporte
- `check_table_exists(table_name)` - Verifica a existência de tabelas
- `clear_expired_transaction_locks()` - Remove locks expirados
- `trigger_clear_expired_locks()` - Trigger para limpeza automática

## Processamento de Webhooks
O processamento de webhooks do MercadoPago foi melhorado para:
- Limpar locks expirados antes do processamento
- Verificar existência de ordens anteriores para a mesma transação
- Retornar ordens existentes quando já processadas
- Utilizar locks com expiração para evitar bloqueios permanentes

## Distribuição de Likes
O sistema agora garante a distribuição correta de likes:
- Respeita a quantidade específica definida para cada post
- Envia a quantidade exata para o provedor
- Rastreia o processamento por post individualmente

## Monitoramento e Logs
- Logs aprimorados para rastrear o processamento de transações
- Endpoint de diagnóstico para verificar o status do sistema
- Relatórios de status dos locks e sua expiração

## Recomendações para Desenvolvimento
1. Sempre utilize o campo `expires_at` ao criar locks de transação
2. Ative o serviço de manutenção em ambientes de produção
3. Monitore regularmente o status dos locks através do endpoint de administração
4. Utilize o endpoint de diagnóstico para verificar problemas de processamento

## Solução de Problemas
Se ocorrerem problemas com o processamento de transações:
1. Verifique locks potencialmente bloqueados: `/api/admin/locks`
2. Limpe locks expirados manualmente: `/api/admin/locks?action=clear_expired`
3. Reinicie o serviço de manutenção: `/api/admin/maintenance?action=start`
4. Verifique os logs para identificar erros específicos 