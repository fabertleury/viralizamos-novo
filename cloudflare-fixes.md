# Correções para problemas com Cloudflare e Supabase

## Problemas Identificados

1. O Cloudflare pode estar interferindo nas requisições de autenticação entre o frontend e o Supabase
2. Os cookies de sessão podem estar sendo bloqueados ou não transmitidos corretamente
3. Possível problema com CORS ou cabeçalhos HTTP

## Soluções Implementadas

1. **Atualização do Middleware**:
   - Adicionados cabeçalhos para evitar caching
   - Melhorada a configuração do cliente Supabase no middleware
   - Implementado tratamento de erro mais robusto para a obtenção da sessão

2. **Atualização do Cliente Supabase**:
   - Adicionados cabeçalhos específicos para melhorar compatibilidade com Cloudflare
   - Configurações de realtime ajustadas para melhor performance
   - Desabilitado cache para requisições de autenticação

## Configurações do Cloudflare Recomendadas

1. **Regras para Permitir Autenticação Supabase**:
   - Adicione uma Página Rule no Cloudflare para o caminho `/auth/*` com estas configurações:
     - Cache Level: Bypass
     - Disable Security: ON (ou pelo menos desativar WAF, Bot Fight Mode e Challenge)
     - Browser Integrity Check: OFF

2. **Configurações de SSL/TLS**:
   - Certifique-se de que está configurado como "Full" ou "Full (strict)"
   - Verifique se não está usando "Flexible" pois isso pode causar problemas de redirecionamento

3. **Configurações de Cache**:
   - Certifique-se de que o Browser Cache TTL não está bloqueando as tentativas de login

## Como verificar se está funcionando

1. **Logs no Console**:
   - Verifique o console do navegador por erros relacionados a CORS, cookies ou autenticação
   - A mensagem "Erro ao obter sessão" no console do servidor pode indicar problemas contínuos

2. **Teste de Cookies**:
   - Verifique se os cookies `supabase-auth-token` e relacionados estão sendo definidos no navegador

3. **Teste de API direto**:
   - Faça uma requisição direto para o endpoint de autenticação do Supabase para verificar a resposta

## Criação de Administradores

Para criar administradores, acesse a rota `/api/admin/create-admin` usando o seguinte método:

```javascript
fetch('/api/admin/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'email@exemplo.com',
    password: 'senha',
    name: 'Nome'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

Esta rota adiciona o usuário com papel de administrador tanto na tabela auth.users quanto na tabela profiles. 