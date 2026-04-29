import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { resetPasswordWithOtp } from "../../services/auth.service";

interface ResetPasswordModalProps {
    open: boolean;
    onClose: () => void;
    email: string;
}

export default function ResetPasswordModal({ open, onClose, email }: ResetPasswordModalProps) {
    const navigation = useNavigation();
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!otp || !newPassword || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            setIsLoading(true);
            await resetPasswordWithOtp(email, otp, newPassword);
            Alert.alert("Thành công", "Mật khẩu đã được đặt lại.", [
                {
                    text: "Đăng nhập ngay",
                    onPress: () => {
                        onClose();
                        navigation.navigate("Login" as never);
                    }
                }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Đặt lại mật khẩu thất bại.";
            Alert.alert("Lỗi", msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={open}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 items-center justify-center bg-black/70">
                <View className="bg-black/85 w-11/12 max-w-sm p-6 rounded-xl border border-zinc-700 shadow-lg">
                    <Text className="text-xl text-center font-bold text-white mb-4">
                        Đặt lại mật khẩu
                    </Text>
                    <Text className="text-zinc-400 text-center text-xs mb-6 px-2">
                        Nhập OTP từ email và mật khẩu mới
                    </Text>

                    <View className="w-full mb-6 gap-y-4">
                        <View>
                            <Text className="text-zinc-400 text-xs mb-1 ml-1">Mã OTP (6 số)</Text>
                            <TextInput
                                placeholder="******"
                                placeholderTextColor="#52525b"
                                value={otp}
                                onChangeText={setOtp}
                                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-3 text-center text-lg tracking-widest font-bold"
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>

                        <View>
                            <Text className="text-zinc-400 text-xs mb-1 ml-1">Mật khẩu mới</Text>
                            <TextInput
                                placeholder="Mật khẩu mới"
                                placeholderTextColor="#52525b"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-3 text-base"
                                secureTextEntry
                            />
                        </View>

                        <View>
                            <Text className="text-zinc-400 text-xs mb-1 ml-1">Xác nhận mật khẩu</Text>
                            <TextInput
                                placeholder="Nhập lại mật khẩu"
                                placeholderTextColor="#52525b"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-3 text-base"
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg items-center ${isLoading ? 'bg-red-800' : 'bg-red-600 active:bg-red-700'}`}
                    >
                        <Text className="text-white text-base font-bold">
                            {isLoading ? "Đang xử lý..." : "Xác nhận"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        className="mt-4 self-center p-2"
                    >
                        <Text className="text-zinc-500 text-sm">Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
