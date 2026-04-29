import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Trash2, Calendar, Star, Film } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { getPlaylistDetail, removeMovieFromPlaylist, PlaylistDetail, PlaylistMovieResponse } from '../../services/interaction.service';

type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

const PlaylistDetailScreen = () => {
    const route = useRoute<PlaylistDetailRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { playlistId, title } = route.params;

    const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDetail = useCallback(async () => {
        try {
            const data = await getPlaylistDetail(playlistId);
            setPlaylist(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể tải chi tiết danh sách phát");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [playlistId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]); // Include fetchDetail in dependency array

    const handleRemoveMovie = async (movieId: string, movieTitle: string) => {
        Alert.alert(
            "Xóa phim",
            `Bạn có chắc chắn muốn xóa "${movieTitle}" khỏi danh sách này?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeMovieFromPlaylist(playlistId, movieId);
                            // Optimistic update
                            if (playlist) {
                                setPlaylist({
                                    ...playlist,
                                    movies: playlist.movies.filter(m => m.id !== movieId)
                                });
                            }
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể xóa phim khỏi danh sách");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: PlaylistMovieResponse }) => (
        <TouchableOpacity 
            className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl mb-3 overflow-hidden"
            onPress={() => {
                // Map PlaylistMovieResponse to Movie type for navigation
                 navigation.navigate('MovieDetail', { 
                    movie: {
                        id: item.id,
                        slug: item.slug,
                        title: item.title,
                        posterUrl: item.poster_url,
                        backdropUrl: item.backdrop_url,
                        description: item.overview || '',
                        vote_average: item.vote_average || 0,
                        releaseYear: item.release_date ? item.release_date.split('-')[0] : '',
                        type: (item.media_type && item.media_type.toUpperCase() === 'TV' ? 'TV' : 'MOVIE'),
                    } as any
                });
            }}
        >
            <Image 
                source={{ uri: item.poster_url }} 
                className="w-24 h-36 bg-zinc-800"
                resizeMode="cover"
            />
            <View className="flex-1 p-3 justify-between h-36">
                <View>
                    <Text className="text-white font-bold text-lg mb-1" numberOfLines={2}>{item.title}</Text>
                    <View className="flex-row items-center space-x-3 mb-2">
                        {item.vote_average ? (
                            <View className="flex-row items-center bg-yellow-500/20 px-1.5 py-0.5 rounded">
                                <Star size={12} color="#eab308" fill="#eab308" />
                                <Text className="text-yellow-500 text-xs font-bold ml-1">{item.vote_average.toFixed(1)}</Text>
                            </View>
                        ) : null}
                        <View className="flex-row items-center">
                            <Calendar size={12} color="#a1a1aa" />
                            <Text className="text-zinc-400 text-xs ml-1">{item.release_date?.split('-')[0] || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row justify-end mt-auto">
                    <TouchableOpacity 
                        className="p-2 bg-zinc-800 rounded-full"
                        onPress={() => handleRemoveMovie(item.id, item.title)}
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <View className="px-4 pt-12 pb-4 border-b border-zinc-900 bg-black/90 z-10 flex-row items-center gap-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold" numberOfLines={1}>
                        {title}
                    </Text>
                    <Text className="text-zinc-500 text-xs">
                        {playlist?.movies.length || 0} phim
                    </Text>
                </View>
            </View>

            <FlatList
                data={playlist?.movies || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    fetchDetail();
                }}
                ListEmptyComponent={() => (
                    <View className="py-20 items-center justify-center">
                        <Film size={64} color="#27272a" />
                        <Text className="text-zinc-500 mt-4 text-center">Danh sách trống</Text>
                        <Text className="text-zinc-600 text-xs mt-1 text-center">Thêm phim vào danh sách để xem tại đây</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default PlaylistDetailScreen;
