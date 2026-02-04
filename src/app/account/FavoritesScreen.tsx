import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';

const FavoritesScreen = () => {
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
        <View className="flex-1 bg-zinc-950 p-4 pt-12">
            <Text className="text-white text-2xl font-bold mb-6">Yêu thích</Text>
            {favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
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
