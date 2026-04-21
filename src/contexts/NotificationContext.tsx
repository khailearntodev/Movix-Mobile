import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotification'; // Trỏ đến file hook ở trên
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from './AuthContext';
import { getAccessToken } from '../utils/storage';

type NotificationContextType = ReturnType<typeof useNotifications>;
const NotificationContext = createContext<NotificationContextType | null>(null);
export const NotificationProvider = ({ 
    children 
}: { 
    children: React.ReactNode; 
}) => {
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            if (user) {
                const t = await getAccessToken();
                setToken(t);
            } else {
                setToken(null);
            }
        };
        fetchToken();
    }, [user]);

    const notificationState = useNotifications(token, { enableToast: true });

    usePushNotifications({
        userToken: token,
        onNotificationPress: (data) => {
            console.log('[NotificationContext] Notification pressed with data:', data);
            // TODO: map data.actionUrl | data.movieId | data.partyId sang navigation route.
        },
    });

    return (
        <NotificationContext.Provider value={notificationState}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useGlobalNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useGlobalNotifications phải được đặt trong NotificationProvider');
    }
    return context;
};