import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image, TextInput,
    FlatList, Modal, Alert, Clipboard, Dimensions, KeyboardAvoidingView,
    Platform, ActivityIndicator, Keyboard
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { io, Socket } from 'socket.io-client';
import EmojiPicker from 'rn-emoji-keyboard';
import {
    Play, Pause, Send, Smile, MoreVertical,
    User, MessageSquare, Info, ChevronLeft,
    Settings, Share2, Heart, Lock, Unlock, Globe,
    Copy, Check, Power, LogOut, UserX, Ban, Crown,
    Maximize, Minimize, Volume2, Bell, AlertCircle, RefreshCw,
    Mic, MicOff, Volume1, VolumeX, Calendar, Star
} from 'lucide-react-native';
import { clsx } from 'clsx';
import { RootStackParamList } from '../../types/navigation';
import { Message, WatchPartyMember, RoomData } from '@/types/watch-party';
import { watchPartyService } from '@/services/watch-party.service';
import { useAuth } from '@/contexts/AuthContext';
import { SOCKET_URL } from '@/constants/config';
import { getAccessToken } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TabType = 'chat' | 'members' | 'info';

interface JoinRequest {
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
}

const getSafeYear = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.getFullYear().toString();
};

const getSafeVideoUrl = (url: string | null | undefined) => {
    if (!url) return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    
    let processedUrl = url;
    
    if (processedUrl.includes('localhost') || processedUrl.includes('127.0.0.1')) {
        const host = SOCKET_URL.replace('http://', '').replace('https://', '').split(':')[0];
        processedUrl = processedUrl.replace('localhost', host).replace('127.0.0.1', host);
    }
    
    if (!processedUrl.startsWith('http')) {
        const cleanPath = processedUrl.startsWith('/') ? processedUrl.substring(1) : processedUrl;
        processedUrl = `${SOCKET_URL}/${cleanPath}`;
    }

    // Force https for external sources to avoid ATS issues on iOS
    if (processedUrl.startsWith('http://') && !processedUrl.includes('192.168.') && !processedUrl.includes('10.0.')) {
        processedUrl = processedUrl.replace('http://', 'https://');
    }

    return processedUrl;
};

const getSafeDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN');
};

