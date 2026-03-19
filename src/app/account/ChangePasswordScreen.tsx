import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { changePassword } from '@/services/user.service';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

const ChangePasswordScreen = () => {
    const navigation = useNavigation<any>();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
            return;
        }

        if (newPassword.length < 6) {
             Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
             return;
        }

        try {
            setIsLoading(true);
            await changePassword({
                oldPassword: currentPassword,
                newPassword: newPassword
            });
            Alert.alert("Thành công", "Đổi mật khẩu thành công", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-zinc-950 p-4 pt-12">
            <View className="flex-row items-center mb-8">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-bold">Đổi mật khẩu</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-zinc-400 mb-2">Mật khẩu hiện tại</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Nhập mật khẩu hiện tại"
                        placeholderTextColor="#52525b"
                        editable={!isLoading}
                    />
                </View>

                <View>
                    <Text className="text-zinc-400 mb-2">Mật khẩu mới</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Nhập mật khẩu mới"
                        placeholderTextColor="#52525b"
                        editable={!isLoading}

                    />
                </View>

                <View>
                    <Text className="text-zinc-400 mb-2">Xác nhận mật khẩu mới</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Nhập lại mật khẩu mới"
                        placeholderTextColor="#52525b"
                        editable={!isLoading}
                    />
                </View>

                <TouchableOpacity
                    className={`p-4 rounded-xl items-center mt-4 ${isLoading ? 'bg-red-800' : 'bg-red-600'}`}
                    onPress={handleChangePassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold font-lg">Lưu thay đổi</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default ChangePasswordScreen;
