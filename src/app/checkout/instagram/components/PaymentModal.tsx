'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PaymentStatusChecker } from './PaymentStatusChecker';
import Image from "next/image";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  qrCodeText: string;
}

export function PaymentModal({ isOpen, onClose, qrCode, qrCodeText }: PaymentModalProps) {
  const router = useRouter();
  const [paymentApproved, setPaymentApproved] = useState(false);

  const handleCopyQRCode = () => {
    navigator.clipboard.writeText(qrCodeText);
    toast.success('Código Pix copiado!');
  };

  const handlePaymentSuccess = () => {
    setPaymentApproved(true);
    setTimeout(() => {
      router.push('/acompanhar-pedido');
    }, 2000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via Pix</DialogTitle>
          </DialogHeader>
          
          {!paymentApproved ? (
            <div className="flex flex-col items-center space-y-6 py-4">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={qrCode}
                  alt="QR Code Pix"
                  className="w-64 h-64"
                />
              </div>

              {/* Código Pix */}
              <div className="w-full">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 p-3 rounded-lg flex-1 text-sm break-all">
                    {qrCodeText}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyQRCode}
                    title="Copiar código Pix"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Abra o app do seu banco e escaneie o QR Code</p>
                <p>ou copie o código Pix para fazer o pagamento</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-green-600">Pagamento Aprovado!</h2>
              <p className="text-gray-600">Redirecionando para acompanhamento do pedido...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Adicionar lógica de verificação de pagamento */}
      <PaymentStatusChecker 
        onPaymentApproved={handlePaymentSuccess}
      />
    </>
  );
}
