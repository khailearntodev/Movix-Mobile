import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { List, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const PlaylistScreen = () => {
    const navigation = useNavigation();
    return (
        <View className="flex-1 bg-zinc-950 pt-12">
            <View className="px-4 pb-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-2xl font-bold">Danh sách phát</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center items-center">
                <List size={48} color="#52525b" />
                <Text className="text-zinc-500 mt-4">Chưa có danh sách nào</Text>
            </View>
        </View>
    );
};

export default PlaylistScreen;
