import api from './api.service';
import {
  SubscriptionPlan,
  UserSubscription,
  Transaction,
  TransactionListMeta,
  UserTransactionsQuery,
  UserTransactionsResult,
  ListResponse,
  DetailResponse,
} from '@/types/subscription';

const SUBSCRIPTION_BASE_URL = '/subscription-plans';

const DEFAULT_TRANSACTIONS_META: TransactionListMeta = {
  totalItems: 0,
  currentPage: 1,
  limit: 10,
  totalPages: 0,
};

class SubscriptionService {
  // 1. Lấy danh sách các gói đăng ký đang hoạt động
  async getSubscriptionPlans(isActive: boolean = true): Promise<SubscriptionPlan[]> {
    try {
      const { data } = await api.get<ListResponse<SubscriptionPlan>>(
        SUBSCRIPTION_BASE_URL,
        {
          params: { isActive },
        },
      );
      return data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // 2. Lấy chi tiết một gói đăng ký cụ thể
  async getSubscriptionPlanDetail(
    planId: string,
  ): Promise<SubscriptionPlan & { subscriptions?: UserSubscription[]; transactions?: Transaction[] }> {
    try {
      const { data } = await api.get<
        DetailResponse<SubscriptionPlan & { subscriptions?: UserSubscription[]; transactions?: Transaction[] }>
      >(`${SUBSCRIPTION_BASE_URL}/${planId}`);
      return data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // 3. Lấy thông tin gói đăng ký hiện tại của user
  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await api.get('/profile/me/subscription');
      const payload = response.data;
      if (payload?.data === null) {
        return null;
      }
      return (payload?.data || null) as UserSubscription | null;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 401) {
        return null;
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // 4. Lấy lịch sử đăng ký gói của user
  async getUserSubscriptionHistory(): Promise<UserSubscription[]> {
    try {
      const response = await api.get('/subscriptions');
      const payload = response.data;
      if (Array.isArray(payload?.data)) {
        return payload.data as UserSubscription[];
      }
      if (Array.isArray(payload)) {
        return payload as UserSubscription[];
      }
      return [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // 5. Lấy lịch sử giao dịch thanh toán của user
  async getUserTransactionHistory(
    query: UserTransactionsQuery = {},
  ): Promise<UserTransactionsResult> {
    try {
      const { page = 1, limit = 10, status } = query;
      const response = await api.get('/payment/my-transactions', {
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
        },
      });
      const payload = response.data;

      if (payload?.error !== 0) {
        throw new Error(payload?.message || 'Không thể tải lịch sử giao dịch.');
      }

      return {
        items: Array.isArray(payload?.data) ? (payload.data as Transaction[]) : [],
        meta: (payload?.meta || {
          ...DEFAULT_TRANSACTIONS_META,
          currentPage: page,
          limit,
        }) as TransactionListMeta,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          items: [],
          meta: {
            ...DEFAULT_TRANSACTIONS_META,
            currentPage: query.page || 1,
            limit: query.limit || 10,
          },
        };
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // 6. Kiểm tra xem user có gói cước còn hạn hay không
  async checkUserSubscriptionStatus(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();
      if (!subscription) return false;

      const endDate = new Date(subscription.end_date);
      return (
        subscription.status === 'ACTIVE' &&
        endDate > new Date()
      );
    } catch {
      return false;
    }
  }

  // 7. Các hàm check quyền hạn và lợi ích đi kèm của gói cước
  async canCreateWatchParty(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();
      if (!subscription || !subscription.plan) return false;
      return (
        subscription.status === 'ACTIVE' &&
        subscription.plan.can_create_watch_party === true
      );
    } catch {
      return false;
    }
  }

  async getMaxWatchPartyParticipants(): Promise<number> {
    try {
      const subscription = await this.getUserSubscription();
      if (!subscription || !subscription.plan) return 0;
      if (
        subscription.status === 'ACTIVE' &&
        subscription.plan.can_create_watch_party === true
      ) {
        return subscription.plan.max_watch_party_participants || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async canKickMuteMembers(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();
      if (!subscription || !subscription.plan) return false;
      return (
        subscription.status === 'ACTIVE' &&
        subscription.plan.can_kick_mute_members === true
      );
    } catch {
      return false;
    }
  }

  async getUserSubscriptionLevel(): Promise<number> {
    try {
      const subscription = await this.getUserSubscription();
      if (!subscription || !subscription.plan) return 0;
      if (
        subscription.status === 'ACTIVE' &&
        new Date(subscription.end_date) > new Date()
      ) {
        return subscription.plan.level || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async getUserSubscriptionBenefits(): Promise<Record<string, any> | null> {
    try {
      const subscription = await this.getUserSubscription();
      if (!subscription || !subscription.plan) return null;
      if (
        subscription.status === 'ACTIVE' &&
        new Date(subscription.end_date) > new Date()
      ) {
        return subscription.plan.benefits || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getSubscriptionRemainingDays(): Promise<number> {
    try {
      const subscription = await this.getUserSubscription();
      if (!subscription) return 0;

      const endDate = new Date(subscription.end_date);
      const now = new Date();

      if (endDate <= now) return 0;

      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  }

  // 8. Yêu cầu hoàn tiền và lấy danh sách yêu cầu hoàn tiền của user
  async requestRefund(reason?: string): Promise<{ message: string; refundRequest: any }> {
    try {
      const response = await api.post('/profile/me/subscription/refund-request', {
        reason,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async getRefundRequests(): Promise<{ message: string; data: any[] }> {
    try {
      const response = await api.get('/profile/me/refund-requests');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();