export interface CommentUser {
  id: string;
  display_name: string;      
  avatar_url: string | null;   
}

export interface CommentData {
  id: string;
  user_id: string;
  movie_id: string;
  comment: string;          
  parent_comment_id: string | null;
  is_deleted: boolean;
  is_spoiler: boolean;
  is_hidden: boolean;
  toxicity_score?: number; 
  message?: string;     
  created_at: string;      
  updated_at: string;
  user: CommentUser;
}
export type CommentWithReplies = CommentData & {
  replies: CommentData[]; 
};