import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Image, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, User as UserIcon } from 'lucide-react-native';
import { followService } from '@/services/follow.service';
import { UserProfile } from '@/services/user.service';

type NetworkRouteProp = RouteProp<{ Network: { initialTab: 'followers' | 'following' } }, 'Network'>;

export default function NetworkScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<NetworkRouteProp>();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(route.params?.initialTab || 'followers');
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [followings, setFollowings] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [followersData, followingsData] = await Promise.all([
        followService.getMyFollowers(),
        followService.getMyFollowings()
      ]);
      setFollowers(followersData);
      setFollowings(followingsData);
    } catch (error) {
      console.error('Lỗi tải danh sách người theo dõi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentData = activeTab === 'followers' ? followers : followings;

  const renderItem = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-zinc-900 active:bg-zinc-900">
      {item.avatar_url ? (
        <Image 
          source={{ uri: item.avatar_url }} 
          className="w-12 h-12 rounded-full mr-3"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center mr-3">
          <UserIcon color="#a1a1aa" size={24} />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-white text-base font-medium">{item.display_name || item.username}</Text>
        <Text className="text-zinc-400 text-sm">@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-zinc-900">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="p-2 -ml-2 rounded-full bg-zinc-900/50"
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-2">Mạng lưới</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-zinc-900">
        <TouchableOpacity 
          className={`flex-1 py-4 items-center ${activeTab === 'followers' ? 'border-b-2 border-red-600' : ''}`}
          onPress={() => setActiveTab('followers')}
        >
          <Text className={`font-semibold ${activeTab === 'followers' ? 'text-red-600' : 'text-zinc-500'}`}>
            Người theo dõi ({followers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-4 items-center ${activeTab === 'following' ? 'border-b-2 border-red-600' : ''}`}
          onPress={() => setActiveTab('following')}
        >
          <Text className={`font-semibold ${activeTab === 'following' ? 'text-red-600' : 'text-zinc-500'}`}>
            Đang theo dõi ({followings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-8">
              <UserIcon color="#3f3f46" size={64} className="mb-4" />
              <Text className="text-zinc-400 text-center text-base">
                {activeTab === 'followers' 
                  ? 'Bạn chưa có người theo dõi nào.' 
                  : 'Bạn chưa theo dõi ai.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}