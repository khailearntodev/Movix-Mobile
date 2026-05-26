import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Trophy, Star, Clock, Target, Award, Lock } from 'lucide-react-native';
import { getProfile, getAchievements, GamificationProfile } from '@/services/gamification.service';
import { UserAchievement } from '@/types/gamification';

const ACHIEVEMENTS_ICONS: Record<string, any> = {
    'WATCH_TIME': Clock,
    'XP': Star,
    'LOGIN_STREAK': Target,
    'COMMENT_COUNT': Trophy,
    'MOVIE_COUNT': Trophy,
};

export default function AchievementsScreen() {
    const navigation = useNavigation<any>();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProfile = async () => {
        try {
            const [profileData, allAchievements] = await Promise.all([
                getProfile(),
                getAchievements()
            ]);
            
            setProfile(profileData);
            
            // Format achievements
            if (allAchievements) {
                const unlockedIds = new Set((profileData.achievements || []).map((a: any) => a.id));
                const formatted = allAchievements.map((a: any) => ({
                    ...a,
                    is_unlocked: Boolean(a.is_unlocked || a.unlocked_at || unlockedIds.has(a.id))
                }));
                setAchievements(formatted);
            }
        } catch (error) {
            console.error('Error loading gamification profile:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadProfile();
    };

    const renderProgressBar = (current: number, max: number, colorClass: string) => {
        const percent = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
        return (
            <View className="flex-1 h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <View 
                    style={{ width: `${percent}%` }}
                    className={`h-full ${colorClass}`} 
                />
            </View>
        );
    };

    const unlockedAchievements = achievements.filter(a => a.is_unlocked);
    const lockedAchievements = achievements.filter(a => !a.is_unlocked);
    const totalAchievements = achievements.length;
    const unlockedCount = unlockedAchievements.length;
    let rankProgressPercent = 0;
    if (profile?.current_rank && profile?.next_rank) {
        const denom = profile.next_rank.min_xp - profile.current_rank.min_xp;
        if (denom > 0) rankProgressPercent = Math.max(0, Math.min(100, Math.round(((profile.xp - profile.current_rank.min_xp) / denom) * 100)));
    } else if (profile?.current_rank) {
        rankProgressPercent = 100;
    }

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center py-4 px-4 bg-black pt-12">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold flex-1">Thành tựu</Text>
            </View>

            <ScrollView 
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
            >
                <View className="px-4 pb-12">
                    <Text className="text-zinc-400 mb-6">Theo dõi hành trình và thu thập các danh hiệu độc đáo của bạn.</Text>

                    {profile && (
                        <>
                            {/* Overview Card */}
                            <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8 relative overflow-hidden">
                                <View className="absolute -top-4 -right-4 opacity-5 rotate-12">
                                    <Trophy size={140} color="#eab308" />
                                </View>
                                
                                <View className="flex-row items-start justify-between mb-4 z-10">
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-base">Tiến độ tổng quan</Text>
                                        <Text className="text-zinc-400 text-xs mt-1">Bạn đã mở khóa {unlockedCount}/{totalAchievements} danh hiệu</Text>
                                        
                                        <View className="flex-row items-center mt-3 flex-wrap">
                                            <Text className="text-zinc-300 text-xs font-medium mr-1">Hạng hiện tại:</Text>
                                            <Text className="text-zinc-200 text-xs mr-2">{profile.current_rank?.name || "—"}</Text>
                                            {profile.next_rank && (
                                                <Text className="text-zinc-400 text-xs">Tiến tới: {profile.next_rank.name}</Text>
                                            )}
                                        </View>
                                    </View>
                                    <Text className="text-yellow-500 font-bold text-3xl">{rankProgressPercent}%</Text>
                                </View>
                                
                                <View className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden z-10">
                                    <View 
                                        className="h-full bg-yellow-500"
                                        style={{ width: `${rankProgressPercent}%` }}
                                    />
                                </View>
                            </View>

                            {/* Unlocked Achievements */}
                            <Text className="text-white text-lg font-bold mb-4 flex-row items-center"><Award size={20} color="#eab308" style={{marginRight: 8}}/> Bộ Sưu Tập Danh Hiệu</Text>
                            
                            {unlockedAchievements.length > 0 ? (
                                <View className="flex-row flex-wrap justify-between mb-8">
                                    {unlockedAchievements.map((achievement: any) => (
                                        <View 
                                            key={achievement.id}
                                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4"
                                            style={{ width: '48%' }}
                                        >
                                            <View className="flex-row items-start justify-between mb-3">
                                                <View className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden items-center justify-center border border-zinc-700/50">
                                                    {achievement.icon_url ? (
                                                        <Image source={{ uri: achievement.icon_url }} className="w-8 h-8" resizeMode="contain" />
                                                    ) : (
                                                        <Trophy size={24} color="#eab308" />
                                                    )}
                                                </View>
                                                <View className="bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded">
                                                    <Text className="text-yellow-500 text-[10px] font-medium">Đã nhận</Text>
                                                </View>
                                            </View>
                                            <Text className="text-white font-bold text-sm mb-1" numberOfLines={2}>{achievement.name}</Text>
                                            <Text className="text-zinc-400 text-xs mb-3 flex-1" numberOfLines={3}>{achievement.description}</Text>
                                            <View className="border-t border-zinc-800/50 pt-2 flex-row items-center">
                                                <Trophy size={10} color="#71717a" className="mr-1" />
                                                <Text className="text-zinc-500 text-[10px]">
                                                    Mở khóa ngày: {achievement.unlocked_at ? new Date(achievement.unlocked_at).toLocaleDateString('vi-VN') : 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text className="text-zinc-500 text-center py-6 mb-4">Bạn chưa mở khóa danh hiệu nào. Hãy tích cực xem phim nhé!</Text>
                            )}

                            {/* Locked Achievements */}
                            <Text className="text-white text-lg font-bold mb-4 flex-row items-center"><Lock size={20} color="#71717a" style={{marginRight: 8}}/> Chưa Mở Khóa</Text>
                            
                            <View className="mb-6">
                                {lockedAchievements.map((achievement: any) => {
                                    let progressValue = achievement.current_progress ?? achievement.progress ?? 0;
                                    if (!progressValue) {
                                        if (achievement.condition_type === "XP") progressValue = profile.xp;
                                        else if (achievement.condition_type === "TOTAL_WATCH_TIME") progressValue = profile.total_watch_time;
                                    }
                                    const percent = achievement.condition_value > 0 ? Math.min(100, Math.round((progressValue / achievement.condition_value) * 100)) : 0;
                                    
                                    return (
                                        <View key={achievement.id} className="flex-row items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-3 opacity-80">
                                            <View className="w-12 h-12 bg-zinc-900 rounded-full items-center justify-center overflow-hidden grayscale mr-4 opacity-50">
                                                {achievement.icon_url ? (
                                                    <Image source={{ uri: achievement.icon_url }} className="w-10 h-10" resizeMode="contain" />
                                                ) : (
                                                    <Trophy size={20} color="#52525b" />
                                                )}
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-center mb-1">
                                                    <Text className="text-zinc-300 font-semibold text-sm flex-1 mr-2" numberOfLines={1}>{achievement.name}</Text>
                                                    <View className="bg-zinc-900 px-2 py-0.5 rounded">
                                                        <Text className="text-zinc-500 text-xs font-mono">{progressValue}/{achievement.condition_value}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-zinc-500 text-xs mb-2" numberOfLines={2}>{achievement.description}</Text>
                                                <View className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                    <View className="h-full bg-zinc-600" style={{ width: `${percent}%` }} />
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}