# Correção dos Erros na Tela de Monitoramento

Este guia descreve como resolver os erros na tela de monitoramento relacionados às tabelas de admin_notifications e fila de pedidos.

## Problema

O sistema apresenta os seguintes erros na tela de monitoramento:

1. Erro 400 ao tentar carregar pedidos (core_orders)
2. Erro 404 ao tentar acessar notificações de pedidos duplicados (admin_notifications)
3. Erro 404 na função RPC admin_get_order_queue

## Solução

A solução envolve a criação das tabelas necessárias com o Prisma e a aplicação de uma função SQL personalizada.

### Passo 1: Verificar as atualizações do Schema do Prisma

Foi adicionado ao arquivo `prisma/schema.prisma`:

1. Modelo `AdminNotifications` para gerenciar as notificações administrativas
2. Modelo `OrderQueue` para gerenciar a fila de pedidos no painel

### Passo 2: Aplicar as migrações

Execute os seguintes comandos para aplicar as migrações:

```bash
# Gerar a migração
npm run db:migrate

# Gerar os tipos do Prisma Client
npm run db:generate

# Aplicar as funções administrativas personalizadas
npm run db:apply-admin-functions
```

### Passo 3: Verificar a aplicação

Após aplicar as migrações e funções, verifique se os erros foram resolvidos acessando o painel de monitoramento.

## Detalhes Técnicos

### Tabelas Criadas

1. `admin_notifications` - Armazena notificações para o painel administrativo
2. `order_queue` - Gerencia a fila de pedidos para processamento

### Função SQL Criada

`admin_get_order_queue` - Função RPC que obtém a fila de pedidos com paginação e filtros.

## Suporte

Se os problemas persistirem após aplicar estas correções, verifique:

1. Se as migrações foram aplicadas corretamente
2. Se as permissões do banco de dados estão configuradas corretamente
3. Os logs para identificar outros possíveis erros 