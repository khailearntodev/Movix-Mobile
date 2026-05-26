import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from '../app/account/AccountScreen';
import FavoritesScreen from '../app/account/FavoritesScreen';
import PlaylistScreen from '../app/account/PlaylistScreen';
import PlaylistDetailScreen from '../app/account/PlaylistDetailScreen';
import HistoryScreen from '../app/account/HistoryScreen';
import NotificationsScreen from '../app/account/NotificationsScreen';
import EditProfileScreen from '../app/account/EditProfileScreen';
import ChangePasswordScreen from '../app/account/ChangePasswordScreen';
import SubscriptionScreen from '../app/account/SubscriptionScreen';
import TransactionsScreen from '../app/account/TransactionsScreen';
import DownloadsScreen from '../app/account/DownloadsScreen';
import DevicesScreen from '../app/account/DevicesScreen';
import AchievementsScreen from '../app/account/AchievementsScreen';

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
            />
            <Stack.Screen
                name="Transactions"
                component={TransactionsScreen}
            />
            <Stack.Screen
                name="Downloads"
                component={DownloadsScreen}
            />
            <Stack.Screen
                name="Favorites"
                component={FavoritesScreen}
            />
            <Stack.Screen
                name="Playlist"
                component={PlaylistScreen}
            />
            <Stack.Screen
                name="PlaylistDetail"
                component={PlaylistDetailScreen}
            />
            <Stack.Screen
                name="History"
                component={HistoryScreen}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
            />
            <Stack.Screen
                name="Devices"
                component={DevicesScreen}
            />
            <Stack.Screen
                name="Achievements"
                component={AchievementsScreen}
            />
        </Stack.Navigator>
    );
}
