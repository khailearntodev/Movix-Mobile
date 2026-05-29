import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, Trophy, Award, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { gamificationService, Achievement, GamificationRank } from '@/services/gamification.service';
import { useAuth } from '@/contexts/AuthContext';

export default function AchievementsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [xp, setXp] = useState<number>(0);
    const [totalWatchTime, setTotalWatchTime] = useState<number>(0);
    const [currentRank, setCurrentRank] = useState<GamificationRank | null>(null);
    const [nextRank, setNextRank] = useState<GamificationRank | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [profileData, allAchievements] = await Promise.all([
                    gamificationService.getProfile(),
                    gamificationService.getAchievements()
                ]);
                setXp(profileData.xp || 0);
                setTotalWatchTime(profileData.total_watch_time || 0);
                setCurrentRank(profileData.current_rank || null);
                setNextRank(profileData.next_rank || null);

                const unlockedIds = new Set((profileData.achievements || []).map((a) => a.id));
                const merged = (allAchievements || []).map((ach) => ({
                    ...ach,
                    is_unlocked: Boolean(ach.is_unlocked || ach.unlocked_at || unlockedIds.has(ach.id)),
                }));

                setAchievements(merged);
            } catch (error) {
                console.error("Failed to load achievements", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const processedAchievements = achievements.map((a) => ({
        ...a,
        is_unlocked: Boolean(a.is_unlocked || a.unlocked_at),
    }));

    const unlockedAchievements = processedAchievements.filter((a) => a.is_unlocked);
    const lockedAchievements = processedAchievements.filter((a) => !a.is_unlocked);

    const totalAchievements = achievements.length;
    const unlockedCount = unlockedAchievements.length;
    
    const rankProgressPercent = React.useMemo(() => {
        if (!currentRank) return 0;
        if (!nextRank) return 100;
        const denom = (nextRank.min_xp - currentRank.min_xp);
        if (!denom || denom <= 0) return 100;
        const p = Math.round(((xp - (currentRank.min_xp || 0)) / denom) * 100);
        return Math.max(0, Math.min(100, p));
    }, [xp, currentRank, nextRank]);

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#eab308" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-4 pt-14 pb-4 flex-row items-center border-b border-zinc-900">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Trophy size={24} color="#eab308" className="mr-2" />
                <Text className="text-white text-xl font-bold"> Thành tựu</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                {/* Overview Card */}
                <View className="bg-zinc-900 rounded-2xl p-5 mb-8 border border-zinc-800 overflow-hidden relative">
                    <View className="absolute -top-6 -right-6 opacity-5 rotate-12">
                        <Trophy size={150} color="#eab308" />
                    </View>
                    <View className="flex-row justify-between items-start mb-4 relative z-10">
                        <View className="flex-1">
                            <Text className="text-white font-bold text-lg mb-1">Tiến độ tổng quan</Text>
                            <Text className="text-gray-400 text-xs mb-3">Bạn đã mở khóa {unlockedCount}/{totalAchievements} danh hiệu</Text>
                            <Text className="text-gray-300 text-sm">
                                Hạng hiện tại: <Text className="font-bold text-white">{currentRank?.name || "—"}</Text>
                            </Text>
                            {nextRank && (
                                <Text className="text-gray-400 text-sm mt-1">
                                    Tiến tới: {nextRank.name}
                                </Text>
                            )}
                        </View>
                        <Text className="text-yellow-500 font-bold text-3xl">{rankProgressPercent}%</Text>
                    </View>
                    <View className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden relative z-10">
                        <View 
                            className="h-full bg-yellow-500 rounded-full"
                            style={{ width: `${rankProgressPercent}%` }}
                        />
                    </View>
                </View>

                {/* Unlocked Achievements */}
                <View className="mb-8">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Award size={20} color="#eab308" />
                        <Text className="text-white font-bold text-lg">Bộ Sưu Tập Danh Hiệu</Text>
                    </View>
                    
                    {unlockedAchievements.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between">
                            {unlockedAchievements.map((achievement) => (
                                <View 
                                    key={achievement.id}
                                    className="w-[48%] bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-4"
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden justify-center items-center">
                                            {achievement.icon_url ? (
                                                <Image 
                                                    source={{ uri: achievement.icon_url }} 
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Trophy size={24} color="#eab308" />
                                            )}
                                        </View>
                                    </View>
                                    <Text className="text-white font-bold text-sm mb-1">{achievement.name}</Text>
                                    <Text className="text-gray-400 text-xs mb-2 leading-tight" numberOfLines={3}>{achievement.description}</Text>
                                    <Text className="text-yellow-500 text-[10px] font-medium">Đã nhận</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text className="text-gray-500 text-center py-4">Bạn chưa mở khóa danh hiệu nào.</Text>
                    )}
                </View>

                {/* Locked Achievements */}
                <View className="mb-10">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Lock size={20} color="#71717a" />
                        <Text className="text-white font-bold text-lg">Chưa Mở Khóa</Text>
                    </View>

                    {lockedAchievements.map((achievement) => {
                        let progressValue = achievement.current_progress ?? achievement.progress ?? 0;
                        if (!progressValue) {
                            if (achievement.condition_type === "XP") progressValue = xp;
                            else if (achievement.condition_type === "TOTAL_WATCH_TIME") progressValue = totalWatchTime;
                        }
                        const percent = achievement.condition_value > 0 
                            ? Math.min(100, Math.round((progressValue / achievement.condition_value) * 100))
                            : 0;
                        
                        return (
                            <View 
                                key={achievement.id} 
                                className="flex-row items-center p-4 bg-zinc-950 border border-zinc-800 rounded-xl mb-3 opacity-70"
                            >
                                <View className="w-12 h-12 bg-zinc-900 rounded-full overflow-hidden justify-center items-center mr-4 opacity-50 grayscale">
                                    {achievement.icon_url ? (
                                        <Image 
                                            source={{ uri: achievement.icon_url }} 
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <Trophy size={20} color="#52525b" />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-gray-300 font-bold flex-1 mr-2">{achievement.name}</Text>
                                        <Text className="text-xs text-gray-500 bg-zinc-900 px-2 py-1 rounded">
                                            {progressValue}/{achievement.condition_value}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>{achievement.description}</Text>
                                    <View className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <View 
                                            className="h-full bg-zinc-600 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
