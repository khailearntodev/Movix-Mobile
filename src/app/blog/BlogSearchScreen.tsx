import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, FlatList, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, Clock } from 'lucide-react-native';
import { blogService } from '../../services/blog.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function BlogSearchScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      const response = await blogService.getAllBlogs({ search: searchQuery, limit: 20 });
      if (response && response.data) {
        setResults(response.data.blogs || response.data);
      }
    } catch (error) {
      console.error('Error seeking blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-row items-center px-4 py-3 border-b border-[#2A2A32]"
      onPress={() => navigation.navigate('BlogDetail', { id: item.id, slug: item.slug })}
    >
      <View className="bg-[#1C1C22] p-3 rounded-full mr-3">
        <Search color="#8F8F99" size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-white text-[15.5px] font-medium" numberOfLines={1}>
          {item.title || item.excerpt || 'Bài viết'}
        </Text>
        <Text className="text-[#8F8F99] text-[13px] mt-1" numberOfLines={1}>
          {item.user?.display_name || item.user?.username} • {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: vi }) : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
      <View className="flex-row items-center px-4 py-3 border-b border-[#2A2A32] bg-black">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <View className="flex-1 flex-row items-center bg-[#1C1C22] h-10 rounded-full px-4">
          <Search color="#8F8F99" size={20} />
          <TextInput 
            className="flex-1 text-[15px] ml-2 text-white h-full"
            placeholder="Tìm bài viết, tác giả..."
            placeholderTextColor="#8F8F99"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Text className="text-[#8F8F99] font-medium">Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1 bg-black">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="#EF2B2D" size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View className="pt-8 items-center px-4">
                {hasSearched ? (
                  <>
                    <Text className="text-[#8F8F99] text-[16px] mb-2 text-center">Không tìm thấy bài viết nào phù hợp với "{searchQuery}"</Text>
                    <Text className="text-[#66666F] text-[14px]">Hãy thử tìm kiếm với từ khóa khác</Text>
                  </>
                ) : (
                  <>
                    <Search color="#2A2A32" size={48} className="mb-4" />
                    <Text className="text-[#66666F] text-[15px]">Nhập từ khóa bắt đầu tìm kiếm</Text>
                  </>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}