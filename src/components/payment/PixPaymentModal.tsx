'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  selectedPosts: any[];
  orderData: any;
}

export default function PixPaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  orderId, 
  selectedPosts,
  orderData 
}: PixPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const generatePixQRCode = async () => {
    try {
      setLoading(true);

      // Gerar QR Code do PIX
      const response = await fetch('/api/core/payment/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description: `Pedido #${orderId}`,
          service: orderData.service,
          user_id: orderData.user_id,
          profile: orderData.profile,
          customer: orderData.contact,
          posts: selectedPosts.map(post => ({
            id: post.id,
            shortcode: post.shortcode || post.code,
            display_url: post.display_url,
            caption: post.caption
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code');
      }

      const pixData = await response.json();
      setQrCodeData(pixData.qr_code);
      setTransactionId(pixData.id);

      toast.success('QR Code PIX gerado com sucesso!');

      // Redirecionar para a página de sucesso após 2 segundos
      setTimeout(() => {
        router.push(`/checkout/instagram/curtidas/success?transaction_id=${pixData.id}`);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      as="div" 
      className="relative z-50" 
      onClose={() => {}}
      open={isOpen}
    >
      <div className="fixed inset-0 bg-black/50" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              Pagamento via PIX
            </Dialog.Title>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-4">
              Valor a pagar:{' '}
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(amount)}
              </span>
            </p>

            {qrCodeData ? (
              <div className="flex flex-col items-center space-y-4">
                <QRCodeCanvas value={qrCodeData} size={200} />
                <p className="text-sm text-gray-500 text-center">
                  Escaneie o QR Code acima com o seu aplicativo do banco.<br />
                  Você será redirecionado após o pagamento.
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Aguardando pagamento...</span>
                </div>
              </div>
            ) : (
              <Button
                onClick={generatePixQRCode}
                disabled={loading}
                className="w-full"
                variant={loading ? "outline" : "default"}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </div>
                ) : (
                  'Gerar QR Code PIX'
                )}
              </Button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
