declare module 'mercadopago' {
  interface MercadoPagoConfig {
    setAccessToken(token: string): void;
  }

  interface PaymentCreateRequest {
    transaction_amount: number;
    description: string;
    payment_method_id: string;
    notification_url?: string;
    date_of_expiration?: string;
    payer: {
      email: string;
      first_name: string;
      last_name: string;
    };
    metadata?: Record<string, any>;
  }

  interface PaymentCreateResponse {
    body: {
      id: number;
      status: string;
      point_of_interaction: {
        transaction_data: {
          qr_code: string;
          qr_code_base64?: string;
        };
      };
      [key: string]: any;
    };
    response: any;
    status: number;
  }

  interface MercadoPagoPaymentAPI {
    create(data: PaymentCreateRequest): Promise<PaymentCreateResponse>;
    get(paymentId: string): Promise<any>;
    update(data: { id: string | number; status: string }): Promise<any>;
  }

  const configurations: MercadoPagoConfig;
  const payment: MercadoPagoPaymentAPI;

  export { configurations, payment };
  export default { configurations, payment };
} 