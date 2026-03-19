import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { User, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getMyProfile, updateMyProfile, UserProfile } from '@/services/user.service';

const EditProfileScreen = () => {
    const navigation = useNavigation<any>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const user = await getMyProfile();
            setName(user.display_name || user.username || '');
            setEmail(user.email || '');
            setGender(user.gender || 'male');
            setAvatar(user.avatar_url);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateMyProfile({
                display_name: name,
                gender: gender,
                avatar_url: avatar
            });
            Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-zinc-950 justify-center items-center pt-12">
                <ActivityIndicator color="#ef4444" size="large" />
            </View>
        );
    }

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
                    source={{ uri: avatar || "https://github.com/shadcn.png" }}
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
                        editable={!isSaving}
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
                        {(['male', 'female', 'other'] as const).map((g) => (
                            <TouchableOpacity
                                key={g}
                                className={`flex-1 p-3 rounded-xl border ${gender === g ? 'bg-zinc-800 border-red-600' : 'bg-zinc-900 border-zinc-800'}`}
                                onPress={() => setGender(g)}
                                disabled={isSaving}
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
                className="flex-row items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-6 mx-4"
                onPress={() => navigation.navigate('ChangePassword')}
                disabled={isSaving}
            >
                <Text className="text-white font-medium">Đổi mật khẩu</Text>
                <ChevronRight size={20} color="#71717a" />
            </TouchableOpacity>

            <TouchableOpacity
                className={`p-4 rounded-xl items-center mx-4 ${isSaving ? 'bg-yellow-700' : 'bg-yellow-500'}`}
                onPress={handleSave}
                disabled={isSaving}
            >
                {isSaving ? (
                     <ActivityIndicator color="black" />
                ) : (
                    <Text className="text-black font-bold font-lg">Lưu thay đổi</Text>
                )}
            </TouchableOpacity>
            
            <View className="h-8" /> 
        </ScrollView>
    );
};


export default EditProfileScreen;
