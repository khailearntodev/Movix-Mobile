import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, Text, StatusBar, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ArrowLeft, MessageSquare, Share2, Download, Star, Calendar, Clock, Plus, Heart, Play, AlertCircle } from 'lucide-react-native';
import { Movie, Episode } from '../../types/movie';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { useVideoPlayer, VideoView } from 'expo-video';

import { ShareModal } from "../../components/common/ShareModal";
import { FavoriteToast } from "../../components/common/FavoriteToast";
import { PlaylistModal, Playlist } from "../../components/movie/PlaylistModal";
import { getMovie } from '../../services/movie.service';
import { 
    checkFavoriteStatus, 
    toggleFavorite as toggleFavoriteApi,
    getPlaylists,
    createPlaylist,
    addMovieToPlaylist,
    removeMovieFromPlaylist
} from '../../services/interaction.service';

import * as Application from 'expo-application';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { downloadService } from '../../services/download.service';

type WatchMovieRouteProp = RouteProp<RootStackParamList, 'WatchMovie'>;

export default function WatchMovieScreen() {
    const route = useRoute<WatchMovieRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { movie: initialMovie, episodeId: episodeIdFromParam, offlineUrl } = route.params;
    const [movie, setMovie] = useState<Movie>(initialMovie);
    
    // Add loading state for video
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState<string | null>(null);

    // Fetch full movie detail on mount
    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                if (initialMovie.slug) {
                    const fullMovie = await getMovie(initialMovie.slug);
                    setMovie(prev => ({ ...prev, ...fullMovie }));
                }
            } catch (error) {
                console.error("Failed to fetch full movie details:", error);
            }
        };
        fetchMovieDetail();
    }, [initialMovie.slug]);

    // --- Logic from Web: WatchContainer ---

    const findEpisodeById = (id: string | null | undefined) => {
        if (!id || !movie.seasons) return null;
        for (const season of movie.seasons) {
            const ep = season.episodes.find((e) => e.id === id);
            if (ep) return ep;
        }
        return null;
    };

    const initialEpisode = useMemo(() => {
        return findEpisodeById(episodeIdFromParam) || movie.seasons?.[0]?.episodes?.[0];
    }, [episodeIdFromParam, movie.seasons]);

    const [currentEpisode, setCurrentEpisode] = useState<Episode | undefined>(initialEpisode);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(
        offlineUrl || initialEpisode?.videoUrl || movie.videoUrl || ""
    );

    // Update state if movie/params change or initialEpisode changes
    useEffect(() => {
        if (offlineUrl && (!currentEpisode || currentEpisode.id === episodeIdFromParam)) {
            setCurrentVideoUrl(offlineUrl);
        } else if (initialEpisode) {
            setCurrentEpisode(initialEpisode);
            const videoSource = initialEpisode.videoUrl || movie.videoUrl || "";
            setCurrentVideoUrl(videoSource);
        } else if (movie.videoUrl) {
            setCurrentVideoUrl(movie.videoUrl);
            setCurrentEpisode(undefined);
        }
    }, [initialEpisode, movie.videoUrl, offlineUrl, currentEpisode, episodeIdFromParam]);

    const handleEpisodeSelect = (episode: Episode) => {
        setCurrentEpisode(episode);
        if (episode.videoUrl) {
            setCurrentVideoUrl(episode.videoUrl);
        } else if (movie.type === 'MOVIE' && movie.videoUrl) {
            setCurrentVideoUrl(movie.videoUrl);
        } else {
            setCurrentVideoUrl("");
        }
    };

    // --- Khởi tạo Video Player bằng link lấy từ API ---
    // Expo Video sẽ tự động reload lại player khi currentVideoUrl thay đổi (ví dụ: khi chọn tập mới)
    const player = useVideoPlayer(currentVideoUrl, player => {
        player.loop = true;
        player.play();
    });

    // Theo dõi trạng thái player để hiện loading
    useEffect(() => {
        const subscription = player.addListener('statusChange', (payload) => {
            if (payload.status === 'loading') {
                setIsVideoLoading(true);
                setVideoError(null);
            } else if (payload.status === 'error') {
                setIsVideoLoading(false);
                setVideoError(payload.error?.message || "Đã xảy ra lỗi khi tải video");
            } else {
                setIsVideoLoading(false);
                setVideoError(null);
            }
        });
        
        // Reset loading khi player thay đổi (đổi tập/phim)
        setIsVideoLoading(true);
        setVideoError(null);

        return () => {
            subscription.remove();
        };
    }, [player]);

    // State for Dialogs
    const [isShareVisible, setShareVisible] = useState(false);
    const [isPlaylistVisible, setPlaylistVisible] = useState(false);
    const [isFavoriteVisible, setFavoriteVisible] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);

    // Load interaction status
    useEffect(() => {
        if (!movie.id) return;

        const loadData = async () => {
            try {
                // Check favorite status
                const favData = await checkFavoriteStatus(movie.id.toString());
                if (favData && typeof favData.isFavorite !== 'undefined') {
                    setIsFavorite(favData.isFavorite);
                }

                // Load playlists
                const playlistsData = await getPlaylists();
                if (Array.isArray(playlistsData)) {
                     // Check format from service
                     const formatted = playlistsData.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        count: p._count?.playlist_movies || 0
                    }));
                    setPlaylists(formatted);
                }
            } catch (error) {
                console.error("Failed to load interaction data:", error);
            }
        };
        
        loadData();
    }, [movie.id]);

    // State for Season Selection
    const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(() => {
        if (currentEpisode && movie.seasons) {
            const season = movie.seasons.find(s => s.episodes.some(e => e.id === currentEpisode.id));
            if (season) return season.id;
        }
        return movie.seasons?.[0]?.id;
    });

    useEffect(() => {
        if (currentEpisode && movie.seasons) {
            const season = movie.seasons.find(s => s.episodes.some(e => e.id === currentEpisode.id));
            if (season && season.id !== selectedSeasonId) {
                setSelectedSeasonId(season.id);
            }
        }
    }, [currentEpisode, movie.seasons]);

    const currentEpisodes = useMemo(() =>
        movie.seasons?.find(s => s.id === selectedSeasonId)?.episodes || [],
        [selectedSeasonId, movie.seasons]
    );

    const toggleFavorite = async () => {
        if (!movie.id) return;
        try {
            const newStatus = !isFavorite;
            setIsFavorite(newStatus);
            await toggleFavoriteApi(movie.id.toString());
            
            if (newStatus) {
                setFavoriteVisible(true);
                setTimeout(() => setFavoriteVisible(false), 2000); 
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            setIsFavorite(!isFavorite); // Revert
        }
    };

    const handleCreatePlaylist = async (name: string) => {
        try {
            const newPlaylist = await createPlaylist(name);
            const p: Playlist = {
                id: newPlaylist.id,
                name: newPlaylist.name,
                count: 0
            };
            setPlaylists([...playlists, p]);
            // Auto add to new playlist
            await togglePlaylistSelection(p.id);
        } catch (error) {
            console.error("Failed to create playlist:", error);
        }
    };

    const togglePlaylistSelection = async (id: string) => {
        if (!movie.id) return;
        const isSelected = selectedPlaylists.includes(id);
        
        try {
            // Optimistic update
            if (isSelected) {
                setSelectedPlaylists(prev => prev.filter(pid => pid !== id));
                setPlaylists(prev => prev.map(p => 
                    p.id === id ? { ...p, count: Math.max(0, p.count - 1) } : p
                ));
                await removeMovieFromPlaylist(id, movie.id.toString());
            } else {
                setSelectedPlaylists(prev => [...prev, id]);
                setPlaylists(prev => prev.map(p => 
                    p.id === id ? { ...p, count: p.count + 1 } : p
                ));
                await addMovieToPlaylist(id, movie.id.toString());
            }
        } catch (error) {
            console.error("Failed to update playlist:", error);
            // Revert
            if (isSelected) {
                setSelectedPlaylists(prev => [...prev, id]);
                setPlaylists(prev => prev.map(p => 
                    p.id === id ? { ...p, count: p.count + 1 } : p
                ));
            } else {
                setSelectedPlaylists(prev => prev.filter(pid => pid !== id));
                setPlaylists(prev => prev.map(p => 
                    p.id === id ? { ...p, count: Math.max(0, p.count - 1) } : p
                ));
            }
        }
    };

    const getImageUrl = (path: string | undefined | null) =>
        path?.startsWith('http') ? path : path ? `https://image.tmdb.org/t/p/w500${path}` : "https://placehold.co/600x400/1a1a1a/FFF.png";

    const handleDownload = async () => {
        const episodeId = currentEpisode?.id || movie?.id;
        if (!episodeId) {
            Alert.alert('Lỗi', 'Không thể xác định tập phim để tải.');
            return;
        }

        try {
            // Lấy ID thiết bị
            let deviceId = 'unknown-device';
            if (Platform.OS === 'android') {
                deviceId = Application.getAndroidId() || 'unknown-android';
            } else if (Platform.OS === 'ios') {
                deviceId = await Application.getIosIdForVendorAsync() || 'unknown-ios';
            }
            const requestRes = await downloadService.requestDownload({
                episodeId: episodeId.toString(),
                deviceId,
            });

            if (requestRes.success) {
                const { download, videoUrl } = requestRes.data;
                Alert.alert('Thành công', 'Video đang được tải xuống, vui lòng không đóng ứng dụng.');

                try {
                    // Thư mục lưu trữ
                    const dir = `${FileSystem.documentDirectory}downloads/`;
                    const dirInfo = await FileSystem.getInfoAsync(dir);
                    if (!dirInfo.exists) {
                        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
                    }
                    const extension = videoUrl.split('.').pop()?.split('?')[0] || 'mp4';
                    const localFilePath = `${dir}${download.id}.${extension}`;

                    const downloadResumable = FileSystem.createDownloadResumable(
                        videoUrl,
                        localFilePath,
                        {},
                        (downloadProgress) => {
                            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                            console.log(`[ID: ${download.id}] Tiến độ tải: ${Math.round(progress * 100)}%`);
                        }
                    );

                    const result = await downloadResumable.downloadAsync();

                    if (result && result.uri) {
                        console.log(`[Tải xong] Local File Path vừa tạo: ${result.uri}`);
                        await downloadService.completeDownload(download.id, {
                            filePath: result.uri
                        });
                        console.log(`Đã báo hoàn tất lên Server ID: ${download.id}`);
                        Alert.alert('Thành công', 'Tải video hoàn tất!');
                    } else {
                        Alert.alert('Lỗi', 'Không thể lưu file video vào thiết bị.');
                    }
                } catch (err) {
                    console.error('Lỗi khi tải hoặc complete download:', err);
                    Alert.alert('Lỗi', 'Quá trình tải file gặp sự cố.');
                }
            }
        } catch (error: any) {
            console.error("Lỗi khi tải phim:", error);
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra hoặc bạn chưa đăng ký gói Premium.';
            Alert.alert('Lỗi tải xuống', errorMsg);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <View className="flex-row items-center px-4 py-3 bg-black z-10 border-b border-zinc-800">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 bg-zinc-800/50 rounded-full mr-4"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
                    {currentEpisode ? `${movie.title} - ${currentEpisode.title}` : movie.title}
                </Text>
            </View>

            {/* Video Player Section */}
            <View className="w-full h-64 bg-black relative border-b border-zinc-800 justify-center items-center">
                <VideoView
                    style={{ width: '100%', height: '100%' }}
                    player={player}
                    allowsPictureInPicture
                    contentFit="contain"
                    nativeControls={!videoError}
                />
                
                {isVideoLoading && !videoError && (
                    <View className="absolute inset-0 z-10 justify-center items-center bg-black/50">
                        <ActivityIndicator size="large" color="#ef4444" />
                        <Text className="text-white text-xs mt-2 font-medium">Đang tải...</Text>
                    </View>
                )}

                {videoError && (
                    <View className="absolute inset-0 z-20 justify-center items-center bg-black/80 px-4">
                        <AlertCircle color="#ef4444" size={40} className="mb-2" />
                        <Text className="text-white text-center font-bold text-lg mb-1">Không thể phát video</Text>
                        <Text className="text-zinc-400 text-center text-sm mb-4">{videoError}</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                setVideoError(null);
                                setIsVideoLoading(true);
                                player.replay();
                            }}
                            className="bg-red-600 px-4 py-2 rounded-full"
                        >
                            <Text className="text-white font-medium text-sm">Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* 1. Info Section */}
                <View className="px-4 pt-5 pb-4">
                    <Text className="text-white text-2xl font-bold mb-3 tracking-wide">{movie.title}</Text>

                    <View className="flex-row items-center mb-5 space-x-3 gap-2">
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md space-x-1.5 gap-1.5">
                            <Star size={14} color="#fbbf24" fill="#fbbf24" />
                            <Text className="text-zinc-200 text-xs font-semibold">{(movie.rating || movie.vote_average || 0).toFixed(1)}</Text>
                        </View>
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md space-x-1.5 gap-1.5">
                            <Calendar size={14} color="#a1a1aa" />
                            <Text className="text-zinc-200 text-xs font-semibold">{movie.releaseYear || "N/A"}</Text>
                        </View>
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md space-x-1.5 gap-1.5">
                            <Clock size={14} color="#a1a1aa" />
                            <Text className="text-zinc-200 text-xs font-semibold">{currentEpisode ? `${currentEpisode.runtime} phút` : movie.duration || "N/A"}</Text>
                        </View>
                        <View className="flex-row items-center bg-zinc-800/60 px-2.5 py-1.5 rounded-md">
                            <Text className="text-zinc-200 text-xs font-semibold">{movie.type === 'TV' ? 'Series' : 'Movie'}</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row justify-around mb-6 bg-zinc-900 py-3.5 rounded-xl">
                        <TouchableOpacity onPress={toggleFavorite} className="items-center flex-row space-x-2 gap-2">
                            <Heart color={isFavorite ? "#ef4444" : "white"} fill={isFavorite ? "#ef4444" : "transparent"} size={20} />
                            <Text className={`text-sm font-medium ${isFavorite ? 'text-red-500' : 'text-white'}`}>Thích</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPlaylistVisible(true)} className="items-center flex-row space-x-2 gap-2">
                            <Plus color="white" size={20} />
                            <Text className="text-white text-sm font-medium">Danh sách</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShareVisible(true)} className="items-center flex-row space-x-2 gap-2">
                            <Share2 color="white" size={20} />
                            <Text className="text-white text-sm font-medium">Chia sẻ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDownload} className="items-center flex-row space-x-2 gap-2">
                            <Download color="white" size={20} />
                            <Text className="text-white text-sm font-medium">Tải về</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-zinc-400 text-[15px] leading-6 mb-2" numberOfLines={3}>
                        {movie.description || "Mô tả phim chưa cập nhật..."}
                    </Text>
                </View>

                {/* 2. Season & Episodes Section */}
                {movie.seasons && movie.seasons.length > 0 && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1 h-6 bg-red-600 rounded-sm mr-2.5" />
                            <Text className="text-white text-xl font-bold">Danh sách tập</Text>
                        </View>

                        {/* Season Selector */}
                        {movie.seasons.length > 1 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
                                {movie.seasons.map(season => (
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
                        )}

                        {/* Episode List */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                            {currentEpisodes.map((ep) => (
                                <TouchableOpacity
                                    key={ep.id}
                                    className="mr-4 w-44"
                                    onPress={() => handleEpisodeSelect(ep)}
                                >
                                    <View className={clsx(
                                        "w-44 h-24 rounded-lg bg-zinc-800 mb-2 relative overflow-hidden border",
                                        currentEpisode?.id === ep.id ? "border-red-600" : "border-zinc-800"
                                    )}>
                                        <Image
                                            source={{ uri: getImageUrl(ep.videoImageUrl || movie.posterUrl) }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                        <View className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded">
                                            <Text className="text-white text-[10px] font-bold">{ep.runtime}m</Text>
                                        </View>
                                        {currentEpisode?.id === ep.id && (
                                            <View className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded">
                                                <Text className="text-white text-[10px] font-bold">Đang phát</Text>
                                            </View>
                                        )}

                                        <View className="absolute inset-0 items-center justify-center">
                                            {currentEpisode?.id !== ep.id && (
                                                <View className="bg-black/30 rounded-full p-1 backdrop-blur-sm">
                                                    <Play size={20} color="white" fill="white" />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <Text
                                        className={clsx("text-sm font-medium", currentEpisode?.id === ep.id ? "text-red-500" : "text-zinc-200")}
                                        numberOfLines={1}
                                    >
                                        {ep.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* 3. Recommendations Section */}
                {movie.recommendations && movie.recommendations.length > 0 && (
                    <View className="mt-8 px-4">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1 h-6 bg-red-600 rounded-sm mr-2.5" />
                            <Text className="text-white text-xl font-bold">Đề xuất cho bạn</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                            {movie.recommendations.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className="mr-4 w-32"
                                    onPress={() => navigation.push('WatchMovie', { movie: item })}
                                >
                                    <View className="w-32 h-48 rounded-lg bg-zinc-800 mb-2 overflow-hidden border border-zinc-800">
                                        <Image source={{ uri: getImageUrl(item.posterUrl) }} className="w-full h-full" resizeMode="cover" />
                                    </View>
                                    <Text className="text-zinc-200 text-sm font-medium text-center" numberOfLines={1}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

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

            {/* Components */}
            <ShareModal
                visible={isShareVisible}
                onClose={() => setShareVisible(false)}
            />

            <PlaylistModal
                visible={isPlaylistVisible}
                onClose={() => setPlaylistVisible(false)}
                playlists={playlists}
                onAddPlaylist={handleCreatePlaylist}
                selectedPlaylists={selectedPlaylists}
                onToggleSelection={togglePlaylistSelection}
            />

            <FavoriteToast visible={isFavoriteVisible} />

        </SafeAreaView>
    );
}