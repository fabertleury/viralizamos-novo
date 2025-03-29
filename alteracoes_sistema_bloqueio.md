# Redução do Tempo de Bloqueio para Pedidos Duplicados

## Problema Identificado

O sistema estava utilizando bloqueios de longa duração (1 ano) para prevenir duplicação de pedidos para o mesmo post e serviço. Isso impedia que clientes pudessem solicitar serviços adicionais para o mesmo post após um período razoável, criando uma limitação desnecessária para o negócio.

## Alterações Implementadas

### 1. Redução do Tempo de Bloqueio para 1 Hora

No arquivo `src/lib/core/services/providerOrderService.ts`:
- Modificamos o método `registerLock` para criar bloqueios com duração de 1 hora em vez de 1 ano
- Atualizamos a mensagem para refletir que o bloqueio é temporário
- Adicionamos metadados para indicar a duração do bloqueio

### 2. Melhoria na Verificação de Bloqueios

No arquivo `src/lib/services/order/OrderProcessor.ts`:
- Melhoramos o método `isOrderLocked` para verificar explicitamente a data de expiração
- Adicionamos um filtro para considerar apenas bloqueios não expirados
- Incluímos logs detalhados mostrando quanto tempo resta para o bloqueio expirar

### 3. Scripts para Atualização de Dados Existentes

Criamos dois scripts SQL para atualizar o banco de dados:

**atualizar_bloqueios_existentes.sql**:
- Identifica bloqueios de longa duração existentes
- Atualiza todos para expirarem em 1 hora a partir do momento atual
- Atualiza os metadados para refletir a mudança

**reduzir_bloqueio_para_pedido_especifico.sql**:
- Atualiza o bloqueio específico para o post `DHCBx-iJjA8` 
- Reduz o tempo de expiração para 1 minuto, permitindo novo pedido quase imediatamente
- Inclui verificação de pedidos relacionados

## Impacto das Alterações

Estas alterações permitem:

1. **Melhor experiência para clientes**: Os clientes podem solicitar serviços adicionais para o mesmo post após 1 hora
2. **Flexibilidade operacional**: Operadores podem reduzir manualmente bloqueios específicos quando necessário
3. **Prevenção de erros**: O sistema continua protegido contra duplicações acidentais em curto prazo
4. **Visibilidade**: Logs melhorados mostram claramente status e tempo restante de bloqueios

## Como Verificar a Solução

1. Execute o script `atualizar_bloqueios_existentes.sql` para atualizar todos os bloqueios existentes
2. Para casos urgentes, use `reduzir_bloqueio_para_pedido_especifico.sql` para um post específico
3. Monitore logs para confirmar que novos bloqueios estão sendo criados com duração de 1 hora
4. Verifique se pedidos para o mesmo post podem ser criados após o tempo de bloqueio expirar

## Recomendações Futuras

- Considerar adicionar uma opção de configuração para o tempo de bloqueio no painel administrativo
- Implementar uma funcionalidade para liberar bloqueios específicos através da interface do usuário
- Adicionar uma verificação de duplicação baseada em "janela de tempo" mais inteligente 