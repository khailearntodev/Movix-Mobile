import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { getFavoriteMovies } from '../../services/interaction.service';
import { Movie } from '../../types/movie';
import { RootStackParamList } from '../../types/navigation';

const FavoritesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [favorites, setFavorites] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = useCallback(async () => {
        try {
            const data = await getFavoriteMovies();
            setFavorites(data);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFavorites();
        setRefreshing(false);
    };

    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;
    };

    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity 
            className="flex-1 m-2"
            onPress={() => navigation.navigate("MovieDetail", { movie: item })}
        >
            <View className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <Image
                    source={{ uri: getImageUrl(item.posterUrl) }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-sm">
                    <Heart size={14} color="#ef4444" fill="#ef4444" />
                </View>
            </View>
            <Text className="text-white mt-2 font-bold text-sm" numberOfLines={1}>{item.title}</Text>
            <Text className="text-zinc-500 text-xs" numberOfLines={1}>{item.vote_average?.toFixed(1)} ★ • {item.releaseYear}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black pt-12">
            <View className="px-4 pb-4 border-b border-zinc-900">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-2xl font-bold">Yêu thích</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20">
                            <Heart size={48} color="#52525b" />
                            <Text className="text-zinc-500 mt-4 text-center">
                                Chưa có phim yêu thích nào.{'\n'}Hãy thêm phim vào danh sách yêu thích!
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default FavoritesScreen;
