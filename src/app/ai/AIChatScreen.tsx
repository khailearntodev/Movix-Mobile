import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from "react-native";

import { X, Send, Bot, User, Minus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
}

const renderMessageContent = (text: string) => {
    const cleanText = text.replace(/\*/g, "").trim();
    return cleanText;
};

export default function AIChatScreen() {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Xin chào! 👋 Tôi là AI của Movix. Tôi có thể giúp bạn tìm phim hoặc giải đáp thắc mắc.", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Đây là phản hồi mẫu từ AI (đang chờ API).",
                sender: "bot"
            };
            setMessages(prev => [...prev, botMsg]);
            setIsLoading(false);
        }, 1500);
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const renderItem = ({ item }: { item: Message }) => {
        const isBot = item.sender === "bot";
        return (
            <View className={`flex-row mb-4 ${isBot ? "" : "flex-row-reverse"}`}>
                <View className={`w-8 h-8 rounded-full items-center justify-center ${isBot ? "bg-zinc-800" : "bg-zinc-700"}`}>
                    {isBot ? <Bot size={16} color="#ef4444" /> : <User size={16} color="white" />}
                </View>
                <View className={`mx-2 p-3 rounded-2xl max-w-[80%] ${isBot ? "bg-zinc-800 rounded-tl-none" : "bg-red-600 rounded-tr-none"
                    }`}>
                    <Text className={`text-sm leading-relaxed ${isBot ? "text-gray-200" : "text-white"}`}>
                        {renderMessageContent(item.text)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between bg-[#E50914] px-4 py-3 shadow-md" style={{ paddingTop: Platform.OS === 'android' ? 40 : 10 }}>
                    <View className="flex-row items-center gap-2">
                        <View className="bg-white/20 p-1.5 rounded-full">
                            <Bot size={20} color="white" />
                        </View>
                        <View>
                            <Text className="font-bold text-white text-base">Movix Assistant</Text>
                            <View className="flex-row items-center gap-1">
                                <View className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                <Text className="text-[10px] text-green-200 font-medium">Online</Text>
                            </View>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-1">
                        {/* Nút Close */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="p-1 rounded bg-white/10"
                        >
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chat Content */}
                <View className="flex-1 bg-zinc-900/50">
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                        ListFooterComponent={() => (
                            isLoading ? (
                                <View className="flex-row mb-4">
                                    <View className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center">
                                        <Bot size={16} color="#ef4444" />
                                    </View>
                                    <View className="mx-2 bg-zinc-800 p-3 rounded-2xl rounded-tl-none flex-row gap-1 items-center h-10 w-16 justify-center">
                                        <ActivityIndicator size="small" color="#9ca3af" />
                                    </View>
                                </View>
                            ) : null
                        )}
                    />
                </View>

                {/* Input Area */}
                <View className="p-3 bg-zinc-900 border-t border-zinc-800 pb-6">
                    <View className="flex-row items-center relative">
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Hỏi tôi về phim..."
                            placeholderTextColor="#6b7280"
                            className="flex-1 pl-4 pr-12 py-3 rounded-full bg-black border border-zinc-700 text-white text-sm"
                            onSubmitEditing={handleSend}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`absolute right-2 p-2 rounded-full ${!input.trim() || isLoading ? 'bg-red-600/50' : 'bg-red-600'}`}
                        >
                            <Send size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
