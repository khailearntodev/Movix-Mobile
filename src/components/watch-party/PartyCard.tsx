import React from "react";
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Users, Lock, Clock, Bell } from 'lucide-react-native';
import clsx from 'clsx';
import { PartyRoom } from '@/types/watch-party';

interface PartyCardProps {
    item: PartyRoom;
    onPress: () => void;
}

export const PartyCard = ({ item, onPress }: PartyCardProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className={clsx("mb-4 rounded-xl overflow-hidden bg-[#1F1F1F] border border-slate-800", item.status === 'ended' && "opacity-70 grayscale")}
        >
            <View className="h-48 w-full relative">
                <Image
                    source={{ uri: item.image || "https://placehold.co/600x400/png" }}
                    className="w-full h-full object-cover opacity-90"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/30" />
                <View className="absolute top-3 left-3 flex-row gap-2">
                    {item.status === 'live' && (
                        <View className="bg-red-600/90 px-2 py-1 rounded shadow-sm">
                            <Text className="text-white text-[10px] font-bold uppercase">● LIVE</Text>
                        </View>
                    )}
                    {item.status === 'scheduled' && (
                        <View className="bg-yellow-500/90 px-2 py-1 rounded shadow-sm">
                            <Text className="text-black text-[10px] font-bold uppercase">Sắp chiếu</Text>
                        </View>
                    )}
                </View>
                <View className="absolute top-3 right-3 flex-col items-end gap-2">
                    {item.isPrivate && (
                        <View className="bg-black/60 p-1.5 rounded-full border border-white/10">
                            <Lock size={12} color="#cbd5e1" />
                        </View>
                    )}
                    {item.status === 'live' && (
                        <View className="bg-black/60 flex-row items-center gap-1 px-2 py-1 rounded-full border border-white/10">
                            <Users size={12} color="#ef4444" />
                            <Text className="text-white text-xs font-bold">{item.viewers || 0}</Text>
                        </View>
                    )}
                </View>
                <View className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 overflow-hidden border border-white/20">
                            <Image source={{ uri: item.hostAvatar || "https://i.pravatar.cc/150" }} className="w-full h-full" />
                        </View>
                        <Text className="text-slate-300 text-[10px] font-medium shadow-black">{item.host}</Text>
                    </View>

                    <Text numberOfLines={1} className="text-white font-bold text-lg leading-tight shadow-md">
                        {item.title}
                    </Text>

                    <View className="flex-row items-center gap-1 mt-1">
                        <View className="w-1 h-1 rounded-full bg-slate-500" />
                        <Text className="text-slate-400 text-xs font-light">{item.movieTitle}</Text>
                    </View>
                </View>
            </View>
            {item.status === 'scheduled' && (
                <View className="flex-row items-center justify-between p-3 bg-[#1a1a1a] border-t border-white/5">
                    <View className="flex-row items-center gap-1.5">
                        <Clock size={14} color="#eab308" />
                        <Text className="text-yellow-500 text-xs font-medium">
                            20:00 hôm nay
                        </Text>
                    </View>
                    <TouchableOpacity className="flex-row items-center gap-1.5">
                        <Bell size={14} color="#cbd5e1" />
                        <Text className="text-slate-300 text-[10px] font-bold uppercase">Nhận tin</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};