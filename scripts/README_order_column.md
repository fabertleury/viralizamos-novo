# Instruções para Adicionar a Coluna de Ordenação

Este documento explica como adicionar a coluna `order` à tabela `services` e como atualizar o código para usar essa coluna para ordenação dos serviços.

## Passo 1: Executar o Script SQL

Execute o script `add_order_column.sql` no seu banco de dados Supabase. Você pode fazer isso através da interface do Supabase:

1. Faça login no painel do Supabase
2. Navegue até o SQL Editor
3. Cole o conteúdo do arquivo `add_order_column.sql`
4. Execute o script

## Passo 2: Atualizar o Código

Após adicionar a coluna `order` ao banco de dados, você precisa atualizar o código para usar essa coluna. As seguintes alterações já foram feitas no código:

1. A consulta SQL foi atualizada para ordenar os serviços pela coluna `order`
2. As funções de reordenação (moveServiceUp e moveServiceDown) foram modificadas para atualizar a coluna `order` no banco de dados

## Passo 3: Verificar a Ordenação

Após executar o script e atualizar o código, verifique se a ordenação dos serviços está funcionando corretamente:

1. Acesse a página de serviços em `/admin/servicos_v1`
2. Tente reordenar os serviços usando os botões de seta para cima e para baixo
3. Verifique se a ordem é mantida após recarregar a página

## Solução de Problemas

Se você encontrar algum problema com a ordenação dos serviços, verifique:

1. Se a coluna `order` foi adicionada corretamente à tabela `services`
2. Se os valores iniciais da coluna `order` foram definidos corretamente
3. Se o código está usando a coluna `order` para ordenar os serviços

## Próximos Passos

Depois de implementar a coluna `order`, você pode:

1. Adicionar uma interface de arrastar e soltar para reordenar os serviços
2. Implementar ordenação por categoria ou tipo de serviço
3. Adicionar opções de ordenação para o usuário final
