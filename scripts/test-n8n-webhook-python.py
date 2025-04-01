#!/usr/bin/env python3
# Teste do webhook do n8n
#
# Uso:
# pip install requests
# python test-n8n-webhook-python.py [test|production] --providerId=<id-do-provedor>
#
# Exemplo:
# python test-n8n-webhook-python.py test --providerId=a1b2c3d4-5678-90ab-cdef-ghijklmnopqr
#
# Se nenhum providerId for especificado, será usado o provedor padrão ("1")

import sys
import time
import random
import json
import datetime
import requests
import argparse
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configurar o parser de argumentos
parser = argparse.ArgumentParser(description='Teste do webhook do n8n')
parser.add_argument('environment', nargs='?', default='test', choices=['test', 'production'],
                   help='Ambiente para enviar o pedido (test ou production)')
parser.add_argument('--providerId', default='1',
                   help='ID do provedor a ser usado no teste')
args = parser.parse_args()

# URLs do webhook para ambientes de teste e produção
test_webhook_url = os.getenv('N8N_WEBHOOK_URL_TEST', 'https://automacoes.traconegocios.com.br/webhook-test/order')
prod_webhook_url = os.getenv('N8N_WEBHOOK_URL', 'https://n8nwebhook.traconegocios.com.br/webhook/order')

# Determinar qual URL usar com base no ambiente
webhook_url = test_webhook_url if args.environment == 'test' else prod_webhook_url

# API key para autenticação
api_key = os.getenv('N8N_API_KEY', 'n8n_viralizamos_2024')

# Gerar IDs únicos para teste (usando timestamp + número aleatório)
timestamp = int(time.time() * 1000)
random_num = random.randint(1, 10000)
transaction_id = f"test-{timestamp}-{random_num}"
post_id = f"post-{random_num}"
order_id = f"{transaction_id}-{post_id}"

# Dados do pedido
order_data = {
    "order_id": order_id,
    "transaction_id": transaction_id,
    "service_id": "1001",
    "provider_id": args.providerId,  # Usa o providerId fornecido ou o valor padrão
    "external_service_id": "1234",
    "quantity": 1000,
    "target_url": "https://instagram.com/p/ABC123XYZ/",
    "target_username": "usuario_instagram",
    "metadata": {
        "post_id": post_id,
        "post_code": "ABC123XYZ",
        "post_type": "post",
        "service_type": "likes",
        "payment_id": "106707916782",
        "customer_email": "cliente@exemplo.com",
        "customer_name": "Cliente Exemplo"
    },
    "webhook_timestamp": datetime.datetime.now().isoformat()
}

print(f"Enviando pedido para {args.environment.upper()}")
print(f"URL: {webhook_url}")
print(f"Provider ID: {args.providerId}")
print(f"Dados do pedido: {json.dumps(order_data, indent=2)}")

# Enviar o pedido para o webhook
try:
    response = requests.post(
        webhook_url,
        json=order_data,
        headers={
            'Content-Type': 'application/json',
            'X-API-KEY': api_key
        }
    )
    
    # Exibir a resposta
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Resposta: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Erro: {response.text}")
except Exception as e:
    print(f"Erro ao enviar requisição: {str(e)}") 