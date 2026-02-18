/**
 * Payment Types
 * Types for payment gateway integration
 */

/**
 * Payment Gateway Providers
 */
export type PaymentGateway = 'paystack' | 'flutterwave';

/**
 * Payment Status
 */
export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'ABANDONED';

/**
 * Payment Method Type
 */
export type PaymentMethodType = 'card' | 'bank' | 'ussd' | 'bank_transfer' | 'qr';

/**
 * Payment Intent (for wallet funding)
 */
export interface PaymentIntent {
  reference: string;
  amount: string;
  currency: string;
  payment_gateway: PaymentGateway;
  payment_url?: string;
  authorization_url?: string;
  access_code?: string;
  status: PaymentStatus;
  created_at: string;
}

/**
 * Payment Verification Request
 */
export interface PaymentVerificationRequest {
  reference: string;
  payment_gateway: PaymentGateway;
}

/**
 * Payment Verification Response
 */
export interface PaymentVerificationResponse {
  success: boolean;
  reference: string;
  amount: string;
  status: PaymentStatus;
  payment_gateway: PaymentGateway;
  wallet_credited: boolean;
  wallet_transaction_reference?: string;
  message: string;
}

/**
 * Paystack Payment Data
 */
export interface PaystackPaymentData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

/**
 * Flutterwave Payment Data
 */
export interface FlutterwavePaymentData {
  link: string;
  reference: string;
}

/**
 * Payment Webhook Payload
 */
export interface PaymentWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at?: string;
    customer?: {
      email: string;
    };
    metadata?: Record<string, any>;
  };
}

/**
 * Payment State (for Context/Redux)
 */
export interface PaymentState {
  currentPayment: PaymentIntent | null;
  paymentHistory: PaymentIntent[];
  isProcessing: boolean;
  error: string | null;
}

/**
 * Payment Context Type
 */
export interface PaymentContextType extends PaymentState {
  initiatePayment: (amount: number, gateway: PaymentGateway) => Promise<PaymentIntent>;
  verifyPayment: (reference: string, gateway: PaymentGateway) => Promise<PaymentVerificationResponse>;
  fetchPaymentHistory: () => Promise<void>;
  clearError: () => void;
}

/**
 * Payment Card Details (for tokenization)
 */
export interface PaymentCardDetails {
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  card_holder_name: string;
}

/**
 * Bank Details (for bank transfer)
 */
export interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

/**
 * Payment Callback
 */
export interface PaymentCallback {
  onSuccess: (response: PaymentVerificationResponse) => void;
  onError: (error: string) => void;
  onClose?: () => void;
}