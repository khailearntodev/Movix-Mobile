import React, {useState, useEffect} from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar as RNStatusBar, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Person } from '../../types/person';
import { ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { peopleService } from '../../services/people';

const PeopleScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPeople = async (pageNum: number): Promise<void> => {
    try {
      const response = await peopleService.getAll(pageNum);
      if (pageNum ===1) {
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
    fetchPeople(1);
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPeople(nextPage);
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
        <Text className="text-white text-lg font-bold">Nghệ sĩ</Text>
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
    </SafeAreaView>
  );
};

export default PeopleScreen;
