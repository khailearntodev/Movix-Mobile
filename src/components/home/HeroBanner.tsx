import React from 'react';
import { View, Text, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Expo typically has this, if not I might need to adjust or use a simple overlay
import { Movie } from '../../types/movie';

const { width } = Dimensions.get('window');

interface HeroBannerProps {
    movies: Movie[];
    onPress: (movie: Movie) => void;
}

const HeroBanner = ({ movies, onPress }: HeroBannerProps) => {
    if (!movies || movies.length === 0) return null;

    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(item)}
            className="relative"
            style={{ width: width, height: 450 }}
        >
            <Image
                source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750' }}
                className="w-full h-full"
                resizeMode="cover"
            />

            <View className="absolute inset-0 bg-black/30" />
            <View className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />
            <View className="absolute bottom-0 w-full p-4 pb-8 bg-black/60">
                <Text className="text-white text-3xl font-bold mb-2 text-center" numberOfLines={2}>
                    {item.title}
                </Text>
                <Text className="text-zinc-300 text-sm text-center mb-4" numberOfLines={2}>
                    {item.overview}
                </Text>
                <View className="flex-row justify-center gap-2">
                    {item.media_type && (
                        <View className="bg-red-600 px-2 py-1 rounded">
                            <Text className="text-white text-xs font-bold uppercase">{item.media_type}</Text>
                        </View>
                    )}
                    <View className="bg-zinc-800 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-bold">⭐ {item.vote_average?.toFixed(1)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="mb-6">
            <FlatList
                data={movies}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToAlignment="center"
                decelerationRate="fast"
            />
        </View>
    );
};

export default HeroBanner;
