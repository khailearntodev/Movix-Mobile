import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ResetPasswordModal from "../../../components/auth/ResetPasswordModal";
import { API_URL } from "../../../constants/config";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation";

export default function ForgotPasswordPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert("Lỗi", "Vui lòng nhập email!");
            return;
        }

        setIsLoading(true);

        try {
            // Real API call logic
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsModalOpen(true);
            } else {
                Alert.alert("Lỗi", data.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
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
                            <Text className="text-3xl font-bold text-white mb-2">Quên mật khẩu</Text>
                            <View className="flex-row">
                                <Text className="text-zinc-400 text-base">Bạn đã có tài khoản? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                    <Text className="text-red-500 text-base font-semibold">Đăng nhập ngay</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="space-y-5">
                            <View>
                                <Text className="text-zinc-200 text-base mb-2">Email</Text>
                                <TextInput
                                    placeholder="Nhập email"
                                    placeholderTextColor="#71717a"
                                    value={email}
                                    onChangeText={setEmail}
                                    className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-4 text-base"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    textContentType="emailAddress"
                                    autoComplete="email"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-lg items-center mt-5 ${isLoading ? 'bg-red-800' : 'bg-red-600 active:bg-red-700'}`}
                            >
                                <Text className="text-white text-base font-bold">
                                    {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <StatusBar style="light" />

            <ResetPasswordModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </ImageBackground>
    );
}
