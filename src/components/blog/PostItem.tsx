import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MessageSquare, ThumbsUp, Bookmark, MoreHorizontal, Share2 } from 'lucide-react-native';
import { useFollow } from '../../hooks/useFollow';
import { useAuth } from '../../contexts/AuthContext';

interface PostItemProps {
  item: any;
  onPress: () => void;
  onLike: () => void;
  onBookmark: () => void;
  onShare?: () => void;
  onOpenActions?: () => void;
}

export const PostItem = ({ item, onPress, onLike, onBookmark, onShare, onOpenActions }: PostItemProps) => {
  const { user } = useAuth();
  const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollow(item.author?.id || "");
  const isOwnPost = user?.id === item.author?.id;

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
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

        <View className="flex-row items-center">
          {!isOwnPost && item.author?.id && (
            <TouchableOpacity 
              onPress={toggleFollow}
              disabled={isFollowLoading}
              className={`mr-3 px-3 py-1.5 border rounded-full ${
                isFollowing 
                  ? 'bg-transparent border-zinc-600' 
                  : 'bg-red-600/10 border-red-600'
              }`}
            >
              <Text className={`text-xs font-medium ${
                isFollowing ? 'text-zinc-300' : 'text-red-600'
              }`}>
                {isFollowing ? 'Ngừng theo dõi' : 'Theo dõi'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="p-2 -mr-2" onPress={onOpenActions}>
            <MoreHorizontal color="#A4A4AD" size={22} />
          </TouchableOpacity>
        </View>
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
            <Text className="text-white text-[15px] font-semibold" numberOfLines={1}>{item.movie.title}</Text>
          </View>
        </View>
      )}

      <View className="flex-row items-center justify-between pt-2 mt-1">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            className="flex-row items-center py-2 mr-6"
            onPress={onLike}
          >
            <ThumbsUp color={item.likedByCurrentUser ? "#EF2B2D" : "#A4A4AD"} size={22} />
            <Text className={`ml-2 text-[14.5px] font-medium ${item.likedByCurrentUser ? "text-[#EF2B2D]" : "text-[#A4A4AD]"}`}>
              {item?.stats?.likes || 0}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center py-2 mr-6" onPress={onPress}>
            <MessageSquare color="#A4A4AD" size={22} />
            <Text className="text-[#A4A4AD] ml-2 text-[14.5px] font-medium">{item?.stats?.comments || 0}</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-[#A4A4AD] text-[13.5px] mr-4">{item?.viewCount || 0} lượt xem</Text>
          <TouchableOpacity
            className="py-2 px-2 mr-2"
            onPress={onShare}
          >
            <Share2 color="#A4A4AD" size={22} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="py-2 pl-2"
            onPress={onBookmark}
          >
            <Bookmark color={item.bookmarkedByCurrentUser ? "#EF2B2D" : "#A4A4AD"} size={22} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
