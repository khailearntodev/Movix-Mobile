import api from './api.service';


export interface HistoryItem {
  id: string;
  progress_seconds: number;
  is_finished: boolean;
  watched_at: string;
  episode: {
    id: string;
    title: string;
    episode_number: number;
    runtime: number | null;
    season: {
      season_number: number;
      title: string;
      movie: {
        id: string;
        title: string;
        original_title: string;
        poster_url: string;
        slug: string;
      };
    };
  };
}

interface HistoryResponse {
  data: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getWatchHistory = async (page = 1, limit = 20) => {
  const { data } = await api.get<HistoryResponse>('/history', {
    params: { page, limit }
  });
  return data;
};
export const syncWatchHistory = async (episodeId: string, progress: number, isFinished: boolean) => {
  return api.post('/history/sync', {
    episodeId,
    progress,
    isFinished
  });
};
