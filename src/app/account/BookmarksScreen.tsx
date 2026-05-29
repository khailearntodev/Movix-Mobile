import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Bookmark, Search as SearchIcon, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { blogService } from '@/services/blog.service';
import { useFocusEffect } from '@react-navigation/native';

export default function BookmarksScreen() {
    const navigation = useNavigation<any>();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookmarks = async () => {
        try {
            setIsLoading(true);
            const response = await blogService.getSavedBlogs({
                page: 1,
                limit: 20,
            });
            setPosts(response.blogs || []);
        } catch (error) {
            console.error("Failed to fetch bookmarks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookmarks();
        }, [])
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="flex-row items-center p-4 bg-zinc-900 mb-3 rounded-xl mx-4"
            onPress={() => navigation.navigate('BlogDetail', { id: item.id, slug: item.slug })}
        >
            <Image
                source={{ uri: item.thumbnail || (item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150') }}
                className="w-20 h-20 rounded-lg mr-4"
            />
            <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1" numberOfLines={2}>{item.title}</Text>
                <Text className="text-gray-400 text-xs mb-2">{item.user?.display_name || 'Người dùng Movix'}</Text>
                <View className="flex-row items-center gap-4">
                    <Text className="text-gray-500 text-xs">❤️ {item._count?.likes || 0}</Text>
                    <Text className="text-gray-500 text-xs">💬 {item._count?.comments || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black">
            <View className="px-4 pt-14 pb-4 flex-row items-center border-b border-zinc-900">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Bookmark size={24} color="#eab308" className="mr-2" />
                <Text className="text-white text-xl font-bold"> Bài viết đã lưu</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#eab308" />
                </View>
            ) : posts.length > 0 ? (
                <FlatList
                    data={posts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-4">
                    <Bookmark size={64} color="#3f3f46" className="mb-4" />
                    <Text className="text-white text-lg font-bold mb-2">Chưa có bài viết nào</Text>
                    <Text className="text-gray-400 text-center">Hãy lưu các bài viết thú vị để xem lại chúng ở đây nhé!</Text>
                </View>
            )}
        </View>
    );
}
