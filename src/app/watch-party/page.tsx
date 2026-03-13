import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ImageBackground, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Play } from 'lucide-react-native';
import { PartyRoom } from '@/types/watch-party';
import { PartyCard } from '@/components/watch-party/PartyCard';
import CreatePartyModal from '@/components/watch-party/CreatePartyModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// Mock Data
const MOCK_ROOMS: PartyRoom[] = [
    { id: '1', title: 'Cày phim đêm khuya 🍿', movieTitle: 'Interstellar', image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', status: 'live', viewers: 128, host: 'Alice Nguyen', isPrivate: false },
    { id: '2', title: 'Marvel Marathon', movieTitle: 'Avengers: Endgame', image: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', status: 'scheduled', scheduledAt: '2024-02-10T20:00:00Z', host: 'Bob Smith', isPrivate: true },
    { id: '3', title: 'Xem lại Arcane', movieTitle: 'Arcane: Season 2', image: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', status: 'ended', host: 'Charlie', isPrivate: false },
];

export default function WatchPartyScreen() {
    const [filter, setFilter] = useState<'live' | 'scheduled' | 'ended'>('live');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickCode, setQuickCode] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const filteredRooms = MOCK_ROOMS.filter(r => r.status === filter);

    const FilterButton = ({ label, value, activeColor }: { label: string, value: typeof filter, activeColor: string }) => (
        <TouchableOpacity
            onPress={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg mr-2 border ${filter === value ? `bg-${activeColor}-600 border-${activeColor}-600` : 'bg-[#1F1F1F] border-slate-800'}`}
        >
            <Text className={`${filter === value ? 'text-white' : 'text-slate-400'} font-medium text-xs`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#141414]">
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground
                    source={{ uri: 'https://image.tmdb.org/t/p/original/t5zCBSB5xMDKcDqe91qahCOUYVV.jpg' }}
                    className="h-64 justify-end pb-6"
                    resizeMode="cover"
                >
                    <View className="absolute inset-0 bg-black/60" />
                    <View className="px-5 space-y-3">
                        <Text className="text-white text-3xl font-bold tracking-tighter shadow-lg">WATCH PARTY</Text>
                        <Text className="text-slate-300 text-sm font-light leading-5" numberOfLines={2}>
                            Xem phim cùng bạn bè, trò chuyện thời gian thực ngay trên điện thoại.
                        </Text>

                        <View className="flex-row gap-3 mt-2">
                            <TouchableOpacity
                                className="flex-1 bg-red-600 rounded-lg flex-row items-center justify-center py-3 gap-2 shadow-lg shadow-red-900/20"
                                onPress={() => setIsCreateModalOpen(true)}
                            >
                                <Plus size={18} color="white" />
                                <Text className="text-white font-bold text-sm">Tạo phòng</Text>
                            </TouchableOpacity>

                            <View className="flex-[1.5] flex-row bg-black/50 border border-slate-600 rounded-lg items-center px-3">
                                <TextInput
                                    placeholder="Nhập mã..."
                                    placeholderTextColor="#94a3b8"
                                    className="flex-1 text-white py-2 font-mono text-sm"
                                    value={quickCode}
                                    onChangeText={setQuickCode}
                                    autoCapitalize="characters"
                                    maxLength={6}
                                />
                                <TouchableOpacity disabled={!quickCode}>
                                    <Play size={16} color={quickCode ? "white" : "#64748b"} fill={quickCode ? "white" : "transparent"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ImageBackground>

                <View className="px-4 py-6">
                    <View className="flex-row items-center bg-[#1F1F1F] rounded-full border border-slate-800 px-4 py-2.5 mb-6">
                        <Search size={16} color="#64748b" />
                        <TextInput
                            placeholder="Tìm tên phòng, phim..."
                            placeholderTextColor="#64748b"
                            className="flex-1 ml-2 text-white text-sm"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View className="flex-row mb-6">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                onPress={() => setFilter('live')}
                                className={`px-5 py-2 rounded-lg mr-2 border ${filter === 'live' ? 'bg-red-600 border-red-600' : 'bg-[#1F1F1F] border-slate-800'}`}
                            >
                                <Text className={`${filter === 'live' ? 'text-white' : 'text-slate-400'} font-medium text-xs`}>Đang diễn ra</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setFilter('scheduled')}
                                className={`px-5 py-2 rounded-lg mr-2 border ${filter === 'scheduled' ? 'bg-yellow-600 border-yellow-600' : 'bg-[#1F1F1F] border-slate-800'}`}
                            >
                                <Text className={`${filter === 'scheduled' ? 'text-white' : 'text-slate-400'} font-medium text-xs`}>Sắp chiếu</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setFilter('ended')}
                                className={`px-5 py-2 rounded-lg mr-2 border ${filter === 'ended' ? 'bg-slate-700 border-slate-700' : 'bg-[#1F1F1F] border-slate-800'}`}
                            >
                                <Text className={`${filter === 'ended' ? 'text-white' : 'text-slate-400'} font-medium text-xs`}>Đã kết thúc</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <View className="pb-10">
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => (
                                <PartyCard
                                    key={room.id}
                                    item={room}
                                    onPress={() => navigation.navigate('WatchPartyRoom', { roomId: room.id })}
                                />
                            ))
                        ) : (
                            <View className="items-center justify-center py-10 opacity-50">
                                <Text className="text-slate-400">Không tìm thấy phòng nào.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <CreatePartyModal
                visible={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </View>
    );
}