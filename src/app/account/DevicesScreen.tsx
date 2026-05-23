import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Monitor, Smartphone, Tablet, Laptop, Tv, Trash2, ShieldCheck, MapPin, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { deviceService } from '@/services/device.service';
import { DeviceSessionResponse } from '@/types/device';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const DevicesScreen = () => {
    const navigation = useNavigation();
    const [devices, setDevices] = useState<DeviceSessionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setIsLoading(true);
            const response = await deviceService.getLoggedInDevices();
            if (response && response.data) {
                // Sort to show newest last used first
                const sorted = response.data.sort((a, b) => 
                    new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime()
                );
                setDevices(sorted);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách thiết bị');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevoke = (id: string) => {
        Alert.alert(
            "Đăng xuất thiết bị",
            "Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Đăng xuất", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setRevokingId(id);
                            await deviceService.revokeDevice(id);
                            // Cập nhật lại danh sách sau khi xóa thành công
                            setDevices(prev => prev.filter(d => d.id !== id));
                        } catch (error) {
                            console.error('Error revoking device:', error);
                            Alert.alert('Lỗi', 'Không thể đăng xuất thiết bị lúc này');
                        } finally {
                            setRevokingId(null);
                        }
                    }
                }
            ]
        );
    };

    const getDeviceIcon = (deviceInfo: any) => {
        const type = deviceInfo?.deviceType?.toLowerCase();
        const os = deviceInfo?.os?.toLowerCase() || '';

        if (type === 'mobile' || os.includes('ios') || os.includes('android')) {
            if (os.includes('ipad')) return <Tablet size={24} color="#a1a1aa" />;
            return <Smartphone size={24} color="#a1a1aa" />;
        }
        if (type === 'tablet') return <Tablet size={24} color="#a1a1aa" />;
        if (type === 'tv' || os.includes('tv')) return <Tv size={24} color="#a1a1aa" />;
        if (type === 'desktop' || os.includes('windows') || os.includes('mac') || os.includes('linux')) return <Monitor size={24} color="#a1a1aa" />;
        
        return <Laptop size={24} color="#a1a1aa" />;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Không xác định';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return 'Không hợp lệ';
        }
    };

    return (
        <View className="flex-1 bg-black pt-12">
            {/* Header */}
            <View className="flex-row items-center px-4 mb-6">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 -ml-2 mr-2"
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Thiết bị đã đăng nhập</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                <View className="mb-6">
                    <Text className="text-zinc-400 text-sm leading-5">
                        Dưới đây là danh sách các thiết bị đã đăng nhập vào tài khoản của bạn. 
                        Bạn có thể đăng xuất khỏi các thiết bị không còn sử dụng để bảo vệ tài khoản.
                    </Text>
                </View>

                {isLoading ? (
                    <View className="py-10 items-center justify-center">
                        <ActivityIndicator size="large" color="#ef4444" />
                    </View>
                ) : devices.length === 0 ? (
                    <View className="py-10 items-center justify-center">
                        <Monitor size={48} color="#52525b" />
                        <Text className="text-zinc-400 text-center mt-4">Không có thiết bị nào</Text>
                    </View>
                ) : (
                    <View className="gap-4 pb-8">
                        {devices.map((device, index) => (
                            <View 
                                key={device.id} 
                                className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                            >
                                <View className="flex-row items-center mb-3">
                                    <View className="w-12 h-12 bg-zinc-800 rounded-full items-center justify-center mr-3">
                                        {getDeviceIcon(device.device_info)}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                                            {device.device_info?.deviceName || 'Trình duyệt Web'}
                                        </Text>
                                        <Text className="text-zinc-400 text-xs">
                                            {device.device_info?.os || 'Hệ điều hành không xác định'} {device.device_info?.browser ? `• ${device.device_info.browser}` : ''}
                                        </Text>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        onPress={() => handleRevoke(device.id)}
                                        disabled={revokingId === device.id}
                                        className="p-2 rounded-full bg-red-500/10"
                                    >
                                        {revokingId === device.id ? (
                                            <ActivityIndicator size="small" color="#ef4444" />
                                        ) : (
                                            <Trash2 size={18} color="#ef4444" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                
                                <View className="flex-row items-center justify-between border-t border-zinc-800 pt-3 mt-1 gap-2">
                                    <View className="flex-row items-center flex-shrink-0">
                                        <Clock size={12} color="#a1a1aa" className="mr-1" />
                                        <Text className="text-zinc-400 text-xs text-left">
                                            Hoạt động: {formatDate(device.last_used_at)}
                                        </Text>
                                    </View>
                                    {device.ip_address && (
                                        <View className="flex-row items-center flex-1 justify-end">
                                            <MapPin size={12} color="#a1a1aa" className="mr-1 flex-shrink-0" />
                                            <Text className="text-zinc-400 text-xs text-right" numberOfLines={1} ellipsizeMode="tail">
                                                {device.ip_address.split(',')[0].trim()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default DevicesScreen;