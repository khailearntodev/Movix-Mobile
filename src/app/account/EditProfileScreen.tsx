import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { User, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
    const navigation = useNavigation<any>();

    const [name, setName] = useState('Người dùng Movix');
    const [email, setEmail] = useState('user@example.com');
    const [gender, setGender] = useState('male'); // simple state for now

    const handleSave = () => {
        Alert.alert("Thông báo", "Đã lưu thông tin (Demo)");
    };

    return (
        <ScrollView className="flex-1 bg-zinc-950 pt-12">
            <View className="px-4 pb-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-4">
                    <ChevronLeft size={28} color="white" />
                    <Text className="text-white text-2xl font-bold">Thông tin tài khoản</Text>
                </TouchableOpacity>
            </View>

            <View className="items-center mb-8 px-4">
                <Image
                    source={{ uri: "https://github.com/shadcn.png" }}
                    className="w-24 h-24 rounded-full mb-4"
                />
                <TouchableOpacity className="bg-zinc-800 px-4 py-2 rounded-full">
                    <Text className="text-white text-xs">Thay đổi avatar</Text>
                </TouchableOpacity>
            </View>

            <View className="space-y-4 mb-8 px-4">
                <View>
                    <Text className="text-zinc-400 mb-2">Tên hiển thị</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800"
                        value={name}
                        onChangeText={setName}
                    />
                </View>
                <View>
                    <Text className="text-zinc-400 mb-2">Email</Text>
                    <TextInput
                        className="bg-zinc-900 text-zinc-500 p-4 rounded-xl border border-zinc-800"
                        value={email}
                        editable={false}
                    />
                </View>
                <View>
                    <Text className="text-zinc-400 mb-2">Giới tính</Text>
                    <View className="flex-row gap-4">
                        {['male', 'female', 'other'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                className={`flex-1 p-3 rounded-xl border ${gender === g ? 'bg-zinc-800 border-red-600' : 'bg-zinc-900 border-zinc-800'}`}
                                onPress={() => setGender(g)}
                            >
                                <Text className={`text-center capitalize ${gender === g ? 'text-white' : 'text-zinc-400'}`}>
                                    {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <TouchableOpacity
                className="flex-row items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-6"
                onPress={() => navigation.navigate('ChangePassword')}
            >
                <Text className="text-white font-medium">Đổi mật khẩu</Text>
                <ChevronRight size={20} color="#71717a" />
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-yellow-500 p-4 rounded-xl items-center"
                onPress={handleSave}
            >
                <Text className="text-black font-bold font-lg">Lưu thay đổi</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

export default EditProfileScreen;
