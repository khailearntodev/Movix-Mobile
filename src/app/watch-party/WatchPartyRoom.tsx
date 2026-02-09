
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image, TextInput,
    FlatList, Modal, Alert, Clipboard, Dimensions, KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
    Play, Pause, Send, Smile, MoreVertical,
    User, MessageSquare, Info, ChevronLeft,
    Settings, Share2, Heart, Lock, Globe,
    Copy, Check, Power, LogOut, UserX, Ban, Crown,
    Maximize, Minimize, Volume2
} from 'lucide-react-native';
import { clsx } from 'clsx';
import { MOCK_MOVIES } from '../../data/mockData';
import { RootStackParamList } from '../../types/navigation';

// --- Types & Mock Data ---

type TabType = 'chat' | 'members' | 'info';

const MOCK_ROOM_DATA = {
    id: '123',
    title: 'Cày phim đêm khuya 🍿',
    join_code: 'AB12CD',
    is_private: true,
    host_id: '1',
    movie: MOCK_MOVIES[0],
    viewers: 128
};

const MOCK_MEMBERS = [
    { id: '1', name: 'Admin User', avatar: 'https://i.pravatar.cc/150?u=1', role: 'host', online: true },
    { id: '2', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=2', role: 'member', online: true },
    { id: '3', name: 'Alice Smith', avatar: 'https://i.pravatar.cc/150?u=3', role: 'member', online: true },
    { id: '4', name: 'Bob Wilson', avatar: 'https://i.pravatar.cc/150?u=4', role: 'member', online: false },
    { id: '5', name: 'Emma Brown', avatar: 'https://i.pravatar.cc/150?u=5', role: 'member', online: true },
];

const MOCK_MESSAGES = [
    { id: '1', userId: '2', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=2', text: 'Phim hay quá!', time: '20:30', isHost: false },
    { id: '2', userId: '1', name: 'Admin User', avatar: 'https://i.pravatar.cc/150?u=1', text: 'Đoạn này kịch tính thật sự 🔥', time: '20:31', isHost: true },
    { id: '3', userId: '3', name: 'Alice Smith', avatar: 'https://i.pravatar.cc/150?u=3', text: 'Mọi người thấy kỹ xảo thế nào?', time: '20:32', isHost: false },
    { id: '4', userId: '2', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=2', text: 'Đỉnh kout luôn bác ơi', time: '20:32', isHost: false },
];

// --- Components ---

const InviteModal = ({ visible, onClose, roomData }: { visible: boolean; onClose: () => void; roomData: any }) => {
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    // Mock links
    const inviteLink = `https://movix.app/watch-party/${roomData.id}`;

    const handleCopy = (text: string, type: 'link' | 'code') => {
        Clipboard.setString(text);
        if (type === 'link') {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <View className="flex-1 bg-black/80 justify-center items-center p-4">
                <View className="bg-[#1F1F1F] w-full max-w-sm rounded-xl border border-slate-700 p-5">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-2">
                            {roomData.is_private ? <Lock size={18} color="#ef4444" /> : <Globe size={18} color="#22c55e" />}
                            <Text className="text-white font-bold text-lg">Mời bạn bè</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-slate-400 font-bold text-lg">✕</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-slate-400 text-sm mb-6">
                        {roomData.is_private
                            ? "Phòng riêng tư. Bạn bè cần mã code để tham gia."
                            : "Phòng công khai. Bất kỳ ai có link đều vào được."}
                    </Text>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-slate-500 text-xs font-bold uppercase mb-2">Liên kết phòng</Text>
                            <View className="flex-row gap-2">
                                <View className="flex-1 bg-black/40 border border-slate-700 rounded h-10 justify-center px-3">
                                    <Text className="text-slate-300 text-xs" numberOfLines={1}>{inviteLink}</Text>
                                </View>
                                <TouchableOpacity
                                    className="w-10 h-10 bg-[#252525] border border-slate-700 rounded items-center justify-center active:bg-slate-700"
                                    onPress={() => handleCopy(inviteLink, 'link')}
                                >
                                    {copiedLink ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="white" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {roomData.is_private && (
                            <View>
                                <Text className="text-slate-500 text-xs font-bold uppercase mb-2 mt-5">Mã tham gia (Join Code)</Text>
                                <View className="flex-row gap-2">
                                    <View className="flex-1 bg-black/40 border border-slate-700 rounded h-12 justify-center items-center">
                                        <Text className="text-red-500 font-mono text-xl font-bold tracking-[6px]">
                                            {roomData.join_code}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        className="w-12 h-12 bg-[#252525] border border-slate-700 rounded items-center justify-center active:bg-slate-700"
                                        onPress={() => handleCopy(roomData.join_code, 'code')}
                                    >
                                        {copiedCode ? <Check size={20} color="#22c55e" /> : <Copy size={20} color="white" />}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function WatchPartyRoomPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'WatchPartyRoom'>>();
    const { roomId } = route.params || {};

    // State
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [inviteVisible, setInviteVisible] = useState(false);
    const [msgInput, setMsgInput] = useState("");
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [userManageModal, setUserManageModal] = useState<{ visible: boolean, userId: string | null }>({ visible: false, userId: null });

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(350); // seconds
    const duration = 5400; // seconds

    const isHost = true; // Simulating host role

    // Helper functions
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSendMessage = () => {
        if (!msgInput.trim()) return;
        const newMsg = {
            id: Date.now().toString(),
            userId: '1',
            name: 'Me',
            avatar: 'https://i.pravatar.cc/150?u=1',
            text: msgInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isHost: true
        };
        setMessages([...messages, newMsg]);
        setMsgInput("");
    };

    const handleUserAction = (action: 'kick' | 'ban' | 'transfer') => {
        const user = MOCK_MEMBERS.find(u => u.id === userManageModal.userId);
        if (!user) return;

        const actionText = action === 'kick' ? 'Mời ra khỏi phòng' : action === 'ban' ? 'Cấm vĩnh viễn' : 'Chuyển quyền Host';

        Alert.alert(
            `Xác nhận ${actionText}`,
            `Bạn có chắc chắn muốn thực hiện với ${user.name}?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý", onPress: () => {
                        setUserManageModal({ visible: false, userId: null });
                        // Implement logic here
                    }, style: action === 'ban' ? 'destructive' : 'default'
                }
            ]
        );
    };

    const handleEndRoom = () => {
        Alert.alert(
            "Kết thúc phòng",
            "Tất cả thành viên sẽ bị ngắt kết nối. Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Kết thúc ngay", onPress: () => navigation.goBack(), style: "destructive" }
            ]
        );
    };

    const handleLeaveRoom = () => {
        Alert.alert(
            "Rời phòng",
            "Bạn có chắc chắn muốn rời khỏi phòng xem chung?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Rời ngay", onPress: () => navigation.goBack(), style: "destructive" }
            ]
        );
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-black">

                {/* 1. Video Player Area */}
                <View className="w-full aspect-video bg-black relative group z-10">
                    <Image
                        source={{ uri: MOCK_ROOM_DATA.movie.poster_path }}
                        className="w-full h-full opacity-60"
                        resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/40" />

                    {/* Top Bar Overlay */}
                    <View className="absolute top-0 left-0 right-0 p-3 flex-row justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-20">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 items-center justify-center rounded-full bg-black/30">
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>

                        <Text className="text-white font-bold flex-1 mx-3 truncate" numberOfLines={1}>
                            {MOCK_ROOM_DATA.title} {roomId ? `(#${roomId})` : ''}
                        </Text>

                        <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => setInviteVisible(true)} className="bg-white/10 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 backdrop-blur-md">
                                <Share2 size={14} color="white" />
                                <Text className="text-white text-xs font-medium">Mời</Text>
                            </TouchableOpacity>

                            {isHost ? (
                                <TouchableOpacity onPress={handleEndRoom} className="bg-red-600 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                                    <Power size={14} color="white" />
                                    <Text className="text-white text-xs font-bold">End</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={handleLeaveRoom} className="bg-white/10 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                                    <LogOut size={14} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Center Play Button */}
                    <TouchableOpacity
                        className="absolute inset-0 justify-center items-center z-10"
                        onPress={() => setIsPlaying(!isPlaying)}
                        activeOpacity={0.7}
                    >
                        {!isPlaying && (
                            <View className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 items-center justify-center">
                                <Play size={32} color="white" fill="white" style={{ marginLeft: 4 }} />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Bottom Controls Overlay */}
                    <View className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent z-20">
                        {/* Progress Bar */}
                        <View className="w-full h-1 bg-white/30 rounded-full mb-3 overflow-hidden">
                            <View
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                                className="h-full bg-red-600 rounded-full"
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                                    {isPlaying ? <Pause size={24} color="white" fill="white" /> : <Play size={24} color="white" fill="white" />}
                                </TouchableOpacity>
                                <Text className="text-white text-xs font-medium">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </Text>
                                <Volume2 size={20} color="rgba(255,255,255,0.7)" />
                            </View>

                            <TouchableOpacity>
                                <Maximize size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 2. Tabs Navigation */}
                <View className="flex-row border-b border-white/10 bg-[#141414]">
                    {[
                        { key: 'chat', label: 'Trò chuyện', icon: MessageSquare },
                        { key: 'members', label: `Thành viên (${MOCK_MEMBERS.length})`, icon: User },
                        { key: 'info', label: 'Thông tin', icon: Info },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key as TabType)}
                            className={clsx(
                                "flex-1 items-center justify-center py-3 border-b-2 flex-row gap-2",
                                activeTab === tab.key ? "border-red-600 bg-white/5" : "border-transparent"
                            )}
                        >
                            <tab.icon size={16} color={activeTab === tab.key ? "#ef4444" : "#94a3b8"} />
                            <Text className={clsx("font-semibold text-xs", activeTab === tab.key ? "text-white" : "text-slate-400")}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 3. Content Area */}
                <View className="flex-1 bg-[#121212]">
                    {activeTab === 'chat' && (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            className="flex-1"
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                        >
                            <FlatList
                                data={messages}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <View className="flex-row gap-3 mb-4 items-start">
                                        <Image source={{ uri: item.avatar }} className="w-8 h-8 rounded-full border border-white/10 mt-1" />
                                        <View className="flex-1">
                                            <View className="flex-row items-baseline gap-2 mb-1">
                                                <Text className={clsx("text-xs font-bold", item.isHost ? "text-yellow-500" : "text-slate-300")}>
                                                    {item.name}
                                                </Text>
                                                {item.isHost && (
                                                    <View className="bg-yellow-500/20 px-1 py-0.5 rounded ml-1">
                                                        <Text className="text-[8px] text-yellow-500 font-bold uppercase">HOST</Text>
                                                    </View>
                                                )}
                                                <Text className="text-[10px] text-slate-500 ml-auto">{item.time}</Text>
                                            </View>
                                            <View className="bg-[#1F1F1F] p-3 rounded-2xl rounded-tl-none border border-white/5 self-start">
                                                <Text className="text-slate-200 text-sm leading-5">{item.text}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            />
                            <View className="p-3 bg-[#0A0A0A] border-t border-white/10 flex-row items-center gap-3">
                                <TouchableOpacity className="w-9 h-9 items-center justify-center rounded-full bg-white/5">
                                    <Smile size={20} color="#94a3b8" />
                                </TouchableOpacity>
                                <TextInput
                                    placeholder="Nhập tin nhắn..."
                                    placeholderTextColor="#64748b"
                                    value={msgInput}
                                    onChangeText={setMsgInput}
                                    className="flex-1 h-10 bg-[#1F1F1F] rounded-full px-4 text-white border border-transparent focus:border-red-600 text-sm"
                                />
                                <TouchableOpacity
                                    onPress={handleSendMessage}
                                    className={clsx("w-10 h-10 items-center justify-center rounded-full shadow-sm", msgInput.trim() ? "bg-red-600" : "bg-slate-700")}
                                    disabled={!msgInput.trim()}
                                >
                                    <Send size={18} color="white" style={{ marginLeft: 2 }} />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    )}

                    {activeTab === 'members' && (
                        <FlatList
                            data={MOCK_MEMBERS}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ padding: 12 }}
                            renderItem={({ item }) => (
                                <View className="flex-row items-center justify-between p-3 rounded-xl hover:bg-white/5 mb-1">
                                    <View className="flex-row items-center gap-3">
                                        <View className="relative">
                                            <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full border border-white/10" />
                                            {item.online && <View className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#121212]" />}
                                        </View>
                                        <View>
                                            <View className="flex-row items-center gap-2">
                                                <Text className="text-slate-200 font-medium">{item.name}</Text>
                                                {item.role === 'host' && (
                                                    <View className="bg-yellow-500/20 px-1.5 py-0.5 rounded">
                                                        <Text className="text-[10px] text-yellow-500 font-bold">HOST</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-slate-500 text-xs mt-0.5">{item.online ? 'Đang xem' : 'Ngoại tuyến'}</Text>
                                        </View>
                                    </View>

                                    {isHost && item.id !== '1' && (
                                        <TouchableOpacity
                                            className="w-8 h-8 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
                                            onPress={() => setUserManageModal({ visible: true, userId: item.id })}
                                        >
                                            <MoreVertical size={16} color="#94a3b8" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        />
                    )}

                    {activeTab === 'info' && (
                        <ScrollView contentContainerStyle={{ padding: 0 }}>
                            <View className="p-5">
                                <View className="flex-row gap-4 mb-6">
                                    <Image
                                        source={{ uri: MOCK_ROOM_DATA.movie.poster_path }}
                                        className="w-24 h-36 rounded-lg shadow-lg border border-white/10"
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1 justify-center">
                                        <Text className="text-2xl font-bold text-white mb-2 leading-tight">{MOCK_ROOM_DATA.movie.title}</Text>
                                        <View className="flex-row items-center gap-3 mb-2">
                                            <View className="flex-row items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded">
                                                <Heart size={12} color="#eab308" fill="#eab308" />
                                                <Text className="text-yellow-500 text-xs font-bold">{MOCK_ROOM_DATA.movie.vote_average}</Text>
                                            </View>
                                            <Text className="text-slate-400 text-xs">{MOCK_ROOM_DATA.movie.release_date.split('-')[0]}</Text>
                                        </View>
                                        <View className="flex-row flex-wrap gap-2">
                                            <View className="bg-slate-800 px-2 py-1 rounded">
                                                <Text className="text-slate-300 text-[10px]">Hành động</Text>
                                            </View>
                                            <View className="bg-slate-800 px-2 py-1 rounded">
                                                <Text className="text-slate-300 text-[10px]">Viễn tưởng</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 space-y-3 mb-6">
                                    <Text className="text-white font-semibold flex-row items-center gap-2">
                                        <Info size={16} color="white" /> Giới thiệu
                                    </Text>
                                    <Text className="text-slate-400 text-sm leading-6">
                                        {MOCK_ROOM_DATA.movie.overview}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* --- Modals --- */}

                <InviteModal
                    visible={inviteVisible}
                    onClose={() => setInviteVisible(false)}
                    roomData={MOCK_ROOM_DATA}
                />

                <Modal transparent visible={userManageModal.visible} animationType="fade" onRequestClose={() => setUserManageModal({ visible: false, userId: null })}>
                    <TouchableOpacity
                        className="flex-1 bg-black/60 justify-end"
                        activeOpacity={1}
                        onPress={() => setUserManageModal({ visible: false, userId: null })}
                    >
                        <View className="bg-[#1F1F1F] rounded-t-2xl p-5 border-t border-slate-700">
                            <Text className="text-white font-bold text-center text-lg mb-5">
                                Quản lý thành viên
                            </Text>

                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-white/5 rounded-xl mb-3 gap-2 active:bg-white/10"
                                onPress={() => handleUserAction('transfer')}
                            >
                                <Crown size={20} color="#eab308" className="mr-3" />
                                <Text className="text-white font-medium">Chuyển quyền Host</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-red-500/10 rounded-xl mb-3 gap-2 active:bg-red-500/20"
                                onPress={() => handleUserAction('kick')}
                            >
                                <UserX size={20} color="#ef4444" className="mr-3" />
                                <Text className="text-red-500 font-medium">Mời ra khỏi phòng</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-red-500/10 rounded-xl mb-5 gap-2 active:bg-red-500/20"
                                onPress={() => handleUserAction('ban')}
                            >
                                <Ban size={20} color="#ef4444" className="mr-3" />
                                <Text className="text-red-500 font-medium">Cấm vĩnh viễn (Ban)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="p-3 bg-slate-800 rounded-xl items-center"
                                onPress={() => setUserManageModal({ visible: false, userId: null })}
                            >
                                <Text className="text-white font-bold">Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

            </SafeAreaView>
        </View>
    );
}
