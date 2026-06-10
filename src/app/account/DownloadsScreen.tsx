import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ArrowLeft, Trash2, DownloadCloud, Play } from 'lucide-react-native';
import { downloadService } from '../../services/download.service';
import { OfflineDownload } from '../../types/download';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_POSTER_STORAGE_KEY = 'offline_download_posters';

export default function DownloadsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [downloads, setDownloads] = useState<OfflineDownload[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDownloads = async () => {
        try {
            setIsLoading(true);
            let deviceId = 'unknown-device';
            if (Platform.OS === 'android') {
                deviceId = Application.getAndroidId() || 'unknown-android';
            } else if (Platform.OS === 'ios') {
                deviceId = await Application.getIosIdForVendorAsync() || 'unknown-ios';
            }

            const response = await downloadService.getDownloads(deviceId);
            if (response.success) {
                const rawPosters = await AsyncStorage.getItem(OFFLINE_POSTER_STORAGE_KEY);
                const posterMap: Record<string, string> = rawPosters ? JSON.parse(rawPosters) : {};
                const downloadsWithPosters = (response.data || []).map((item) => ({
                    ...item,
                    posterPath: item.posterPath || posterMap[item.id],
                }));

                setDownloads(downloadsWithPosters);
            }
        } catch (error) {
            console.error('Failed to fetch downloads:', error);
            Alert.alert('Lỗi', 'Không thể lấy dữ liệu tải xuống');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDownloads();
    }, []);

    const removeOfflinePoster = async (item: OfflineDownload) => {
        try {
            const rawPosters = await AsyncStorage.getItem(OFFLINE_POSTER_STORAGE_KEY);
            const posterMap: Record<string, string> = rawPosters ? JSON.parse(rawPosters) : {};
            const posterPath = item.posterPath || posterMap[item.id];

            if (posterPath) {
                const posterInfo = await FileSystem.getInfoAsync(posterPath);
                if (posterInfo.exists) {
                    await FileSystem.deleteAsync(posterPath, { idempotent: true });
                }
            }

            if (posterMap[item.id]) {
                delete posterMap[item.id];
                await AsyncStorage.setItem(OFFLINE_POSTER_STORAGE_KEY, JSON.stringify(posterMap));
            }
        } catch (error) {
            console.warn('Khong the xoa poster offline:', error);
        }
    };

    const handleDelete = async (item: OfflineDownload, titleName: string) => {
        Alert.alert(
            'Xác nhận xoá',
            `Bạn có chắc chắn muốn xoá bộ phim "${titleName}" đã tải xuống?\nHành động này cũng sẽ cài lại số lượt trên gói của bạn.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xoá',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await downloadService.removeDownload(item.id);
                            await removeOfflinePoster(item);
                            // Cập nhật giao diện
                            setDownloads((prev) => prev.filter((d) => d.id !== item.id));
                        } catch (error) {
                            console.error('Lỗi khi xoá offline:', error);
                            Alert.alert('Lỗi', 'Không thể xoá vì quá trình xử lý gặp lỗi.');
                        }
                    },
                },
            ]
        );
    };

    const handlePlayOffline = async (item: OfflineDownload) => {
        if (item.status !== 'COMPLETED') {
            Alert.alert('Thông báo', 'Phim/tập vẫn đang tải xuống.');
            return;
        }

        if (!item.movie) {
            Alert.alert('Lỗi', 'Dữ liệu phim không hợp lệ.');
            return;
        }

        // Lấy lại filePath mà lúc lưu vào API số 2 chúng ta đã gửi lên server
        // Dùng fallback thủ công tạo lại link gốc để chớt trường hợp Backend API Get List không chịu trả field này.
        const localPath = item.filePath || `${FileSystem.documentDirectory}downloads/${item.id}.mp4`;

        if (!localPath) {
            Alert.alert('Lỗi', 'Không tìm thấy file nguồn video offline.');
            return;
        }
        
        try {
            const fileInfo = await FileSystem.getInfoAsync(localPath);
            if (!fileInfo.exists) {
                Alert.alert('Lỗi', 'File phim đã bị xoá khỏi bộ nhớ máy hoặc quá trình tải trước đó bị gián đoạn chưa tải xong gốc.');
                return;
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra file local:', error);
        }

        // Điều hướng sang WatchMovie và truyền thêm offlineUrl là link local
        navigation.navigate('WatchMovie', {
            movie: item.movie,
            episodeId: item.episodeId,
            offlineUrl: localPath
        });
    };

    const renderItem = ({ item }: { item: OfflineDownload }) => {
        const movieTitle = item?.movie?.title || item?.episode?.title || 'Không rõ tên phim';
        const coverPic = item.posterPath || item?.movie?.posterUrl || item?.movie?.backdropUrl;
        const coverUri = coverPic
            ? (coverPic.startsWith('http') || coverPic.startsWith('file:') || coverPic.startsWith('content:')
                ? coverPic
                : `https://image.tmdb.org/t/p/w200${coverPic}`)
            : 'https://placehold.co/100x150/1a1a1a/FFF.png';
        const statusText = item.status === 'COMPLETED' ? 'Đã tải xong' : item.status === 'PENDING' ? 'Đang tải về...' : 'Thất bại';

        return (
            <View className="flex-row p-3 mb-4 bg-zinc-900 rounded-lg">
                <Image 
                    source={{ uri: coverUri }} 
                    className="w-24 h-32 rounded-md bg-zinc-800"
                    resizeMode="cover"
                />
                
                <View className="flex-1 ml-4 justify-between py-1">
                    <View>
                        <Text className="text-white text-lg font-bold" numberOfLines={2}>{movieTitle}</Text>
                        <Text className="text-zinc-400 mt-1">Trạng thái: {statusText}</Text>
                        <Text className="text-zinc-500 text-xs mt-1">ID: {item.id}</Text>
                    </View>

                    <View className="flex-row items-center space-x-4 mt-3">
                        <TouchableOpacity 
                            onPress={() => handlePlayOffline(item)}
                            className="bg-red-600 px-4 py-2 flex-row rounded-full justify-center items-center mr-3"
                        >
                            <Play size={16} color="white" fill="white" />
                            <Text className="text-white font-semibold ml-2">Phát</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => handleDelete(item, movieTitle)}
                            className="p-2 border border-zinc-600 rounded-full"
                        >
                            <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-zinc-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2 bg-zinc-800 rounded-full">
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Quản lý tải xuống</Text>
            </View>

            {/* List */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : downloads.length === 0 ? (
                <View className="flex-1 justify-center items-center px-6">
                    <DownloadCloud size={80} color="#3f3f46" className="mb-4" />
                    <Text className="text-white text-lg font-bold mb-2">Chưa có tải xuống</Text>
                    <Text className="text-zinc-400 text-center">Bạn chưa có phim nào được lưu lại để xem khi không có Internet.</Text>
                </View>
            ) : (
                <FlatList
                    data={downloads}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </SafeAreaView>
    );
}