const InviteModal = ({ visible, onClose, roomData }: { visible: boolean; onClose: () => void; roomData: RoomData | null }) => {
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    if (!roomData) return null;

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

                        {roomData?.is_private && roomData?.join_code && (
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
                                        onPress={() => roomData.join_code && handleCopy(roomData.join_code, 'code')}
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
    const roomId = (route.params as any)?.roomId as string;

    const { user, isLoading: authLoading } = useAuth();

    const socketRef = useRef<Socket | null>(null);
    const isSocketAction = useRef(false);
    const lastTimeRef = useRef(0);
    const flatListRef = useRef<FlatList>(null);

    const [roomData, setRoomData] = useState<RoomData | null>(null);

    // Expo Video Player
    const videoUrl = useMemo(() => {
        const rawUrl = roomData?.episode?.video_url || roomData?.movie?.video_url || 
                       roomData?.episode?.videoUrl || roomData?.movie?.videoUrl;
        return getSafeVideoUrl(rawUrl) || "";
    }, [roomData]);

    const player = useVideoPlayer(videoUrl, p => {
        p.loop = false;
        p.play();
    });

    const [messages, setMessages] = useState<any[]>([]);
    const [members, setMembers] = useState<WatchPartyMember[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [showEmoji, setShowEmoji] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isPendingApproval, setIsPendingApproval] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState<string | null>(null);

    const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState("");
    const [inviteVisible, setInviteVisible] = useState(false);
    const [msgInput, setMsgInput] = useState("");
    const [userManageModal, setUserManageModal] = useState<{ visible: boolean, userId: string | null }>({ visible: false, userId: null });
    const [isLoading, setIsLoading] = useState(true);
    const [isHostUser, setIsHostUser] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const isHost = Boolean(roomData && user && roomData.host_user_id === user.id);

    const isHostRef = useRef(isHost);
    useEffect(() => {
        isHostRef.current = isHost;
    }, [isHost]);
    const [showManualControls, setShowManualControls] = useState(false);

    const [isMicOn, setIsMicOn] = useState(true);
    const [peerVolumes, setPeerVolumes] = useState<{ [key: string]: number }>({});
    const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!members.length) return;
        const interval = setInterval(() => {
            const newSpeaking = new Set<string>();
            const potentialSpeakers = members.filter(m => m.id !== user?.id && m.online);
            if (potentialSpeakers.length > 0) {
                const count = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < count; i++) {
                    const randomMember = potentialSpeakers[Math.floor(Math.random() * potentialSpeakers.length)];
                    if (randomMember) newSpeaking.add(randomMember.id);
                }
            }
            setSpeakingUsers(newSpeaking);
        }, 3000);
        return () => clearInterval(interval);
    }, [members, user?.id]);

    const { width: screenWidth } = Dimensions.get('window');
    const videoHeight = screenWidth * (9 / 16);
    const headerHeight = videoHeight + 50;

    useEffect(() => {
        console.log("WatchPartyRoom useEffect 1 - Check user/room:", { hasUser: !!user, roomId, authLoading });
        if (!roomId || authLoading) return;

        const fetchRoomData = async () => {
            try {
                const res: any = await watchPartyService.getWatchPartyDetails(roomId);
                console.log("[DEBUG] Fetch Room Data:", {
                    roomId,
                    isPrivate: res.party?.is_private,
                    hostId: res.party?.host_user_id,
                    userId: user?.id,
                    isHostFromBE: res.isHost
                });

                const rawVideoUrl = res.party?.episode?.video_url || res.party?.movie?.video_url;
                const safeUrl = getSafeVideoUrl(rawVideoUrl);
                console.log("[DEBUG] Video URL Resolution:", {
                    raw: rawVideoUrl,
                    resolved: safeUrl
                });

                setRoomData(res.party);
                setMessages(res.messages || []);

                const isHostFromServer = res.isHost || (user?.id && res.party?.host_user_id === user.id);
                setIsHostUser(Boolean(isHostFromServer));

                if (isHostFromServer) {
                    console.log("[DEBUG] User identified as HOST. Authorized.");
                    setIsAuthorized(true);
                    setShowJoinCodeModal(false);
                } else if (res.party?.is_private) {
                    const storedCode = await AsyncStorage.getItem(`wp_join_code_${roomId}`);
                    if (storedCode && storedCode === res.party.join_code) {
                        console.log("[DEBUG] Provided code matched storage. Authorized.");
                        setIsAuthorized(true);
                        setShowJoinCodeModal(false);
                    } else {
                        console.log("[DEBUG] Private room. Showing join code modal.");
                        setShowJoinCodeModal(true);
                        setIsAuthorized(false);
                    }
                } else {
                    console.log("[DEBUG] Public room. Authorized.");
                    setIsAuthorized(true);
                    setShowJoinCodeModal(false);
                }
            } catch (err: any) {
                console.log("Error fetching room data:", err.message, err.response?.data);
                Alert.alert("Lỗi", "Không thể tải thông tin phòng");
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoomData();
    }, [roomId, user, authLoading]);

    useEffect(() => {
        if (!user || !roomId || !roomData) return;
        if (!isAuthorized && !isPendingApproval) return;

        let socketInstance: Socket | null = null;
        let isMounted = true;

        const initSocket = async () => {
            const token = await getAccessToken();
            if (!isMounted) return;

            socketInstance = io(SOCKET_URL, {
                auth: { token },
                transports: ["polling", "websocket"],
                forceNew: true,
                reconnectionAttempts: 5,
            });
            socketRef.current = socketInstance as unknown as Socket;

            console.log("MOBILE SOCKET INITIALIZING...");
            socketInstance.on("connect", () => {
                console.log("[SOCKET WP] Connected:", socketInstance?.id);
                socketInstance?.emit('wp:join', { roomId, userId: user?.id });

                if (!isHost && isAuthorized) {
                    socketInstance?.emit('wp:request_sync', { roomId, requesterId: user?.id });
                }
            });
            socketInstance.on("connect_error", (err: any) => { console.log("[SOCKET ERR]:", err.message); });

            socketInstance.on('wp:update_members', (newMembers: WatchPartyMember[]) => {
                console.log("[SOCKET] wp:update_members received:", newMembers);
                setMembers(newMembers);
            });

            socketInstance.on('wp:new_message', (msg: Message) => {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                setTimeout(() => { if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true }); }, 200);
            });

            socketInstance.on('wp:system_message', (msg: any) => {
                setMessages(prev => [...prev, { ...msg, isSystem: true, id: Date.now().toString() }]);
                setTimeout(() => { if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true }); }, 200);
            });

            // JOIN REQUESTS (HOST)
            socketInstance.on('wp:host_receive_join_request', (requester: JoinRequest) => {
                if (isHost) {
                    setJoinRequests(prev => {
                        if (prev.some(r => r.userId === requester.userId)) return prev;
                        return [...prev, requester];
                    });
                    Alert.alert(
                        "Yêu cầu tham gia",
                        `${requester.displayName || requester.username} muốn vào phòng`,
                        [
                            {
                                text: "Từ chối", style: "cancel", onPress: () => {
                                    socketRef.current?.emit('wp:process_join_request', { roomId, userId: requester.userId, accept: false });
                                    setJoinRequests(prev => prev.filter(r => r.userId !== requester.userId));
                                }
                            },
                            {
                                text: "Chấp nhận", onPress: () => {
                                    socketRef.current?.emit('wp:process_join_request', { roomId, userId: requester.userId, accept: true });
                                    setJoinRequests(prev => prev.filter(r => r.userId !== requester.userId));
                                }
                            }
                        ]
                    );
                }
            });

            // JOIN STATUS (GUEST)
            socketInstance.on('wp:join_pending', ({ message }: { message: string }) => {
                setIsPendingApproval(true);
                setIsAuthorized(false);
            });

            socketInstance.on('wp:join_accepted', () => {
                setIsPendingApproval(false);
                setIsAuthorized(true);
                Alert.alert("Thành công", "Chủ phòng đã chấp nhận yêu cầu!");
                socketRef.current?.emit('wp:request_sync', { roomId, requesterId: user.id });
            });

            socketInstance.on('wp:join_rejected', ({ message }: { message: string }) => {
                setIsPendingApproval(false);
                Alert.alert("Từ chối", message || "Yêu cầu tham gia bị từ chối.");
                navigation.goBack();
            });


            // ĐỒNG BỘ VIDEO TỪ SERVER
            socketInstance.on('wp:sync_player', async ({ action, currentTime: remoteTime }: { action: 'play' | 'pause' | 'seek', currentTime: number }) => {
                if (!player) return;

                isSocketAction.current = true;

                const localTime = player.currentTime;

                // Sync time nếu lệch quá 2s
                if (action === 'seek' || Math.abs(localTime - remoteTime) > 2) {
                    console.log(`[SYNC] Seek to ${remoteTime}`);
                    player.currentTime = remoteTime;
                    setCurrentTime(remoteTime);
                    lastTimeRef.current = remoteTime;
                }

                if (action === 'play') {
                    console.log(`[SYNC] Play`);
                    player.play();
                    setIsPlaying(true);
                } else if (action === 'pause') {
                    console.log(`[SYNC] Pause`);
                    player.pause();
                    setIsPlaying(false);
                }

                setTimeout(() => {
                    isSocketAction.current = false;
                }, 1000);
            });

            // NHẬN YÊU CẦU ĐỒNG BỘ TỪ VIEWER MỚI VÀO (CHỈ HOST XỬ LÝ)
            socketInstance.on('wp:get_host_time', async ({ requesterId }) => {
                if (!isHostRef.current || !player) return;

                const localTime = player.currentTime;
                socketInstance?.emit('wp:send_host_time', {
                    roomId,
                    requesterId,
                    currentTime: localTime,
                    isPlaying: player.playing
                });
            });

            // VIEWER NHẬN DỮ LIỆU ĐỒNG BỘ TỪ HOST KHI VỪA VÀO PHÒNG
            socketInstance.on('wp:sync_initial', async ({ targetUserId, currentTime: remoteTime, isPlaying: remoteIsPlaying }) => {
                if (user.id !== targetUserId || !player) return;

                isSocketAction.current = true;
                console.log(`[SYNC INIT] Syncing new viewer to ${remoteTime}s and playing: ${remoteIsPlaying}`);

                player.currentTime = remoteTime;
                setCurrentTime(remoteTime);
                lastTimeRef.current = remoteTime;

                if (remoteIsPlaying) {
                    player.play();
                    setIsPlaying(true);
                } else {
                    player.pause();
                    setIsPlaying(false);
                }

                setTimeout(() => {
                    isSocketAction.current = false;
                }, 1000);
            });

            // CÁC EVENT LỆNH CỦA PHÒNG
            socketInstance.on('wp:kicked', ({ userId }: { userId: string }) => {
                if (user.id === userId) {
                    Alert.alert("Thông báo", "Bạn đã bị mời ra khỏi phòng.");
                    navigation.goBack();
                }
            });

            socketInstance.on('wp:banned', ({ userId }: { userId: string }) => {
                if (user.id === userId) {
                    Alert.alert("Thông báo", "Bạn đã bị cấm khỏi phòng này vĩnh viễn.");
                    navigation.goBack();
                }
            });

            socketInstance.on('wp:host_transferred', ({ newHostId }: { newHostId: string }) => {
                if (user.id === roomData?.host_user_id) {
                    Alert.alert("Thông báo", "Đã chuyển quyền thành công.");
                } else if (user.id === newHostId) {
                    Alert.alert("Thông báo", "Bạn đã được chuyển quyền chủ phòng!");
                } else {
                    Alert.alert("Thông báo", "Quyền chủ phòng đã được chuyển giao cho thành viên khác.");
                }

                // Phải xóa cờ host cũ của mình để tránh lưu state isHostUser = true
                setIsHostUser(user.id === newHostId);
                setRoomData(prev => prev ? { ...prev, host_user_id: newHostId } : null);
                setUserManageModal({ visible: false, userId: null }); // Đóng modal nếu đang mở
            });

            socketInstance.on('wp:room_ended', () => {
                Alert.alert("Thông báo", "Phòng đã kết thúc.");
                navigation.goBack();
            });
        };

        initSocket();

        return () => {
            isMounted = false;
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };

    }, [roomId, user?.id, isAuthorized, isPendingApproval]);

    useEffect(() => {
        if (!player) return;

        const playingSub = player.addListener('playingChange', (payload) => {
            const isPlayingNow = payload.isPlaying;
            if (isSocketAction.current || !isHost || !socketRef.current) return;

            console.log(`[HOST] Play/Pause detected: ${isPlayingNow}`);
            const action = isPlayingNow ? 'play' : 'pause';
            setIsPlaying(isPlayingNow);
            socketRef.current.emit("wp:sync_action", {
                roomId,
                action,
                currentTime: player.currentTime
            });
        });

        const timeSub = player.addListener('timeUpdate', (event) => {
            const currentSecs = event.currentTime;
            setCurrentTime(currentSecs);
            
            if (player.duration) {
                setDuration(player.duration);
            }

            if (isSocketAction.current || !isHost || !socketRef.current) {
                lastTimeRef.current = currentSecs;
                return;
            }

            const diff = Math.abs(currentSecs - lastTimeRef.current);
            const isSeeking = diff > 2;

            if (isSeeking) {
                console.log(`[HOST] User seeked logic detected: ${lastTimeRef.current} -> ${currentSecs}`);
                socketRef.current.emit('wp:seek_action', { roomId, currentTime: currentSecs });
            }

            lastTimeRef.current = currentSecs;
        });

        const statusSub = player.addListener('statusChange', (payload) => {
            if (payload.status === 'loading') {
                setIsVideoLoading(true);
                setVideoError(null);
            } else if (payload.status === 'error') {
                setIsVideoLoading(false);
                const errorMsg = payload.error?.message || "Đã xảy ra lỗi khi tải video";
                setVideoError(errorMsg);
                Alert.alert("Lỗi Video", errorMsg);
            } else {
                setIsVideoLoading(false);
                setVideoError(null);
            }
        });

        return () => {
            playingSub.remove();
            timeSub.remove();
            statusSub.remove();
        };
    }, [player, isHost, roomId]);

    const handleSeek = async (newTimeSeconds: number) => {
        if (!isHost || !player || !socketRef.current) return;

        player.currentTime = newTimeSeconds;
        setCurrentTime(newTimeSeconds);
        socketRef.current.emit('wp:seek_action', {
            roomId,
            currentTime: newTimeSeconds
        });
    };

    useEffect(() => {
        if (!isHost || !roomData?.scheduled_at || roomData.started_at || !player) return;
        const scheduleTime = new Date(roomData.scheduled_at).getTime();
        const checkTimer = setInterval(async () => {
            if (Date.now() >= scheduleTime) {
                if (!player.playing) {
                    Alert.alert("Thông báo", "Đến giờ chiếu! Đang bắt đầu phát video.");
                    player.play();
                    setIsPlaying(true);
                    socketRef.current?.emit('wp:sync_action', { roomId, action: 'play', currentTime: player.currentTime });
                }
                clearInterval(checkTimer);
            }
        }, 3000);
        return () => clearInterval(checkTimer);
    }, [isHost, roomData, player]);

    const handleManualSync = () => {
        if (isHost) {
            socketRef.current?.emit('wp:sync_action', {
                roomId,
                action: isPlaying ? 'play' : 'pause',
                currentTime: currentTime
            });
            Alert.alert("Thành công", "Đã phát tín hiệu đồng bộ cho tất cả thành viên");
        } else {
            Alert.alert("Thông báo", "Đang yêu cầu Host đồng bộ...");
            socketRef.current?.emit('wp:request_sync', { roomId, requesterId: user?.id });
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSendMessage = () => {
        if (!msgInput.trim()) return;

        if (!socketRef.current || !socketRef.current.connected) {
            Alert.alert("Lỗi kết nối", "Bạn chưa kết nối tới phòng chat. Vui lòng thử lại.");
            return;
        }

        socketRef.current.emit('wp:send_message', {
            roomId,
            userId: user?.id,
            message: msgInput,
            user: { name: user?.display_name || user?.username, avatar: user?.avatar_url }
        });
        setMsgInput("");
    };

    const handleUserAction = (action: 'kick' | 'ban' | 'transfer') => {
        const targetUserId = userManageModal.userId;
        if (!targetUserId || !socketRef.current) return;

        const targetUser = members.find(u => u.id === targetUserId);

        const actionText = action === 'kick' ? 'Mời ra khỏi phòng' : action === 'ban' ? 'Cấm vĩnh viễn' : 'Chuyển quyền Host';
        const socketEvent = action === 'kick' ? 'wp:kick_user' : action === 'ban' ? 'wp:ban_user' : 'wp:transfer_host';

        Alert.alert(
            `Xác nhận ${actionText}`,
            `Bạn có chắc chắn muốn thực hiện với ${targetUser?.name}?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý", onPress: () => {
                        if (action === 'transfer') {
                            socketRef.current?.emit(socketEvent, { roomId, newHostId: targetUserId });
                        } else if (action === 'kick') {
                            socketRef.current?.emit(socketEvent, { roomId, userIdToKick: targetUserId });
                        } else if (action === 'ban') {
                            socketRef.current?.emit(socketEvent, { roomId, userIdToBan: targetUserId });
                        }
                        setUserManageModal({ visible: false, userId: null });
                    }, style: action === 'ban' ? 'destructive' : 'default'
                }
            ]
        );
    };

    const handleEndRoom = () => {
        if (!isHost) return;
        Alert.alert(
            "Kết thúc phòng",
            "Tất cả thành viên sẽ bị ngắt kết nối. Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Kết thúc ngay",
                    onPress: () => {
                        socketRef.current?.emit('wp:end_room', roomId);
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleLeaveRoom = () => {
        Alert.alert("Rời phòng", "Bạn có chắc chắn muốn rời khỏi phòng xem chung?", [
            { text: "Hủy", style: "cancel" },
            { text: "Rời ngay", onPress: () => navigation.goBack(), style: "destructive" }
        ]);
    };

    // Render loading state
    if (isLoading || !roomData) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#ef4444" />
                <Text className="text-white mt-4">Đang tải phòng...</Text>
            </View>
        );
    }

    if (isPendingApproval) {
        return (
            <View className="flex-1 bg-black justify-center items-center p-6">
                <View className="bg-[#1F1F1F] p-8 rounded-2xl items-center w-full max-w-sm border border-slate-700">
                    <ActivityIndicator size="large" color="#ef4444" className="mb-6" />
                    <Text className="text-white text-xl font-bold mb-2 text-center">Đang chờ duyệt</Text>
                    <Text className="text-slate-400 text-center mb-8">
                        Vui lòng chờ chủ phòng chấp nhận yêu cầu tham gia của bạn.
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="bg-slate-700 px-6 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold">Hủy yêu cầu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-black">

                {/* Top Bar (Moved outside video to prevent native controls overlap) */}
                <View className="flex-row justify-between items-center p-3 z-20 bg-[#121212] border-b border-white/10">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 items-center justify-center rounded-full bg-white/10">
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>

                    <Text className="text-white font-bold flex-1 mx-3 truncate" numberOfLines={1}>
                        {roomData.title}
                    </Text>

                    <View className="flex-row gap-2 items-center">
                        <TouchableOpacity onPress={() => setInviteVisible(true)} className="bg-white/10 px-2 py-1.5 rounded-full flex-row items-center gap-1.5">
                            <Share2 size={14} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleManualSync} className="bg-white/10 px-2 py-1.5 rounded-full flex-row items-center gap-1.5">
                            <RefreshCw size={14} color="white" />
                        </TouchableOpacity>

                        {isHost ? (
                            <>
                                <TouchableOpacity onPress={handleLeaveRoom} className="bg-white/10 px-2 py-1.5 rounded-full flex-row items-center gap-1.5">
                                    <LogOut size={14} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleEndRoom} className="bg-red-600 px-2 py-1.5 rounded-full flex-row items-center gap-1.5">
                                    <Power size={14} color="white" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={handleLeaveRoom} className="bg-white/10 px-2 py-1.5 rounded-full flex-row items-center gap-1.5">
                                <LogOut size={14} color="white" />
                                <Text className="text-white text-xs font-medium">Rời</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 1. Video Player Area */}
                <View className="w-full aspect-video bg-black relative group z-10 justify-center items-center">
                    <VideoView
                        player={player}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="contain"
                        nativeControls={isHost}
                    />

                    {isVideoLoading && !videoError && (
                        <View className="absolute inset-0 z-20 justify-center items-center bg-black/50">
                            <ActivityIndicator size="large" color="#ef4444" />
                            <Text className="text-white text-xs mt-2 font-medium">Đang tải phim...</Text>
                        </View>
                    )}

                    {videoError && (
                        <View className="absolute inset-0 z-30 justify-center items-center bg-black/80 px-4">
                            <AlertCircle color="#ef4444" size={40} className="mb-2" />
                            <Text className="text-white text-center font-bold text-lg mb-1">Không thể phát video</Text>
                            <Text className="text-zinc-400 text-center text-sm">{videoError}</Text>
                        </View>
                    )}

                    {!isPlaying && !isHost && !isVideoLoading && !videoError && (
                        <View className="absolute inset-0 bg-black/40 items-center justify-center pointer-events-none">
                            <ActivityIndicator color="white" />
                            <Text className="text-white opacity-90 mt-2 font-bold">Đang chờ Host phát...</Text>
                        </View>
                    )}

                    {!isHost && (
                        <View className="absolute bottom-2 right-4 bg-black/50 px-2 flex-row rounded items-center pointer-events-none">
                            {isPlaying ? <Play size={10} color="white" className="mr-1" /> : <Pause size={10} color="white" className="mr-1" />}
                            <Text className="text-white text-xs">{formatTime(currentTime)}</Text>
                        </View>
                    )}
                </View>

                {/* 2. Tabs Navigation */}
                <View className="flex-row border-b border-white/10 bg-[#141414]">
                    {[
                        { key: 'chat', label: 'Trò chuyện', icon: MessageSquare },
                        { key: 'members', label: `Thành viên (${members.length})`, icon: User },
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
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            className="flex-1"
                            keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 60 : 80} // Tăng offset lên để chat nhích lên
                        >
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                                renderItem={({ item }) => {
                                    if (item.isSystem) {
                                        return (
                                            <View className="mb-4 items-center">
                                                <View className="bg-white/10 px-3 py-1 rounded-full">
                                                    <Text className="text-slate-400 text-[10px] text-center italic">{item.text}</Text>
                                                </View>
                                            </View>
                                        );
                                    }

                                    return (
                                        <View className="flex-row gap-3 mb-4 items-start">
                                            <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} className="w-8 h-8 rounded-full border border-white/10 mt-1" />
                                            <View className="flex-1">
                                                <View className="flex-row items-baseline gap-2 mb-1">
                                                    <Text className={clsx("text-xs font-bold", item.isHost ? "text-yellow-500" : "text-slate-300")}>
                                                        {item.user}
                                                    </Text>
                                                    {item.isHost && (
                                                        <View className="bg-yellow-500/20 px-1 py-0.5 rounded ml-1">
                                                            <Text className="text-[8px] text-yellow-500 font-bold uppercase">HOST</Text>
                                                        </View>
                                                    )}
                                                    <Text className="text-[10px] text-slate-500 ml-auto">
                                                        {new Date(item.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                                <View className="bg-[#1F1F1F] p-3 rounded-2xl rounded-tl-none border border-white/5 self-start">
                                                    <Text className="text-slate-200 text-sm leading-5">{item.text}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }}
                            />

                            <EmojiPicker
                                onEmojiSelected={(emojiObject) => setMsgInput(prev => prev + emojiObject.emoji)}
                                open={showEmoji}
                                onClose={() => setShowEmoji(false)}
                            />

                            {/* Thêm padding/margin bottom cho Android/iOS khỏi bị lẹm bàn phím */}
                            <View className="p-3 bg-[#0A0A0A] border-t border-white/10 flex-row items-center gap-3 pb-6">
                                <TouchableOpacity
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        setShowEmoji(true);
                                    }}
                                    className="w-9 h-9 items-center justify-center rounded-full bg-white/5"
                                >
                                    <Smile size={20} color={showEmoji ? "#ef4444" : "#94a3b8"} />
                                </TouchableOpacity>
                                <TextInput
                                    placeholder="Nhập tin nhắn..."
                                    placeholderTextColor="#64748b"
                                    value={msgInput}
                                    onChangeText={setMsgInput}
                                    style={{ flex: 1, height: 40, backgroundColor: '#1F1F1F', borderRadius: 20, paddingHorizontal: 16, color: 'white', fontSize: 14 }}
                                    onSubmitEditing={handleSendMessage}
                                    returnKeyType="send"
                                    blurOnSubmit={false}
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
                            data={members}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ padding: 12 }}
                            ListHeaderComponent={() => (
                                <>
                                    <View className="mb-4 bg-red-900/10 border border-white/5 rounded-xl p-3 flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-3">
                                            <View className={clsx("w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10", isMicOn && "border-green-500/50 bg-green-500/10")}>
                                                {isMicOn ? <Mic size={20} color="#22c55e" /> : <MicOff size={20} color="#ef4444" />}
                                            </View>
                                            <View>
                                                <Text className={clsx("font-bold text-sm", isMicOn ? "text-green-500" : "text-slate-400")}>Voice Chat</Text>
                                                <Text className="text-xs text-slate-500">{isMicOn ? "Đang bật mic" : "Đã tắt mic"}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setIsMicOn(!isMicOn)}
                                            className={clsx("px-4 py-2 rounded-lg", isMicOn ? "bg-white/10" : "bg-red-600")}
                                        >
                                            <Text className={clsx("font-bold text-xs uppercase tracking-wider", isMicOn ? "text-slate-300" : "text-white")}>
                                                {isMicOn ? "Tắt Mic" : "Bật Mic"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {isHost && joinRequests.length > 0 && (
                                        <View className="mb-6">
                                            <View className="flex-row items-center gap-2 mb-3">
                                                <Bell size={18} color="#eab308" />
                                                <Text className="text-yellow-500 font-bold uppercase text-xs">Yêu cầu tham gia</Text>
                                            </View>
                                            {joinRequests.map(req => (
                                                <View key={req.userId} className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/30 flex-row items-center justify-between mb-2">
                                                    <View className="flex-row items-center gap-3">
                                                        <Image source={{ uri: req.avatarUrl || 'https://via.placeholder.com/150' }} className="w-10 h-10 rounded-full" />
                                                        <Text className="text-white font-bold">{req.displayName || req.username}</Text>
                                                    </View>
                                                    <View className="flex-row gap-2">
                                                        <TouchableOpacity
                                                            className="w-9 h-9 bg-green-600 rounded-full items-center justify-center"
                                                            onPress={() => {
                                                                socketRef.current?.emit('wp:process_join_request', { roomId, userId: req.userId, accept: true });
                                                                setJoinRequests(prev => prev.filter(r => r.userId !== req.userId));
                                                            }}
                                                        >
                                                            <Check size={18} color="white" />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            className="w-9 h-9 bg-red-600 rounded-full items-center justify-center"
                                                            onPress={() => {
                                                                socketRef.current?.emit('wp:process_join_request', { roomId, userId: req.userId, accept: false });
                                                                setJoinRequests(prev => prev.filter(r => r.userId !== req.userId));
                                                            }}
                                                        >
                                                            <UserX size={18} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    <View className="flex-row items-center gap-2 mb-3 mt-2">
                                        <User size={18} color="#94a3b8" />
                                        <Text className="text-slate-400 font-bold uppercase text-xs">Danh sách thành viên</Text>
                                    </View>
                                </>
                            )}
                            renderItem={({ item }) => {
                                const isSpeaking = speakingUsers.has(item.id);
                                const isMe = item.id === user?.id;
                                const volume = peerVolumes[item.id] ?? 100;
                                const isMuted = volume === 0;

                                return (
                                    <View className="p-3 rounded-xl bg-transparent mb-1">
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center gap-3">
                                                <View className="relative">
                                                    <View className={clsx("rounded-full border-2", isSpeaking ? "border-green-500" : "border-white/10")}>
                                                        <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} className="w-10 h-10 rounded-full" />
                                                    </View>
                                                    {isSpeaking && <View className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-[#121212]"><Mic size={10} color="black" /></View>}
                                                    {!isSpeaking && item.online && <View className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#121212]" />}
                                                </View>
                                                <View>
                                                    <View className="flex-row items-center gap-2">
                                                        <Text className="text-slate-200 font-bold">{item.name}</Text>
                                                        {item.role === 'host' && (
                                                            <View className="bg-yellow-500/20 px-1.5 py-0.5 rounded">
                                                                <Text className="text-[10px] text-yellow-500 font-bold">HOST</Text>
                                                            </View>
                                                        )}
                                                        {isMe && (
                                                            <View className="bg-slate-700 px-1.5 py-0.5 rounded">
                                                                <Text className="text-[10px] text-slate-300 font-bold">BẠN</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View className="flex-row items-center gap-1 mt-0.5">
                                                        <View className={clsx("w-1.5 h-1.5 rounded-full", item.online ? "bg-green-500" : "bg-slate-600")} />
                                                        <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">
                                                            {item.online ? 'Online' : 'Offline'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="flex-row items-center gap-2">
                                                {!isMe && item.online && (
                                                    <TouchableOpacity
                                                        className="w-8 h-8 items-center justify-center"
                                                        onPress={() => setPeerVolumes(prev => ({ ...prev, [item.id]: isMuted ? 80 : 0 }))}
                                                    >
                                                        {isMuted ? <VolumeX size={16} color="#64748b" /> : (volume < 50 ? <Volume1 size={16} color="#cbd5e1" /> : <Volume2 size={16} color="#cbd5e1" />)}
                                                    </TouchableOpacity>
                                                )}
                                                {isHost && !isMe && (
                                                    <TouchableOpacity
                                                        className="w-8 h-8 items-center justify-center rounded-full bg-white/5"
                                                        onPress={() => setUserManageModal({ visible: true, userId: item.id })}
                                                    >
                                                        <MoreVertical size={16} color="#94a3b8" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    )}

                    {activeTab === 'info' && (
                        <ScrollView contentContainerStyle={{ padding: 0 }}>
                            <View className="p-5">
                                <View className="flex-row gap-5 mb-6">
                                    <Image
                                        source={{ uri: roomData.movie?.poster_url || 'https://via.placeholder.com/150' }}
                                        className="w-32 h-44 rounded-xl shadow-2xl border border-white/5"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-2xl font-bold text-white mb-1 leading-tight">{roomData.movie?.title}</Text>
                                        <View className="bg-transparent border border-slate-600 rounded px-1.5 py-0.5 self-start mb-3">
                                            <Text className="text-slate-400 text-xs">{getSafeYear(roomData.movie?.release_date)}</Text>
                                        </View>

                                        {roomData.episode && (
                                            <Text className="text-red-500 font-bold mb-3">
                                                Đang phát: {roomData.episode.title || `Tập ${roomData.episode.episode_number}`}
                                            </Text>
                                        )}

                                        <View className="flex-row items-center gap-3 mb-2 flex-wrap">
                                            <View className="flex-row items-center gap-1 bg-white/10 px-2 py-1 rounded">
                                                <Star size={12} color="#eab308" fill="#eab308" />
                                                <Text className="text-white font-bold text-[10px]">8.5</Text>
                                            </View>
                                            <View className="flex-row items-center gap-1">
                                                <Calendar size={12} color="#94a3b8" />
                                                <Text className="text-slate-300 text-[10px]">{getSafeDate(roomData.movie?.release_date)}</Text>
                                            </View>
                                            <View className="flex-row items-center gap-1">
                                                <Globe size={12} color="#94a3b8" />
                                                <Text className="text-slate-300 text-[10px]">{roomData.movie?.country?.name || 'Quốc tế'}</Text>
                                            </View>
                                        </View>

                                        <View className="flex-row gap-1.5 flex-wrap">
                                            {roomData.movie?.movie_genres?.map((g: any) => (
                                                <View key={g.genre?.id || g.id} className="bg-slate-800 px-2 py-0.5 rounded">
                                                    <Text className="text-slate-200 text-[10px]">{g.genre?.name}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 space-y-3 mb-6">
                                    <Text className="text-slate-300 text-sm leading-6">
                                        {roomData.movie?.description || 'Chưa có mô tả cho phim này.'}
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
                    roomData={roomData}
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
                                className="flex-row items-center p-4 bg-white/5 rounded-xl mb-3 gap-2"
                                onPress={() => handleUserAction('transfer')}
                            >
                                <Crown size={20} color="#eab308" className="mr-3" />
                                <Text className="text-white font-medium">Chuyển quyền Host</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-red-500/10 rounded-xl mb-3 gap-2"
                                onPress={() => handleUserAction('kick')}
                            >
                                <UserX size={20} color="#ef4444" className="mr-3" />
                                <Text className="text-red-500 font-medium">Mời ra khỏi phòng</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-red-500/10 rounded-xl mb-5 gap-2"
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

                <Modal transparent visible={showJoinCodeModal} animationType="fade">
                    <View className="flex-1 bg-black/80 justify-center items-center p-5">
                        <View className="bg-[#1F1F1F] w-full max-w-sm rounded-xl border border-slate-700 p-6 items-center">
                            <Lock size={40} color="#ef4444" className="mb-4" />
                            <Text className="text-white font-bold text-lg mb-2">Phòng riêng tư</Text>
                            <Text className="text-slate-400 text-center text-sm mb-6">Vui lòng nhập mã tham gia (Join Code) để vào phòng này.</Text>
                            <TextInput
                                className="w-full bg-black/50 border border-slate-700 text-white rounded-lg p-3 text-center text-lg font-mono tracking-widest mb-4 uppercase"
                                placeholder="NHẬP MÃ"
                                placeholderTextColor="#64748b"
                                value={joinCodeInput}
                                onChangeText={setJoinCodeInput}
                                autoCapitalize="characters"
                            />
                            <View className="flex-row gap-3 w-full">
                                <TouchableOpacity
                                    className="flex-1 p-3 bg-slate-800 rounded-lg flex-row items-center justify-center gap-2"
                                    onPress={() => navigation.goBack()}
                                >
                                    <LogOut size={18} color="white" />
                                    <Text className="text-white font-bold">Thoát</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 p-3 bg-red-600 rounded-lg flex-row items-center justify-center gap-2"
                                    onPress={async () => {
                                        if (joinCodeInput.trim().toUpperCase() === roomData?.join_code) {
                                            await AsyncStorage.setItem(`wp_join_code_${roomId}`, joinCodeInput.trim().toUpperCase());
                                            setIsAuthorized(true);
                                            setShowJoinCodeModal(false);
                                        } else {
                                            Alert.alert("Lỗi", "Mã tham gia không chính xác!");
                                        }
                                    }}
                                >
                                    <Unlock size={18} color="white" />
                                    <Text className="text-white font-bold">Vào phòng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}



