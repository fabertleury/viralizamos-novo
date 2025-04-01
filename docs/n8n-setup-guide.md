# Guia de Configuração do n8n para a Viralizamos

Este guia explica como configurar o n8n para processar pedidos do sistema Viralizamos.

## Pré-requisitos

1. Servidor n8n instalado (pode ser na nuvem ou localmente)
2. Acesso às APIs dos provedores

## Passos para Configuração

### 1. Instalar o n8n

Você pode instalar o n8n de várias formas:

- **Docker**: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`
- **NPM**: `npm install n8n -g && n8n start`
- **Hospedagem**: Use serviços como n8n Cloud, Digital Ocean, etc.

### 2. Configurar Variáveis de Ambiente

No n8n, configure as seguintes variáveis de ambiente:

- `PROVEDOR1_API_KEY`: Chave API para o Provedor 1
- `PROVEDOR2_API_KEY`: Chave API para o Provedor 2
- `PROVEDOR3_API_KEY`: Chave API para o Provedor 3
- `SUPABASE_CREDENTIALS_NAME`: Nome das credenciais do Supabase no n8n
- `API_CALLBACK_URL`: URL base da API da Viralizamos (ex: https://viralizamos.com.br)
- `API_CALLBACK_SECRET`: Chave secreta para autenticação de callbacks

### 3. Configurar Credenciais do Supabase

1. No n8n, vá para **Configurações > Credenciais**
2. Clique em **Adicionar**
3. Selecione **Supabase**
4. Preencha as informações:
   - Nome: `Supabase Viralizamos`
   - Host: URL do Supabase (ex: https://xxxxxxxxxxxx.supabase.co)
   - Service Role Key: Chave secreta do Supabase

### 4. Importar o Fluxo

1. No n8n, vá para **Fluxos de Trabalho**
2. Clique em **Importar de Arquivo**
3. Selecione o arquivo `providers-flow.json`
4. Clique em **Importar**

### 5. Ativar o Fluxo

1. Abra o fluxo importado
2. Clique no nó **Webhook - Receber Pedido**
3. Copie a URL do webhook (ex: https://seu-n8n.com/webhook/xxx)
4. Ative o fluxo clicando em **Ativar**

### 6. Configurar a API da Viralizamos

No arquivo .env da sua aplicação, adicione:

```
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/xxx
N8N_API_KEY=sua_chave_secreta
API_CALLBACK_SECRET=mesma_chave_configurada_no_n8n
```

## Como Funciona o Fluxo

1. A aplicação Viralizamos envia dados do pedido para o webhook do n8n
2. O n8n identifica o provedor correto com base no `provider_id`
3. O n8n envia o pedido para o provedor com os parâmetros específicos
4. O n8n processa a resposta do provedor
5. O n8n atualiza o status do pedido no banco de dados Supabase
6. O n8n notifica a aplicação sobre o resultado via callback

## Personalização

Para adicionar novos provedores:

1. Duplique um dos nós "Provedor?" existentes
2. Ajuste o `provider_id` para o novo provedor
3. Crie um novo nó HTTP para a API do novo provedor
4. Configure os cabeçalhos e parâmetros específicos
5. Conecte o fluxo corretamente

## Solução de Problemas

- **Webhook não recebe dados**: Verifique se a URL está correta e o fluxo está ativo
- **Erro de autenticação**: Verifique as chaves de API nos provedores
- **Callback não funciona**: Verifique se a URL de callback está acessível e se o segredo está correto
- **Pedidos não são atualizados**: Verifique se as credenciais do Supabase estão corretas

## Logs e Monitoramento

O n8n oferece logs detalhados para cada execução:

1. No n8n, vá para **Execuções**
2. Selecione a execução desejada
3. Veja os dados processados em cada etapa

Para monitoramento em tempo real, configure alertas no n8n ou use o sistema de logs da Viralizamos. 