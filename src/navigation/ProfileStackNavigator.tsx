import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from '../app/account/AccountScreen';
import FavoritesScreen from '../app/account/FavoritesScreen';
import PlaylistScreen from '../app/account/PlaylistScreen';
import HistoryScreen from '../app/account/HistoryScreen';
import NotificationsScreen from '../app/account/NotificationsScreen';
import EditProfileScreen from '../app/account/EditProfileScreen';
import ChangePasswordScreen from '../app/account/ChangePasswordScreen';
import SubscriptionScreen from '../app/account/SubscriptionScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#09090b' }, // zinc-950
                headerStyle: { backgroundColor: '#09090b' },
                headerTintColor: '#fff',
            }}
        >
            <Stack.Screen name="AccountMenu" component={AccountScreen} />
            <Stack.Screen
                name="Subscription"
                component={SubscriptionScreen}
                options={{ headerShown: true, title: 'Gói dịch vụ' }}
            />
            <Stack.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{ headerShown: true, title: 'Yêu thích' }}
            />
            <Stack.Screen
                name="Playlist"
                component={PlaylistScreen}
                options={{ headerShown: true, title: 'Danh sách' }}
            />
            <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ headerShown: true, title: 'Xem tiếp' }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: true, title: 'Thông báo' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: true, title: 'Tài khoản' }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ headerShown: true, title: 'Đổi mật khẩu' }}
            />
        </Stack.Navigator>
    );
}
