import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Check, Crown, ChevronLeft } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { subscriptionService } from '@/services/subscription.service';
import { SubscriptionPlan, UserSubscription } from '@/types/subscription';

const SubscriptionScreen = () => {
    const navigation = useNavigation();
    const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [sub, availablePlans] = await Promise.all([
                subscriptionService.getUserSubscription(),
                subscriptionService.getSubscriptionPlans(true)
            ]);
            setCurrentSubscription(sub);
            setPlans(availablePlans);
        } catch (error: any) {
            console.error('Fetch subscription error:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin gói dịch vụ.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const isPlanActive = (planId: string) => {
        if (!currentSubscription) return false;
        return currentSubscription.plan_id === planId && 
               currentSubscription.status === 'ACTIVE' && 
               new Date(currentSubscription.end_date) > new Date();
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-zinc-950 justify-center items-center">
                <ActivityIndicator size="large" color="#eab308" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-zinc-950 pt-12">
            <View className="px-4 pb-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-xl font-bold">Gói dịch vụ</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4">
                <View className="items-center mb-8 mt-4">
                    <View className="bg-yellow-500/20 p-6 rounded-full mb-4">
                        <Crown size={48} color="#eab308" />
                    </View>
                    <Text className="text-white text-2xl font-bold mb-2">Gói thành viên</Text>
                    <Text className="text-zinc-400 text-center px-8">
                        Nâng cấp lên Premium để trải nghiệm Movix tốt nhất
                    </Text>
                </View>

                {plans.map((plan) => {
                    const isActive = isPlanActive(plan.id);
                    
                    let benefitsList: string[] = [];
                    if (plan.description) benefitsList.push(plan.description);
                    if (plan.can_create_watch_party) benefitsList.push(`Tạo phòng xem chung (tối đa ${plan.max_watch_party_participants} người)`);
                    if (plan.can_kick_mute_members) benefitsList.push("Quyền quản lý phòng (Kick/Mute)");
                    if (plan.benefits) {
                        if (plan.benefits.no_ads) benefitsList.push("Xem phim không quảng cáo");
                        if (plan.benefits.quality) benefitsList.push(`Chất lượng ${plan.benefits.quality}`);
                        if (plan.benefits.downloads) benefitsList.push("Tải xuống không giới hạn");
                    }

                    return (
                        <View key={plan.id} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-6 relative overflow-hidden">
                            {isActive && (
                                <View className="absolute top-0 right-0 bg-yellow-500 px-3 py-1 rounded-bl-xl">
                                    <Text className="text-black font-bold text-xs uppercase">Đang sử dụng</Text>
                                </View>
                            )}

                            <Text className="text-yellow-500 font-bold text-lg mb-2">{plan.name.toUpperCase()}</Text>
                            <Text className="text-white text-3xl font-bold mb-6">
                                {formatCurrency(plan.price)} 
                                <Text className="text-zinc-500 text-lg font-normal"> / {plan.duration_days} ngày</Text>
                            </Text>

                            <View className="gap-y-4 mb-8">
                                {benefitsList.map((benefit, index) => (
                                    <View key={index} className="flex-row items-center gap-3">
                                        <View className="bg-yellow-500/10 p-1 rounded-full"><Check size={16} color="#eab308" /></View>
                                        <Text className="text-zinc-300">{benefit}</Text>
                                    </View>
                                ))}
                            </View>

                            {!isActive ? (
                                <TouchableOpacity className="bg-yellow-500 w-full p-4 rounded-xl items-center">
                                    <Text className="text-black font-bold text-lg uppercase">Nâng cấp ngay</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity className="bg-zinc-800 w-full p-4 rounded-xl items-center border border-zinc-700">
                                    <Text className="text-zinc-300 font-medium">Quản lý gói đăng ký</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {plans.length === 0 && (
                    <Text className="text-zinc-500 text-center px-4 pb-8">
                        Hiện không có gói dịch vụ nào khả dụng.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
};

export default SubscriptionScreen;
