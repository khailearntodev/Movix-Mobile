import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { List } from 'lucide-react-native';

const PlaylistScreen = () => {
    return (
        <View className="flex-1 bg-zinc-950 p-4 pt-12">
            <Text className="text-white text-2xl font-bold mb-6">Danh sách phát</Text>
            <View className="flex-1 justify-center items-center">
                <List size={48} color="#52525b" />
                <Text className="text-zinc-500 mt-4">Chưa có danh sách nào</Text>
            </View>
        </View>
    );
};

export default PlaylistScreen;
