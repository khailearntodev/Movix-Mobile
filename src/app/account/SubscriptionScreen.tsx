import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Check, Crown } from 'lucide-react-native';

const SubscriptionScreen = () => {
    const currentPlan = 'free';

    return (
        <ScrollView className="flex-1 bg-zinc-950 p-4 pt-8">
            <View className="items-center mb-8">
                <View className="bg-yellow-500/20 p-6 rounded-full mb-4">
                    <Crown size={48} color="#eab308" />
                </View>
                <Text className="text-white text-2xl font-bold mb-2">Gói thành viên</Text>
                <Text className="text-zinc-400 text-center px-8">
                    Nâng cấp lên Premium để trải nghiệm Movix tốt nhất
                </Text>
            </View>

            {/* Premium Plan Card */}
            <View className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-6 relative overflow-hidden">
                {currentPlan === 'premium' && (
                    <View className="absolute top-0 right-0 bg-yellow-500 px-3 py-1 rounded-bl-xl">
                        <Text className="text-black font-bold text-xs uppercase">Đang sử dụng</Text>
                    </View>
                )}

                <Text className="text-yellow-500 font-bold text-lg mb-2">MOVIX PREMIUM</Text>
                <Text className="text-white text-3xl font-bold mb-6">36.000đ <Text className="text-zinc-500 text-lg font-normal">/ tháng</Text></Text>

                <View className="space-y-4 mb-8">
                    <View className="flex-row items-center gap-3">
                        <View className="bg-yellow-500/10 p-1 rounded-full"><Check size={16} color="#eab308" /></View>
                        <Text className="text-zinc-300">Xem phim không quảng cáo</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <View className="bg-yellow-500/10 p-1 rounded-full"><Check size={16} color="#eab308" /></View>
                        <Text className="text-zinc-300">Chất lượng HD</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <View className="bg-yellow-500/10 p-1 rounded-full"><Check size={16} color="#eab308" /></View>
                        <Text className="text-zinc-300">Tải xuống không giới hạn</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <View className="bg-yellow-500/10 p-1 rounded-full"><Check size={16} color="#eab308" /></View>
                        <Text className="text-zinc-300">Xem trên 4 thiết bị</Text>
                    </View>
                </View>

                {currentPlan === 'free' ? (
                    <TouchableOpacity className="bg-yellow-500 w-full p-4 rounded-xl items-center">
                        <Text className="text-black font-bold text-lg uppercase">Nâng cấp ngay</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity className="bg-zinc-800 w-full p-4 rounded-xl items-center border border-zinc-700">
                        <Text className="text-zinc-300 font-medium">Quản lý gói đăng ký</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text className="text-zinc-500 text-center text-xs px-4 pb-8">
                Đang phát triển.......
            </Text>
        </ScrollView>
    );
};

export default SubscriptionScreen;
