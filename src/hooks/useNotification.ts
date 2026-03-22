import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message'; // Thư viện Toast cho React Native
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types/notification';

const getSocketUrl = () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://movix-be.onrender.com';
    return baseUrl.replace(/\/api\/?$/, '');
};

const SOCKET_URL = getSocketUrl();

interface UseNotificationsReturn {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: (page?: number, limit?: number) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (notificationId: string) => Promise<void>;
    hasMore: boolean;
    currentPage: number;
}

interface UseNotificationsOptions {
    enableToast?: boolean; 
    onAccountLocked?: () => void;
}

export const useNotifications = (
    userToken: string | null, 
    options: UseNotificationsOptions = { enableToast: true }
): UseNotificationsReturn => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const socketRef = useRef<Socket | null>(null);

    const onAccountLockedRef = useRef(options.onAccountLocked);
    useEffect(() => {
        onAccountLockedRef.current = options.onAccountLocked;
    }, [options.onAccountLocked]);

    useEffect(() => {
        console.log('[useNotifications] Token provided:', !!userToken);

        if (!userToken) {
            console.log('[useNotifications] Không có token, ngắt kết nối socket');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        console.log('[useNotifications] Connecting to:', SOCKET_URL);

        const socketOptions = {
            transports: ['websocket'], 
            auth: { token: userToken }, 
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
        };

        const newSocket = io(SOCKET_URL, socketOptions);
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('Đã kết nối Socket Server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Ngắt kết nối Socket:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Lỗi kết nối Socket:', error.message);
            setIsConnected(false);
        });
        newSocket.on('notification:new', (notification: Notification) => {
            console.log('Thông báo mới:', notification);

            setNotifications(prev => [notification, ...prev]);

            if (!notification.isRead) {
                setUnreadCount(prev => prev + 1);
            }

            if (options.enableToast) {
                Toast.show({
                    type: 'info',
                    text1: notification.title,
                    text2: notification.message,
                    visibilityTime: 4000,
                    topOffset: 50,
                });
            }
        });

        newSocket.on('account:locked', () => {
            if (onAccountLockedRef.current) {
                onAccountLockedRef.current();
            }
        });

        newSocket.on('notification:unread-count', (data: { count: number }) => {
            setUnreadCount(data.count);
        });

        newSocket.on('notification:system', (notification: Notification) => {
            Toast.show({
                type: 'error',
                text1: notification.title,
                text2: notification.message,
                visibilityTime: 6000,
            });
        });

        newSocket.on('notification:all-marked-read', () => {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        });

        newSocket.on('notification:latest', (latestNotifications: Notification[]) => {
            setNotifications(latestNotifications);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, [userToken, options.enableToast]);

    const fetchNotifications = useCallback(async (page: number = 1, limit: number = 20) => {
        try {
            setIsLoading(true);
            const response = await notificationService.getNotifications(page, limit);
            setHasMore(response.data.hasNext);
            setCurrentPage(page);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải thông báo' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('notification:mark-read', notificationId);
        } else {
            notificationService.markAsRead(notificationId).catch(console.error);
        }
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('notification:mark-all-read');
        } else {
            notificationService.markAllAsRead().catch(console.error);
        }
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    }, []);

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            await notificationService.deleteNotification(notificationId);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể xóa thông báo' });
        }
    }, []);

    return {
        socket, isConnected, notifications, unreadCount, isLoading,
        fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, deleteNotification,
        hasMore, currentPage,
    };
};