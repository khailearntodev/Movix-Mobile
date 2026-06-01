import apiClient from './api.service';

export interface OnboardingData {
  genres: { id: string; name: string }[];
  seed_movies: {
    id: string;
    title: string;
    original_title: string;
    poster_url: string;
    release_date: string;
    vote_average: number;
  }[];
  predefined_vibes: string[];
  predefined_character_types: string[];
  predefined_content_to_avoid: string[];
}

export interface OnboardingPayload {
  fav_genres?: string[];
  seed_movie_ids?: string[];
  vibes?: string[];
  favorite_character_types?: string[];
  exploration_level?: number;
  content_to_avoid?: string[];
}

export const getOnboardingData = async (): Promise<OnboardingData> => {
  const response = await apiClient.get<OnboardingData>('/profile/onboarding/data');
  return response.data;
};

export const submitOnboarding = async (data: OnboardingPayload): Promise<{ message?: string; data?: any }> => {
  const response = await apiClient.post('/profile/onboarding', data);
  return response.data;
};
