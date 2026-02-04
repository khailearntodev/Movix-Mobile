import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';

const HistoryScreen = () => {
    const history = [
        { id: '1', title: 'Phim Đã Xem A', cover: 'https://via.placeholder.com/150', progress: '45m left' },
    ];

    return (
        <View className="flex-1 bg-zinc-950 p-4 pt-12">
            <Text className="text-white text-2xl font-bold mb-6">Xem tiếp</Text>
            {history.length > 0 ? (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity className="flex-row mb-4 bg-zinc-900 rounded-lg overflow-hidden">
                            <Image
                                source={{ uri: item.cover }}
                                className="w-24 h-32 bg-zinc-800"
                            />
                            <View className="p-4 flex-1 justify-center">
                                <Text className="text-white font-bold text-lg mb-2">{item.title}</Text>
                                <Text className="text-zinc-400">{item.progress}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-zinc-500">Chưa có lịch sử xem</Text>
                </View>
            )}
        </View>
    );
};

export default HistoryScreen;
