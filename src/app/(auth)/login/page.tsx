import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation";

export default function LoginPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu!");
            return;
        }

        try {
            setIsLoading(true);
            Alert.alert("Thông báo", "Đăng nhập thành công (Simulation)");
            navigation.navigate("Main");
        } catch (error) {
            Alert.alert("Lỗi", "Đăng nhập thất bại.");
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
            {/* Overlay */}
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
                        {/* Header */}
                        <View className="items-center mb-8">
                            <Image
                                source={require("../../../../assets/images/logo.png")}
                                className="w-40 h-10 mb-4"
                                resizeMode="contain"
                            />
                            <Text className="text-3xl font-bold text-white mb-2">Đăng nhập</Text>
                            <View className="flex-row">
                                <Text className="text-zinc-400 text-base">Bạn chưa có tài khoản? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                                    <Text className="text-red-500 text-base font-semibold">Đăng ký ngay</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Form */}
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
                                />
                            </View>

                            <View>
                                <Text className="text-zinc-200 text-base mb-2 mt-5">Mật khẩu</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        placeholder="Nhập mật khẩu"
                                        placeholderTextColor="#71717a"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-4 text-base pr-12"
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

                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-lg items-center mt-5 ${isLoading ? 'bg-red-800' : 'bg-red-600 active:bg-red-700'}`}
                            >
                                <Text className="text-white text-base font-bold">
                                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} className="items-center mt-4">
                                <Text className="text-zinc-400 text-sm">Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <StatusBar style="light" />
        </ImageBackground>
    );
}