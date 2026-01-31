import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Image, Modal, Animated, DeviceEventEmitter } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    Search as SearchIcon,
    SlidersHorizontal,
    ArrowLeft,
    Sparkles,
    Mic,
    Image as ImageIcon,
    X,
    Send,
    Loader2
} from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { StatusBar } from 'expo-status-bar';
import { MOCK_MOVIES } from '../../data/mockData';
import MovieCard from '../../components/MovieCard';
import { FilterValues } from '../../components/search/FilterForm';

// --- TYPES ---
type SearchRouteProp = RouteProp<RootStackParamList, 'Search'>;
type SearchMode = 'normal' | 'ai_text' | 'voice' | 'image';

export default function SearchPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<SearchRouteProp>();

    // --- STATES ---
    const [searchMode, setSearchMode] = useState<SearchMode>('normal');

    // Query States
    const [normalQuery, setNormalQuery] = useState('');
    const [aiTextQuery, setAiTextQuery] = useState('');
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Data States
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<FilterValues | null>(null);

    // Animation Refs
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // --- EFFECTS ---
    useEffect(() => {
        // [EVENT LISTENER]: Lắng nghe sự kiện update từ trang Filter
        // Đây là cách an toàn nhất để đảm bảo UI update ngay khi modal đóng
        const subscription = DeviceEventEmitter.addListener('event.updateFilters', (newFilters) => {
            console.log("📢 SearchPage received filters event:", newFilters);
            setFilters(newFilters);
            handleSearch('filter_event', true);
        });

        // Fallback: Check params (cho trường hợp legacy)
        if (route.params?.appliedFilters) {
            setFilters(route.params.appliedFilters);
            handleSearch('filter_param', true);
        }

        return () => {
            subscription.remove();
        };
    }, [route.params]);

    // Hiệu ứng chuyển mode
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [searchMode]);

    // --- HANDLERS (LOGIC MOCK) ---

    const handleSearch = (source: string, reset = false) => {
        setIsLoading(true);
        console.log(`🔍 Searching via [${searchMode}]:`, source);

        // Giả lập API call
        setTimeout(() => {
            const newMovies = [...MOCK_MOVIES];
            // Xáo trộn dữ liệu chút cho cảm giác khác nhau
            const shuffled = newMovies.sort(() => 0.5 - Math.random());

            setResults(prev => reset ? shuffled : [...prev, ...shuffled.map(m => ({ ...m, id: Math.random() }))]);
            setIsLoading(false);
            if (source === 'voice') setVoiceStatus('idle');
        }, 1500);
    };

    const toggleMode = (mode: SearchMode) => {
        if (searchMode === mode) {
            setSearchMode('normal'); // Tắt nếu bấm lại
        } else {
            setSearchMode(mode);
            setResults([]); // Reset kết quả khi đổi chế độ
            fadeAnim.setValue(0);
        }
    };

    const handleVoiceToggle = () => {
        if (voiceStatus === 'idle') {
            setVoiceStatus('listening');
            // Giả lập nghe 3s xong tự tìm
            setTimeout(() => {
                setVoiceStatus('processing');
                handleSearch('voice', true);
            }, 3000);
        } else {
            setVoiceStatus('idle');
        }
    };

    // --- RENDER SECTIONS ---

    const renderAiTextPanel = () => (
        <Animated.View style={{ opacity: fadeAnim }} className="bg-indigo-950/20 m-4 p-4 rounded-xl border border-indigo-500/30">
            <View className="flex-row items-center mb-2">
                <Sparkles size={16} color="#818cf8" />
                <Text className="text-indigo-300 font-bold ml-2">Mô tả phim bạn muốn xem</Text>
            </View>
            <TextInput
                className="bg-zinc-950/50 text-white p-3 rounded-lg border border-indigo-500/20 h-24 text-top align-top"
                placeholder="Ví dụ: Một bộ phim buồn về tình yêu ở Paris, kết thúc bi thảm..."
                placeholderTextColor="#6366f1"
                multiline
                numberOfLines={4}
                value={aiTextQuery}
                onChangeText={setAiTextQuery}
                style={{ textAlignVertical: 'top' }}
            />
            <TouchableOpacity
                className="bg-indigo-600 mt-3 py-3 rounded-lg flex-row justify-center items-center"
                onPress={() => handleSearch(aiTextQuery, true)}
            >
                <Text className="text-white font-bold mr-2">Phân tích & Tìm kiếm</Text>
                <Send size={16} color="white" />
            </TouchableOpacity>
            <Text className="text-indigo-400/40 text-xs mt-2 italic text-center">
                * AI sẽ phân tích ngữ nghĩa để tìm phim phù hợp nhất.
            </Text>
        </Animated.View>
    );

    const renderVoicePanel = () => (
        <Animated.View style={{ opacity: fadeAnim }} className="bg-red-950/20 m-4 p-6 rounded-xl border border-red-500/30 items-center">
            <Text className="text-red-300 font-bold mb-4">
                {voiceStatus === 'listening' ? "Đang nghe giọng nói..." :
                    voiceStatus === 'processing' ? "Đang phân tích..." : "Chạm để nói"}
            </Text>

            <TouchableOpacity
                onPress={handleVoiceToggle}
                className={`w-20 h-20 rounded-full items-center justify-center border-4 ${voiceStatus === 'listening'
                        ? 'bg-red-600 border-red-400 shadow-lg shadow-red-500'
                        : 'bg-zinc-800 border-zinc-700'
                    }`}
            >
                {voiceStatus === 'processing' ? (
                    <ActivityIndicator color="white" size="large" />
                ) : (
                    <Mic size={32} color={voiceStatus === 'listening' ? "white" : "#ef4444"} />
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    const renderImagePanel = () => (
        <Animated.View style={{ opacity: fadeAnim }} className="bg-emerald-950/20 m-4 p-4 rounded-xl border border-emerald-500/30">
            <Text className="text-emerald-300 font-bold mb-3 flex-row items-center">
                <ImageIcon size={16} color="#34d399" /> Tải lên hình ảnh (Poster, Cảnh phim...)
            </Text>

            <TouchableOpacity
                className="border-2 border-dashed border-emerald-500/30 rounded-xl h-40 items-center justify-center bg-black/20"
                onPress={() => setSelectedImage("mock_image_path")}
            >
                {selectedImage ? (
                    <View className="items-center">
                        <View className="w-20 h-20 bg-zinc-800 rounded-lg mb-2 items-center justify-center">
                            <ImageIcon size={40} color="#34d399" />
                        </View>
                        <Text className="text-emerald-400">Đã chọn ảnh demo.jpg</Text>
                    </View>
                ) : (
                    <View className="items-center">
                        <ImageIcon size={32} color="#34d399" className="opacity-50" />
                        <Text className="text-emerald-500/50 mt-2">Chạm để chọn ảnh</Text>
                    </View>
                )}
            </TouchableOpacity>

            {selectedImage && (
                <TouchableOpacity
                    className="bg-emerald-600 mt-3 py-3 rounded-lg items-center"
                    onPress={() => handleSearch('image', true)}
                >
                    <Text className="text-white font-bold">Tìm kiếm phim này</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    return (
        <View className="flex-1 bg-zinc-950">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">

                {/* --- 1. HEADER CHÍNH --- */}
                <View className="px-4 pt-4 pb-2 bg-zinc-950 z-20">
                    <View className="flex-row items-center gap-3 mb-3">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <ArrowLeft size={24} color="#a1a1aa" />
                        </TouchableOpacity>

                        {/* Ô nhập thông thường (chỉ hiện khi không ở mode AI Text) */}
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
                            {normalQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setNormalQuery('')}>
                                    <X size={16} color="#71717a" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* --- 2. TOOLBAR CÔNG CỤ (Feature Icons) --- */}
                    <View className="flex-row justify-between gap-2">
                        {/* Nút FILTER */}
                        <TouchableOpacity
                            className={`flex-1 flex-row items-center justify-center p-2 rounded-lg border ${filters ? 'bg-yellow-600/10 border-yellow-600' : 'bg-zinc-900 border-zinc-800'}`}
                            onPress={() => navigation.navigate("Filter")}
                        >
                            <SlidersHorizontal size={18} color={filters ? "#eab308" : "#a1a1aa"} />
                            <Text className={`ml-2 font-medium ${filters ? 'text-yellow-500' : 'text-zinc-400'}`}>Bộ lọc</Text>
                        </TouchableOpacity>

                        {/* Nút AI TEXT */}
                        <TouchableOpacity
                            className={`flex-1 flex-row items-center justify-center p-2 rounded-lg border ${searchMode === 'ai_text' ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-900 border-zinc-800'}`}
                            onPress={() => toggleMode('ai_text')}
                        >
                            <Sparkles size={18} color={searchMode === 'ai_text' ? "white" : "#818cf8"} />
                            <Text className={`ml-2 font-medium ${searchMode === 'ai_text' ? 'text-white' : 'text-indigo-400'}`}>AI</Text>
                        </TouchableOpacity>

                        {/* Nút VOICE */}
                        <TouchableOpacity
                            className={`p-2 w-12 items-center justify-center rounded-lg border ${searchMode === 'voice' ? 'bg-red-600 border-red-500' : 'bg-zinc-900 border-zinc-800'}`}
                            onPress={() => toggleMode('voice')}
                        >
                            <Mic size={18} color={searchMode === 'voice' ? "white" : "#ef4444"} />
                        </TouchableOpacity>

                        {/* Nút IMAGE */}
                        <TouchableOpacity
                            className={`p-2 w-12 items-center justify-center rounded-lg border ${searchMode === 'image' ? 'bg-emerald-600 border-emerald-500' : 'bg-zinc-900 border-zinc-800'}`}
                            onPress={() => toggleMode('image')}
                        >
                            <ImageIcon size={18} color={searchMode === 'image' ? "white" : "#34d399"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- 3. EXPANDABLE PANELS (AI MODES) --- */}
                {searchMode === 'ai_text' && renderAiTextPanel()}
                {searchMode === 'voice' && renderVoicePanel()}
                {searchMode === 'image' && renderImagePanel()}

                {/* --- 4. DANH SÁCH KẾT QUẢ --- */}
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <MovieCard movie={item} onPress={() => console.log("Click phim:", item.title)} />
                    )}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    onEndReached={() => !isLoading && handleSearch('more')}
                    ListHeaderComponent={() => (
                        <View className="mb-2">
                            {/* Hiển thị filter tags nếu có */}
                            {filters && (
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    <View className="bg-yellow-600/20 px-3 py-1 rounded-full border border-yellow-600/50">
                                        <Text className="text-yellow-500 text-xs">Đang lọc...</Text>
                                    </View>
                                    {filters.sort_by && <Text className="text-zinc-500 text-xs self-center">Sort: {filters.sort_by}</Text>}
                                </View>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        !isLoading && (
                            <View className="items-center justify-center mt-10 opacity-50">
                                {searchMode === 'normal' && (
                                    <>
                                        <SearchIcon size={60} color="#3f3f46" />
                                        <Text className="text-zinc-600 mt-4 font-bold">Tìm kiếm phim yêu thích</Text>
                                    </>
                                )}
                                {searchMode === 'ai_text' && (
                                    <>
                                        <Sparkles size={60} color="#4338ca" />
                                        <Text className="text-indigo-900 mt-4 font-bold">AI Magic Search</Text>
                                    </>
                                )}
                            </View>
                        )
                    )}
                    ListFooterComponent={() => (
                        isLoading ? <ActivityIndicator size="small" color="#ef4444" className="py-4" /> : null
                    )}
                />

            </SafeAreaView>
        </View>
    );
}
