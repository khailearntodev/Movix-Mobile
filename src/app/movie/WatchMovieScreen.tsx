import React, { useRef, useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, StatusBar, ScrollView, Image, TextInput } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { ArrowLeft, ThumbsUp, MessageSquare, Share2, Download, Star, Calendar, Clock, ChevronDown } from 'lucide-react-native';
import { Movie } from '../../types/movie';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';

type WatchMovieRouteProp = RouteProp<RootStackParamList, 'WatchMovie'>;

// Mock Seasons Data
const MOCK_SEASONS = [
    {
        id: 's1',
        title: 'Mùa 1',
        episodes: Array.from({ length: 8 }).map((_, i) => ({
            id: `s1-ep-${i + 1}`,
            number: i + 1,
            title: `Tập ${i + 1}: Sự khởi đầu`,
            image: `https://placehold.co/600x400/1a1a1a/FFF.png?text=S1+EP+${i + 1}`,
            duration: '45m'
        }))
    },
    {
        id: 's2',
        title: 'Mùa 2',
        episodes: Array.from({ length: 10 }).map((_, i) => ({
            id: `s2-ep-${i + 1}`,
            number: i + 1,
            title: `Tập ${i + 1}: Trỗi dậy`,
            image: `https://placehold.co/600x400/1a1a1a/FFF.png?text=S2+EP+${i + 1}`,
            duration: '50m'
        }))
    }
];

