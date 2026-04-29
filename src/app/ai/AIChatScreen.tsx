import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, Bot, User } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import api from "../../services/api";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Typing animation component
const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (val: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(val, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(val, { toValue: 0, duration: 400, useNativeDriver: true }),
                ])
            );
        };
        Animated.parallel([
            animate(dot1, 0),
            animate(dot2, 150),
            animate(dot3, 300),
        ]).start();
    }, []);

    const dotStyle = (val: Animated.Value) => ({
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#9ca3af",
        marginHorizontal: 2,
        transform: [{ translateY: val.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }]
    });

    return (
        <View className="flex-row items-center px-1">
            <Animated.View style={dotStyle(dot1)} />
            <Animated.View style={dotStyle(dot2)} />
            <Animated.View style={dotStyle(dot3)} />
        </View>
    );
};

export default function AIChatScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Xin chào! 👋 Tôi là AI của Movix. Tôi có thể giúp bạn tìm phim hoặc giải đáp thắc mắc.", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        const userMsg: Message = { id: Date.now().toString(), text: userText, sender: "user" };
        
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await api.post("/ai/chat", { message: userText });
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: res.data.reply || "Tôi không nhận được phản hồi phù hợp. Bạn có muốn hỏi lại không?",
                sender: "bot"
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                id: `err-${Date.now()}`, 
                text: "Rất tiếc, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.", 
                sender: "bot" 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isLoading]);

    const renderMessageContent = (text: string, isBot: boolean) => {
        if (!isBot) return <Text className="text-white text-sm leading-relaxed">{text}</Text>;

        // Clean stars and common MD markers
        const cleanText = text.replace(/\*/g, "").trim();
        const regex = /\[([^\]]+)\]\s*\(([^)]+)\)/g;
        
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(cleanText)) !== null) {
            if (match.index > lastIndex) {
                parts.push(cleanText.substring(lastIndex, match.index));
            }

            const label = match[1].trim(); 
            const url = match[2].trim(); 
            
            // Extract slug from /movies/slug
            const slugMatch = url.match(/\/movies\/([^/]+)/);
            const slug = slugMatch ? slugMatch[1] : null;

            parts.push({
                label,
                slug,
                isLink: true
            });

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < cleanText.length) {
            parts.push(cleanText.substring(lastIndex));
        }

        return (
            <Text className="text-gray-200 text-sm leading-relaxed">
                {parts.map((part, index) => {
                    if (typeof part === 'string') return part;
                    return (
                        <Text 
                            key={index} 
                            onPress={() => part.slug && navigation.navigate("MovieDetail", { movie: { slug: part.slug, id: part.slug } } as any)}
                            className="text-red-500 font-bold underline"
                        >
                            {part.label}
                        </Text>
                    );
                })}
            </Text>
        );
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isBot = item.sender === "bot";
        return (
            <View className={`flex-row mb-4 ${isBot ? "" : "flex-row-reverse"}`}>
                <View className={`w-8 h-8 rounded-full items-center justify-center ${isBot ? "bg-zinc-800" : "bg-zinc-700"}`}>
                    {isBot ? <Bot size={16} color="#ef4444" /> : <User size={16} color="white" />}
                </View>
                <View className={`mx-2 p-3 rounded-2xl max-w-[80%] ${isBot ? "bg-zinc-800 rounded-tl-none border border-zinc-700/50" : "bg-red-600 rounded-tr-none shadow-sm shadow-red-900/20"
                    }`}>
                    {renderMessageContent(item.text, isBot)}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
                                <Text className="text-[10px] text-green-200 font-medium">Sẵn sàng hỗ trợ</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-1 rounded-full bg-black/10"
                    >
                        <X size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Chat Content */}
                <View className="flex-1 bg-zinc-950">
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={() => (
                            isLoading ? (
                                <View className="flex-row mb-4">
                                    <View className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center">
                                        <Bot size={16} color="#ef4444" />
                                    </View>
                                    <View className="mx-2 bg-zinc-800 p-3 rounded-2xl rounded-tl-none border border-zinc-700/50 h-10 w-16 justify-center">
                                        <TypingIndicator />
                                    </View>
                                </View>
                            ) : null
                        )}
                    />
                </View>

                {/* Input Area */}
                <View className="px-4 py-3 bg-zinc-900 border-t border-zinc-800">
                    <View className="flex-row items-center bg-black rounded-full px-4 py-1 border border-zinc-700">
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Hỏi về phim, diễn viên..."
                            placeholderTextColor="#71717a"
                            className="flex-1 py-3 text-white text-sm"
                            onSubmitEditing={handleSend}
                            multiline={false}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`ml-2 p-2 rounded-full ${!input.trim() || isLoading ? 'bg-zinc-800' : 'bg-red-600'}`}
                        >
                            {isLoading ? <ActivityIndicator size="small" color="white" /> : <Send size={18} color="white" />}
                        </TouchableOpacity>
                    </View>
                    <View className="mt-2 items-center">
                        <Text className="text-[10px] text-zinc-600 uppercase tracking-widest">Powered by Movix AI</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
