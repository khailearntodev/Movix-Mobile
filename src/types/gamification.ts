export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  condition_type: 'WATCH_TIME' | 'XP' | 'LOGIN_STREAK' | 'COMMENT_COUNT' | 'MOVIE_COUNT' | string;
  condition_value: number;
  reward_xp: number;
  is_active: boolean;
}

export interface UserAchievement extends Achievement {
  unlocked_at?: string; // ISO Date string
  progress: number;
  is_unlocked: boolean;
}
