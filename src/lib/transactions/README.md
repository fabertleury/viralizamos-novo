# Módulo de Processamento de Transações

Este módulo foi refatorado para melhorar a organização, legibilidade e manutenibilidade do código.

## Estrutura

```
transactions/
├── transactionProcessor.ts      # Arquivo principal com as funções exportadas
├── README.md                    # Esta documentação
└── modules/                     # Módulos específicos
    ├── types.ts                 # Tipos e interfaces
    ├── customerManager.ts       # Gerenciamento de clientes
    ├── providerManager.ts       # Gerenciamento de provedores
    ├── linkFormatter.ts         # Formatação de links
    ├── orderProcessor.ts        # Processamento de pedidos
    ├── orderStatusManager.ts    # Gerenciamento de status de pedidos
    └── errorHandler.ts          # Tratamento de erros
```

## Principais Componentes

### transactionProcessor.ts
Arquivo principal que exporta as funções públicas e coordena o fluxo de processamento.

### Módulos

#### types.ts
Define interfaces e tipos utilizados em todo o módulo, melhorando a tipagem e documentação do código.

#### customerManager.ts
Responsável por verificar a existência de clientes e criar novos quando necessário.

#### providerManager.ts
Gerencia a obtenção e validação de provedores para as transações.

#### linkFormatter.ts
Formata links do Instagram para o formato esperado pelos provedores.

#### orderProcessor.ts
Processa pedidos para diferentes tipos de serviços (curtidas, seguidores, etc.).

#### orderStatusManager.ts
Gerencia a verificação e atualização de status de pedidos.

#### errorHandler.ts
Trata erros durante o processamento de transações e pedidos.

## Melhorias Implementadas

1. **Modularização**: Código dividido em módulos menores e mais específicos.
2. **Tipagem**: Interfaces e tipos bem definidos para melhorar a segurança do código.
3. **Redução de duplicação**: Funções comuns extraídas para módulos reutilizáveis.
4. **Tratamento de erros**: Sistema de tratamento de erros mais robusto.
5. **Logs**: Logs detalhados para facilitar a depuração.
6. **Formatação de links**: Formatação consistente de links do Instagram.

## Como Usar

```typescript
import { processTransaction, checkOrderStatus, updateOrderStatus } from '@/lib/transactions/transactionProcessor';

// Processar uma transação
const orders = await processTransaction('transaction-id');

// Verificar o status de um pedido
const status = await checkOrderStatus('order-id', 'provider-id');

// Atualizar o status de um pedido
const updatedOrder = await updateOrderStatus('order-id', 'completed');
```
