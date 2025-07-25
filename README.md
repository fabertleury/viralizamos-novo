# Viralizamos Dev

Projeto de gerenciamento de pagamentos e processamento de pedidos para serviços de mídia social.

## Configuração do Ambiente

### Pré-requisitos:
- Node.js 16+ 
- NPM 7+
- Banco de dados Supabase

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/fabertleury/viralizamos-dev.git
cd viralizamos-dev
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=sua_chave_de_servico
MERCADO_PAGO_ACCESS_TOKEN=seu_token_do_mercado_pago
NEXT_PUBLIC_API_KEY=chave_api_para_endpoints_admin
NEXT_PUBLIC_BASE_URL=url_base_do_seu_site
```

4. Execute as migrações:
Aplique as migrações disponíveis na pasta `supabase/migrations/` para configurar o banco de dados.

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run check-transactions`: Verifica as tabelas de transações
- `npm run simulate-payment`: Simula um pagamento PIX (para testes)
- `npm run process-transaction`: Processa transações pendentes
- `npm run check-orders`: Verifica o status dos pedidos

## Simulando Pagamentos para Teste

Para testar o sistema sem precisar realizar pagamentos reais:

```bash
npm run simulate-payment -- --username nome_usuario_instagram
```

Opções disponíveis:
- `--username`: Nome de usuário do Instagram
- `--serviceId`: ID do serviço no banco de dados
- `--amount`: Valor da transação em reais
- `--userId`: ID do usuário (auth.users.id)
- `--customerId`: ID do cliente (customers.id)

## Processando Transações

Para processar manualmente uma transação:

```bash
npm run process-transaction -- ID_DA_TRANSACAO
```

Ou para processar todas as transações pendentes:

```bash
npm run process-transaction -- --all
```

## Estrutura do Projeto

- `src/app/api/`: Endpoints da API
- `src/lib/core/`: Biblioteca central de processamento
- `src/scripts/`: Scripts utilitários para teste e manutenção
- `supabase/migrations/`: Migrações do banco de dados

## Tabelas Principais

- `core_transactions`: Armazena transações de pagamento
- `core_transaction_posts`: Armazena posts associados às transações
- `core_orders`: Armazena pedidos enviados aos provedores
- `core_processing_logs`: Logs de processamento
- `core_processing_locks`: Controle de processamento concorrente
