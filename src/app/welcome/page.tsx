import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

export default function WelcomePage() {
    //variables
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isLoading, setIsLoading] = useState(false);
    //useEffects
    //handles
    //UIs
    return (
        <ImageBackground source={require("../../../assets/images/background-homepage.jpg")} className="flex-1" resizeMode="cover">
            <View className="absolute inset-0 bg-black/70" />
            <View className="flex-1 justify-end pb-20 px-6">
                <View className="items-center mb-10">
                    <Image
                        source={require("../../../assets/images/logo.png")}
                        className="w-80 h-80 mb-2"
                        resizeMode="contain"
                    />
                    <Text className="text-white text-5xl font-bold mb-2 tracking-widest text-shadow-lg">MOVIX</Text>
                    <Text className="text-zinc-300 text-xl italic text-center px-4">
                        Thế giới điện ảnh trong tầm tay bạn!
                    </Text>
                </View>

                <View className="space-y-4 w-full gap-4">
                    <TouchableOpacity
                        className="bg-red-600 active:bg-red-700 rounded-xl py-4 w-full items-center shadow-lg shadow-red-900/40"
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text className="text-white text-lg font-bold uppercase tracking-wider">Đăng nhập</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-transparent border-2 border-white/30 active:bg-white/10 rounded-xl py-4 w-full items-center"
                        onPress={() => navigation.navigate("Register")}
                    >
                        <Text className="text-white text-lg font-bold uppercase tracking-wider">Đăng ký</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
}