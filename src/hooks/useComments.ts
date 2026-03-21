// src/hooks/useComments.ts
import { useState, useEffect } from "react";
import { getComments, postComment } from "../services/comment.service";
import { CommentWithReplies, CommentData } from "../types/comment";

export const useComments = (movieId: string, showToast: (message: string, type: "success" | "warning" | "error") => void) => {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const data = await getComments(movieId);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsPostingComment(true);
      await postComment({
        movieId: movieId,
        comment: newComment,
        isSpoiler,
        parentCommentId: replyingTo?.id
      });
      setNewComment("");
      setIsSpoiler(false);
      setReplyingTo(null);
      showToast("Bình luận thành công!", "success");
      // Refresh comments after posting
      fetchComments();
    } catch (error: any) {
      console.error("Failed to post comment:", error);
      const errorMessage = error?.response?.data?.message || "Không thể đăng bình luận. Vui lòng thử lại.";
      
      // Check specifically for toxicity/profanity errors if the API returns specific codes or messages
      if (errorMessage.toLowerCase().includes("toxic") || errorMessage.toLowerCase().includes("profan") || errorMessage.toLowerCase().includes("vi phạm")) {
         showToast("Bình luận chứa nội dung không phù hợp!", "error");
      } else {
         showToast(errorMessage, "error");
      }
    } finally {
      setIsPostingComment(false);
    }
  };

  return {
    comments,
    isLoadingComments,
    newComment,
    setNewComment,
    isPostingComment,
    handlePostComment,
    isSpoiler,
    setIsSpoiler,
    replyingTo,
    setReplyingTo,
    fetchComments
  };
};