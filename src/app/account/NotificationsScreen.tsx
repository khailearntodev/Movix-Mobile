import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Bell, Film, MessageSquare, Users, AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

type NotificationType = 'NEW_MOVIE' | 'COMMENT_REPLY' | 'WATCH_PARTY_INVITE' | 'SYSTEM';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'NEW_MOVIE',
        title: 'Phim mới: Dune: Part Two',
        message: 'Siêu phẩm hành động viễn tưởng đã có mặt trên Movix. Xem ngay!',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
        id: '2',
        type: 'SYSTEM',
        title: 'Cập nhật hệ thống',
        message: 'Movix Mobile bản cập nhật 2.0 đã sẵn sàng. Trải nghiệm giao diện mới ngay.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: '3',
        type: 'WATCH_PARTY_INVITE',
        title: 'Lời mời xem chung',
        message: 'Huỳnh Quốc Huy mời bạn tham gia xem phim "Interstellar".',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: '4',
        type: 'COMMENT_REPLY',
        title: 'Phản hồi bình luận',
        message: 'Có người vừa trả lời bình luận của bạn trong "Kung Fu Panda 4".',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
    {
        id: '5',
        type: 'NEW_MOVIE',
        title: 'Phim mới: Godzilla x Kong',
        message: 'Cuộc chiến giữa các titan tiếp tục. Đừng bỏ lỡ!',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    },
];

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

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
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
                data={MOCK_NOTIFICATIONS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHead{!isTab ? (
                            <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                                <ChevronLeft size={28} color="white" />
                                <Text className="text-white text-2xl font-bold">Thông báo</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row items-center gap-4">
                                <Text className="text-white text-2xl font-bold">Thông báo</Text>
                            </View>
                        )}ze={28} color="white" />
                            <Text className="text-white text-2xl font-bold">Thông báo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text className="text-red-500 font-medium">Đánh dấu đã đọc</Text>
                        </TouchableOpacity>
                    </View>
                )}
                stickyHeaderIndices={[0]}
            />
        </View>
    );
};

export default NotificationsScreen;
