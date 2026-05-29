import api from './api.service';
import { UserProfile } from './user.service';

export interface FollowResponse {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export const followService = {
  follow: async (followingId: string): Promise<FollowResponse> => {
    const response = await api.post<FollowResponse>(`/follow/${followingId}`);
    return response.data;
  },
  
  unFollow: async (followingId: string): Promise<void> => {
    await api.delete(`/follow/${followingId}`);
  },
  
  getMyFollowings: async (): Promise<UserProfile[]> => {
    const response = await api.get<UserProfile[]>('/follow/followings');
    return response.data;
  },
  
  getMyFollowers: async (): Promise<UserProfile[]> => {
    const response = await api.get<UserProfile[]>('/follow/followers');
    return response.data;
  },

  isFollowing: async (followingId: string): Promise<boolean> => {
    const response = await api.get<{ isFollowing: boolean }>(`/follow/is-following/${followingId}`);
    return response.data.isFollowing;
  }
};
