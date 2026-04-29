import api from './api.service';
import { CommentData, CommentWithReplies } from '@/types/comment';

export const getComments = async (movieId: string) => {
  const { data } = await api.get<CommentWithReplies[]>('/comments', {
    params: { movieId },
  });
  return data;
};


interface PostCommentPayload {
  movieId: string;
  comment: string;
  parentCommentId?: string;
  isSpoiler?: boolean;
}

export const postComment = async (payload: PostCommentPayload) => {
  const { data } = await api.post<CommentData>(
    '/comments',
    payload,
    {
      withCredentials: true,
    },
  );
  return data;
};

export const updateComment = async (commentId: string, comment: string) => {
  const { data } = await api.put(
    `/comments/${commentId}`,
    { comment },
    {
      withCredentials: true,
    },
  );
  return data;
};

export const deleteComment = async (commentId: string) => {
  const { data } = await api.delete(`/comments/${commentId}`, {
    withCredentials: true,
  });
  return data;
};