import api from './api.service';
import { Achievement, UserAchievement } from "@/types/gamification";

export interface GamificationRank {
  key: 'NEWBIE' | 'MEMBER' | 'EXPERT' | 'LEGEND' | string;
  name: string;
  min_xp: number;
}

export interface GamificationProfile {
  xp: number;
  total_watch_time: number;
  current_rank: GamificationRank | null;
  next_rank: GamificationRank | null;
  achievements: UserAchievement[];
}

export const getAllAchievements = async (page = 1, limit = 100, isActive?: boolean): Promise<{achievements: Achievement[], total: number, page: number, totalPages: number}> => {
  const params: any = { page, limit };
  if (isActive !== undefined) {
    params.isActive = isActive;
  }
  const response = await api.get('/admin/gamification/get-all-achievements', { params });
  return {
    achievements: response.data.data,
    total: response.data.meta.total,
    page: response.data.meta.page,
    totalPages: response.data.meta.totalPages
  };
};
export const getProfile = async (): Promise<GamificationProfile> => {
  const response = await api.get('/gamification/profile');
  return response.data.data;
};

export const getAchievements = async (): Promise<any[]> => {
  const response = await api.get('/gamification/achievements');
  return response.data.data;
};
