import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notification.service';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface UsePushNotificationsOptions {
    userToken: string | null;
    onNotificationPress?: (data: Record<string, unknown>) => void;
}

type PushPlatform = 'ios' | 'android' | 'web';

const getPushPlatform = (): PushPlatform => {
    if (Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web') {
        return Platform.OS;
    }

    return 'web';
};

const getProjectId = (): string | undefined => {
    const easProjectId = Constants?.easConfig?.projectId;
    const expoProjectId = Constants?.expoConfig?.extra?.eas?.projectId;
    const extraProjectId = Constants?.expoConfig?.extra?.projectId;
    const envProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    return easProjectId ?? expoProjectId ?? extraProjectId ?? envProjectId;
};

const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    if (!Device.isDevice) {
        console.log('[usePushNotifications] Push notification chỉ hỗ trợ máy thật');
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[usePushNotifications] User chưa cấp quyền notification');
        return null;
    }

    const projectId = getProjectId();
    if (!projectId) {
        throw new Error(
            'Missing EAS projectId. Set expo.extra.eas.projectId in app.json or EXPO_PUBLIC_EAS_PROJECT_ID in .env.'
        );
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });

    return tokenResponse.data;
};

export const usePushNotifications = ({
    userToken,
    onNotificationPress,
}: UsePushNotificationsOptions) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [isRegisteringPush, setIsRegisteringPush] = useState(false);
    const [pushError, setPushError] = useState<string | null>(null);

    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const foregroundListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        if (!userToken) {
            setExpoPushToken(null);
            setPushError(null);
            return;
        }

        let isMounted = true;

        const setupPush = async () => {
            try {
                setIsRegisteringPush(true);
                setPushError(null);

                const token = await registerForPushNotificationsAsync();
                if (!isMounted || !token) {
                    return;
                }

                setExpoPushToken(token);
                console.log('[usePushNotifications] Expo push token:', token);

                await notificationService.registerDeviceToken(token, getPushPlatform());
                console.log('[usePushNotifications] Registered Expo token');
            } catch (error) {
                if (isMounted) {
                    if (isAxiosError(error) && error.response?.status === 404) {
                        console.warn('[usePushNotifications] Backend chưa có endpoint expo-token, bỏ qua đăng ký token trên server.');
                        setPushError('Backend chưa hỗ trợ /notifications/expo-token. Push token đã tạo nhưng chưa được lưu server.');
                    } else {
                        console.error('[usePushNotifications] Register token failed:', error);
                        setPushError(error instanceof Error ? error.message : 'Không thể đăng ký push token');
                    }
                }
            } finally {
                if (isMounted) {
                    setIsRegisteringPush(false);
                }
            }
        };

        setupPush();

        return () => {
            isMounted = false;
        };
    }, [userToken]);

    useEffect(() => {
        foregroundListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log('[usePushNotifications] Foreground push:', notification.request.identifier);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data as Record<string, unknown>;
            if (onNotificationPress) {
                onNotificationPress(data);
            }
        });

        return () => {
            if (foregroundListener.current) {
                foregroundListener.current.remove();
                foregroundListener.current = null;
            }

            if (responseListener.current) {
                responseListener.current.remove();
                responseListener.current = null;
            }
        };
    }, [onNotificationPress]);

    useEffect(() => {
        if (!userToken || !expoPushToken) {
            return;
        }

        return () => {
            notificationService.unregisterDeviceToken(expoPushToken).catch((error) => {
                if (isAxiosError(error) && error.response?.status === 404) {
                    return;
                }
                console.error('[usePushNotifications] Unregister token failed:', error);
            });
        };
    }, [userToken, expoPushToken]);

    return {
        expoPushToken,
        isRegisteringPush,
        pushError,
    };
};
