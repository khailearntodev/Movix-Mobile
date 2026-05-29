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
import { PostItem } from '../../components/blog/PostItem';
import { DeviceEventEmitter } from 'react-native';
import { getBlogEngagement } from './blogEngagement';

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
            likes: getBlogEngagement(item, user?.id).likeCount,
            comments: getBlogEngagement(item, user?.id).commentCount,
            shares: getBlogEngagement(item, user?.id).bookmarkCount,
          },
          likedByCurrentUser: getBlogEngagement(item, user?.id).isLiked,
          bookmarkedByCurrentUser: getBlogEngagement(item, user?.id).isBookmarked,
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

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('blog_post_updated', ({ postId, updates }) => {
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const newPost = { ...post, stats: { ...post.stats } };
            if (updates.commentsCount !== undefined) {
              newPost.stats.comments = updates.commentsCount;
            }
            if (updates.likesCount !== undefined) {
               newPost.stats.likes = updates.likesCount;
            }
            if (updates.isLiked !== undefined) {
               newPost.likedByCurrentUser = updates.isLiked;
            }
            if (updates.isBookmarked !== undefined) {
               newPost.bookmarkedByCurrentUser = updates.isBookmarked;
            }
            return newPost;
          }
          return post;
        })
      );
    });

    return () => {
      subscription.remove();
    };
  }, []);

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

  const handleLikePost = async (postId: string, currentLiked: boolean) => {
    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likedByCurrentUser: !currentLiked,
              stats: {
                ...post.stats,
                likes: currentLiked ? Math.max(0, Number(post.stats.likes || 0) - 1) : Number(post.stats.likes || 0) + 1,
              },
            }
          : post
      )
    );

    try {
      const response = await blogService.toggleLike(postId);
      const data = response?.data;
      if (data) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  likedByCurrentUser: typeof data.liked === 'boolean' ? data.liked : post.likedByCurrentUser,
                  stats: {
                    ...post.stats,
                    likes: typeof data.like_count === 'number' ? data.like_count : post.stats.likes,
                    comments: typeof data.comment_count === 'number' ? data.comment_count : post.stats.comments,
                    shares: typeof data.bookmark_count === 'number' ? data.bookmark_count : post.stats.shares,
                  },
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                likedByCurrentUser: currentLiked,
                stats: {
                  ...post.stats,
                  likes: currentLiked ? Number(post.stats.likes || 0) + 1 : Math.max(0, Number(post.stats.likes || 0) - 1),
                },
              }
            : post
        )
      );
    }
  };

  const handleBookmarkPost = async (postId: string, currentBookmarked: boolean) => {
    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              bookmarkedByCurrentUser: !currentBookmarked,
            }
          : post
      )
    );

    try {
      const response = await blogService.toggleBookmark(postId);
      const data = response?.data;
      if (data) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  bookmarkedByCurrentUser: typeof data.bookmarked === 'boolean' ? data.bookmarked : post.bookmarkedByCurrentUser,
                  stats: {
                    ...post.stats,
                    likes: typeof data.like_count === 'number' ? data.like_count : post.stats.likes,
                    comments: typeof data.comment_count === 'number' ? data.comment_count : post.stats.comments,
                    shares: typeof data.bookmark_count === 'number' ? data.bookmark_count : post.stats.shares,
                  },
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on error
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                bookmarkedByCurrentUser: currentBookmarked,
              }
            : post
        )
      );
    }
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate('BlogDetail', { slug: post.slug, id: post.id });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostItem 
      item={item}
      onPress={() => handlePostPress(item)}
      onLike={() => handleLikePost(item.id, !!item.likedByCurrentUser)}
      onBookmark={() => handleBookmarkPost(item.id, !!item.bookmarkedByCurrentUser)}
    />
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
