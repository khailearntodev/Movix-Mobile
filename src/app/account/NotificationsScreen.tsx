import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Bell, Film, MessageSquare, Users, AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGlobalNotifications } from '../../contexts/NotificationContext'; 
import { Notification, NotificationType } from '../../types/notification';

const NotificationIcon = ({ type }: { type: NotificationType }) => {
    switch (type) {
        case 'NEW_MOVIE':
            return <Film size={20} color="#60a5fa" />; // blue-400
        case 'COMMENT_REPLY':
            return <MessageSquare size={20} color="#4ade80" />; // green-400
        case 'WATCH_PARTY_INVITE':
            return <Users size={20} color="#c084fc" />; // purple-400
        case 'SYSTEM':
            return <AlertTriangle size={20} color="#fb923c" />; // orange-400
        default:
            return <Bell size={20} color="#9ca3af" />; // gray-400
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "Vừa xong";
};

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const isTab = route.params?.isTab;

    const context = useGlobalNotifications();
    
    // Fallback if context is null
    const { 
        notifications, 
        isLoading, 
        markAsRead, 
        markAllAsRead, 
        fetchNotifications, 
        deleteNotification 
    } = context || { 
        notifications: [], 
        isLoading: false, 
        markAsRead: () => {}, 
        markAllAsRead: () => {}, 
        fetchNotifications: async () => {}, 
        deleteNotification: async () => {} 
    };

    const handleRefresh = useCallback(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleNotificationPress = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        // Handle navigation based on notification type here
        // e.g., if (notification.type === 'NEW_MOVIE') navigation.navigate('MovieDetail', { id: notification.data?.movieId });
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            className={`flex-row p-4 border-b border-zinc-900 ${item.isRead ? '' : 'bg-zinc-900/40'}`}
        >
            <View className="mr-4 mt-1 bg-zinc-800 p-2 rounded-full h-10 w-10 items-center justify-center">
                <NotificationIcon type={item.type} />
            </View>
            <View className="flex-1">
                <Text className={`text-sm mb-1 ${item.isRead ? 'text-zinc-300 font-medium' : 'text-white font-bold'}`}>
                    {item.title}
                </Text>
                <Text className="text-zinc-400 text-xs mb-2 leading-5" numberOfLines={2}>
                    {item.message}
                </Text>
                <Text className="text-zinc-600 text-[10px]">
                    {formatTimeAgo(item.createdAt)}
                </Text>
            </View>
            {!item.isRead && (
                <View className="w-2 h-2 bg-red-600 rounded-full mt-2" />
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black pt-12">
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id || 'notif'}-${index}`}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                        tintColor="#dc2626" 
                        colors={['#dc2626']}
                    />
                }
                ListHeaderComponent={
                    <View className="flex-row justify-between items-center px-4 py-4 border-b border-zinc-900 bg-black">
                        {!isTab ? (
                            <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                                <ChevronLeft size={28} color="white" />
                                <Text className="text-white text-2xl font-bold">Thông báo</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row items-center gap-4">
                                <Text className="text-white text-2xl font-bold">Thông báo</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => markAllAsRead()}>
                            <Text className="text-red-500 font-medium">Đánh dấu đã đọc</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center justify-center py-20">
                            <Bell size={48} color="#52525b" />
                            <Text className="text-zinc-500 mt-4 text-base">Không có thông báo nào</Text>
                        </View>
                    ) : null
                }
                stickyHeaderIndices={[0]}
            />
        </View>
    );
};

export default NotificationsScreen;
