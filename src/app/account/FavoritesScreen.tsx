import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

const FavoritesScreen = () => {
    const navigation = useNavigation();
    const favorites = [
        { id: '1', title: 'Phim A', cover: 'https://via.placeholder.com/150' },
        { id: '2', title: 'Phim B', cover: 'https://via.placeholder.com/150' },
    ];

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity className="flex-1 m-2">
            <Image
                source={{ uri: item.cover }}
                className="w-full h-40 rounded-lg bg-zinc-800"
                resizeMode="cover"
            />
            <Text className="text-white mt-2 font-medium" numberOfLines={1}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-zinc-950 pt-12">
            <View className="px-4 pb-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-2xl font-bold">Yêu thích</Text>
                </TouchableOpacity>
            </View>
            {favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-zinc-500">Chưa có phim yêu thích</Text>
                </View>
            )}
        </View>
    );
};

export default FavoritesScreen;
