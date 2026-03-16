import { Actor } from "./actor";
import { Director } from "./director";

// BACKEND RESPONSE TYPES

export interface GenreResponse {
  id: string;
  genre: {
    id: string;
    name: string;
  };
}

export interface Genre {
  id: string;
  name: string;
}

export interface PersonResponse {
  id: string;
  character?: string;
  job?: string;
  credit_type?: 'cast' | 'crew' | string;

  person: {
    id: string;
    name: string;
    avatar_url: string | null;
    role_type: string;
    biography?: string | null;
    birthday?: string | null;
    gender?: number | null;
  };
}
export interface EpisodeResponse {
  id: string;
  episode_number: number;
  title: string;
  runtime: number;
  video_url: string;
  video_image_url?: string;
  videoImageUrl?: string;
  still_path?: string;
  stillPath?: string;
}

export interface SeasonResponse {
  id: string;
  season_number: number;
  title: string;
  episodes: EpisodeResponse[];
}

export interface MovieResponse {
  id: string;
  slug: string;
  original_title: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  release_date: string | null;
  media_type: "MOVIE" | "TV";
  vote_average?: number;
  voteAverage?: number;
  movie_genres?: GenreResponse[];
  movie_people?: PersonResponse[];
  seasons?: SeasonResponse[];
  recommendations?: MovieResponse[];

  metadata?: {
    duration?: string;
    tmdb_rating?: number;
  };
}

//FRONTEND UI TYPES 

export interface Episode {
  id: string;
  number: number;
  title: string;
  videoUrl: string;
  videoImageUrl?: string;
  runtime: number;
}

export interface Season {
  id: string;
  number: number;
  title: string;
  episodes: Episode[];
}

export interface Movie {
  id: string;
  slug: string;
  title: string;
  subTitle: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string | null;
  videoUrl: string | null;
  seasons?: Season[];
  releaseYear?: number | string;
  tags: string[];
  cast?: Actor[];
  director?: Director | undefined;
  rating?: number;
  duration?: string;
  vote_average?: number; 
  vote_count?: number;
  type: "MOVIE" | "TV";
  views?: number;
  comment_count?: number;
  favorite_count?: number;
  recommendations?: Movie[];
}