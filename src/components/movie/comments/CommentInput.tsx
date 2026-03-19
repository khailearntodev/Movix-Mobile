import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Send, X, AlertTriangle } from "lucide-react-native";
import { CommentData } from "../../../types/comment";

interface CommentInputProps {
  newComment: string;
  setNewComment: (text: string) => void;
  handlePostComment: () => void;
  isPostingComment: boolean;
  replyingTo: CommentData | null;
  setReplyingTo: (comment: CommentData | null) => void;
  isSpoiler: boolean;
  setIsSpoiler: (isSpoiler: boolean) => void;
}

export function CommentInput({
  newComment,
  setNewComment,
  handlePostComment,
  isPostingComment,
  replyingTo,
  setReplyingTo,
  isSpoiler,
  setIsSpoiler
}: CommentInputProps) {
  return (
    <View className="bg-zinc-900 border-t border-zinc-800 p-3 pb-8">
      {replyingTo && (
        <View className="flex-row items-center justify-between bg-zinc-800 p-2 rounded-t-xl mb-2 border border-zinc-700">
          <Text className="text-zinc-400 text-xs" numberOfLines={1}>
            Đang trả lời <Text className="font-bold text-white">{replyingTo.user?.display_name || "Người dùng"}</Text>
          </Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)} className="p-1">
            <X size={14} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      )}
      
      <View className="flex-row items-end space-x-2">
        <TextInput
          className="flex-1 bg-zinc-800 text-white rounded-xl px-4 py-3 min-h-[44px] max-h-[100px]"
          placeholder={replyingTo ? "Viết phản hồi..." : "Viết bình luận..."}
          placeholderTextColor="#71717a"
          value={newComment}
          onChangeText={setNewComment}
          multiline
          textAlignVertical="center"
        />
        <TouchableOpacity 
          onPress={handlePostComment}
          disabled={isPostingComment || !newComment.trim()}
          className={`w-11 h-11 items-center justify-center rounded-full ${!newComment.trim() ? "bg-zinc-800" : "bg-blue-600"}`}
        >
          {isPostingComment ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Send size={20} color={!newComment.trim() ? "#71717a" : "white"} />
          )}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        className="flex-row items-center mt-3 space-x-2"
        onPress={() => setIsSpoiler(!isSpoiler)}
      >
        <View className={`w-5 h-5 rounded border ${isSpoiler ? 'bg-yellow-600 border-yellow-600' : 'border-zinc-600'} items-center justify-center`}>
          {isSpoiler && <AlertTriangle size={12} color="black" />}
        </View>
        <Text className={`text-xs ${isSpoiler ? 'text-yellow-500 font-bold' : 'text-zinc-500'}`}>
          Chứa nội dung Spoiler?
        </Text>
      </TouchableOpacity>
    </View>
  );
}