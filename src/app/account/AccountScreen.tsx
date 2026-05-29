import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Heart, List, History, Bell, User, LogOut, ChevronRight, Crown, Settings, Download, Search, Menu, Smartphone, Trophy, Bookmark } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getMyProfile, UserProfile } from '@/services/user.service';
import { subscriptionService } from '@/services/subscription.service';
import { UserSubscription } from '@/types/subscription';
import { getProfile, GamificationProfile } from '@/services/gamification.service';
import { AIChatButton } from '@/components/common/AIChatButton';
import { useAuth } from '@/contexts/AuthContext';

const AccountScreen = () => {
    const navigation = useNavigation<any>();
    const { signOut } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
    const [gamificationProfile, setGamificationProfile] = useState<GamificationProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, [])
    );

    const loadUserProfile = async () => {
        try {
            if (!userProfile || !userSubscription) {
                setIsLoading(true);
            }
            const [profileData, subData, gamificationData] = await Promise.all([
                getMyProfile(),
                subscriptionService.getUserSubscription().catch(() => null),
                getProfile().catch(() => null)
            ]);
            setUserProfile(profileData);
            setUserSubscription(subData);
            setGamificationProfile(gamificationData);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogout = () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Đăng xuất", 
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                    }
                }
            ]
        );
    };

    const isPremium = userSubscription && 
                      userSubscription.status === 'ACTIVE' && 
                      new Date(userSubscription.end_date) > new Date();

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
                {isLoading && !userProfile ? (
                    <View className="items-center mb-8 h-32 justify-center">
                        <ActivityIndicator color="#ef4444" />
                    </View>
                ) : userProfile ? (
                    <TouchableOpacity
                        className="items-center mb-8"
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Image
                            source={{ uri: userProfile.avatar_url || 'https://github.com/shadcn.png' }}
                            className={`w-24 h-24 rounded-md mb-3 ${isPremium ? 'border-2 border-yellow-500' : 'border-2 border-transparent'}`}
                        />
                        <Text className="text-white text-xl font-bold mb-1">
                            {userProfile.display_name || userProfile.username || 'Người dùng'}
                        </Text>
                        <View className="flex-row items-center gap-2">
                            <View className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${isPremium ? 'bg-yellow-500/20' : 'bg-zinc-800'}`}>
                                {isPremium && <Crown size={14} color="#eab308" />}
                                <Text className={`${isPremium ? 'text-yellow-500 font-bold' : 'text-zinc-300 font-medium'} text-xs uppercase`}>
                                    {isPremium ? 'VIP MEMBER' : 'Thành viên'}
                                </Text>
                            </View>
                            {gamificationProfile?.current_rank && (
                                <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20">
                                    <Trophy size={14} color="#3b82f6" />
                                    <Text className="text-blue-500 font-bold text-xs uppercase">
                                        {gamificationProfile.current_rank.name}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View className="items-center mb-8">
                        <Text className="text-zinc-400">Không thể tải thông tin người dùng</Text>
                    </View>
                )}


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
                    <TouchableOpacity 
                        className="items-center gap-2"
                        onPress={() => navigation.navigate('Downloads')}
                    >
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
                    {renderMenuItem(<Trophy size={22} color="white" />, "Thành tựu", () => navigation.navigate('Achievements'))}
                    {renderMenuItem(<List size={22} color="white" />, "Danh sách của tôi", () => navigation.navigate('Playlist'))}
                    {renderMenuItem(<Heart size={22} color="white" />, "Phim yêu thích", () => navigation.navigate('Favorites'))}
                    {renderMenuItem(<History size={22} color="white" />, "Lịch sử xem", () => navigation.navigate('History'))}
                </View>

                {/* Community Section */}
                <View className="mb-8">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View className="w-1 h-4 bg-yellow-500 rounded-full" />
                        <Text className="text-lg font-bold text-zinc-200">Cộng đồng</Text>
                    </View>
                    {renderMenuItem(<Trophy size={22} color="#eab308" />, "Danh hiệu & Thành tựu", () => navigation.navigate('Achievements'))}
                    {renderMenuItem(<Bookmark size={22} color="white" />, "Bài viết đã lưu", () => navigation.navigate('Bookmarks'))}
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
                    {renderMenuItem(<Smartphone size={22} color="white" />, "Quản lý thiết bị", () => navigation.navigate('Devices'))}
                    {renderMenuItem(<LogOut size={22} color="#ef4444" />, "Đăng xuất", handleLogout, "#ef4444")}
                </View>

                <Text className="text-zinc-600 text-center text-xs mb-8">Movix Mobile v1.0.0</Text>
            </ScrollView>
            <AIChatButton />
        </View>
    );
};

export default AccountScreen;
