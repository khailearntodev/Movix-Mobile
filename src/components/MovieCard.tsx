import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { Movie } from '../types/movie';

interface MovieCardProps {
    movie: Movie;
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
                source={{ uri: movie.posterUrl || 'https://via.placeholder.com/150' }}
                className="w-24 h-36"
                resizeMode="cover"
            />

            {/* Thông tin */}
            <View className="flex-1 p-3 justify-between">
                <View>
                    <Text className="text-white text-lg font-bold" numberOfLines={2}>
                        {movie.title}
                    </Text>
                    <Text className="text-zinc-500 text-sm mt-1">
                        {movie.releaseYear || 'N/A'}
                    </Text>
                </View>

                {/* Điểm đánh giá */}
                <View className="flex-row items-center mt-2">
                    <View className="bg-zinc-950/50 px-2 py-1 rounded-md flex-row items-center border border-zinc-700">
                        <Star size={14} color="#eab308" fill="#eab308" />
                        <Text className={`font-bold ml-1 ${getRatingColor(movie.vote_average || 0)}`}>
                            {(movie.vote_average || 0).toFixed(1)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
