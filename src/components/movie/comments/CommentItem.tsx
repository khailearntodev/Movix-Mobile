// src/components/movie/comments/CommentItem.tsx
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { AlertTriangle, MessageSquare } from "lucide-react-native";
import { CommentWithReplies, CommentData } from "../../../types/comment";

interface CommentItemProps {
  comment: CommentWithReplies | CommentData;
  onReply: (c: CommentData) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, onReply, isReply = false }: CommentItemProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const replies = (comment as CommentWithReplies).replies || [];

  if (comment.is_hidden) return null;

  return (
    <View className={`bg-zinc-900/50 p-4 rounded-xl mb-3 ${isReply ? 'ml-8 border-l-2 border-zinc-700 bg-zinc-900/30' : ''}`}>
      <View className="flex-row items-start space-x-3 mb-2">
         {/* Avatar */}
         <View className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden items-center justify-center">
            {comment.user?.avatar_url ? (
               <Image 
                  source={{ uri: comment.user.avatar_url }} 
                  className="w-full h-full" 
               />
            ) : (
               <Text className="text-white font-bold text-xs">
                 {(comment.user?.display_name || "U").charAt(0).toUpperCase()}
               </Text>
            )}
         </View>
         <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-bold text-sm mb-0.5">
                {comment.user?.display_name || "Người dùng ẩn danh"}
              </Text>
              <Text className="text-zinc-500 text-xs">
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            {comment.is_spoiler && !isRevealed ? (
              <TouchableOpacity 
                onPress={() => setIsRevealed(true)}
                className="bg-zinc-800 p-3 rounded mt-2 border border-yellow-500/30 flex-row items-center justify-center space-x-2"
              >
                <AlertTriangle size={16} color="#eab308" />
                <Text className="text-yellow-500 text-sm font-bold">Nội dung Spoiler! Nhấn để xem</Text>
              </TouchableOpacity>
            ) : (
                <View>
                    <Text className="text-zinc-300 text-sm leading-5 mt-1">{comment.comment}</Text>
                    {/* Reply Button */}
                    <TouchableOpacity 
                        onPress={() => onReply(comment)}
                        className="flex-row items-center mt-2 space-x-1 self-start"
                    >
                        <MessageSquare size={14} color="#a1a1aa" />
                        <Text className="text-zinc-500 text-xs font-medium">Trả lời</Text>
                    </TouchableOpacity>
                </View>
            )}
         </View>
      </View>
      
      {/* Recursively render replies if any */}
      {!isReply && replies.length > 0 && (
          <View className="mt-2 space-y-2">
              {replies.filter(r => !r.is_hidden).map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    onReply={onReply}
                    isReply={true}
                  />
              ))}
          </View>
      )}
    </View>
  );
}