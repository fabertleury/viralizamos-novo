'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TesteWebhook() {
  const [paymentId, setPaymentId] = useState('');
  const [format, setFormat] = useState('v2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    status: number;
    statusText: string;
    body: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test/webhook-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          format: format,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao testar webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Teste de Webhook do Mercado Pago</CardTitle>
          <CardDescription>
            Use esta ferramenta para testar o recebimento de webhooks do Mercado Pago localmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_id">ID do Pagamento</Label>
                <Input
                  id="payment_id"
                  placeholder="Ex: 123456789"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato do Webhook</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">WebHook v1.0 (payment.updated)</SelectItem>
                    <SelectItem value="v2">Feed v2.0 (type: payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Testar Webhook'}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  Status: {result.status} {result.statusText}
                </AlertTitle>
                <AlertDescription>
                  {result.success
                    ? 'Webhook processado com sucesso!'
                    : 'Erro ao processar webhook'}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="font-medium mb-2">Resposta:</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-200 dark:bg-gray-900 rounded">
                  {JSON.stringify(result.body, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Nota: Esta ferramenta simula requisições de webhook do Mercado Pago para o seu servidor local.
        </CardFooter>
      </Card>
    </div>
  );
} 