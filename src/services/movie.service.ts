import api from './api';
import type { Movie, MovieResponse, Season, Genre } from "@/types/movie";
import type { Actor } from "@/types/actor";
import type { Director } from "@/types/director";

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
export async function getMovieData(slug: string) {
  try {
    const { data } = await api.get<MovieResponse>(`/movies/${slug}`);
    const movie = mapToMovie(data);
    return { movie };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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