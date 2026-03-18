import React from 'react';
import { View, Text, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Expo typically has this, if not I might need to adjust or use a simple overlay
import { Banner } from '../../types/banner';

const { width } = Dimensions.get('window');

interface HeroBannerProps {
    banners: Banner[];
    onPress: (banner: Banner) => void;
}

const HeroBanner = ({ banners, onPress }: HeroBannerProps) => {
    if (!banners || banners.length === 0) return null;

    const renderItem = ({ item }: { item: Banner }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(item)}
            className="relative"
            style={{ width: width, height: 450 }}
        >
            <Image
                source={{ uri: item.imageUrl || `https://via.placeholder.com/500x750?text=${item.title}` }}
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
                    {item.description || item.movie?.description || ''}
                </Text>
                <View className="flex-row justify-center gap-2">
                    {item.movie?.type && (
                        <View className="bg-red-600 px-2 py-1 rounded">
                            <Text className="text-white text-xs font-bold uppercase">{item.movie.type}</Text>
                        </View>
                    )}
                    {item.movie?.vote_average !== undefined && (
                        <View className="bg-zinc-800 px-2 py-1 rounded">
                            <Text className="text-white text-xs font-bold">⭐ {(item.movie.vote_average || 0).toFixed(1)}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="mb-6">
            <FlatList
                data={banners}
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
