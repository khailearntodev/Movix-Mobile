import api from './api.service';

export interface GamificationRank {
  key: string;
  name: string;
  min_xp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  is_active: boolean;
  is_unlocked?: boolean;
  unlocked_at?: string;
  current_progress?: number;
  progress?: number;
}

export interface GamificationProfile {
  xp: number;
  total_watch_time: number;
  current_rank: GamificationRank | null;
  next_rank: GamificationRank | null;
  achievements: Achievement[];
}

export const gamificationService = {
  getProfile: async (): Promise<GamificationProfile> => {
    const response = await api.get('/gamification/profile');
    return response.data.data;
  },

  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get('/gamification/achievements');
    return response.data.data;
  }
};
