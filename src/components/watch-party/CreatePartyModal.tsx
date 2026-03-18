import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Image, Switch, Alert, Platform
} from 'react-native';
import { X, Search, Calendar, ChevronDown, Check } from 'lucide-react-native';
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { watchPartyService } from '@/services/watch-party';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

const searchMoviesAPI = async (query: string) => {
    try {
        const response = await api.get('/movies/search', { params: { q: query } });
        return response.data.movies || [];
    } catch (e) {
        return [];
    }
};

interface CreatePartyModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CreatePartyModal({ visible, onClose }: CreatePartyModalProps) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [title, setTitle] = useState('');
    const [movieQuery, setMovieQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    // Movie vs TV Show
    const [selectedMovie, setSelectedMovie] = useState<any>(null);
    const [movieDetails, setMovieDetails] = useState<any>(null);
    const [selectedSeason, setSelectedSeason] = useState<any>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

    const [isPrivate, setIsPrivate] = useState(false);
    
    const [isScheduled, setIsScheduled] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (movieQuery.trim() && !selectedMovie) {
                const results = await searchMoviesAPI(movieQuery);
                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [movieQuery, selectedMovie]);

    const handleSelectMovie = async (movie: any) => {
        setSelectedMovie(movie);
        setMovieQuery(movie.title);
        setSearchResults([]);
        if (movie.media_type === 'TV') {
            setLoading(true);
            try {
                const res = await api.get(`/movies/by-id/${movie.id}`);
                setMovieDetails(res.data);
                if (res.data?.seasons?.length > 0) {
                    const firstSeason = res.data.seasons[0];
                    setSelectedSeason(firstSeason);
                    if (firstSeason.episodes?.length > 0) {
                        setSelectedEpisode(firstSeason.episodes[0]);
                    }
                }
            } catch (e) {
                console.log('Error fetching TV details:', e);
            }
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!title.trim() || !selectedMovie) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên phòng và chọn phim.');
            return;
        }

        if (selectedMovie.media_type === 'TV' && !selectedEpisode) {
            Alert.alert('Lỗi', 'Vui lòng chọn tập phim cho series này.');
            return;
        }

        setLoading(true);
        try {
            const dataToCreate = {
                title: title.trim(),
                movieId: selectedMovie.id,
                episodeId: selectedEpisode?.id,
                isPrivate: isPrivate,
                scheduledAt: isScheduled ? date.toISOString() : undefined
            };

            const room = await watchPartyService.createRoom(dataToCreate);
            Alert.alert('Thành công', 'Đã tạo phòng xem chung!');
            onClose();
            navigation.navigate('WatchPartyRoom', { roomId: room.id });
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo phòng lúc này.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-[#1F1F1F] rounded-t-3xl h-[85%] w-full overflow-hidden border-t border-slate-700">
                    <View className="flex-row items-center justify-between p-5 border-b border-slate-800">
                        <Text className="text-white text-xl font-bold">Tạo phòng xem chung</Text>
                        <TouchableOpacity onPress={onClose} className="p-1 bg-slate-800 rounded-full">
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        className="p-5 flex-1" 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="mb-5">
                            <Text className="text-slate-300 font-medium mb-3">Tên phòng</Text>
                            <TextInput
                                placeholder="Vd: Cày phim cuối tuần..."
                                placeholderTextColor="#64748b"
                                className="bg-black/30 border border-slate-700 rounded-xl p-3 text-white focus:border-red-600"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View className="mb-5 z-50">
                            <Text className="text-slate-300 font-medium mb-3">Chọn phim</Text>
                            <View className="relative z-50">
                                <View className="bg-black/30 border border-slate-700 rounded-xl flex-row items-center px-3">
                                    <Search size={18} color="#64748b" />
                                    <TextInput
                                        placeholder="Tìm kiếm phim..."
                                        placeholderTextColor="#64748b"
                                        className="flex-1 p-3 text-white ml-2"
                                        value={movieQuery}
                                        onChangeText={(text) => {
                                            setMovieQuery(text);
                                            if (selectedMovie) {
                                                setSelectedMovie(null);
                                                setMovieDetails(null);
                                                setSelectedSeason(null);
                                                setSelectedEpisode(null);
                                            }
                                        }}
                                    />
                                    {loading && !searchResults.length && <ActivityIndicator size="small" color="#ef4444" />}
                                </View>

                                {searchResults.length > 0 && !selectedMovie && (
                                    <View className="absolute top-14 left-0 right-0 bg-[#252525] border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-hidden">
                                        <ScrollView className="max-h-60" nestedScrollEnabled keyboardShouldPersistTaps="handled">
                                            {searchResults.map((movie) => (
                                                <TouchableOpacity
                                                    key={movie.id}
                                                    className="flex-row items-center gap-3 p-3 border-b border-white/5 bg-[#252525]"
                                                    onPress={() => handleSelectMovie(movie)}
                                                >
                                                    <Image
                                                        source={{ uri: movie.poster_url }}
                                                        className="w-8 h-12 rounded bg-slate-700"
                                                        resizeMode="cover"
                                                    />
                                                    <View className="flex-1">
                                                        <Text className="text-white font-medium" numberOfLines={1}>{movie.title}</Text>
                                                        <Text className="text-slate-400 text-xs">
                                                            {movie.media_type === 'TV' ? 'Series' : 'Movie'} • {movie.release_date?.substring(0,4) || 'N/A'}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* TV Show Selection (Season & Episode) */}
                        {selectedMovie?.media_type === 'TV' && movieDetails && (
                            <View className="mb-5 space-y-4">
                                <View>
                                    <Text className="text-slate-300 font-medium mb-4">Mùa</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                        {movieDetails.seasons?.map((season: any) => (
                                            <TouchableOpacity 
                                                key={season.id}
                                                onPress={() => {
                                                    setSelectedSeason(season);
                                                    if(season.episodes?.length > 0) setSelectedEpisode(season.episodes[0]);
                                                }}
                                                className={`px-4 py-2 mr-2 rounded-lg border ${selectedSeason?.id === season.id ? 'border-red-600 bg-red-600/20' : 'border-slate-700 bg-black/30'}`}>
                                                <Text className={selectedSeason?.id === season.id ? 'text-red-500 font-bold' : 'text-slate-400'}>
                                                    Season {season.season_number}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                                {selectedSeason && (
                                    <View>
                                        <Text className="text-slate-300 font-medium mb-4">Tập</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                            {selectedSeason.episodes?.map((ep: any) => (
                                                <TouchableOpacity 
                                                    key={ep.id}
                                                    onPress={() => setSelectedEpisode(ep)}
                                                    className={`px-4 py-2 mr-2 rounded-lg border ${selectedEpisode?.id === ep.id ? 'border-red-600 bg-red-600/20' : 'border-slate-700 bg-black/30'}`}>
                                                    <Text className={selectedEpisode?.id === ep.id ? 'text-red-500 font-bold' : 'text-slate-400'}>
                                                        Tập {ep.episode_number}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}


                        <View className="space-y-4 mb-20">
                            <View className="bg-black/20 p-4 rounded-xl border border-slate-800 flex-row justify-between items-center">
                                <View className="flex-1 mr-4">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Calendar size={16} color="#eab308" />
                                        <Text className="text-white font-medium">Lên lịch công chiếu</Text>
                                    </View>
                                    <Text className="text-slate-500 text-xs text-justify">Tự động phát video cho mọi người khi đến giờ hẹn.</Text>
                                </View>
                                <Switch
                                    value={isScheduled}
                                    onValueChange={setIsScheduled}
                                    trackColor={{ false: '#334155', true: '#ca8a04' }}
                                    thumbColor={isScheduled ? '#ffffff' : '#94a3b8'}
                                />
                            </View>

                            {isScheduled && (
                                <View className="bg-black/20 p-3 rounded-xl border border-slate-800">
                                    <Text className="text-yellow-500 text-sm mb-2">Chọn thời gian</Text>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity 
                                            className="flex-1 bg-black/40 p-3 rounded border border-slate-700"
                                            onPress={() => setShowDatePicker(true)}>
                                            <Text className="text-white text-center">{date.toLocaleDateString('vi-VN')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            className="flex-1 bg-black/40 p-3 rounded border border-slate-700"
                                            onPress={() => setShowTimePicker(true)}>
                                            <Text className="text-white text-center">{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row items-center justify-center gap-4 mt-4">
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display="default"
                                                themeVariant="dark"
                                                textColor="white"
                                                minimumDate={new Date()}
                                                onChange={(e: any, selectedDate?: Date) => {
                                                    setShowDatePicker(Platform.OS === 'ios');
                                                    if (selectedDate) setDate(selectedDate);
                                                }}
                                            />
                                        )}
                                        {showTimePicker && (
                                            <DateTimePicker
                                                value={date}
                                                mode="time"
                                                display="default"
                                                themeVariant="dark"
                                                textColor="white"
                                                onChange={(e: any, selectedDate?: Date) => {
                                                    setShowTimePicker(Platform.OS === 'ios');
                                                    if (selectedDate) setDate(selectedDate);
                                                }}
                                            />
                                        )}
                                    </View>
                                </View>
                            )}

                            <View className="bg-black/20 p-4 rounded-xl border border-slate-800 flex-row justify-between items-center mt-4">
                                <View className="flex-1">
                                    <Text className="text-white font-medium mb-1">Phòng riêng tư</Text>
                                    <Text className="text-slate-500 text-xs">Chỉ những người có mã hoặc link mời mới có thể tham gia.</Text>
                                </View>
                                <Switch
                                    value={isPrivate}
                                    onValueChange={setIsPrivate}
                                    trackColor={{ false: '#334155', true: '#dc2626' }}
                                    thumbColor={isPrivate ? '#ffffff' : '#94a3b8'}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View className="p-5 border-t border-slate-800 bg-[#1F1F1F] absolute bottom-0 left-0 right-0">
                        <TouchableOpacity
                            className="bg-red-600 rounded-xl py-3.5 items-center flex-row justify-center gap-2 "
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    {isScheduled ? <Calendar size={18} color="white" /> : <Check size={18} color="white" />}
                                    <Text className="text-white font-bold text-base uppercase">
                                        {isScheduled ? 'Lên lịch ngay' : 'Tạo phòng ngay'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

