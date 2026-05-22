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
    <View className="bg-zinc-950/95 border-t border-zinc-900/80 pt-3 pb-8 px-4">
      {replyingTo && (
        <View className="flex-row items-center justify-between bg-zinc-900/80 px-4 py-2 rounded-2xl mb-3 border border-zinc-800">
          <Text className="text-zinc-400 text-sm">
            Đang trả lời <Text className="font-semibold text-white">{replyingTo.user?.display_name || "Người dùng"}</Text>
          </Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)} className="p-1 rounded-full bg-zinc-800">
            <X size={14} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      )}
      
      <View className="flex-row items-end gap-2 text-center">
        <View className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-3xl flex-row items-end p-0.5">
          <TextInput
            className="flex-1 text-white px-4 py-3 min-h-[44px] max-h-[100px] text-[15px]"
            placeholder={replyingTo ? "Viết phản hồi..." : "Viết bình luận..."}
            placeholderTextColor="#71717a"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            textAlignVertical="center"
          />
          <TouchableOpacity 
            className="p-3 mb-0.5"
            onPress={() => setIsSpoiler(!isSpoiler)}
          >
           <AlertTriangle 
             size={20} 
             color={isSpoiler ? "#eab308" : "#52525b"} 
             fill={isSpoiler ? "#eab308" : "transparent"} 
             fillOpacity={isSpoiler ? 0.2 : 0} 
           />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handlePostComment}
          disabled={isPostingComment || !newComment.trim()}
          className={`w-[48px] h-[48px] items-center justify-center rounded-full ${!newComment.trim() ? "bg-zinc-900 border border-zinc-800" : "bg-red-600"}`}
        >
          {isPostingComment ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Send size={20} color={!newComment.trim() ? "#52525b" : "white"} style={{ marginLeft: !newComment.trim() ? 0 : 2 }} />
          )}
        </TouchableOpacity>
      </View>
      
      {isSpoiler && (
         <View className="mt-2.5 flex-row items-center justify-center space-x-1.5 ml-2">
           <AlertTriangle size={12} color="#eab308" />
           <Text className="text-yellow-500/90 text-xs font-medium">Bình luận của bạn sẽ bị làm mờ vì chứa Spoiler</Text>
         </View>
      )}
    </View>
  );
}