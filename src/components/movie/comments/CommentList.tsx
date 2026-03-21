// src/components/movie/comments/CommentList.tsx
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MessageCircle } from "lucide-react-native";
import { CommentWithReplies, CommentData } from "../../../types/comment";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: CommentWithReplies[];
  isLoading: boolean;
  onReply: (comment: CommentData) => void;
}

export function CommentList({ comments, isLoading, onReply }: CommentListProps) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <MessageCircle size={20} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white text-lg font-bold">Bình luận ({comments.length})</Text>
      </View>

      {/* Comments List */}
      {isLoading ? (
        <ActivityIndicator color="#fbbf24" size="large" className="py-4" />
      ) : comments.length === 0 ? (
        <Text className="text-zinc-500 text-center py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
      ) : (
        <View className="space-y-4">
          {comments.length > 0 && comments.filter(c => !c.is_hidden).map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={onReply}
            />
          ))}
        </View>
      )}
    </View>
  );
}