#!/usr/bin/env python3
"""
Script para testar o envio de pedidos para o webhook do n8n

Como usar:
1. Certifique-se de ter Python e a biblioteca requests instalada
   pip install requests
2. Execute: python test-n8n-webhook.py [test|production]
   - test: Envia para o ambiente de teste (padrão se não especificado)
   - production: Envia para o ambiente de produção
"""

import sys
import time
import random
import json
import datetime
import requests

# Obter o ambiente a partir dos argumentos da linha de comando
env = sys.argv[1] if len(sys.argv) > 1 else 'test'
is_production = env == 'production'

# URLs dos webhooks
webhook_urls = {
    'test': 'https://automacoes.traconegocios.com.br/webhook-test/order',
    'production': 'https://n8nwebhook.traconegocios.com.br/webhook/order'
}

# Chave de API para autenticação
api_key = 'n8n_viralizamos_2024'

# Gerar IDs únicos para o teste
transaction_id = f"test-{int(time.time())}"
post_id = f"post-{random.randint(1000, 9999)}"
post_code = f"ABC{random.randint(1000, 9999)}XYZ"

# Dados do pedido para teste
order_data = {
    "order_id": f"{transaction_id}-{post_id}",
    "transaction_id": transaction_id,
    "service_id": "1001",
    "provider_id": "1",  # Altere para testar diferentes provedores (1, 2, 3)
    "external_service_id": "1234",
    "quantity": 1000,
    "target_url": f"https://instagram.com/p/{post_code}/",
    "target_username": "usuario_teste",
    "metadata": {
        "post_id": post_id,
        "post_code": post_code,
        "post_type": "post",  # Pode ser "post" ou "reel"
        "service_type": "likes",  # Pode ser "likes", "views", "seguidores", etc.
        "payment_id": f"payment-{int(time.time())}",
        "customer_email": "teste@exemplo.com",
        "customer_name": "Usuário de Teste"
    },
    "webhook_timestamp": datetime.datetime.now().isoformat()
}

# Determinar a URL com base no ambiente
webhook_url = webhook_urls['production' if is_production else 'test']

print(f"Enviando requisição de teste para o webhook do n8n (ambiente: {'PRODUÇÃO' if is_production else 'TESTE'})")
print(f"URL: {webhook_url}")
print("Dados do pedido:", json.dumps(order_data, indent=2))

# Enviar a requisição
try:
    response = requests.post(
        webhook_url,
        json=order_data,
        headers={
            'Content-Type': 'application/json',
            'X-API-KEY': api_key
        },
        timeout=30
    )
    
    # Imprimir a resposta
    print("\nResposta recebida:")
    print("Status:", response.status_code)
    try:
        print("Dados:", json.dumps(response.json(), indent=2))
    except:
        print("Corpo da resposta:", response.text)
        
except Exception as e:
    print("\nErro ao enviar requisição:")
    print(f"Erro: {str(e)}") 