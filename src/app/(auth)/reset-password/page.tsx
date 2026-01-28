import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { API_URL } from "../../../constants/config";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation";

type ResetPasswordRouteParams = {
    token?: string;
};

export default function ResetPasswordPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const params = route.params as ResetPasswordRouteParams | undefined;
    const token = params?.token;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async () => {
        if (!token) {
            Alert.alert("Lỗi", "Token không hợp lệ hoặc bị thiếu.");
            return;
        }

        if (!newPassword || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu phải ≥ 6 ký tự!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Thành công", "Đặt lại mật khẩu thành công!", [
                    { text: "OK", onPress: () => navigation.navigate("Login") }
                ]);
            } else {
                Alert.alert("Lỗi", data.message || "Đã xảy ra lỗi.");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require("../../../../assets/images/background-homepage.jpg")}
            className="flex-1"
            resizeMode="cover"
        >
            <View className="absolute inset-0 bg-black/70" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="w-full bg-black/80 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-red-900/20 my-auto">

                        <View className="items-center mb-8">
                            <Image
                                source={require("../../../../assets/images/logo.png")}
                                className="w-40 h-10 mb-4"
                                resizeMode="contain"
                            />
                            <Text className="text-3xl font-bold text-white mb-2">Đặt lại mật khẩu</Text>
                            <View className="flex-row">
                                <Text className="text-zinc-400 text-base">Bạn đã có tài khoản? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                    <Text className="text-red-500 text-base font-semibold">Đăng nhập ngay</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="space-y-5">
                            {!token && (
                                <View className="bg-yellow-900/30 border border-yellow-700 p-2 rounded mb-2">
                                    <Text className="text-yellow-400 text-sm">
                                        Không tìm thấy token. Vui lòng kiểm tra lại link trong email.
                                    </Text>
                                </View>
                            )}

                            <View>
                                <Text className="text-zinc-200 text-base mb-2">Mật khẩu mới</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        placeholder="Nhập mật khẩu mới"
                                        placeholderTextColor="#71717a"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPassword}
                                        className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-4 text-base pr-12"
                                        textContentType="newPassword"
                                        autoComplete="password-new"
                                        passwordRules="minlength: 6;"
                                    />
                                    <TouchableOpacity
                                        className="absolute right-4"
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color="#71717a" />
                                        ) : (
                                            <Eye size={20} color="#71717a" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <Text className="text-zinc-200 text-base mb-2 mt-2">Nhập lại mật khẩu mới</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        placeholder="Nhập lại mật khẩu mới"
                                        placeholderTextColor="#71717a"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirm}
                                        className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-4 text-base pr-12"
                                        textContentType="newPassword"
                                        autoComplete="password-new"
                                    />
                                    <TouchableOpacity
                                        className="absolute right-4"
                                        onPress={() => setShowConfirm(!showConfirm)}
                                    >
                                        {showConfirm ? (
                                            <EyeOff size={20} color="#71717a" />
                                        ) : (
                                            <Eye size={20} color="#71717a" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isLoading || !token}
                                className={`w-full py-4 rounded-lg items-center mt-6 ${isLoading || !token ? 'bg-red-800' : 'bg-red-600 active:bg-red-700'}`}
                            >
                                <Text className="text-white text-base font-bold">
                                    {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <StatusBar style="light" />
        </ImageBackground>
    );
}
