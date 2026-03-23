import api from './api';
import type { NotificationsResponse, UnreadCountResponse } from '../types/notification';

const NOTIFICATION_BASE_URL = '/notifications';

export const notificationService = {

    async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
        const response = await api.get<NotificationsResponse>(
            `${NOTIFICATION_BASE_URL}?page=${page}&limit=${limit}`
        );
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get<UnreadCountResponse>(
            `${NOTIFICATION_BASE_URL}/unread-count`
        );
        return response.data.data.count;
    },

    async markAsRead(notificationId: string): Promise<void> {
        await api.patch(`${NOTIFICATION_BASE_URL}/${notificationId}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.patch(`${NOTIFICATION_BASE_URL}/read-all`);
    },

    async deleteNotification(notificationId: string): Promise<void> {
        await api.delete(`${NOTIFICATION_BASE_URL}/${notificationId}`);
    },
};
