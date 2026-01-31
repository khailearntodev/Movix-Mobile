import React from 'react';
import { View, DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Import types navigation
import { RootStackParamList } from '../../types/navigation';

// Import component form đã tạo
import FilterForm, { FilterValues } from '../../components/search/FilterForm';
import { StatusBar } from 'expo-status-bar';

// --- TRANG MÀN HÌNH CHÍNH CỦA FILTER (PAGE) ---

export default function FilterPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Hàm xử lý sau khi người dùng nhấn nút "Áp dụng"
    const handleApply = (filters: FilterValues) => {
        const cleanFilters = JSON.parse(JSON.stringify(filters));

        console.log("🎬 Emit Event & Close Modal:", cleanFilters);

        // 1. Bắn sự kiện Global để trang Search (đang nằm dưới) bắt được
        DeviceEventEmitter.emit('event.updateFilters', cleanFilters);

        // 2. Gọi lệnh Back đơn giản -> Đảm bảo modal trượt xuống (Tắt đi)
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-zinc-950">
            <StatusBar style="light" />
            <FilterForm
                onApply={handleApply}
                onClose={() => navigation.goBack()}
            />
        </View>
    );
}