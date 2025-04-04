# Nova Solução de Pagamento para Viralizamos

Este documento explica como usar a nova solução de pagamento que resolve o problema do React Error #130 que estava ocorrendo durante o redirecionamento para a página de pagamento.

## Problema Resolvido

O React Error #130 ocorre quando tentamos atualizar o estado de um componente React depois que ele já foi desmontado ou durante o processo de renderização. No caso específico dos nossos fluxos de pagamento, estávamos tentando manipular o DOM e redirecionar para outra página durante o ciclo de vida do componente, o que causava conflitos com o React.

## Nova Arquitetura

A nova solução consiste em três componentes principais:

1. **`redirectToPaymentService.ts`** - Função utilitária JavaScript pura para fazer o redirecionamento
2. **`paymentIntegration.ts`** - Módulo completo de integração com o sistema de pagamentos
3. **`PaymentUniversalButton.tsx`** - Componente React reutilizável para qualquer serviço

Esta arquitetura separa claramente as responsabilidades e evita conflitos com o ciclo de vida do React.

## Como Usar

### 1. Importe o componente `PaymentUniversalButton`

```tsx
import PaymentUniversalButton from '@/components/payment/PaymentUniversalButton';
```

### 2. Utilize o botão em qualquer serviço

```tsx
<PaymentUniversalButton
  service={{
    id: service.id,
    name: service.name,
    preco: finalAmount || service.preco,
    quantidade: service.quantidade,
    provider_id: service.provider_id
  }}
  profile={{
    username: profileData.username,
    full_name: profileData.full_name
  }}
  customer={{
    name: formData.name,
    email: formData.email,
    phone: formData.phone
  }}
  items={[...selectedPosts, ...selectedReels]}
  type="curtidas"
  amount={finalAmount}
  appliedCoupon={appliedCoupon}
  disabled={loading || selectedItems.length === 0 || !formData.name || !formData.email || !formData.phone}
  onBeforePayment={async () => {
    // Código opcional a ser executado antes do pagamento
    // Retorne true para continuar ou false para cancelar
    return true;
  }}
  onPaymentSuccess={() => {
    console.log('Pagamento iniciado com sucesso');
  }}
  onPaymentError={(error) => {
    console.error('Erro no pagamento:', error);
  }}
/>
```

## Integração Completa (Exemplo)

```tsx
import { useState } from 'react';
import { toast } from 'sonner';
import PaymentUniversalButton from '@/components/payment/PaymentUniversalButton';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);
  
  // ... resto do componente ...
  
  return (
    <div>
      {/* ... interface do usuário ... */}
      
      <PaymentUniversalButton
        service={service}
        profile={profileData}
        customer={formData}
        items={selectedItems}
        type="curtidas"
        disabled={loading || selectedItems.length === 0 || !formData.name || !formData.email}
        onBeforePayment={async () => {
          try {
            setLoading(true);
            // Lógica adicional se necessário...
            return true;
          } catch (error) {
            toast.error('Erro ao preparar pagamento');
            setLoading(false);
            return false;
          }
        }}
        onPaymentSuccess={() => {
          toast.success('Redirecionando para pagamento...');
        }}
        onPaymentError={(error) => {
          toast.error('Erro ao processar pagamento');
          setLoading(false);
        }}
      />
    </div>
  );
}
```

## Vantagens

1. **Solução para o React Error #130** - Evita conflitos com o ciclo de vida do React
2. **Componente Reutilizável** - O mesmo componente pode ser usado em qualquer serviço
3. **Separação de Responsabilidades** - Interface e lógica de negócio bem separadas
4. **Facilidade de Manutenção** - Mudanças na lógica de pagamento ficam centralizadas
5. **Logs Detalhados** - Facilita a depuração de problemas em produção

## Implementação em Novos Serviços

Para implementar a solução em um novo serviço, substitua o antigo fluxo de pagamento que usa `PaymentPixModal` pelo novo componente `PaymentUniversalButton`. Remova qualquer código relacionado ao redirecionamento direto, mapeando os dados para os formatos esperados pelo novo componente.

## Suporte

Em caso de problemas, verificar os logs do console que são detalhados e indicam cada etapa do processo de pagamento. 