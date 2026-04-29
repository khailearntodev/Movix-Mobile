import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StatusBar as RNStatusBar, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Person } from '../../types/person';
import { ArrowLeft, Search } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { peopleService } from '../../services/people.service';
import { AIChatButton } from '../../components/common/AIChatButton';

const PeopleScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState('');

  const fetchPeople = async (pageNum: number, search: string = searchQuery, roleFilter: string = role): Promise<void> => {
    try {
      const response = await peopleService.getAll(pageNum, 20, search, roleFilter);
      if (pageNum === 1) {
        setPeople(response.data);
      } else {
        setPeople(prev => [...prev, ...response.data]);
      }
      setHasMore(pageNum < response.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch people:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setLoading(true);
      fetchPeople(1, searchQuery, role);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, role]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPeople(nextPage, searchQuery, role);
    }
  }

  const getImageUrl = (path: string | null) =>
    path ? path : "https://placehold.net/600x800.png";

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      className="flex-1 m-2 bg-neutral-800 rounded-lg overflow-hidden"
      onPress={() => navigation.navigate('PersonDetail', { personId: item.id })}
    >
      <Image
        source={{ uri: getImageUrl(item.avatar_url) }}
        className="w-full h-64 bg-neutral-700"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-white font-bold text-base" numberOfLines={1}>{item.name}</Text>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>{item.role_type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-900" style={{ paddingTop: RNStatusBar.currentHeight }}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-800">
        <Text className="text-white text-xl font-bold">Nghệ sĩ</Text>
      </View>

      {/* Filters */}
      <View className="px-4 py-2 border-b border-neutral-800">
        <View className="flex-row items-center bg-neutral-800 rounded-lg px-3 py-2 mb-3">
          <Search color="#9ca3af" size={20} />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Tìm kiếm nghệ sĩ..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {['', 'actor', 'director'].map((r) => {
            const label = r === '' ? 'Tất cả' : r === 'actor' ? 'Diễn viên' : r === 'director' ? 'Đạo diễn' : '';
            const isActive = role === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                className={`px-4 py-2 rounded-full mr-2 ${isActive ? 'bg-red-500' : 'bg-neutral-800'}`}
              >
                <Text className={`font-semibold ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      {loading && page === 1 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <FlatList
          data={people}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View className="py-4">
                <ActivityIndicator color="#ef4444" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-neutral-400">Không có dữ liệu nghệ sĩ</Text>
            </View>
          }
        />
      )}
      <AIChatButton />
    </SafeAreaView>
  );
};

export default PeopleScreen;
