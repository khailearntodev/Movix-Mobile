import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { List, ChevronLeft, Plus, Trash2, Folder } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { getPlaylists, createPlaylist, deletePlaylist, Playlist } from '../../services/interaction.service';

const PlaylistScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [isModalVisible, setModalVisible] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const fetchPlaylists = useCallback(async () => {
        try {
            const data = await getPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPlaylists();
        setRefreshing(false);
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        
        setIsCreating(true);
        try {
            await createPlaylist(newPlaylistName);
            setNewPlaylistName('');
            setModalVisible(false);
            fetchPlaylists(); // Refresh list
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tạo danh sách phát");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeletePlaylist = (id: string) => {
        Alert.alert(
            "Xóa danh sách", 
            "Bạn có chắc chắn muốn xóa danh sách này không?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Xóa", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePlaylist(id);
                            // Optimistic update
                            setPlaylists(prev => prev.filter(p => p.id !== id));
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể xóa danh sách phát");
                            fetchPlaylists(); // Revert/Refresh on error
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Playlist }) => (
        <TouchableOpacity 
            className="flex-row items-center bg-zinc-900 p-4 rounded-xl mb-3 border border-zinc-800"
            onPress={() => {
                navigation.navigate('PlaylistDetail', { 
                    playlistId: item.id, 
                    title: item.name 
                });
            }}
        >
            <View className="w-12 h-12 bg-zinc-800 rounded-lg items-center justify-center mr-4">
                <Folder size={24} color="#ef4444" />
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold text-lg">{item.name}</Text>
                <Text className="text-zinc-500 text-sm">
                    {item._count?.playlist_movies || 0} phim
                </Text>
            </View>
            <TouchableOpacity 
                className="p-2"
                onPress={() => handleDeletePlaylist(item.id)}
            >
                <Trash2 size={20} color="#71717a" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black pt-12">
            <View className="px-4 pb-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-2xl font-bold">Danh sách phát</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setModalVisible(true)}
                    className="bg-zinc-800 w-10 h-10 rounded-full items-center justify-center"
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : (
                <FlatList
                    data={playlists}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20">
                            <List size={48} color="#52525b" />
                            <Text className="text-zinc-500 mt-4 text-center">
                                Chưa có danh sách nào.{'\n'}Hãy tạo danh sách mới!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Create Playlist Modal */}
            <Modal
                transparent
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 items-center justify-center px-4">
                    <View className="bg-zinc-900 w-full rounded-2xl p-6 border border-zinc-800">
                        <Text className="text-white text-xl font-bold mb-4">Tạo danh sách mới</Text>
                        
                        <TextInput
                            className="bg-zinc-950 text-white p-4 rounded-xl border border-zinc-800 mb-4 font-medium"
                            placeholder="Tên danh sách..."
                            placeholderTextColor="#71717a"
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            autoFocus
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                className="flex-1 bg-zinc-800 p-3 rounded-xl items-center"
                                onPress={() => {
                                    setModalVisible(false);
                                    setNewPlaylistName('');
                                }}
                            >
                                <Text className="text-white font-bold">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className={`flex-1 p-3 rounded-xl items-center ${!newPlaylistName.trim() ? 'bg-red-900' : 'bg-red-600'}`}
                                disabled={!newPlaylistName.trim() || isCreating}
                                onPress={handleCreatePlaylist}
                            >
                                {isCreating ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-bold">Tạo</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PlaylistScreen;
