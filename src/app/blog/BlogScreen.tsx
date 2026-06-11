import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator, SafeAreaView, Platform, TextInput, Modal, Alert, Clipboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare, ThumbsUp, Edit, Search, AlertTriangle, Copy, Trash2, X } from 'lucide-react-native';
import { blogService } from '../../services/blog.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { usePullToRefreshHaptics } from '../../hooks/usePullToRefreshHaptics';
import { PostItem } from '../../components/blog/PostItem';
import { DeviceEventEmitter } from 'react-native';
import { getBlogEngagement } from './blogEngagement';
import { ShareModal } from '../../components/common/ShareModal';
import { FE_URL } from '../../constants/config';
import { reportService } from '../../services/report.service';
import { ReportTargetType } from '../../types/report';

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
  fullContent: string;
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
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [actionPost, setActionPost] = useState<Post | null>(null);
  const [reportPost, setReportPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const fetchBlogs = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) setLoading(true);
      
      const params: any = { page: pageNumber, limit: 10 };
      if (searchQuery) params.search = searchQuery;
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
          fullContent: item.content || item.excerpt || '',
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

    const savedSubscription = DeviceEventEmitter.addListener('blog_post_saved', () => {
      setPage(1);
      fetchBlogs(1, true);
    });

    const deletedSubscription = DeviceEventEmitter.addListener('blog_post_deleted', ({ postId }) => {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    });

    return () => {
      subscription.remove();
      savedSubscription.remove();
      deletedSubscription.remove();
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

  const displayedPosts = useMemo(() => {
    const sortedPosts = [...posts];

    if (activeFilter === 'top') {
      return sortedPosts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }

    if (activeFilter === 'reviews') {
      return sortedPosts.filter((post) => post.movie != null);
    }

    return sortedPosts;
  }, [activeFilter, posts]);

  const handleFilterChange = (filter: typeof activeFilter) => {
    if (filter === activeFilter) return;
    setPage(1);
    setActiveFilter(filter);
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

  const getBlogShareUrl = (post: Post) => `${FE_URL}/blog/${post.slug}`;

  const handleCopyLink = (post: Post) => {
    Clipboard.setString(getBlogShareUrl(post));
    setActionPost(null);
    Alert.alert('Thành công', 'Đã sao chép liên kết bài viết');
  };

  const handleEditPost = (post: Post) => {
    setActionPost(null);
    navigation.navigate('CreateBlog', {
      post: {
        id: post.id,
        title: post.title,
        content: post.fullContent,
        imageUrl: post.imageUrl,
        movie: post.movie,
      },
    });
  };

  const handleDeletePost = (post: Post) => {
    setActionPost(null);
    Alert.alert(
      'Xóa bài viết',
      'Bạn có chắc chắn muốn xóa bài viết này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await blogService.deleteBlogPost(post.id);
              setPosts((prevPosts) => prevPosts.filter((item) => item.id !== post.id));
              Alert.alert('Thành công', 'Đã xóa bài viết');
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa bài viết');
            }
          },
        },
      ]
    );
  };

  const openReportModal = (post: Post) => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để báo cáo bài viết');
      setActionPost(null);
      return;
    }

    setActionPost(null);
    setReportPost(post);
  };

  const handleSubmitReport = async () => {
    if (!reportPost) return;

    if (!reportReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do báo cáo');
      return;
    }

    try {
      setIsReporting(true);
      await reportService.createReport({
        targetType: ReportTargetType.BLOG,
        targetId: reportPost.id,
        reason: reportReason.trim(),
      });
      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi');
      setReportPost(null);
      setReportReason('');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi báo cáo lúc này');
    } finally {
      setIsReporting(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostItem 
      item={item}
      onPress={() => handlePostPress(item)}
      onLike={() => handleLikePost(item.id, !!item.likedByCurrentUser)}
      onBookmark={() => handleBookmarkPost(item.id, !!item.bookmarkedByCurrentUser)}
      onShare={() => setSharingPost(item)}
      onOpenActions={() => setActionPost(item)}
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
          onPress={() => handleFilterChange('newest')}
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
          onPress={() => handleFilterChange('reviews')}
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
          onPress={() => handleFilterChange('top')}
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
        data={displayedPosts}
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

      <ShareModal
        visible={!!sharingPost}
        onClose={() => setSharingPost(null)}
        title={sharingPost?.title || 'Bài viết Movix'}
        url={sharingPost ? getBlogShareUrl(sharingPost) : undefined}
      />

      <Modal
        visible={!!actionPost}
        transparent
        animationType="fade"
        onRequestClose={() => setActionPost(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 justify-end bg-black/70"
          onPress={() => setActionPost(null)}
        >
          <View className="bg-zinc-900 rounded-t-3xl p-5 pb-8 border-t border-zinc-800">
            <View className="w-12 h-1 bg-zinc-700 rounded-full self-center mb-5" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold" numberOfLines={1}>
                Tùy chọn bài viết
              </Text>
              <TouchableOpacity onPress={() => setActionPost(null)} className="p-2 bg-zinc-800 rounded-full">
                <X color="#fff" size={18} />
              </TouchableOpacity>
            </View>

            {actionPost && user?.id === actionPost.author.id ? (
              <>
                <TouchableOpacity
                  className="flex-row items-center py-4 border-b border-zinc-800"
                  onPress={() => handleEditPost(actionPost)}
                >
                  <Edit color="#e4e4e7" size={20} />
                  <Text className="text-zinc-100 text-base font-medium ml-3">Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center py-4 border-b border-zinc-800"
                  onPress={() => handleDeletePost(actionPost)}
                >
                  <Trash2 color="#ef4444" size={20} />
                  <Text className="text-red-500 text-base font-medium ml-3">Xóa bài viết</Text>
                </TouchableOpacity>
              </>
            ) : actionPost ? (
              <TouchableOpacity
                className="flex-row items-center py-4 border-b border-zinc-800"
                onPress={() => openReportModal(actionPost)}
              >
                <AlertTriangle color="#ef4444" size={20} />
                <Text className="text-red-500 text-base font-medium ml-3">Báo cáo bài viết</Text>
              </TouchableOpacity>
            ) : null}

            {actionPost && (
              <TouchableOpacity
                className="flex-row items-center py-4"
                onPress={() => handleCopyLink(actionPost)}
              >
                <Copy color="#e4e4e7" size={20} />
                <Text className="text-zinc-100 text-base font-medium ml-3">Sao chép liên kết</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={!!reportPost}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setReportPost(null);
          setReportReason('');
        }}
      >
        <View className="flex-1 justify-center bg-black/80 px-5">
          <View className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <Text className="text-white text-xl font-bold mb-2">Báo cáo vi phạm</Text>
            <Text className="text-zinc-400 text-sm leading-5 mb-4">
              Hãy cho chúng tôi biết lý do bạn muốn báo cáo nội dung này. Quản trị viên sẽ xem xét và xử lý.
            </Text>
            <TextInput
              placeholder="Nhập lý do báo cáo..."
              placeholderTextColor="#71717a"
              className="min-h-[110px] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white mb-4"
              multiline
              textAlignVertical="top"
              value={reportReason}
              onChangeText={setReportReason}
              editable={!isReporting}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-3 mr-2"
                disabled={isReporting}
                onPress={() => {
                  setReportPost(null);
                  setReportReason('');
                }}
              >
                <Text className="text-zinc-300 font-semibold">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-600 px-5 py-3 rounded-xl min-w-[110px] items-center"
                disabled={isReporting}
                onPress={handleSubmitReport}
              >
                {isReporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold">Gửi báo cáo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
