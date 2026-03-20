import api from './api';
import { Movie } from '@/types/movie'; //

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  _count?: { 
    playlist_movies: number;
  };
  created_at?: string;
}
export interface PlaylistMovieResponse {
  id: string;
  title: string;
  original_title?: string;
  slug?: string;
  poster_url: string;
  backdrop_url: string;
  release_date: string;
  media_type: string;
  added_at: string;
  overview?: string; 
  vote_average?: number;
  origin_country?: string[];
}
export interface PlaylistDetail extends Playlist {
  movies: PlaylistMovieResponse[];
}
export const toggleFavorite = async (movieId: string) => {
  const response = await api.post('/interact/favorite/toggle', { movieId });
  return response.data; 
};

export const checkFavoriteStatus = async (movieId: string) => {
  const response = await api.post('/interact/favorite/status', {
    params: { movieId },
  });
  return response.data; 
};

export const getFavoriteMovies = async (): Promise<Movie[]> => {
  const response = await api.get('/interact/favorites');
  return response.data;
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const response = await api.get('/interact/playlists');
  return response.data;
};

export const getPlaylistDetail = async (id: string): Promise<PlaylistDetail> => {
  const response = await api.get(`/interact/playlists/${id}`);
  return response.data;
};

export const createPlaylist = async (name: string): Promise<Playlist> => {
  const response = await api.post('/interact/playlist/create', { name });
  return response.data;
};

export const updatePlaylist = async (id: string, name: string): Promise<Playlist> => {
  const response = await api.put(`/interact/playlists/${id}`, { name });
  return response.data;
};

export const deletePlaylist = async (id: string): Promise<void> => {
  await api.delete(`/interact/playlists/${id}`);
};

export const addMovieToPlaylist = async (
  playlistId: string,
  movieId: string,
) => {
  const response = await api.post('/interact/playlist/add', {
    playlistId,
    movieId,
  });
  return response.data;
};

export const removeMovieFromPlaylist = async (
  playlistId: string,
  movieId: string,
) => {
  const response = await api.delete(`/interact/playlists/${playlistId}/movies/${movieId}`);
  return response.data;
};
export interface RatingStats {
  average: number;
  count: number;
}

export interface UserRating {
  hasRated: boolean;
  rating: number | null;
}

// --- RATING API ---

export const getRatingStats = async (movieId: string): Promise<RatingStats> => {
  const response = await api.get(`/interact/rating/stats/${movieId}`);
  return response.data;
};

export const getMyRating = async (movieId: string): Promise<UserRating> => {
  const response = await api.get('/interact/rating/my-rate', {
    params: { movieId },
  });
  return response.data;
};

export const rateMovie = async (movieId: string, rating: number) => {
  const response = await api.post('/interact/rating', {
    movieId,
    rating,
  });
  return response.data;
};

export const deleteRating = async (movieId: string) => {
  const response = await api.delete(`/interact/rating/${movieId}`);
  return response.data;
};
export interface RatingItem {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user: {
    id: string;
    username: string;
    display_name: string; 
    avatar_url: string | null;
  };
}

interface RatingListResponse {
  data: RatingItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export const getMovieRatings = async (movieId: string): Promise<RatingItem[]> => {
  const response = await api.get<RatingListResponse>(`/interact/rating/list/${movieId}`);
  return response.data.data; 
};