// Mock Recommendations
const MOCK_RECOMMENDATIONS: Movie[] = [
    { id: 101, title: "Avatar: The Way of Water", poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", backdrop_path: "", vote_average: 7.7, release_date: "2022-12-14", overview: "", media_type: "movie" },
    { id: 102, title: "Oppenheimer", poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop_path: "", vote_average: 8.1, release_date: "2023-07-19", overview: "", media_type: "movie" },
    { id: 103, title: "Interstellar", poster_path: "/gEU2QniL6C971PNLyfeRT389M95.jpg", backdrop_path: "", vote_average: 8.4, release_date: "2014-11-05", overview: "", media_type: "movie" },
];

export default function WatchMovieScreen() {
    const route = useRoute<WatchMovieRouteProp>();
    const navigation = useNavigation();
    const { movie } = route.params;
    const video = useRef<Video>(null);
    const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);

    // State for Season Selection
    const [selectedSeasonId, setSelectedSeasonId] = useState(MOCK_SEASONS[0].id);

    // Get current episodes based on selection
    const currentEpisodes = useMemo(() =>
        MOCK_SEASONS.find(s => s.id === selectedSeasonId)?.episodes || [],
        [selectedSeasonId]
    );

    const videoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    const getImageUrl = (path: string) =>
        path?.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header with Back Button (Fixed overlap issue) */}
            <View className="flex-row items-center px-4 py-3 bg-black z-10 border-b border-zinc-800">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 bg-zinc-800/50 rounded-full mr-4"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
                    {movie.title}
                </Text>
            </View>

            {/* Video Player Section */}
            <View className="w-full h-64 bg-black relative border-b border-zinc-800">
                <Video
                    ref={video}
                    className="w-full h-full"
                    source={{ uri: videoUrl }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                    shouldPlay
                />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* 1. Info Section */}
                <View className="px-4 pt-5 pb-4">
                    <Text className="text-white text-2xl font-bold mb-3 tracking-wide">{movie.title}</Text>

                    <View className="flex-row items-center mb-5 space-x-3 gap-2">
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md space-x-1.5 gap-1.5">
                            <Star size={14} color="#fbbf24" fill="#fbbf24" />
                            <Text className="text-zinc-200 text-xs font-semibold">{movie.vote_average?.toFixed(1) || "N/A"}</Text>
                        </View>
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md space-x-1.5 gap-1.5">
                            <Calendar size={14} color="#a1a1aa" />
                            <Text className="text-zinc-200 text-xs font-semibold">{movie.release_date?.split('-')[0] || "N/A"}</Text>
                        </View>
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md space-x-1.5 gap-1.5">
                            <Clock size={14} color="#a1a1aa" />
                            <Text className="text-zinc-200 text-xs font-semibold">120 phút</Text>
                        </View>
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md">
                            <Text className="text-zinc-200 text-xs font-semibold">HD</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row justify-around mb-6 bg-zinc-900 py-3.5 rounded-xl">
                        <TouchableOpacity className="items-center flex-row space-x-2 gap-2">
                            <ThumbsUp color="white" size={20} />
                            <Text className="text-white text-sm font-medium">Thích</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="items-center flex-row space-x-2 gap-2">
                            <Share2 color="white" size={20} />
                            <Text className="text-white text-sm font-medium">Chia sẻ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="items-center flex-row space-x-2 gap-2">
                            <Download color="white" size={20} />
                            <Text className="text-white text-sm font-medium">Tải về</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-zinc-400 text-[15px] leading-6 mb-2" numberOfLines={3}>
                        {movie.overview || "Mô tả phim chưa cập nhật. Một bộ phim hấp dẫn đang chờ bạn khám phá..."}
                    </Text>
                </View>

                {/* 2. Season & Episodes Section */}
                <View className="mt-6 px-4">
                    <View className="flex-row items-center mb-4">
                        <View className="w-1 h-6 bg-red-600 rounded-sm mr-2.5" />
                        <Text className="text-white text-xl font-bold">Danh sách tập</Text>
                    </View>

                    {/* Season Selector */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
                        {MOCK_SEASONS.map(season => (
                            <TouchableOpacity
                                key={season.id}
                                className={clsx(
                                    "px-4 py-2 rounded-full mr-3 border",
                                    selectedSeasonId === season.id
                                        ? "bg-red-600 border-red-600"
                                        : "bg-zinc-800 border-zinc-700"
                                )}
                                onPress={() => setSelectedSeasonId(season.id)}
                            >
                                <Text className={clsx(
                                    "font-semibold text-sm",
                                    selectedSeasonId === season.id ? "text-white" : "text-zinc-400"
                                )}>
                                    {season.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Episode List */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                        {currentEpisodes.map((ep) => (
                            <TouchableOpacity key={ep.id} className="mr-4 w-44">
                                <View className="w-44 h-24 rounded-lg bg-zinc-800 mb-2 relative overflow-hidden border border-zinc-800">
                                    <Image source={{ uri: ep.image }} className="w-full h-full" resizeMode="cover" />
                                    <View className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded">
                                        <Text className="text-white text-[10px] font-bold">{ep.duration}</Text>
                                    </View>
                                    {ep.number === 1 && selectedSeasonId === 's1' && (
                                        <View className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded">
                                            <Text className="text-white text-[10px] font-bold">Đang phát</Text>
                                        </View>
                                    )}
                                    {/* Center Play Icon Overlay */}
                                    <View className="absolute inset-0 items-center justify-center">
                                        <View className="bg-black/30 rounded-full p-1 backdrop-blur-sm">
                                            {/* Optional: Add small play icon if desired */}
                                        </View>
                                    </View>
                                </View>
                                <Text className="text-zinc-200 text-sm font-medium" numberOfLines={1}>{ep.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 3. Recommendations Section */}
                <View className="mt-8 px-4">
                    <View className="flex-row items-center mb-4">
                        <View className="w-1 h-6 bg-red-600 rounded-sm mr-2.5" />
                        <Text className="text-white text-xl font-bold">Đề xuất cho bạn</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                        {MOCK_RECOMMENDATIONS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="mr-4 w-32"
                                onPress={() => (navigation.navigate as any)('WatchMovie', { movie: item })}
                            >
                                <View className="w-32 h-48 rounded-lg bg-zinc-800 mb-2 overflow-hidden border border-zinc-800">
                                    <Image source={{ uri: getImageUrl(item.poster_path) }} className="w-full h-full" resizeMode="cover" />
                                </View>
                                <Text className="text-zinc-200 text-sm font-medium text-center" numberOfLines={1}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 4. Comments Section Placeholder */}
                <View className="mt-8 px-4 mb-10">
                    <View className="flex-row items-center mb-4">
                        <View className="w-1 h-6 bg-red-600 rounded-sm mr-2.5" />
                        <Text className="text-white text-xl font-bold">Bình luận</Text>
                    </View>
                    <View className="flex-row items-center bg-zinc-900 p-3 rounded-xl gap-3 space-x-3">
                        <Image
                            source={{ uri: "https://github.com/shadcn.png" }}
                            className="w-8 h-8 rounded-full"
                        />
                        <TextInput
                            placeholder="Viết bình luận..."
                            placeholderTextColor="#71717a"
                            className="flex-1 text-white text-sm h-10"
                        />
                        <TouchableOpacity>
                            <MessageSquare color="#a1a1aa" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
