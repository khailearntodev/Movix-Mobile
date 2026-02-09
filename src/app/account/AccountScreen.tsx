import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Heart, List, History, Bell, User, LogOut, ChevronRight, Crown, Settings, Download, Search, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const AccountScreen = () => {
    const navigation = useNavigation<any>();

    const user = {
        name: "Người dùng Movix",
        email: "user@example.com",
        avatar: "https://github.com/shadcn.png",
        isPremium: true
    };

    const renderMenuItem = (icon: any, label: string, onPress: () => void, color = "#a1a1aa", showBadge = false) => (
        <TouchableOpacity
            className="flex-row items-center py-4 border-b border-zinc-900 active:bg-zinc-900/50"
            onPress={onPress}
        >
            <View className="mr-4">
                {icon}
            </View>
            <Text className="flex-1 text-white text-base font-medium">{label}</Text>
            {showBadge && (
                <View className="bg-red-600 w-2 h-2 rounded-full mr-2" />
            )}
            <ChevronRight size={16} color="#52525b" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black pt-12">
            {/* Header */}
            <View className="px-4 mb-6 flex-row items-center justify-between">
                <Text className="text-white text-2xl font-bold">Cá nhân</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={() => navigation.navigate("Search")}><Search size={24} color="white" /></TouchableOpacity>
                    <TouchableOpacity><Menu size={24} color="white" /></TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4">
                {/* User Profile */}
                <TouchableOpacity
                    className="items-center mb-8"
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Image
                        source={{ uri: user.avatar }}
                        className="w-24 h-24 rounded-md mb-3 border-2 border-transparent"
                    />
                    <Text className="text-white text-xl font-bold mb-1">{user.name}</Text>
                    <View className="flex-row items-center gap-1 bg-zinc-800 px-3 py-1 rounded-full">
                        {user.isPremium && <Crown size={12} color="#eab308" />}
                        <Text className="text-zinc-300 text-xs font-medium uppercase">
                            {user.isPremium ? "Thành viên Premium" : "Thành viên miễn phí"}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Quick Actions (Notifications, Downloads) */}
                <View className="flex-row justify-center gap-8 mb-8">
                    <TouchableOpacity
                        className="items-center gap-2"
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View className="w-12 h-12 bg-red-600 rounded-full items-center justify-center">
                            <Bell size={24} color="white" />
                        </View>
                        <Text className="text-zinc-400 text-xs font-medium">Thông báo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center gap-2">
                        <View className="w-12 h-12 bg-zinc-800 rounded-full items-center justify-center">
                            <Download size={24} color="white" />
                        </View>
                        <Text className="text-zinc-400 text-xs font-medium">Tải xuống</Text>
                    </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View className="mb-8">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View className="w-1 h-4 bg-red-600 rounded-full" />
                        <Text className="text-lg font-bold text-zinc-200">Kho phim của tôi</Text>
                    </View>
                    {renderMenuItem(<List size={22} color="white" />, "Danh sách của tôi", () => navigation.navigate('Playlist'))}
                    {renderMenuItem(<Heart size={22} color="white" />, "Phim yêu thích", () => navigation.navigate('Favorites'))}
                    {renderMenuItem(<History size={22} color="white" />, "Lịch sử xem", () => navigation.navigate('History'))}
                </View>

                {/* Settings Section */}
                <View className="mb-10">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View className="w-1 h-4 bg-zinc-600 rounded-full" />
                        <Text className="text-lg font-bold text-zinc-200">Cài đặt & Hỗ trợ</Text>
                    </View>
                    {renderMenuItem(<Crown size={22} color="#eab308" />, "Gói dịch vụ", () => navigation.navigate('Subscription'))}
                    {renderMenuItem(<Settings size={22} color="white" />, "Cài đặt ứng dụng", () => { })}
                    {renderMenuItem(<User size={22} color="white" />, "Tài khoản", () => navigation.navigate('EditProfile'))}
                    {renderMenuItem(<LogOut size={22} color="#ef4444" />, "Đăng xuất", () => { }, "#ef4444")}
                </View>

                <Text className="text-zinc-600 text-center text-xs mb-8">Movix Mobile v1.0.0</Text>
            </ScrollView>
        </View>
    );
};

export default AccountScreen;
