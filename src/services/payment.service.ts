import api from './api.service';
import {
  CheckoutResponse,
  PaymentInfoResponse,
  CancelPaymentResponse,
} from '@/types/subscription';

const PAYMENT_BASE_URL = '/payment';

const extractPaymentUrl = (payload: any): string | null => {
  const candidates = [
    payload?.data?.paymentData?.paymentUrl,
    payload?.data?.paymentData?.checkoutUrl,
    payload?.data?.paymentData?.payUrl,
    payload?.data?.paymentData?.link,
    payload?.data?.paymentUrl,
    payload?.data?.checkoutUrl,
    payload?.paymentUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() && candidate !== 'undefined') {
      return candidate;
    }
  }

  return null;
};

const normalizeCheckoutData = (payload: any): CheckoutResponse['data'] | null => {
  const rawData = payload?.data;
  if (!rawData) return null;

  const paymentUrl = extractPaymentUrl(payload);
  if (!paymentUrl) {
    return null;
  }

  const paymentData = {
    ...(rawData.paymentData || {}),
    paymentUrl,
  };

  return {
    paymentData,
    transactionId: rawData.transactionId,
  } as CheckoutResponse['data'];
};

export const createCheckoutSession = async (
  planId: string,
  paymentMethod: string = 'PAYOS',
): Promise<CheckoutResponse['data']> => {
  try {
    const response = await api.post<CheckoutResponse>(
      `${PAYMENT_BASE_URL}/checkout`,
      {
        planId,
        paymentMethod,
      },
    );

    const data = response.data as any;

    if (data.error !== 0) {
      throw new Error(data.message || 'Failed to create checkout session');
    }

    const normalized = normalizeCheckoutData(data);
    if (!normalized?.paymentData?.paymentUrl) {
      throw new Error('Khong nhan duoc URL thanh toan hop le tu he thong');
    }

    return normalized;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};


export const getPaymentInfo = async (
  orderId: string,
  method: string = 'PAYOS',
): Promise<PaymentInfoResponse['data']> => {
  try {
    const { data } = await api.get<PaymentInfoResponse>(
      `${PAYMENT_BASE_URL}/info/${orderId}`,
      {
        params: { method },
      },
    );

    if (data.error !== 0) {
      throw new Error(data.message || 'Failed to get payment info');
    }

    if (!data.data) {
      throw new Error('No payment data returned');
    }

    return data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};


export const cancelPayment = async (
  orderId: string,
  cancellationReason?: string,
  method: string = 'PAYOS',
): Promise<CancelPaymentResponse['data']> => {
  try {
    const { data } = await api.put<CancelPaymentResponse>(
      `${PAYMENT_BASE_URL}/cancel/${orderId}`,
      { cancellationReason },
      {
        params: { method },
      },
    );

    if (data.error !== 0) {
      throw new Error(data.message || 'Failed to cancel payment');
    }

    if (!data.data) {
      throw new Error('No cancellation data returned');
    }

    return data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const isPaymentCompleted = async (orderId: string): Promise<boolean> => {
  try {
    const paymentInfo = await getPaymentInfo(orderId);
    if (!paymentInfo) return false;
    return paymentInfo.status === 'PAID';
  } catch {
    return false;
  }
};

export const isPaymentPending = async (orderId: string): Promise<boolean> => {
  try {
    const paymentInfo = await getPaymentInfo(orderId);
    if (!paymentInfo) return false;
    return paymentInfo.status === 'PENDING';
  } catch {
    return false;
  }
};

export const pollPaymentStatus = async (
  orderId: string,
  maxRetries: number = 12,
  intervalMs: number = 5000,
): Promise<PaymentInfoResponse['data']> => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const paymentInfo = await getPaymentInfo(orderId);

      if (!paymentInfo) {
        throw new Error('No payment info returned');
      }

      // If status is PAID, FAILED, CANCELLED, or EXPIRED, stop polling
      if (['PAID', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(paymentInfo.status)) {
        return paymentInfo;
      }

      // Still pending, wait and retry
      if (paymentInfo.status === 'PENDING') {
        attempt++;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
          continue;
        }
      }
    } catch (error) {
      attempt++;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Payment status check timeout after ${maxRetries} attempts`,
  );
};

export const initiateCheckoutWithRetry = async (
  planId: string,
  paymentMethod: string = 'PAYOS',
  maxRetries: number = 3,
): Promise<CheckoutResponse['data']> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await createCheckoutSession(planId, paymentMethod);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delayMs = 1000 * attempt;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Failed to create checkout session');
};

export const formatPaymentInfo = (paymentInfo: PaymentInfoResponse['data']) => {
  if (!paymentInfo) return null;

  return {
    id: paymentInfo.id,
    amount: paymentInfo.amount.toLocaleString('vi-VN'),
    amountPaid: paymentInfo.amountPaid.toLocaleString('vi-VN'),
    description: paymentInfo.description,
    accountNumber: paymentInfo.accountNumber,
    reference: paymentInfo.reference,
    transactionDateTime: new Date(paymentInfo.transactionDateTime).toLocaleString(
      'vi-VN',
    ),
    status: paymentInfo.status,
    statusLabel: getPaymentStatusLabel(paymentInfo.status),
  };
};
export const getPaymentStatusLabel = (
  status: 'PAID' | 'PENDING' | 'EXPIRED' | 'CANCELLED',
): string => {
  const labels: Record<typeof status, string> = {
    PAID: 'Đã thanh toán',
    PENDING: 'Đang chờ xử lý',
    EXPIRED: 'Đã hết hạn',
    CANCELLED: 'Đã hủy',
  };
  return labels[status] || status;
};
