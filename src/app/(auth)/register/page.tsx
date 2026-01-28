import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation";

export default function RegisterPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRegister = async () => {
        if (username.trim().length < 4) {
            Alert.alert("Lỗi", "Tên đăng nhập phải ≥ 4 ký tự!");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            Alert.alert("Lỗi", "Email không hợp lệ!");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu phải ≥ 6 ký tự!");
            return;
        }

        if (password !== confirm) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            setIsLoading(true);
            Alert.alert("Thông báo", "Đăng ký thành công (Simulation)");
            // navigation.navigate("Login"); 
        } catch (error) {
            Alert.alert("Lỗi", "Đăng ký thất bại.");
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
                            <Text className="text-3xl font-bold text-white mb-2">Đăng ký</Text>
                            <View className="flex-row">
                                <Text className="text-zinc-400 text-base">Bạn đã có tài khoản? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                    <Text className="text-red-500 text-base font-semibold">Đăng nhập ngay</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Form */}
                        <View className="space-y-5">
                            <View>
                                <Text className="text-zinc-200 text-base mb-2">Tên đăng nhập</Text>
                                <TextInput
                                    placeholder="Nhập tên đăng nhập"
                                    placeholderTextColor="#71717a"
                                    value={username}
                                    onChangeText={setUsername}
                                    className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-4 text-base"
                                    autoCapitalize="none"
                                    textContentType="username"
                                    autoComplete="username"
                                />
                            </View>

                            <View>
                                <Text className="text-zinc-200 text-base mb-2 mt-2">Email</Text>
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

                            <View>
                                <Text className="text-zinc-200 text-base mb-2 mt-2">Mật khẩu</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        placeholder="Nhập mật khẩu"
                                        placeholderTextColor="#71717a"
                                        value={password}
                                        onChangeText={setPassword}
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
                                <Text className="text-zinc-200 text-base mb-2 mt-2">Xác nhận mật khẩu</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        placeholder="Nhập lại mật khẩu"
                                        placeholderTextColor="#71717a"
                                        value={confirm}
                                        onChangeText={setConfirm}
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
                                onPress={handleRegister}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-lg items-center mt-6 ${isLoading ? 'bg-red-800' : 'bg-red-600 active:bg-red-700'}`}
                            >
                                <Text className="text-white text-base font-bold">
                                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
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