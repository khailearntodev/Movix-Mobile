import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator, SafeAreaView, Platform, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare, ThumbsUp, Bookmark, MoreHorizontal, Eye, Edit, Search, Filter, Hash } from 'lucide-react-native';
import { blogService } from '../../services/blog.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { usePullToRefreshHaptics } from '../../hooks/usePullToRefreshHaptics';

interface Post {
  id: string;
  slug: string;
  title: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  timeAgo: string;
  content: string;
  imageUrl?: string;
  isSpoiler?: boolean;
  viewCount?: number;
  movie?: {
    id: string;
    title: string;
    poster_url: string | null;
  } | null;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  likedByCurrentUser?: boolean;
  bookmarkedByCurrentUser?: boolean;
}

export default function BlogScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'newest' | 'reviews' | 'top'>('newest');

  const fetchBlogs = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) setLoading(true);
      
      const params: any = { page: pageNumber, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      // You can add logic for 'reviews' or 'top' if API supports it

      const response = await blogService.getAllBlogs(params);
      
      if (response && response.data) {
        const blogsData = response.data.blogs || response.data;
        const formattedPosts = blogsData.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          author: {
            id: item.user?.id,
            username: item.user?.display_name || item.user?.username || 'Unknown User',
            avatarUrl: item.user?.avatar_url || 'https://via.placeholder.com/150',
          },
          timeAgo: item.created_at 
            ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: vi })
            : 'Vừa xong',
          content: item.excerpt || item.content || '',
          imageUrl: item.thumbnail || (item.images && item.images.length > 0 ? item.images[0] : undefined),
          isSpoiler: item.is_spoiler || false,
          viewCount: item.view_count || 0,
          movie: item.movie || null,
          stats: {
            likes: item._count?.likes || 0,
            comments: item._count?.comments || 0,
            shares: item._count?.bookmarks || 0,
          },
          likedByCurrentUser: item.is_liked || false,
          bookmarkedByCurrentUser: item.is_bookmarked || false,
        }));

        if (pageNumber === 1) {
          setPosts(formattedPosts);
        } else {
          setPosts(prev => [...prev, ...formattedPosts]);
        }
        
        setHasMore(formattedPosts.length === 10);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchBlogs(1, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeFilter]);

  const { handleScroll } = usePullToRefreshHaptics(80);

  const onRefresh = () => {
    // Không cần rung ở đây nữa vì hook đã xử lý lúc chạm ngưỡng refresh
    setRefreshing(true);
    setPage(1);
    fetchBlogs(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBlogs(nextPage);
    }
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate('BlogDetail', { slug: post.slug, id: post.id });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => handlePostPress(item)}
      className="bg-[#18181D] mb-2.5 p-4 border-y border-[#2A2A32]"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <Image 
            source={{ uri: item.author.avatarUrl }} 
            className="w-[44px] h-[44px] rounded-full bg-zinc-800"
          />
          <View className="ml-3 flex-1">
            <Text className="text-white text-[16.5px] font-bold flex-shrink-1" numberOfLines={1}>
              {item.author.username}
            </Text>
            <Text className="text-[#9A9AA3] text-[13px] mt-0.5">{item.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2">
          <MoreHorizontal color="#A4A4AD" size={22} />
        </TouchableOpacity>
      </View>

      {item.title ? (
        <Text className="text-white text-[20px] font-bold leading-7 mt-3.5 mb-2.5" numberOfLines={2}>
          {item.title}
        </Text>
      ) : null}

      <Text className="text-[#D0D0D6] text-[15.5px] leading-6 mb-3" numberOfLines={3}>
        {item.content}
      </Text>

      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          className="w-full aspect-video rounded-xl mb-3 bg-[#111115]"
          resizeMode="cover"
        />
      )}

      {item.movie && (
        <View className="flex-row items-center bg-[#1F1F26] rounded-[14px] p-2.5 mb-3">
          {item.movie.poster_url && (
            <Image 
              source={{ uri: item.movie.poster_url }} 
              className="w-10 h-14 rounded-lg"
              resizeMode="cover"
            />
          )}
          <View className="ml-3 flex-1">
            <Text className="text-[#9A9AA3] text-[12.5px] mb-0.5">Đang nhận xét về:</Text>
            <Text className="text-white text-[15px] font-semibold" numberOfLines={1}>{item.title}</Text>
          </View>
        </View>
      )}

      <View className="flex-row items-center justify-between pt-2 mt-1">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity className="flex-row items-center py-2 mr-6">
            <ThumbsUp color={item.likedByCurrentUser ? "#EF2B2D" : "#A4A4AD"} size={22} />
            <Text className={`ml-2 text-[14.5px] font-medium ${item.likedByCurrentUser ? "text-[#EF2B2D]" : "text-[#A4A4AD]"}`}>
              {item.stats.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center py-2 mr-6">
            <MessageSquare color="#A4A4AD" size={22} />
            <Text className="text-[#A4A4AD] ml-2 text-[14.5px] font-medium">{item.stats.comments}</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-[#A4A4AD] text-[13.5px] mr-4">{item.viewCount} lượt xem</Text>
          <TouchableOpacity className="py-2 pl-2">
            <Bookmark color={item.bookmarkedByCurrentUser ? "#EF2B2D" : "#A4A4AD"} size={22} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="pb-2">
      {/* Create Post */}
      <View className="bg-[#18181D] px-4 py-3 mb-2 border-y border-[#2A2A32] flex-row items-center">
        <Image 
          source={{ uri: user?.avatar_url || 'https://via.placeholder.com/150' }}
          className="w-10 h-10 rounded-full"
        />
        <TouchableOpacity 
          className="flex-1 ml-3 bg-[#111115] rounded-full h-[40px] justify-center px-4"
          onPress={() => navigation.navigate('CreateBlog')}
        >
          <Text className="text-[#8F8F99] text-[15px]">Bạn đang nghĩ gì thế?</Text>
        </TouchableOpacity>
        <TouchableOpacity className="ml-3 p-2 bg-[#1C1C22] rounded-full" onPress={() => navigation.navigate('CreateBlog')}>
          <Edit color="#10b981" size={20} />
        </TouchableOpacity>
      </View>

      <View className="flex-row px-4 py-2">
        <TouchableOpacity
          onPress={() => setActiveFilter('newest')}
          className={`mr-3 px-5 py-2.5 rounded-full ${
            activeFilter === 'newest' ? 'bg-[#EF2B2D]' : 'bg-[#24242A]'
          }`}
        >
          <Text className={`text-[15px] ${
            activeFilter === 'newest' ? 'text-white font-bold' : 'text-[#B8B8C0] font-semibold'
          }`}>
            Mới nhất
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveFilter('reviews')}
          className={`mr-3 px-5 py-2.5 rounded-full ${
            activeFilter === 'reviews' ? 'bg-[#EF2B2D]' : 'bg-[#24242A]'
          }`}
        >
          <Text className={`text-[15px] ${
            activeFilter === 'reviews' ? 'text-white font-bold' : 'text-[#B8B8C0] font-semibold'
          }`}>
            Bài đánh giá
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveFilter('top')}
          className={`px-5 py-2.5 rounded-full ${
            activeFilter === 'top' ? 'bg-[#EF2B2D]' : 'bg-[#24242A]'
          }`}
        >
          <Text className={`text-[15px] ${
            activeFilter === 'top' ? 'text-white font-bold' : 'text-[#B8B8C0] font-semibold'
          }`}>
            Nổi bật
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-black">
        <Text className="text-white text-[28px] font-bold">Cộng đồng</Text>
        <TouchableOpacity 
          className="p-2 bg-[#1C1C22] rounded-full"
          onPress={() => navigation.navigate('BlogSearch')}
        >
          <Search color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => item.id || `post-${index}`}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#dc2626"
            colors={['#dc2626']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => 
          loading && !refreshing ? (
            <View className="py-6 items-center">
              <ActivityIndicator color="#dc2626" />
            </View>
          ) : null
        }
        ListEmptyComponent={() => 
          !loading ? (
            <View className="py-10 items-center">
              <MessageSquare color="#3f3f46" size={48} className="mb-4" />
              <Text className="text-zinc-500 text-lg">Chưa có bài viết nào</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
