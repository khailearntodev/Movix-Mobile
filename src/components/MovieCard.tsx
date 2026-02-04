import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';

interface MovieCardProps {
    movie: {
        id: number;
        title: string;
        poster_path: string | null;
        vote_average: number;
        release_date: string;
    };
    onPress: () => void;
}

export default function MovieCard({ movie, onPress }: MovieCardProps) {
    // Logic màu điểm số (giống web)
    const getRatingColor = (rating: number) => {
        if (rating >= 7) return "text-green-500";
        if (rating >= 5) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <TouchableOpacity
            className="flex-row bg-zinc-900 mb-4 rounded-xl overflow-hidden border border-zinc-800 active:bg-zinc-800"
            onPress={onPress}
        >
            {/* Poster Ảnh */}
            <Image
                source={{ uri: movie.poster_path || 'https://via.placeholder.com/150' }}
                className="w-24 h-36"
                resizeMode="cover"
            />

            {/* Thông tin */}
            <View className="flex-1 p-3 justify-between">
                <View>
                    <Text className="text-white text-lg font-bold numberOfLines={2}">
                        {movie.title}
                    </Text>
                    <Text className="text-zinc-500 text-sm mt-1">
                        {movie.release_date?.split('-')[0] || 'N/A'}
                    </Text>
                </View>

                {/* Điểm đánh giá */}
                <View className="flex-row items-center mt-2">
                    <View className="bg-zinc-950/50 px-2 py-1 rounded-md flex-row items-center border border-zinc-700">
                        <Star size={14} color="#eab308" fill="#eab308" />
                        <Text className={`font-bold ml-1 ${getRatingColor(movie.vote_average)}`}>
                            {movie.vote_average.toFixed(1)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
