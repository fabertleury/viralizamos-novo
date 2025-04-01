#!/bin/bash
# Script para testar o webhook do n8n (ambiente de teste)
#
# Uso:
# chmod +x test-webhook-curl.sh
# ./test-webhook-curl.sh
#

# Gerar IDs únicos para teste
TIMESTAMP=$(date +%s)
RANDOM_NUMBER=$((1 + RANDOM % 10000))
TRANSACTION_ID="test-$TIMESTAMP-$RANDOM_NUMBER"
POST_ID="post-$RANDOM_NUMBER"
ORDER_ID="$TRANSACTION_ID-$POST_ID"

# URL do webhook (ambiente de teste)
WEBHOOK_URL="https://automacoes.traconegocios.com.br/webhook-test/order"

# Chave de API
API_KEY="n8n_viralizamos_2024"

# Dados do pedido
JSON_DATA=$(cat <<EOF
{
  "order_id": "$ORDER_ID",
  "transaction_id": "$TRANSACTION_ID",
  "service_id": "1001",
  "provider_id": "1",
  "external_service_id": "1234",
  "quantity": 1000,
  "target_url": "https://instagram.com/p/ABC123XYZ/",
  "target_username": "usuario_instagram",
  "metadata": {
    "post_id": "$POST_ID",
    "post_code": "ABC123XYZ",
    "post_type": "post",
    "service_type": "likes",
    "payment_id": "106707916782",
    "customer_email": "cliente@exemplo.com",
    "customer_name": "Cliente Exemplo"
  },
  "webhook_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"
}
EOF
)

echo "Enviando requisição para o webhook de teste (URL: $WEBHOOK_URL)"
echo "Dados: $JSON_DATA"
echo ""

# Enviar requisição
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d "$JSON_DATA" \
  -v 