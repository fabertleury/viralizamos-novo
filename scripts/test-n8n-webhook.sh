#!/bin/bash
# Script para testar o envio de pedidos para o webhook do n8n usando curl
#
# Como usar:
# 1. Tornar executável: chmod +x test-n8n-webhook.sh
# 2. Executar: ./test-n8n-webhook.sh [test|production]
#    - test: Envia para o ambiente de teste (padrão se não especificado)
#    - production: Envia para o ambiente de produção

# Obter o ambiente a partir dos argumentos da linha de comando
ENV=${1:-test}

# URLs dos webhooks
TEST_URL="https://automacoes.traconegocios.com.br/webhook-test/order"
PROD_URL="https://n8nwebhook.traconegocios.com.br/webhook/order"

# Determinar a URL com base no ambiente
if [ "$ENV" = "production" ]; then
  WEBHOOK_URL=$PROD_URL
  ENV_TEXT="PRODUÇÃO"
else
  WEBHOOK_URL=$TEST_URL
  ENV_TEXT="TESTE"
fi

# Chave de API para autenticação
API_KEY="n8n_viralizamos_2024"

# Gerar IDs únicos para o teste
TIMESTAMP=$(date +%s)
RANDOM_NUM=$((1000 + RANDOM % 9000))
TRANSACTION_ID="test-$TIMESTAMP"
POST_ID="post-$RANDOM_NUM"
POST_CODE="ABC${RANDOM_NUM}XYZ"

# Criar o JSON para envio
JSON_DATA=$(cat <<EOF
{
  "order_id": "${TRANSACTION_ID}-${POST_ID}",
  "transaction_id": "${TRANSACTION_ID}",
  "service_id": "1001",
  "provider_id": "1",
  "external_service_id": "1234",
  "quantity": 1000,
  "target_url": "https://instagram.com/p/${POST_CODE}/",
  "target_username": "usuario_teste",
  "metadata": {
    "post_id": "${POST_ID}",
    "post_code": "${POST_CODE}",
    "post_type": "post",
    "service_type": "likes",
    "payment_id": "payment-${TIMESTAMP}",
    "customer_email": "teste@exemplo.com",
    "customer_name": "Usuário de Teste"
  },
  "webhook_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
)

echo "Enviando requisição de teste para o webhook do n8n (ambiente: $ENV_TEXT)"
echo "URL: $WEBHOOK_URL"
echo "Dados do pedido:"
echo "$JSON_DATA" | jq . 2>/dev/null || echo "$JSON_DATA"

echo -e "\nEnviando requisição..."

# Enviar a requisição usando curl
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d "$JSON_DATA" \
  -v 