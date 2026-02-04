import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const ChangePasswordScreen = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = () => {
        Alert.alert("Thông báo", "Tính năng đang được phát triển");
    };

    return (
        <View className="flex-1 bg-zinc-950 p-4 pt-12">
            <Text className="text-white text-2xl font-bold mb-8">Đổi mật khẩu</Text>

            <View className="space-y-4">
                <View>
                    <Text className="text-zinc-400 mb-2">Mật khẩu hiện tại</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholderTextColor="#52525b"
                    />
                </View>

                <View>
                    <Text className="text-zinc-400 mb-2">Mật khẩu mới</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholderTextColor="#52525b"

                    />
                </View>

                <View>
                    <Text className="text-zinc-400 mb-2">Xác nhận mật khẩu mới</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholderTextColor="#52525b"
                    />
                </View>

                <TouchableOpacity
                    className="bg-red-600 p-4 rounded-xl items-center mt-4"
                    onPress={handleChangePassword}
                >
                    <Text className="text-white font-bold font-lg">Lưu thay đổi</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChangePasswordScreen;
