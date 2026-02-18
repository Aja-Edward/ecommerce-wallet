/**
 * Order Types
 * Types for e-commerce orders and checkout
 */

/**
 * Order Status
 */
export type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'CONFIRMED' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

/**
 * Payment Method
 */
export type PaymentMethod = 'WALLET' | 'CARD' | 'BANK_TRANSFER';

/**
 * Product Interface
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // Decimal as string
  image_url: string;
  stock_quantity: number;
  category: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Order Item Interface
 */
export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unit_price: string; // Price at time of order
  subtotal: string; // quantity * unit_price
}

/**
 * Shipping Address
 */
export interface ShippingAddress {
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

/**
 * Order Interface
 */
export interface Order {
  id: number;
  order_number: string;
  user: number;
  user_email: string;
  items: OrderItem[];
  subtotal: string;
  tax: string;
  shipping_fee: string;
  total_amount: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  notes?: string;
  wallet_transaction_reference?: string; // If paid with wallet
  created_at: string;
  updated_at: string;
  delivered_at?: string;
}

/**
 * Create Order Request
 */
export interface CreateOrderRequest {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  notes?: string;
}

/**
 * Checkout Request
 */
export interface CheckoutRequest extends CreateOrderRequest {
  use_wallet: boolean;
}

/**
 * Checkout Response
 */
export interface CheckoutResponse {
  order: Order;
  wallet_debit_reference?: string;
  message: string;
}

/**
 * Order State (for Context/Redux)
 */
export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Cart Item (temporary, before order creation)
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Order Context Type
 */
export interface OrderContextType extends OrderState {
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  createOrder: (request: CreateOrderRequest) => Promise<Order>;
  checkout: (request: CheckoutRequest) => Promise<CheckoutResponse>;
  cancelOrder: (orderId: number) => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  clearError: () => void;
}