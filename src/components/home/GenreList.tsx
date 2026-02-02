import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const GENRES = [
    { id: 28, name: "Hành động" },
    { id: 12, name: "Phiêu lưu" },
    { id: 16, name: "Hoạt hình" },
    { id: 35, name: "Hài" },
    { id: 80, name: "Tội phạm" },
    { id: 99, name: "Tài liệu" },
    { id: 18, name: "Chính kịch" },
    { id: 10751, name: "Gia đình" },
    { id: 14, name: "Giả tưởng" },
    { id: 36, name: "Lịch sử" },
    { id: 27, name: "Kinh dị" },
];

interface GenreListProps {
    onGenrePress?: (genreId: number) => void;
}

const GenreList = ({ onGenrePress }: GenreListProps) => {
    return (
        <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4 px-4">Thể loại</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {GENRES.map((genre) => (
                    <TouchableOpacity
                        key={genre.id}
                        className="bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700"
                        onPress={() => onGenrePress && onGenrePress(genre.id)}
                    >
                        <Text className="text-zinc-300 font-medium whitespace-nowrap">{genre.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default GenreList;
