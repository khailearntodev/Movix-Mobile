import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ArrowLeft, MessageSquare, ThumbsUp, Bookmark, Eye, Share2, MoreHorizontal } from 'lucide-react-native';
import { blogService } from '../../services/blog.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommentList } from "../../components/movie/comments/CommentList";
import { CommentInput } from "../../components/movie/comments/CommentInput";
import { ToastMessage, ToastType } from "../../components/common/ToastMessage";
import { useComments } from "../../hooks/useComments";
import { useFollow } from "../../hooks/useFollow";
import { useAuth } from "../../contexts/AuthContext";
import { DeviceEventEmitter } from 'react-native';
import { getBlogEngagement } from './blogEngagement';

type BlogDetailRouteProp = RouteProp<RootStackParamList, 'BlogDetail'>;

export default function BlogDetailScreen() {
  const route = useRoute<BlogDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { id, slug } = route.params;

  // Follow Hook
  const { user } = useAuth();
  const authorId = post?.user?.id;
  const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollow(authorId || "");

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

  const showToast = (message: string, type: ToastType = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const {
    comments,
    isLoadingComments,
    newComment,
    setNewComment,
    isPostingComment,
    handlePostComment,
    isSpoiler,
    setIsSpoiler,
    replyingTo,
    setReplyingTo
  } = useComments(
    { postId: id?.toString() || "" }, 
    showToast,
    (commentsCount) => {
      setPost((currentPost: any) => {
        if (!currentPost) return currentPost;

        return {
          ...currentPost,
          comment_count: commentsCount,
          _count: {
            ...currentPost._count,
            comments: commentsCount
          }
        };
      });

      if (post?.id) {
        DeviceEventEmitter.emit('blog_post_updated', {
          postId: post.id,
          updates: {
             commentsCount
          }
        });
      }
    }
  );

  useEffect(() => {
    fetchPostDetail();
  }, [id, slug, user?.id]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogById(id);
      if (response && response.data) {
        const engagement = getBlogEngagement(response.data, user?.id);
        setPost({
          ...response.data,
          is_liked: engagement.isLiked,
          is_bookmarked: engagement.isBookmarked,
          like_count: engagement.likeCount,
          comment_count: engagement.commentCount,
          bookmark_count: engagement.bookmarkCount,
          _count: {
            ...response.data._count,
            likes: engagement.likeCount,
            comments: engagement.commentCount,
            bookmarks: engagement.bookmarkCount,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching blog detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    // Optimistic update
    const previousPost = { ...post };
    const engagement = getBlogEngagement(post, user?.id);
    const currentLikes = engagement.likeCount;
    const newLikesCount = engagement.isLiked 
      ? Math.max(0, currentLikes - 1)
      : currentLikes + 1;
    const newIsLiked = !engagement.isLiked;

    setPost({
      ...post,
      is_liked: newIsLiked,
      like_count: newLikesCount,
      _count: {
        ...post._count,
        likes: newLikesCount
      }
    });

    DeviceEventEmitter.emit('blog_post_updated', {
      postId: post.id,
      updates: {
         likesCount: newLikesCount,
         isLiked: newIsLiked
      }
    });

    try {
      const response = await blogService.toggleLike(post.id);
      const data = response?.data;
      if (data) {
        setPost((currentPost: any) => ({
          ...currentPost,
          is_liked: typeof data.liked === 'boolean' ? data.liked : currentPost.is_liked,
          like_count: typeof data.like_count === 'number' ? data.like_count : currentPost.like_count,
          comment_count: typeof data.comment_count === 'number' ? data.comment_count : currentPost.comment_count,
          bookmark_count: typeof data.bookmark_count === 'number' ? data.bookmark_count : currentPost.bookmark_count,
          _count: {
            ...currentPost._count,
            likes: typeof data.like_count === 'number' ? data.like_count : currentPost._count?.likes,
            comments: typeof data.comment_count === 'number' ? data.comment_count : currentPost._count?.comments,
            bookmarks: typeof data.bookmark_count === 'number' ? data.bookmark_count : currentPost._count?.bookmarks,
          },
        }));
        DeviceEventEmitter.emit('blog_post_updated', {
          postId: post.id,
          updates: {
             likesCount: typeof data.like_count === 'number' ? data.like_count : newLikesCount,
             isLiked: typeof data.liked === 'boolean' ? data.liked : newIsLiked
          }
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert if error
      setPost(previousPost);
      DeviceEventEmitter.emit('blog_post_updated', {
        postId: post.id,
        updates: {
           likesCount: Number((previousPost.like_count ?? previousPost.likes_count ?? previousPost._count?.likes) || 0),
           isLiked: previousPost.is_liked
        }
      });
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!post) return;

    // Optimistic update
    const previousPost = { ...post };
    const engagement = getBlogEngagement(post, user?.id);
    const newIsBookmarked = !engagement.isBookmarked;
    
    setPost({
      ...post,
      is_bookmarked: newIsBookmarked
    });

    DeviceEventEmitter.emit('blog_post_updated', {
      postId: post.id,
      updates: {
         isBookmarked: newIsBookmarked
      }
    });

    try {
      const response = await blogService.toggleBookmark(post.id);
      const data = response?.data;
      if (data) {
        setPost((currentPost: any) => ({
          ...currentPost,
          is_bookmarked: typeof data.bookmarked === 'boolean' ? data.bookmarked : currentPost.is_bookmarked,
          like_count: typeof data.like_count === 'number' ? data.like_count : currentPost.like_count,
          comment_count: typeof data.comment_count === 'number' ? data.comment_count : currentPost.comment_count,
          bookmark_count: typeof data.bookmark_count === 'number' ? data.bookmark_count : currentPost.bookmark_count,
          _count: {
            ...currentPost._count,
            likes: typeof data.like_count === 'number' ? data.like_count : currentPost._count?.likes,
            comments: typeof data.comment_count === 'number' ? data.comment_count : currentPost._count?.comments,
            bookmarks: typeof data.bookmark_count === 'number' ? data.bookmark_count : currentPost._count?.bookmarks,
          },
        }));
        DeviceEventEmitter.emit('blog_post_updated', {
          postId: post.id,
          updates: {
             isBookmarked: typeof data.bookmarked === 'boolean' ? data.bookmarked : newIsBookmarked
          }
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert if error
      setPost(previousPost);
      DeviceEventEmitter.emit('blog_post_updated', {
        postId: post.id,
        updates: {
           isBookmarked: previousPost.is_bookmarked
        }
      });
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#dc2626" size="large" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Không tìm thấy bài viết</Text>
        <TouchableOpacity 
          className="mt-4 px-6 py-2 bg-red-600 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const timeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi }) : '';
  const authorName = post.user?.display_name || post.user?.username || 'Unknown User';
  const authorAvatar = post.user?.avatar_url || 'https://via.placeholder.com/150';

  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-zinc-950/90 z-10">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 rounded-full bg-zinc-900/50"
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 -mr-2">
          <MoreHorizontal color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          {/* Post Banner / Image */}
          {post.thumbnail && (
            <Image 
              source={{ uri: post.thumbnail }} 
              className="w-full h-64 bg-zinc-900"
              resizeMode="cover"
            />
          )}

          <View className="p-4">
            {/* Title */}
            <Text className="text-2xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </Text>

            {/* Author Info */}
            <View className="flex-row items-center justify-between mb-6 pb-6 border-b border-zinc-800">
              <View className="flex-row items-center flex-1">
                <Image 
                  source={{ uri: authorAvatar }} 
                  className="w-12 h-12 rounded-full bg-zinc-800"
                />
                <View className="ml-3">
                  <Text className="text-white font-semibold text-base">{authorName}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-zinc-400 text-xs">{timeAgo}</Text>
                    <Text className="text-zinc-600 text-xs mx-2">•</Text>
                    <Eye color="#a1a1aa" size={12} />
                    <Text className="text-zinc-400 text-xs ml-1">{post.view_count || 0} lượt xem</Text>
                  </View>
                </View>
              </View>
              
              {(!authorId || user?.id === authorId) ? null : (
                <TouchableOpacity 
                  onPress={toggleFollow}
                  disabled={isFollowLoading}
                  className={`px-4 py-1.5 border rounded-full ${
                    isFollowing 
                      ? 'bg-transparent border-zinc-600' 
                      : 'bg-red-600/10 border-red-600'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    isFollowing ? 'text-zinc-300' : 'text-red-600'
                  }`}>
                    {isFollowing ? 'Ngừng theo dõi' : 'Theo dõi'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Movie Tags */}
            {post.movie && (
              <TouchableOpacity className="flex-row items-center bg-zinc-900 rounded-xl p-3 mb-6">
                {post.movie.poster_url && (
                  <Image 
                    source={{ uri: post.movie.poster_url }} 
                    className="w-10 h-14 rounded bg-zinc-800"
                    resizeMode="cover"
                  />
                )}
                <View className="ml-3 flex-1">
                  <Text className="text-zinc-400 text-xs mb-0.5">Về phim</Text>
                  <Text className="text-white font-medium" numberOfLines={1}>{post.movie.title}</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Content */}
            <Text className="text-zinc-200 text-base leading-relaxed mb-6">
              {post.content}
            </Text>

            <View className="flex-row items-center justify-between border-t border-zinc-900 mt-2 py-4 mb-6">
              <View className="flex-row items-center flex-1">
                <TouchableOpacity 
                  className="flex-row items-center py-2 mr-8"
                  onPress={handleLike}
                >
                  <ThumbsUp color={post.is_liked ? "#dc2626" : "#a1a1aa"} size={22} />
                  <Text className={`ml-2 text-base font-medium ${post.is_liked ? "text-red-600" : "text-zinc-400"}`}>
                    {Number((post.like_count ?? post.likes_count ?? post._count?.likes) || 0)}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row items-center py-2 mr-8">
                  <MessageSquare color="#a1a1aa" size={22} />
                  <Text className="text-zinc-400 ml-2 text-base font-medium">{Number((post.comment_count ?? post.comments_count ?? post._count?.comments) || 0)}</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity 
                  className="p-3 mr-2"
                  onPress={handleBookmark}
                >
                  <Bookmark color={post.is_bookmarked ? "#dc2626" : "#a1a1aa"} size={24} />
                </TouchableOpacity>
                
                <TouchableOpacity className="p-3">
                  <Share2 color="#a1a1aa" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments Section */}
            <CommentList 
              comments={comments}
              isLoading={isLoadingComments}
              onReply={setReplyingTo}
            />
          </View>
        </ScrollView>

        {/* Fixed Comment Input */}
        <CommentInput 
          newComment={newComment}
          setNewComment={setNewComment}
          handlePostComment={handlePostComment}
          isPostingComment={isPostingComment}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          isSpoiler={isSpoiler}
          setIsSpoiler={setIsSpoiler}
        />
      </KeyboardAvoidingView>

      <ToastMessage 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
