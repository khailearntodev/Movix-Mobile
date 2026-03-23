import api from './api';
import type { Movie, MovieResponse, Season, Genre } from "@/types/movie";
import type { Actor } from "@/types/actor";
import type { Director } from "@/types/director";
import type { Person } from "@/types/person";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSeasons(rawSeasons: any[] = []): Season[] {
  return rawSeasons.map((s) => ({
    id: s.id,
    number: s.season_number,
    title: s.title || `Season ${s.season_number}`,
    episodes: s.episodes?.map((e: any) => {
      const rawStillPath = e.still_path || e.stillPath;
      const derivedImageUrl = rawStillPath
        ? rawStillPath.startsWith("http")
          ? rawStillPath
          : `https://image.tmdb.org/t/p/w500${rawStillPath}`
        : undefined;

      return {
        id: e.id,
        number: e.episode_number,
        title: e.title || `Episode ${e.episode_number}`,
        videoUrl: e.video_url,
        videoImageUrl: e.video_image_url || e.videoImageUrl || derivedImageUrl,
        runtime: e.runtime || 0,
      };
    }) || [],
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCast(moviePeople: any[] = []): Actor[] {
  return moviePeople
    .filter((mp) => mp.person.role_type === "actor" || mp.credit_type === "cast")
    .map((mp) => ({
      id: mp.person.id,
      name: mp.person.name || "Không rõ",
      character: mp.character || "Unknown",
      profileUrl: mp.person.avatar_url,
      avatar_url: mp.person.avatar_url,
      biography: mp.person.biography || "",
      birthday: mp.person.birthday,
      gender: mp.person.gender,
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDirector(moviePeople: any[] = []): Director | undefined {
  const directorRaw = moviePeople.find(
    (mp) => mp.person.role_type === "director" || mp.credit_type === "crew"
  );
  return directorRaw
    ? {
      name: directorRaw.person.name,
      avatarUrl:directorRaw.person.avatar_url,
      origin: "Unknown",
    }
    : undefined;
}
function mapToMovie(raw: any): Movie {
  const releaseYear = raw.release_date
    ? new Date(raw.release_date).getFullYear()
    : raw.releaseYear || "N/A";

  const tags =
    raw.movie_genres?.map((mg: any) => mg.genre?.name).filter(Boolean) ||
    raw.tags ||
    [];

  const seasons = mapSeasons(raw.seasons);

  // Determine video URL
  let videoUrl = raw.trailer_url || raw.videoUrl || null;
  const isMovie = raw.media_type === "MOVIE" || raw.type === "MOVIE";

  if (isMovie) {
    const firstEpLink = seasons?.[0]?.episodes?.[0]?.videoUrl;
    if (firstEpLink) {
      videoUrl = firstEpLink;
    }
  }

  // Determine Rating
  const rating =
    raw.vote_average ||
    raw.voteAverage ||
    raw.metadata?.tmdb_rating ||
    raw.score ||
    0;

  // Determine Duration
  let duration = raw.metadata?.duration || raw.duration;
  if (!duration && raw.metadata?.runtime) {
    duration = `${raw.metadata.runtime} phút`;
  }
  duration = duration || "N/A";

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title || raw.original_title || "Chưa có tên",
    subTitle: raw.original_title || raw.title || "",
    description: raw.description || "",

    posterUrl: raw.poster_url || raw.posterUrl,
    backdropUrl: raw.backdrop_url || raw.backdropUrl,

    trailerUrl: raw.trailer_url || null,
    videoUrl,

    type: (raw.media_type === "TV" || raw.type === "TV") ? "TV" : "MOVIE",
    releaseYear,
    tags,

    rating,
    vote_average: rating,
    duration,
    views: raw.view_count ?? raw.metadata?.view_count ?? raw.views ?? 0,
    comment_count: raw.comment_count || 0,
    favorite_count: raw.favorite_count || 0,

    seasons,
    cast: mapCast(raw.movie_people),
    director: mapDirector(raw.movie_people),
    recommendations: (raw.recommendations || []).map(mapToMovie),
  };
}

export async function getMovie(slug: string): Promise<Movie> {
  try {
    const { data } = await api.get<MovieResponse>(`/movies/${slug}`);
    return mapToMovie(data);
  } catch (error: any) {
    console.error("Lỗi lấy phim:", error.response?.data || error.message);
    throw new Error("Không tìm thấy phim");
  }
}

export async function getTrendingMovies(): Promise<Movie[]> {
  try {
    const { data } = await api.get<MovieResponse[]>('/movies/trending');
    return data.map(mapToMovie);
  } catch (error) {
    console.error("Lỗi lấy phim Trending:", error);
    return [];
  }
}

export async function search(query: string): Promise<{ movies: Movie[]; people: Person[] }> {
  if (!query) return { movies: [], people: [] };

  try {
    const { data } = await api.get<{ movies: any[]; people: any[] }>('/movies/search', {
      params: { q: query },
    });

    const movies = (data.movies || []).map(mapToMovie);
    const people = (data.people || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      role_type: p.role_type,
      avatar_url: p.avatar_url,
      biography: p.biography,
      birthday: p.birthday,
      gender: p.gender,
    }));

    return { movies, people };
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    return { movies: [], people: [] };
  }
}
export interface MovieSection {
  id: string;
  title: string;
  movies: Movie[];
}

export async function getDynamicSections(): Promise<MovieSection[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await api.get<any[]>("/homepage");
    return data.map((section) => ({
      id: section.id,
      title: section.title,
      movies: section.movie_links
        .map((link: any) => (link.movie ? mapToMovie(link.movie) : null))
        .filter(Boolean) as Movie[],
    }));
  } catch (error) {
    console.error("Lỗi lấy dynamic sections:", error);
    return [];
  }
}

export async function filterMovies(params: any): Promise<{ movies: Movie[], pagination: any }> {
  try {
    const { data } = await api.get('/movies/filter', { params });
    const mappedMovies = (data.data || []).map(mapToMovie);
    return { movies: mappedMovies, pagination: data.pagination };
  } catch (error) {
    console.error("Lỗi filter phim:", error);
    return { movies: [], pagination: {} };
  }
}

export async function submitVoiceAiSearch(audioUri: string): Promise<{ movies: Movie[], recognizedText?: string }> {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'voice_query.m4a',
  } as any);

  try {
    const { data } = await api.post('/ai/search-voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    const responseData = data;
    const moviesData = Array.isArray(responseData) ? responseData : responseData.data || [];
    return {
      movies: moviesData.map(mapToMovie),
      recognizedText: responseData.recognizedText
    };
  } catch (error: any) {
    console.error("Lỗi AI Voice:", error?.response?.data || error.message);
    throw new Error('Lỗi phân tích giọng nói');
  }
}

export async function submitImageAiSearch(imageUri: string, mimeType: string = 'image/jpeg'): Promise<Movie[]> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: mimeType,
    name: 'search_image.jpg',
  } as any);

  try {
    const { data } = await api.post('/ai/search-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    const results = Array.isArray(data) ? data : data.data || [];
    return results.map(mapToMovie);
  } catch (error: any) {
    console.error("Lỗi AI Image:", error?.response?.data || error.message);
    throw new Error('Lỗi tìm kiếm hình ảnh');
  }
}

export async function submitTextAiSearch(query: string): Promise<Movie[]> {
  try {
    const { data } = await api.post('/ai/search', { query }, { timeout: 120000 });
    return (data || []).map(mapToMovie);
  } catch (error: any) {
    console.error("Lỗi AI Text:", error?.response?.data || error.message);
    throw new Error('Lỗi tìm kiếm AI Text');
  }
}

