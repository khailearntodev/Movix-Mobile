import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SectionList, ActivityIndicator, Image, Animated, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    Search as SearchIcon,
    SlidersHorizontal,
    ArrowLeft,
    Sparkles,
    Mic,
    Image as ImageIcon,
    X,
    Send
} from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { StatusBar } from 'expo-status-bar';
import MovieCard from '../../components/MovieCard';
import { FilterValues } from '../../components/search/FilterForm';
import { search, filterMovies, submitVoiceAiSearch, submitImageAiSearch, submitTextAiSearch } from '../../services/movie.service';
import type { Movie } from '../../types/movie';
import type { Person } from '../../types/person';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { AIChatButton } from '../../components/common/AIChatButton';

function SearchScreen({ navigation, route }: any) {
    const [searchMode, setSearchMode] = useState<'normal' | 'ai_text' | 'voice' | 'image'>('normal');
    console.log("🔍 SearchScreen Rendered. Mode:", searchMode);

    const [normalQuery, setNormalQuery] = useState('');
    const [aiTextQuery, setAiTextQuery] = useState('');
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    // Sử dụng Ref cho recording để dọn dẹp tức thì
    const recordingRef = useRef<Audio.Recording | null>(null);

    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState<FilterValues | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleSearch = useCallback(async (source: string, reset = false, directFilters?: FilterValues | null) => {
        setIsLoading(true);
        const activeFilters = directFilters !== undefined ? directFilters : filters;

        try {
            if (source.startsWith('file://') || source.startsWith('content://')) {
                setVoiceStatus('processing');
                const res = await submitVoiceAiSearch(source);
                if (res.recognizedText) {
                    setAiTextQuery(res.recognizedText);
                    setNormalQuery(res.recognizedText);
                }
                const title = `Gợi ý từ Giọng nói (AI) ${res.remaining !== undefined ? (res.remaining === -1 ? '(Vô hạn)' : `(Còn ${res.remaining} lượt)`) : ''}`;
                setSections(res.movies.length > 0 ? [{ title, data: res.movies, type: 'movie' }] : []);
                setVoiceStatus('idle');
                return;
            }

            const isFilterMode = activeFilters || source === 'filter_event' || source === 'filter_param';
            
            if (isFilterMode && searchMode === 'normal') {
                const params: any = { page: 1, take: 20 };
                const textQuery = source && !['voice', 'image', 'filter_event', 'filter_param', 'more'].includes(source) ? source : normalQuery;
                if (textQuery.trim()) params.q = textQuery.trim();

                if (activeFilters) {
                    if (activeFilters.with_genres?.length) params.genre = activeFilters.with_genres.join(',');
                    if (activeFilters.region && activeFilters.region !== 'Tất cả') params.country = activeFilters.region;
                    if (activeFilters.year && activeFilters.year !== 'Tất cả') params.year = activeFilters.year;
                    if (activeFilters.type && activeFilters.type !== 'all') params.type = activeFilters.type;
                    if (activeFilters.rating && activeFilters.rating !== 'Tất cả') params.rating = activeFilters.rating;
                }
                
                const { movies, pagination } = await filterMovies(params);
                setSections(movies.length > 0 ? [{ title: 'Kết quả lọc', data: movies, type: 'movie' }] : []);
                setPage(1);
                setHasMore(pagination?.page < pagination?.totalPages);

            } else if (searchMode === 'normal') {
                const query = source && !['voice', 'image', 'filter_event', 'filter_param', 'more'].includes(source) ? source : normalQuery;
                if (!query.trim()) {
                    if (reset) {
                        loadInitialMovies();
                    } else {
                        setIsLoading(false);
                    }
                    return;
                }
                const { movies, people } = await search(query);
                const newSections: any[] = [];
                if (movies.length > 0) newSections.push({ title: 'Phim', data: movies, type: 'movie' });
                if (people.length > 0) newSections.push({ title: 'Nghệ sĩ', data: people, type: 'person' });
                setSections(newSections);
                setHasMore(false);

            } else if (searchMode === 'ai_text') {
                const query = source && !['voice', 'image', 'filter_event', 'filter_param', 'more'].includes(source) ? source : aiTextQuery;
                if (!query.trim()) return;
                const { movies, remaining } = await submitTextAiSearch(query);
                setSections(movies.length > 0 ? [{ title: `Gợi ý từ AI ${remaining !== undefined ? (remaining === -1 ? '(Vô hạn)' : `(Còn ${remaining} lượt)`) : ''}`, data: movies, type: 'movie' }] : []);

            } else if (searchMode === 'image') {
                if (selectedImage) {
                    const { movies, remaining } = await submitImageAiSearch(selectedImage);
                    setSections(movies.length > 0 ? [{ title: `Tìm thấy qua hình ảnh ${remaining !== undefined ? (remaining === -1 ? '(Vô hạn)' : `(Còn ${remaining} lượt)`) : ''}`, data: movies, type: 'movie' }] : []);
                }
            }
        } catch (error: any) {
            console.error("Search error:", error);
            if (error?.response?.status === 403) {
                Alert.alert(
                    "Đã đạt giới hạn",
                    error.response.data.message || "Bạn đã hết lượt dùng AI hôm nay. Vui lòng nâng cấp gói VIP.",
                    [{ text: "Đóng", style: "cancel" }]
                );
            } else {
                Alert.alert("Lỗi", "Không thể tìm kiếm, vui lòng thử lại sau.");
            }
            setSections([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchMode, filters, aiTextQuery, normalQuery, selectedImage]);

    const loadInitialMovies = async () => {
        setIsLoading(true);
        try {
            const { movies, pagination } = await filterMovies({ page: 1, take: 20 });
            setSections(movies.length > 0 ? [{ title: 'Phim để bạn khám phá', data: movies, type: 'movie' }] : []);
            setPage(1);
            setHasMore(pagination?.page < pagination?.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('event.updateFilters', (newFilters) => {
            setFilters(newFilters);
            handleSearch('filter_event', true, newFilters);
        });

        if (route.params?.appliedFilters) {
            const af = route.params.appliedFilters;
            setFilters(af);
            handleSearch('filter_param', true, af);
        }

        if (!route.params?.appliedFilters) {
            loadInitialMovies();
        }

        return () => {
            subscription.remove();
            // Cleanup recording tức thì qua Ref
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync().catch(() => {});
                recordingRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [searchMode]);

    useEffect(() => {
        if (searchMode !== 'normal') return;
        const delayDebounceFn = setTimeout(() => {
            if (normalQuery.trim()) {
                handleSearch(normalQuery, true);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [normalQuery, searchMode, handleSearch]);

    const handleLoadMore = async () => {
        if (!hasMore || isLoadingMore || isLoading || searchMode !== 'normal') return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            const params: any = { page: nextPage, take: 20 };
            if (normalQuery.trim()) params.q = normalQuery.trim();
            if (filters) {
                if (filters.with_genres?.length) params.genre = filters.with_genres.join(',');
                if (filters.region && filters.region !== 'Tất cả') params.country = filters.region;
                if (filters.year && filters.year !== 'Tất cả') params.year = filters.year;
                if (filters.type && filters.type !== 'all') params.type = filters.type;
                if (filters.rating && filters.rating !== 'Tất cả') params.rating = filters.rating;
            }
            const { movies, pagination } = await filterMovies(params);
            if (movies.length > 0) {
                setSections(prev => {
                    const next = [...prev];
                    const movieSectionIdx = next.findIndex(s => s.type === 'movie');
                    if (movieSectionIdx >= 0) {
                        next[movieSectionIdx].data = [...next[movieSectionIdx].data, ...movies];
                    }
                    return next;
                });
                setPage(nextPage);
            }
            setHasMore(pagination?.page < pagination?.totalPages);
        } catch (error) {
            console.error("Load more error:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleVoiceToggle = async () => {
        console.log("🎤 Voice Toggle Pressed. Current Status:", voiceStatus);
        
        if (voiceStatus === 'idle') {
            try {
                // 1. Dọn dẹp tuyệt đối bất kỳ phiên cũ nào còn sót lại
                if (recordingRef.current) {
                    console.log("🧹 Unloading existing recording...");
                    await recordingRef.current.stopAndUnloadAsync().catch(() => {});
                    recordingRef.current = null;
                }

                const perm = await Audio.requestPermissionsAsync();
                if (perm.status !== 'granted') {
                    alert("Cần quyền Micro để thực hiện chức năng này");
                    return;
                }

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                // Chờ 100ms để hệ thống audio ổn định
                await new Promise(resolve => setTimeout(resolve, 100));

                console.log("⏺️ Starting new recording...");
                const { recording: newRec } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                
                recordingRef.current = newRec;
                setVoiceStatus('listening');
            } catch (err) {
                console.error("Mic error:", err);
                setVoiceStatus('idle');
                recordingRef.current = null;
            }
        } else if (voiceStatus === 'listening') {
            try {
                if (recordingRef.current) {
                    console.log("🛑 Stopping recording...");
                    setVoiceStatus('processing');
                    
                    await recordingRef.current.stopAndUnloadAsync();
                    const uri = recordingRef.current.getURI();
                    recordingRef.current = null;
                    
                    if (uri) {
                        console.log("🚀 Submitting voice search with URI:", uri);
                        await handleSearch(uri, true);
                    } else {
                        setVoiceStatus('idle');
                    }
                }
            } catch (err) {
                console.error("Stop mic error:", err);
                setVoiceStatus('idle');
                recordingRef.current = null;
            }
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    return (
        <View className="flex-1 bg-zinc-950">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                <View className="px-4 pt-4 pb-2 bg-zinc-950 z-20">
                    <View className="flex-row items-center gap-3 mb-3">

                        <View className="flex-1 flex-row items-center bg-zinc-900 rounded-xl px-3 py-3 border border-zinc-800">
                            <SearchIcon size={20} color="#71717a" />
                            <TextInput
                                className="flex-1 ml-2 text-white text-base"
                                placeholder="Tìm tên phim, diễn viên..."
                                placeholderTextColor="#71717a"
                                value={normalQuery}
                                onChangeText={setNormalQuery}
                                onSubmitEditing={() => handleSearch(normalQuery, true)}
                                editable={searchMode === 'normal'}
                            />
                            {normalQuery.length > 0 && <TouchableOpacity onPress={() => setNormalQuery('')}><X size={16} color="#71717a" /></TouchableOpacity>}
                        </View>
                    </View>
                    <View className="flex-row justify-between gap-2">
                        <TouchableOpacity className={`flex-1 flex-row items-center justify-center p-2 rounded-lg border ${filters ? 'bg-yellow-600/10 border-yellow-600' : 'bg-zinc-900 border-zinc-800'}`} onPress={() => navigation?.navigate?.("Filter")}><SlidersHorizontal size={18} color={filters ? "#eab308" : "#a1a1aa"} /><Text className={`ml-2 font-medium ${filters ? 'text-yellow-500' : 'text-zinc-400'}`}>Bộ lọc</Text></TouchableOpacity>
                        <TouchableOpacity className={`flex-1 flex-row items-center justify-center p-2 rounded-lg border ${searchMode === 'ai_text' ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-900 border-zinc-800'}`} onPress={() => setSearchMode(searchMode === 'ai_text' ? 'normal' : 'ai_text')}><Sparkles size={18} color={searchMode === 'ai_text' ? "white" : "#818cf8"} /><Text className={`ml-2 font-medium ${searchMode === 'ai_text' ? 'text-white' : 'text-indigo-400'}`}>AI</Text></TouchableOpacity>
                        <TouchableOpacity className={`p-2 w-12 items-center justify-center rounded-lg border ${searchMode === 'voice' ? 'bg-red-600 border-red-500' : 'bg-zinc-900 border-zinc-800'}`} onPress={() => setSearchMode(searchMode === 'voice' ? 'normal' : 'voice')}><Mic size={18} color={searchMode === 'voice' ? "white" : "#ef4444"} /></TouchableOpacity>
                        <TouchableOpacity className={`p-2 w-12 items-center justify-center rounded-lg border ${searchMode === 'image' ? 'bg-emerald-600 border-emerald-500' : 'bg-zinc-900 border-zinc-800'}`} onPress={() => setSearchMode(searchMode === 'image' ? 'normal' : 'image')}><ImageIcon size={18} color={searchMode === 'image' ? "white" : "#34d399"} /></TouchableOpacity>
                    </View>
                </View>

                {searchMode === 'ai_text' && (
                    <Animated.View style={{ opacity: fadeAnim }} className="bg-indigo-950/20 m-4 p-4 rounded-xl border border-indigo-500/30">
                        <View className="flex-row items-center mb-2"><Sparkles size={16} color="#818cf8" /><Text className="text-indigo-300 font-bold ml-2">Mô tả phim bạn muốn xem</Text></View>
                        <TextInput className="bg-zinc-950/50 text-white p-3 rounded-lg border border-indigo-500/20 h-24 text-top align-top" placeholder="Ví dụ: Một bộ phim buồn về tình yêu..." placeholderTextColor="#6366f1" multiline numberOfLines={4} value={aiTextQuery} onChangeText={setAiTextQuery} style={{ textAlignVertical: 'top' }} />
                        <TouchableOpacity 
                            className={`bg-indigo-600 mt-3 py-3 rounded-lg flex-row justify-center items-center ${isLoading ? 'opacity-70' : ''}`} 
                            onPress={() => handleSearch(aiTextQuery, true)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" className="mr-2" />
                            ) : (
                                <>
                                    <Text className="text-white font-bold mr-2">Phân tích & Tìm kiếm</Text>
                                    <Send size={16} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}
                {searchMode === 'voice' && (
                    <Animated.View style={{ opacity: fadeAnim }} className="bg-red-950/20 m-4 p-6 rounded-xl border border-red-500/30 items-center">
                        <Text className="text-red-300 font-bold mb-4">{voiceStatus === 'listening' ? "Đang nghe..." : voiceStatus === 'processing' ? "Đang phân tích..." : "Chạm để nói"}</Text>
                        <TouchableOpacity onPress={handleVoiceToggle} className={`w-20 h-20 rounded-full items-center justify-center border-4 ${voiceStatus === 'listening' ? 'bg-red-600 border-red-400' : 'bg-zinc-800 border-zinc-700'}`}>{voiceStatus === 'processing' ? <ActivityIndicator color="white" size="large" /> : <Mic size={32} color={voiceStatus === 'listening' ? "white" : "#ef4444"} />}</TouchableOpacity>
                    </Animated.View>
                )}
                {searchMode === 'image' && (
                    <Animated.View style={{ opacity: fadeAnim }} className="bg-emerald-950/20 m-4 p-4 rounded-xl border border-emerald-500/30">
                        <Text className="text-emerald-300 font-bold mb-3 flex-row items-center"><ImageIcon size={16} color="#34d399" /> Tải lên hình ảnh</Text>
                        <TouchableOpacity className="border-2 border-dashed border-emerald-500/30 rounded-xl h-40 items-center justify-center bg-black/20" onPress={handlePickImage} disabled={isLoading}>
                            {selectedImage ? (
                                <View className="items-center"><View className="w-20 h-20 bg-zinc-800 rounded-lg mb-2 overflow-hidden"><Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%' }} /></View><Text className="text-emerald-400">Đã chọn ảnh</Text></View>
                            ) : (
                                <View className="items-center"><ImageIcon size={32} color="#34d399" className="opacity-50" /><Text className="text-emerald-500/50 mt-2">Chạm để chọn ảnh</Text></View>
                            )}
                        </TouchableOpacity>
                        {selectedImage && (
                            <TouchableOpacity 
                                className={`bg-emerald-600 mt-3 py-3 rounded-lg items-center ${isLoading ? 'opacity-70' : ''}`} 
                                onPress={() => handleSearch('image', true)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-bold">Tìm kiếm phim này</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                )}

                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => (item as any)?.id?.toString() + index}
                    renderSectionHeader={({ section: { title } }) => <Text className="text-white text-lg font-bold p-4 pb-0">{title}</Text>}
                    renderItem={({ item, section }) => section.type === 'movie' ? (
                        <View className="px-4 mt-4"><MovieCard movie={item as Movie} onPress={() => navigation?.navigate('MovieDetail', { movie: item as Movie })} /></View>
                    ) : (
                        <TouchableOpacity className="flex-row items-center bg-zinc-900 mx-4 mt-3 p-3 rounded-xl border border-zinc-800" onPress={() => (item as Person).id && navigation?.navigate('PersonDetail', { personId: (item as Person).id })}>
                            <Image source={{ uri: (item as Person).avatar_url || "https://placehold.net/100x100.png" }} className="w-12 h-12 rounded-full bg-zinc-800" />
                            <View className="ml-3 flex-1"><Text className="text-white font-bold">{ (item as Person).name }</Text><Text className="text-zinc-500 text-xs">{ (item as Person).role_type }</Text></View>
                        </TouchableOpacity>
                    )}
                    onEndReached={handleLoadMore}
                    ListEmptyComponent={() => !isLoading && <View className="items-center justify-center mt-20 opacity-30"><SearchIcon size={60} color="#3f3f46" /><Text className="text-white mt-4">Tìm kiếm gì đó...</Text></View>}
                    ListFooterComponent={() => (isLoading || isLoadingMore) ? <ActivityIndicator size="small" color="#ef4444" className="py-4" /> : null}
                />
            </SafeAreaView>
            <AIChatButton />
        </View>
    );
}

export default memo(SearchScreen);
