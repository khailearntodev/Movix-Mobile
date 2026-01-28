import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";

interface ResetPasswordModalProps {
    open: boolean;
    onClose: () => void;
}

export default function ResetPasswordModal({ open, onClose }: ResetPasswordModalProps) {
    const navigation = useNavigation();

    const handleRedirect = () => {
        onClose();
        navigation.navigate("Login" as never);
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
                    <Text className="text-2xl text-center font-bold text-white mb-2">
                        Kiểm tra email của bạn
                    </Text>
                    <Text className="text-zinc-300 text-center text-sm mb-6">
                        Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
                    </Text>

                    <TouchableOpacity
                        onPress={handleRedirect}
                        className="bg-red-600 active:bg-red-700 w-full py-4 rounded-lg"
                    >
                        <Text className="text-white text-center text-base font-bold">
                            Đã hiểu
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
