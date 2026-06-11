export interface SubscriptionPlan {
  id: string; 
  name: string;
  description: string | null;
  price: number; 
  currency: string;
  duration_days: number; 
  level: number; 
  benefits: Record<string, any> | null; 
  can_create_watch_party: boolean;
  max_watch_party_participants: number;
  can_kick_mute_members: boolean;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL';

export interface UserSubscription {
  id: string; // UUID
  user_id: string; // UUID
  plan_id: string; // UUID
  start_date: string; // ISO 8601
  end_date: string; // ISO 8601
  status: SubscriptionStatus;
  auto_renew: boolean;
  plan?: SubscriptionPlan;
  user?: any; // User object if needed
  created_at?: string; // ISO 8601
  updated_at?: string; // ISO 8601
}

/**
 * Transaction Type
 * Represents a payment transaction
 */
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string; 
  user_id: string; 
  plan_id: string | null; 
  amount: number; 
  currency: string; 
  payment_method: string; 
  transaction_ref: string | null; 
  status: TransactionStatus;
  metadata: Record<string, any> | null; 
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  user?: any; // User object if needed
  plan?: SubscriptionPlan | null;
}

export interface TransactionListMeta {
  totalItems: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface UserTransactionsQuery {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
}

export interface UserTransactionsResult {
  items: Transaction[];
  meta: TransactionListMeta;
}

export interface PaymentData {
  bin?: string;
  accountNumber?: string;
  accountName?: string;
  amount: number;
  description: string;
  orderCode: number | string;
  currency?: string;
  paymentUrl?: string; 
  checkoutUrl?: string;
  payUrl?: string;
  link?: string;
  signature?: string;
}

export interface CheckoutResponse {
  error: 0 | -1; // 0 = success, -1 = error
  message: string;
  data: {
    paymentData: PaymentData;
    transactionId: string; 
  } | null;
}

export interface PaymentInfoResponse {
  error: 0 | -1;
  message: string;
  data: {
    id: string;
    amount: number;
    amountPaid: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string; // ISO 8601
    status: 'PAID' | 'PENDING' | 'EXPIRED' | 'CANCELLED'; 
  } | null;
}

export interface CancelPaymentResponse {
  error: 0 | -1;
  message: string;
  data: {
    id: string;
    amount: number;
    status: 'CANCELLED';
    reason?: string;
  } | null;
}

export interface ListResponse<T> {
  message: string;
  data: T[];
  total: number;
}

export interface DetailResponse<T> {
  message: string;
  data: T;
}
