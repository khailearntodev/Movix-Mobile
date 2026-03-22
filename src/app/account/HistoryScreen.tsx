import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Play, Clock, History as HistoryIcon } from 'lucide-react-native';
import { getWatchHistory, HistoryItem } from '../../services/history.service';
import { RootStackParamList } from '../../types/navigation';

const HistoryScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchHistory = useCallback(async (refresh = false) => {
        try {
            const pageToFetch = refresh ? 1 : page;
            const response = await getWatchHistory(pageToFetch);
            
            if (refresh) {
                setHistory(response.data);
                setPage(2);
            } else {
                setHistory(prev => [...prev, ...response.data]);
                setPage(prev => prev + 1);
            }
            
            setHasMore(response.data.length > 0 && response.pagination.page < response.pagination.totalPages);

        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistory(true);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory(true);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const handlePress = (item: HistoryItem) => {
        const movie = {
            id: item.episode.season.movie.id,
            title: item.episode.season.movie.title,
            slug: item.episode.season.movie.slug,
            posterUrl: item.episode.season.movie.poster_url,
        } as any;

        navigation.navigate('WatchMovie', {
            movie: movie,
            episodeId: item.episode.id
        });
    };

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const episode = item.episode;
        const movie = episode.season.movie;
        const season = episode.season;
        const progressPercent = episode.runtime ? (item.progress_seconds / (episode.runtime * 60)) * 100 : 0;

        return (
            <TouchableOpacity 
                className="flex-row mb-4 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
                onPress={() => handlePress(item)}
            >
                <View className="w-28 h-40 bg-zinc-800 relative">
                     <Image
                        source={{ uri: movie.poster_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play size={24} color="white" fill="white" />
                    </View>
                    <View className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                        <View 
                            className="h-full bg-red-600" 
                            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }} 
                        />
                    </View>
                </View>

                <View className="flex-1 p-3 justify-between">
                    <View>
                        <Text className="text-white font-bold text-base mb-1" numberOfLines={2}>
                            {movie.title}
                        </Text>
                        <Text className="text-zinc-400 text-sm font-medium mb-1">
                            {season.title} - Tập {episode.episode_number}
                        </Text>
                        <Text className="text-zinc-500 text-xs italic" numberOfLines={1}>
                             {episode.title}
                        </Text>
                    </View>

                    <View>
                         <View className="flex-row items-center gap-1 mb-1">
                            <Clock size={12} color="#a1a1aa" />
                            <Text className="text-zinc-400 text-xs">
                                {formatTime(item.progress_seconds)} / {episode.runtime ? `${episode.runtime}m` : '--'}
                            </Text>
                        </View>
                        <Text className="text-zinc-600 text-[10px]">
                            {new Date(item.watched_at).toLocaleDateString('vi-VN')} {new Date(item.watched_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-black pt-12">
            <View className="px-4 pb-4 border-b border-zinc-900 bg-black z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-xl font-bold">Lịch sử xem</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing && history.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
                    }
                    ListEmptyComponent={
                         <View className="flex-1 justify-center items-center py-20">
                            <HistoryIcon size={64} color="#27272a" />
                            <Text className="text-zinc-500 mt-4 text-center font-medium">Chưa có lịch sử xem</Text>
                        </View>
                    }
                    onEndReached={() => {
                        if (hasMore && !loading) {
                            fetchHistory(false);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loading && hasMore ? (
                            <View className="py-4">
                                <ActivityIndicator color="#ef4444" />
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
};

export default HistoryScreen;
