import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Image, Switch
} from 'react-native';
import { X, Search, Calendar, ChevronDown, Check } from 'lucide-react-native';
import clsx from 'clsx';

const mockSearchMovie = (query: string) => {
    return new Promise<any[]>((resolve) => {
        setTimeout(() => {
            if (!query) resolve([]);
            resolve([
                { id: 1, title: 'Inception', poster_url: 'https://image.tmdb.org/t/p/w200/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', media_type: 'movie', release_date: '2010' },
                { id: 2, title: 'Breaking Bad', poster_url: 'https://image.tmdb.org/t/p/w200/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', media_type: 'TV', release_date: '2008' },
            ].filter(m => m.title.toLowerCase().includes(query.toLowerCase())));
        }, 500);
    })
};

interface CreatePartyModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CreatePartyModal({ visible, onClose }: CreatePartyModalProps) {
    const [title, setTitle] = useState('');
    const [movieQuery, setMovieQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<any>(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (movieQuery.trim() && !selectedMovie) {
                const results = await mockSearchMovie(movieQuery);
                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [movieQuery, selectedMovie]);

    const handleSelectMovie = (movie: any) => {
        setSelectedMovie(movie);
        setMovieQuery(movie.title);
        setSearchResults([]);
    };

    const handleCreate = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onClose();
        }, 1500);
    }

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
                        <Text className="text-white text-xl font-bold">🍿 Tạo phòng xem chung</Text>
                        <TouchableOpacity onPress={onClose} className="p-1 bg-slate-800 rounded-full">
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-5 flex-1" showsVerticalScrollIndicator={false}>

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
                            <View className="relative">
                                <View className="bg-black/30 border border-slate-700 rounded-xl flex-row items-center px-3">
                                    <Search size={18} color="#64748b" />
                                    <TextInput
                                        placeholder="Tìm kiếm phim..."
                                        placeholderTextColor="#64748b"
                                        className="flex-1 p-3 text-white ml-2"
                                        value={movieQuery}
                                        onChangeText={(text) => {
                                            setMovieQuery(text);
                                            if (selectedMovie) setSelectedMovie(null);
                                        }}
                                    />
                                    {loading && <ActivityIndicator size="small" color="#ef4444" />}
                                </View>

                                {searchResults.length > 0 && !selectedMovie && (
                                    <View className="absolute top-14 left-0 right-0 bg-[#252525] border border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-hidden">
                                        <ScrollView className="max-h-60" nestedScrollEnabled>
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
                                                    <View>
                                                        <Text className="text-white font-medium">{movie.title}</Text>
                                                        <Text className="text-slate-400 text-xs">
                                                            {movie.media_type === 'TV' ? 'Series' : 'Movie'} • {movie.release_date}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>

                        {selectedMovie?.media_type === 'TV' && (
                            <View className="mb-5 flex-row gap-4">
                                <View className="flex-1 space-y-2">
                                    <Text className="text-slate-300 font-medium">Mùa</Text>
                                    <TouchableOpacity className="bg-black/30 border border-slate-700 p-3 rounded-xl flex-row justify-between">
                                        <Text className="text-white">Season 1</Text>
                                        <ChevronDown size={18} color="gray" />
                                    </TouchableOpacity>
                                </View>
                                <View className="flex-1 space-y-2">
                                    <Text className="text-slate-300 font-medium">Tập</Text>
                                    <TouchableOpacity className="bg-black/30 border border-slate-700 p-3 rounded-xl flex-row justify-between">
                                        <Text className="text-white">Tập 1</Text>
                                        <ChevronDown size={18} color="gray" />
                                    </TouchableOpacity>
                                </View>
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
                                    <Text className="text-yellow-500 text-sm mb-2">Chọn thời gian (Demo)</Text>
                                    <TextInput
                                        className="text-white bg-black/40 p-2 rounded border border-slate-700"
                                        defaultValue="20:00 - 10/02/2024"
                                    />
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
